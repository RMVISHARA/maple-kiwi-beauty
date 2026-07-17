-- ==========================================
-- SCHEMA FOR MAPLE & KIWI BEAUTY MYSQL DATABASE
-- ==========================================

CREATE DATABASE IF NOT EXISTS maple_kiwi_beauty;
USE maple_kiwi_beauty;

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    origin VARCHAR(100) DEFAULT 'CANADA',
    category VARCHAR(100) NOT NULL,
    badge VARCHAR(50) DEFAULT NULL,
    badge_color VARCHAR(7) DEFAULT NULL,
    discount_percent INT DEFAULT NULL,
    subtitle VARCHAR(255) NOT NULL,
    reviews_count INT DEFAULT 0,
    price INT NOT NULL,
    original_price INT DEFAULT NULL,
    size_value DECIMAL(8,2) DEFAULT NULL,
    measure_unit VARCHAR(20) DEFAULT NULL,
    package_type VARCHAR(30) DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    image_data MEDIUMBLOB DEFAULT NULL,
    image_mime_type VARCHAR(50) DEFAULT NULL,
    target_customers TEXT NOT NULL,
    climate_benefit TEXT DEFAULT NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    stock_quantity INT DEFAULT NULL,
    show_stock TINYINT(1) NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Staging table for admin image uploads (copied into products on save)
CREATE TABLE IF NOT EXISTS image_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_data MEDIUMBLOB NOT NULL,
    image_mime_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1c. Product categories (managed from admin)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Benefits Table (One-To-Many Relationship with Products)
CREATE TABLE IF NOT EXISTS product_benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2b. Product Variants (same product, different size/packaging).
-- The product row is the default option; these are the additional buyable
-- options, each with its own price, stock, image and expiry date.
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

-- 3. Create Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    avatar_data MEDIUMBLOB DEFAULT NULL,
    avatar_mime_type VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3b. Pending sign-up OTP verifications (user is created only after OTP is confirmed)
CREATE TABLE IF NOT EXISTS signup_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_signup_otps_email (email)
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) DEFAULT NULL,
    customer_phone VARCHAR(50) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    subtotal INT NOT NULL DEFAULT 0,
    shipping INT NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'COD',
    status VARCHAR(50) DEFAULT 'PENDING',
    stock_deducted TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create Order Items Table (One-To-Many Relationship with Orders)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_variant_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    unit_price INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    line_total INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 6. Customer Reviews (moderated before display)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    author_name VARCHAR(150) NOT NULL,
    rating TINYINT NOT NULL DEFAULT 5,
    body TEXT NOT NULL,
    photos JSON DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_featured (is_featured)
);

-- 6b. Review photo blobs (served via /api/review-photos/:id)
CREATE TABLE IF NOT EXISTS review_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_data MEDIUMBLOB NOT NULL,
    image_mime_type VARCHAR(50) NOT NULL,
    sort_order TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_photos_review (review_id)
);

-- ==========================================
-- SEED DATA INSERTION FOR INITIAL 5 PRODUCTS
-- ==========================================

-- Clear existing seed rows so this script can be re-run safely.
DELETE FROM product_benefits WHERE product_id IN (1, 2, 3, 4, 5);
DELETE FROM products WHERE id IN (1, 2, 3, 4, 5);

INSERT IGNORE INTO categories (id, name, sort_order) VALUES
(1, 'Anti Aging', 1),
(2, 'Brightening', 2),
(3, 'Acne & Oil Control', 3),
(4, 'Hydration', 4),
(5, 'Sun Protection', 5);

-- Seed Products Table
INSERT INTO products (id, name, brand, origin, category, badge, badge_color, discount_percent, subtitle, reviews_count, price, original_price, size_value, measure_unit, package_type, image, target_customers, climate_benefit) VALUES
(1, 'Retinol 1% in Squalane', 'THE ORDINARY', 'CANADA', 'Anti Aging', 'BESTSELLER', '#3d2f27', 17, 'Anti Aging - Age 25+ - Anti-aging skincare', 1248, 4800, 5800, 30, 'ml', 'dropper', '/images/products/retinol.png', 'Age 25+ and customers interested in anti-aging skincare.', 'Formulated in squalane, which mimics skin\'s natural oils. This provides rich anti-aging support without blocking pores or feeling heavy in Sri Lanka\'s humid weather.'),
(2, 'Ascorbyl Glucoside Solution 12%', 'THE ORDINARY', 'CANADA', 'Brightening', 'SALE', '#c4726e', 15, 'Brightening - Pigmentation & uneven skin tone', 876, 3900, 4600, 30, 'ml', 'dropper', '/images/products/vit_c.png', 'People with pigmentation and uneven skin tone.', 'A water-soluble Vitamin C derivative that is incredibly stable and lightweight. Ideal for brightening and UV antioxidant protection in tropical sunshine without leaving an oily residue.'),
(3, 'Niacinamide 10% + Zinc 1%', 'THE ORDINARY', 'CANADA', 'Acne & Oil Control', 'TOP RATED', '#8A9A86', NULL, 'Acne & Oil Control - Oily and combination skin types', 2103, 3500, NULL, 30, 'ml', 'dropper', '/images/products/niacinamide.png', 'Oily and combination skin types.', 'An absolute essential for Sri Lanka\'s climate. Niacinamide regulates sebum production while Zinc calms inflammation, preventing breakouts caused by sweat and humidity.'),
(4, 'Hyaluronic Acid 2% + B5', 'THE ORDINARY', 'CANADA', 'Hydration', 'CLIMATE PICK', '#4B6F44', 16, 'Hydration - Men and women of all ages', 1654, 4200, 5000, 30, 'ml', 'dropper', '/images/products/hyaluronic.png', 'Men and women of all ages.', 'Provides deep hydration by binding water to the skin without using heavy emollients. Absorbs instantly and leaves skin feeling plump, fresh, and cooled in warm climates.'),
(5, 'Protect + Hydrate SPF 50 Sunscreen', 'AVEENO', 'CANADA', 'Sun Protection', 'ESSENTIAL', '#8FBC8F', 17, 'Sun Protection - Everyone using skincare products', 934, 6500, 7800, 88, 'ml', 'tube', '/images/products/sunscreen.png', 'Everyone using skincare products.', 'Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka\'s warm outdoors and tropical beaches.');

-- Seed Product Benefits Table
INSERT INTO product_benefits (product_id, benefit) VALUES
(1, 'Helps reduce fine lines and wrinkles.'),
(1, 'Improves skin texture.'),
(1, 'Supports collagen production.'),
(1, 'Popular anti aging product.'),

(2, 'Brightens dull skin.'),
(2, 'Helps reduce dark spots.'),
(2, 'Antioxidant protection.'),
(2, 'Evens skin tone.'),

(3, 'Reduces appearance of pores.'),
(3, 'Controls excess oil.'),
(3, 'Helps with acne-prone skin.'),
(3, 'Improves skin barrier.'),

(4, 'Deep hydration.'),
(4, 'Makes skin look plumper.'),
(4, 'Suitable for all skin types.'),
(4, 'Excellent for Sri Lanka\'s warm climate.'),

(5, 'Protects against UV damage.'),
(5, 'Helps prevent premature aging.'),
(5, 'Essential daily skincare product.'),
(5, 'Suitable for tropical weather.');

-- Seed a couple of extra size options (variants) for product 1 to demo the feature.
-- Product 1's own row is the default 30 mL option; these are the larger sizes.
INSERT INTO product_variants (product_id, size_value, measure_unit, package_type, price, original_price, stock_quantity, sort_order) VALUES
(1, 60, 'ml', 'dropper', 8600, 9900, 40, 1),
(1, 100, 'ml', 'pump', 12900, 14900, 25, 2);

-- ==========================================
-- MIGRATIONS FOR EXISTING DATABASES (safe to re-run)
-- Adds new columns if the tables already existed without them.
-- (Commented out because standard MySQL does not support IF NOT EXISTS in ALTER TABLE)
-- ==========================================
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock TINYINT(1) NOT NULL DEFAULT 1;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';
-- ALTER TABLE products ADD COLUMN image_data MEDIUMBLOB DEFAULT NULL;
-- ALTER TABLE products ADD COLUMN image_mime_type VARCHAR(50) DEFAULT NULL;
-- CREATE TABLE IF NOT EXISTS image_uploads (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     image_data MEDIUMBLOB NOT NULL,
--     image_mime_type VARCHAR(50) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

