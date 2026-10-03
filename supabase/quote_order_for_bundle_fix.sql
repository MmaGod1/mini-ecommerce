CREATE OR REPLACE FUNCTION quote_order(p_items jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item jsonb;
  v_variant record;
  v_bundle record;
  v_product_id uuid;
  v_discount_percent numeric;
  v_bundle_discount_percent numeric;
  v_eligible_quantity integer;
  v_bundle_best jsonb := '{}'::jsonb;
  v_quantity integer;
  v_line_total numeric;
  v_total numeric := 0;
BEGIN

  -- Validate variants and stock
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP

    SELECT
      v.price,
      v.stock,
      v.product_id
    INTO v_variant
    FROM variants AS v
    WHERE v.id = (v_item->>'variantId')::uuid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;

    v_quantity := (v_item->>'quantity')::integer;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    IF v_variant.stock < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

  END LOOP;


  -- Find qualifying bundle discounts
  FOR v_bundle IN
    SELECT
      b.id,
      b.min_items,
      b.discount_percent
    FROM bundles AS b
  LOOP

    SELECT COALESCE(
      SUM((cart_row.item_data->>'quantity')::integer),
      0
    )
    INTO v_eligible_quantity
    FROM jsonb_array_elements(p_items) AS cart_row(item_data)
    JOIN variants AS v
      ON v.id = (cart_row.item_data->>'variantId')::uuid
    JOIN bundle_products AS bp
      ON bp.product_id = v.product_id
     AND bp.bundle_id = v_bundle.id;

    IF v_eligible_quantity >= v_bundle.min_items THEN

      FOR v_product_id IN
        SELECT bp.product_id
        FROM bundle_products AS bp
        WHERE bp.bundle_id = v_bundle.id
      LOOP

        v_bundle_best := jsonb_set(
          v_bundle_best,
          ARRAY[v_product_id::text],
          to_jsonb(
            GREATEST(
              COALESCE(
                (v_bundle_best ->> v_product_id::text)::numeric,
                0
              ),
              v_bundle.discount_percent
            )
          ),
          true
        );

      END LOOP;

    END IF;

  END LOOP;


  -- Calculate final total
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP

    SELECT
      v.price,
      v.product_id
    INTO v_variant
    FROM variants AS v
    WHERE v.id = (v_item->>'variantId')::uuid;

    v_quantity := (v_item->>'quantity')::integer;

    -- Existing quantity discount
    v_discount_percent := CASE
      WHEN v_quantity >= 10 THEN 10
      WHEN v_quantity >= 5 THEN 5
      ELSE 0
    END;

    -- Bundle discount
    v_bundle_discount_percent := COALESCE(
      (
        v_bundle_best ->> v_variant.product_id::text
      )::numeric,
      0
    );

    v_line_total :=
      v_variant.price
      * v_quantity
      * (1 - v_discount_percent / 100)
      * (1 - v_bundle_discount_percent / 100);

    v_total := v_total + v_line_total;

  END LOOP;


  RETURN ROUND(v_total)::integer;

END;
$$;