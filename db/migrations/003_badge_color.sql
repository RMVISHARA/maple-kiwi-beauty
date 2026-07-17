ALTER TABLE products
  ADD COLUMN badge_color VARCHAR(7) DEFAULT NULL AFTER badge;

UPDATE products SET badge_color = '#3d2f27' WHERE badge = 'BESTSELLER';
UPDATE products SET badge_color = '#c4726e' WHERE badge = 'SALE';
UPDATE products SET badge_color = '#8A9A86' WHERE badge = 'TOP RATED';
UPDATE products SET badge_color = '#4B6F44' WHERE badge = 'CLIMATE PICK';
UPDATE products SET badge_color = '#8FBC8F' WHERE badge = 'ESSENTIAL';
