-- Admin-only product expiry tracking.
-- Stores the expiry date of the current stock so admins can monitor and
-- discount items that are near expiry. Never exposed to customers.
ALTER TABLE products
  ADD COLUMN expiry_date DATE DEFAULT NULL AFTER in_stock;
