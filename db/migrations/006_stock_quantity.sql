-- Stock quantity tracking.
-- stock_quantity: how many units of this product are in stock (NULL = untracked).
-- show_stock: whether to display the remaining count to customers on the storefront.
ALTER TABLE products
  ADD COLUMN stock_quantity INT DEFAULT NULL AFTER in_stock;

ALTER TABLE products
  ADD COLUMN show_stock TINYINT(1) NOT NULL DEFAULT 0 AFTER stock_quantity;

-- Tracks whether an order has already reduced product stock.
-- Stock is deducted when an order becomes CONFIRMED or DELIVERED, and this flag
-- keeps that deduction idempotent (no double counting) and allows restock on cancel.
ALTER TABLE orders
  ADD COLUMN stock_deducted TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
