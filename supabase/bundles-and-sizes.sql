-- Run this in the Supabase SQL Editor, after schema.sql and
-- security-and-orders.sql.

-- Sizes: optional, per colour+size combination, so each combination
-- tracks its own stock (e.g. Black size 40 can sell out while Black
-- size 42 is still available).
alter table variants add column if not exists size text;
alter table order_items add column if not exists size text;
alter table order_items add column if not exists bundle_discount_percent integer not null default 0;

-- Defensive: this should already exist from security-and-orders.sql,
-- but adding it again here (harmless if it's already there) means this
-- migration works correctly even if that column somehow didn't make it
-- in before.
alter table order_items add column if not exists product_id uuid;

-- Bundle deals: "buy N different hand-picked products, get X% off".
-- Separate from discount_tiers, which only looks at quantity of ONE
-- product. A bundle looks at how many DISTINCT eligible products are
-- in the cart, regardless of how many of each.
create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_items integer not null,
  discount_percent integer not null,
  created_at timestamptz default now()
);

create table if not exists bundle_products (
  bundle_id uuid references bundles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (bundle_id, product_id)
);

alter table bundles enable row level security;
alter table bundle_products enable row level security;

create policy "Public read bundles" on bundles for select using (true);
create policy "Public read bundle_products" on bundle_products for select using (true);

-- Replaces the earlier place_order function. Adds bundle-deal logic
-- on top of the existing per-product quantity discount and atomic
-- stock check, everything below still runs as a single transaction,
-- so a failure partway through still rolls back cleanly.
create or replace function place_order(
  p_order_id text,
  p_location text,
  p_phone text,
  p_comments text,
  p_items jsonb -- array of { "variantId": "...", "quantity": n }
) returns text
language plpgsql
security definer
as $$
declare
  item jsonb;
  v_variant record;
  v_discount_percent integer;
  v_base_total integer;
  v_line_items jsonb := '[]'::jsonb;
  v_present_ids uuid[];
  v_bundle record;
  v_match_count integer;
  v_bundle_best jsonb := '{}'::jsonb; -- product_id (text) -> best bundle discount %
  bp_id uuid;
  li jsonb;
  v_bundle_pct integer;
  v_final_total integer;
  v_final_items jsonb := '[]'::jsonb;
  v_total integer := 0;
begin
  -- Pass 1: lock each variant, check stock, apply the per-product
  -- quantity discount tier (unchanged from before).
  for item in select * from jsonb_array_elements(p_items)
  loop
    select v.id, v.color, v.size, v.price, v.stock, v.image_url, v.product_id,
           p.name as product_name
      into v_variant
      from variants v
      join products p on p.id = v.product_id
      where v.id = (item->>'variantId')::uuid
      for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;

    if v_variant.stock < (item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK: % (only % left)',
        v_variant.color, v_variant.stock;
    end if;

    select coalesce(max(discount_percent), 0)
      into v_discount_percent
      from discount_tiers
      where product_id = v_variant.product_id
        and min_qty <= (item->>'quantity')::int;

    v_base_total := round(
      v_variant.price * (item->>'quantity')::int * (1 - v_discount_percent / 100.0)
    );

    v_line_items := v_line_items || jsonb_build_object(
      'variant_id', v_variant.id,
      'product_id', v_variant.product_id,
      'product_name', v_variant.product_name,
      'color', v_variant.color,
      'size', v_variant.size,
      'unit_price', v_variant.price,
      'quantity', (item->>'quantity')::int,
      'discount_percent', v_discount_percent,
      'line_total', v_base_total,
      'image_url', v_variant.image_url
    );

    update variants set stock = stock - (item->>'quantity')::int
      where id = v_variant.id;
  end loop;

  -- Pass 2: figure out which bundle deals qualify, based on how many
  -- DISTINCT products (not units) from this order match each bundle's
  -- eligible list.
  select array_agg(distinct (elem->>'product_id')::uuid)
    into v_present_ids
    from jsonb_array_elements(v_line_items) elem;

  for v_bundle in select id, min_items, discount_percent from bundles
  loop
    select count(*) into v_match_count
      from bundle_products bp
      where bp.bundle_id = v_bundle.id
        and bp.product_id = any(v_present_ids);

    if v_match_count >= v_bundle.min_items then
      for bp_id in
        select bp.product_id from bundle_products bp
        where bp.bundle_id = v_bundle.id
          and bp.product_id = any(v_present_ids)
      loop
        -- If a product qualifies under more than one bundle at once,
        -- only the single best discount applies, they don't stack.
        v_bundle_best := jsonb_set(
          v_bundle_best,
          array[bp_id::text],
          to_jsonb(
            greatest(
              coalesce((v_bundle_best ->> (bp_id::text))::int, 0),
              v_bundle.discount_percent
            )
          ),
          true
        );
      end loop;
    end if;
  end loop;

  -- Pass 3: apply any qualifying bundle discount on top of the
  -- already quantity-discounted line total, and total everything up.
  for li in select * from jsonb_array_elements(v_line_items)
  loop
    v_bundle_pct := coalesce((v_bundle_best ->> (li->>'product_id'))::int, 0);
    v_final_total := round((li->>'line_total')::int * (1 - v_bundle_pct / 100.0));
    v_total := v_total + v_final_total;

    v_final_items := v_final_items || jsonb_build_object(
      'variant_id', li->>'variant_id',
      'product_id', li->>'product_id',
      'product_name', li->>'product_name',
      'color', li->>'color',
      'size', li->>'size',
      'unit_price', (li->>'unit_price')::int,
      'quantity', (li->>'quantity')::int,
      'discount_percent', (li->>'discount_percent')::int,
      'bundle_discount_percent', v_bundle_pct,
      'line_total', v_final_total,
      'image_url', li->>'image_url'
    );
  end loop;

  insert into orders (id, location, phone, comments, total, status)
  values (p_order_id, p_location, p_phone, p_comments, v_total, 'Paid');

  insert into order_items (
    order_id, variant_id, product_id, product_name, color, size,
    unit_price, quantity, discount_percent, bundle_discount_percent,
    line_total, image_url
  )
  select
    p_order_id,
    (fi->>'variant_id')::uuid,
    (fi->>'product_id')::uuid,
    fi->>'product_name',
    fi->>'color',
    fi->>'size',
    (fi->>'unit_price')::int,
    (fi->>'quantity')::int,
    (fi->>'discount_percent')::int,
    (fi->>'bundle_discount_percent')::int,
    (fi->>'line_total')::int,
    fi->>'image_url'
  from jsonb_array_elements(v_final_items) as fi;

  return p_order_id;
end;
$$;
