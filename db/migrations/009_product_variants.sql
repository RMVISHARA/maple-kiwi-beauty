-- Multiple purchasable variants per product (same product, different size /
-- packaging, each with its own price, stock, image and expiry date).
--
-- The product row itself remains the DEFAULT / first option; rows here are the
-- ADDITIONAL options a customer can choose from. Deleting a product cascades to
-- its variants.
CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_value DECIMAL(8,2) DEFAULT NULL,
    measure_unit VARCHAR(20) DEFAULT NULL,
    package_type VARCHAR(30) DEFAULT NULL,
    price INT NOT NULL,
    original_price INT DEFAULT NULL,
    discount_percent INT DEFAULT NULL,
    stock_quantity INT DEFAULT NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    expiry_date DATE DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    image_data MEDIUMBLOB DEFAULT NULL,
    image_mime_type VARCHAR(50) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Links an order line to the specific variant purchased (NULL = the product's
-- default option). Used so stock is deducted from the correct variant.
ALTER TABLE order_items
  ADD COLUMN product_variant_id INT DEFAULT NULL AFTER product_id;
