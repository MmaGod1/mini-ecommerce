CREATE OR REPLACE FUNCTION place_order(
  p_order_id text,
  p_location text,
  p_phone text,
  p_comments text,
  p_items jsonb,
  p_paystack_reference text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_stock integer;
  v_price numeric;
  v_product_id uuid;
  v_product_name text;
  v_color text;
  v_size text;
  v_image_url text;
  v_discount_percent numeric;
  v_bundle_discount_percent numeric;
  v_line_total numeric;
  v_total numeric := 0;
  v_order_id text := p_order_id;
  v_bundle record;
  v_eligible_quantity integer;
BEGIN

  -- Prevent duplicate orders for the same Paystack reference.
  IF p_paystack_reference IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(p_paystack_reference));

    SELECT id
    INTO v_order_id
    FROM orders
    WHERE paystack_reference = p_paystack_reference;

    IF FOUND THEN
      RETURN v_order_id;
    END IF;

    v_order_id := p_order_id;
  END IF;


  -- Validate stock and lock each requested variant.
  -- Aggregate duplicate variant IDs so quantities cannot bypass stock checks.
  FOR item IN
    SELECT jsonb_build_object(
      'variantId', x.variant_id,
      'quantity', SUM(x.quantity)
    )
    FROM (
      SELECT
        (value->>'variantId')::uuid AS variant_id,
        (value->>'quantity')::integer AS quantity
      FROM jsonb_array_elements(p_items)
    ) x
    GROUP BY x.variant_id
  LOOP

    v_variant_id := (item->>'variantId')::uuid;
    v_quantity := (item->>'quantity')::integer;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT v.stock
    INTO v_stock
    FROM variants AS v
    WHERE v.id = v_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'VARIANT_NOT_FOUND: %', v_variant_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

  END LOOP;


  -- Determine qualifying bundle discounts.
  -- Eligibility is based on TOTAL quantity of eligible products,
  -- not the number of distinct products.
  CREATE TEMP TABLE IF NOT EXISTS pg_temp.order_bundle_discounts (
    product_id uuid PRIMARY KEY,
    discount_percent numeric NOT NULL
  ) ON COMMIT DROP;

  TRUNCATE pg_temp.order_bundle_discounts;


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
    )::integer
    INTO v_eligible_quantity
    FROM jsonb_array_elements(p_items) AS cart_row(item_data)
    JOIN variants AS v
      ON v.id = (cart_row.item_data->>'variantId')::uuid
    JOIN bundle_products AS bp
      ON bp.product_id = v.product_id
     AND bp.bundle_id = v_bundle.id;

    IF v_eligible_quantity >= v_bundle.min_items THEN

      INSERT INTO pg_temp.order_bundle_discounts (
        product_id,
        discount_percent
      )
      SELECT
        bp.product_id,
        v_bundle.discount_percent
      FROM bundle_products AS bp
      WHERE bp.bundle_id = v_bundle.id
      ON CONFLICT (product_id) DO UPDATE
      SET discount_percent = GREATEST(
        pg_temp.order_bundle_discounts.discount_percent,
        EXCLUDED.discount_percent
      );

    END IF;

  END LOOP;


  -- Create the order before inserting its items.
  INSERT INTO orders (
    id,
    location,
    phone,
    comments,
    total,
    status,
    paystack_reference
  )
  VALUES (
    v_order_id,
    p_location,
    p_phone,
    p_comments,
    0,
    'Paid',
    p_paystack_reference
  );


  -- Price each order item.
  FOR item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
  LOOP

    v_variant_id := (item->>'variantId')::uuid;
    v_quantity := (item->>'quantity')::integer;

    SELECT
      v.stock,
      v.price,
      v.product_id,
      v.color,
      v.size,
      p.name,
      p.image_url
    INTO
      v_stock,
      v_price,
      v_product_id,
      v_color,
      v_size,
      v_product_name,
      v_image_url
    FROM variants AS v
    JOIN products AS p
      ON p.id = v.product_id
    WHERE v.id = v_variant_id;


    -- Existing quantity discount.
    v_discount_percent := CASE
      WHEN v_quantity >= 10 THEN 10
      WHEN v_quantity >= 5 THEN 5
      ELSE 0
    END;


    -- Bundle discount for this product.
    SELECT COALESCE(
      bd.discount_percent,
      0
    )
    INTO v_bundle_discount_percent
    FROM (
      SELECT v_product_id AS product_id
    ) AS x
    LEFT JOIN pg_temp.order_bundle_discounts AS bd
      ON bd.product_id = x.product_id;


    -- Apply quantity discount, then bundle discount.
    v_line_total :=
      v_price
      * v_quantity
      * (1 - v_discount_percent / 100)
      * (1 - v_bundle_discount_percent / 100);

    v_total := v_total + v_line_total;


    -- Reduce stock.
    UPDATE variants
    SET stock = stock - v_quantity
    WHERE id = v_variant_id;


    -- Save the priced item.
    INSERT INTO order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      color,
      size,
      unit_price,
      quantity,
      discount_percent,
      bundle_discount_percent,
      line_total,
      image_url
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_variant_id,
      v_product_name,
      v_color,
      v_size,
      v_price,
      v_quantity,
      v_discount_percent,
      v_bundle_discount_percent,
      v_line_total,
      v_image_url
    );

  END LOOP;


  -- Save the final calculated order total.
  UPDATE orders
  SET total = v_total
  WHERE id = v_order_id;


  RETURN v_order_id;

END;
$$;