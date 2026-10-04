-- ============================================================
-- ORDER FULFILMENT STATUS
-- Pending -> Packaged -> Sent out
-- ============================================================

-- 1. Add fulfilment columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfilment_status text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS packaged_at timestamptz,
  ADD COLUMN IF NOT EXISTS sent_out_at timestamptz;


-- 2. Restrict fulfilment status to the three valid values
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_fulfilment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_fulfilment_status_check
  CHECK (
    fulfilment_status IN ('Pending', 'Packaged', 'Sent out')
  );


-- 3. Enforce one-way fulfilment progression
CREATE OR REPLACE FUNCTION public.enforce_order_fulfilment_progression()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Every newly created order must start as Pending.
  IF TG_OP = 'INSERT' THEN
    IF NEW.fulfilment_status <> 'Pending' THEN
      RAISE EXCEPTION 'New orders must start as Pending.';
    END IF;

    NEW.packaged_at := NULL;
    NEW.sent_out_at := NULL;

    RETURN NEW;
  END IF;


  -- If the fulfilment status has not changed,
  -- do not allow the timestamps to be changed manually.
  IF NEW.fulfilment_status = OLD.fulfilment_status THEN
    NEW.packaged_at := OLD.packaged_at;
    NEW.sent_out_at := OLD.sent_out_at;

    RETURN NEW;
  END IF;


  -- Pending -> Packaged
  IF OLD.fulfilment_status = 'Pending'
     AND NEW.fulfilment_status = 'Packaged' THEN

    NEW.packaged_at := now();
    NEW.sent_out_at := NULL;

    RETURN NEW;
  END IF;


  -- Packaged -> Sent out
  IF OLD.fulfilment_status = 'Packaged'
     AND NEW.fulfilment_status = 'Sent out' THEN

    NEW.packaged_at := OLD.packaged_at;
    NEW.sent_out_at := now();

    RETURN NEW;
  END IF;


  -- Everything else is forbidden.
  RAISE EXCEPTION
    'Invalid fulfilment status transition: % to %.',
    OLD.fulfilment_status,
    NEW.fulfilment_status;
END;
$$;


-- 4. Replace the trigger
DROP TRIGGER IF EXISTS order_fulfilment_progression_trigger
ON public.orders;

CREATE TRIGGER order_fulfilment_progression_trigger
BEFORE INSERT OR UPDATE OF fulfilment_status, packaged_at, sent_out_at
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_fulfilment_progression();