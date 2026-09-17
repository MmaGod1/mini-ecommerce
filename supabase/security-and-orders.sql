-- Run this AFTER schema.sql, in the Supabase SQL Editor.

-- Extra column referenced by the app's Order type.
alter table order_items add column if not exists product_id uuid;

-- Lock every table down by default, then open only what's safe.
alter table products enable row level security;
alter table variants enable row level security;
alter table discount_tiers enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- The anon key (used in the browser) may only ever READ product-facing
-- data. No insert/update/delete policies exist for any table, and no
-- read policy exists for orders/order_items at all. That means:
--   - Anyone can browse products, colours, prices, categories.
--   - Nobody can write anything, or read any order, using the anon key.
-- All writes, and all order reads, go through our Next.js API routes,
-- which use the service_role key (defined in lib/supabaseServer.ts)
-- that bypasses RLS entirely.
create policy "Public read products" on products for select using (true);
create policy "Public read variants" on variants for select using (true);
create policy "Public read discount_tiers" on discount_tiers for select using (true);
create policy "Public read categories" on categories for select using (true);

-- Atomic order placement.
-- Locks each variant row (FOR UPDATE) before checking stock, so two
-- people checking out the last item at the same moment cannot both
-- succeed, whichever transaction gets there first wins, the second
-- one fails cleanly with an "insufficient stock" error instead of
-- silently overselling.
--
-- Price and discount are calculated here from the database's own
-- current values, never trusted from the request, so a tampered
-- request body cannot change what a customer is charged.
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
  v_line_total integer;
  v_total integer := 0;
  v_line_items jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    select v.id, v.color, v.price, v.stock, v.image_url, v.product_id,
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

    v_line_total := round(
      v_variant.price * (item->>'quantity')::int * (1 - v_discount_percent / 100.0)
    );
    v_total := v_total + v_line_total;

    v_line_items := v_line_items || jsonb_build_object(
      'variant_id', v_variant.id,
      'product_id', v_variant.product_id,
      'product_name', v_variant.product_name,
      'color', v_variant.color,
      'unit_price', v_variant.price,
      'quantity', (item->>'quantity')::int,
      'discount_percent', v_discount_percent,
      'line_total', v_line_total,
      'image_url', v_variant.image_url
    );

    update variants set stock = stock - (item->>'quantity')::int
      where id = v_variant.id;
  end loop;

  insert into orders (id, location, phone, comments, total, status)
  values (p_order_id, p_location, p_phone, p_comments, v_total, 'Paid');

  insert into order_items (
    order_id, variant_id, product_id, product_name, color,
    unit_price, quantity, discount_percent, line_total, image_url
  )
  select
    p_order_id,
    (li->>'variant_id')::uuid,
    (li->>'product_id')::uuid,
    li->>'product_name',
    li->>'color',
    (li->>'unit_price')::int,
    (li->>'quantity')::int,
    (li->>'discount_percent')::int,
    (li->>'line_total')::int,
    li->>'image_url'
  from jsonb_array_elements(v_line_items) as li;

  return p_order_id;
end;
$$;
