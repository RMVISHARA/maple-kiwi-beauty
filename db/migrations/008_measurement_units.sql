-- Multiple product measurement units.
-- Cosmetics are measured in different systems (volume / weight / count) and come
-- in different physical forms (bottle, tube, jar, powder, sheet mask, etc.).
--   size_value   : numeric amount, e.g. 50 (NULL = not specified)
--   measure_unit : unit code from lib/measurement.js, e.g. 'ml', 'g', 'pcs'
--   package_type : physical form / packaging code, e.g. 'tube', 'jar', 'powder'
ALTER TABLE products
  ADD COLUMN size_value DECIMAL(8,2) DEFAULT NULL AFTER original_price;

ALTER TABLE products
  ADD COLUMN measure_unit VARCHAR(20) DEFAULT NULL AFTER size_value;

ALTER TABLE products
  ADD COLUMN package_type VARCHAR(30) DEFAULT NULL AFTER measure_unit;
