-- Delete test order items first
delete from order_items
where order_id like 'TEST-%';

-- Delete test orders
delete from orders
where id like 'TEST-%';

-- Restore the test variant stock to 1
update variants
set stock = 1
where id = '1f3bd378-46c7-4656-b957-b8a641826c59';

-- Verify
select id, color, stock
from variants
where id = '1f3bd378-46c7-4656-b957-b8a641826c59';