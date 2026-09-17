-- Run this in the Supabase SQL Editor, after the previous migrations.

alter table orders add column if not exists paystack_reference text;

-- Read-only pricing preview, used to know the exact amount to charge via
-- Paystack BEFORE payment happens. Mirrors the pricing math inside
-- place_order (same discount tier and bundle logic), but does not lock
-- rows, decrement stock, or write anything, it's just a quote.
--
-- IMPORTANT: if the discount or bundle pricing rules in place_order ever
-- change, this function's math needs to be updated to match, they are
-- intentionally kept in sync rather than sharing code, since one locks
-- rows for a real purchase and the other doesn't.
create or replace function quote_order(p_items jsonb) returns integer
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
  v_bundle_best jsonb := '{}'::jsonb;
  bp_id uuid;
  li jsonb;
  v_bundle_pct integer;
  v_final_total integer;
  v_total integer := 0;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    select v.price, v.stock, v.product_id
      into v_variant
      from variants v
      where v.id = (item->>'variantId')::uuid;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;

    if v_variant.stock < (item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK';
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
      'product_id', v_variant.product_id,
      'line_total', v_base_total
    );
  end loop;

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

  for li in select * from jsonb_array_elements(v_line_items)
  loop
    v_bundle_pct := coalesce((v_bundle_best ->> (li->>'product_id'))::int, 0);
    v_final_total := round((li->>'line_total')::int * (1 - v_bundle_pct / 100.0));
    v_total := v_total + v_final_total;
  end loop;

  return v_total;
end;
$$;
