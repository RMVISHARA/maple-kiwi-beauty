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
    discount_percent INT DEFAULT NULL,
    subtitle VARCHAR(255) NOT NULL,
    reviews_count INT DEFAULT 0,
    price INT NOT NULL,
    original_price INT DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    target_customers TEXT NOT NULL,
    climate_benefit TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Benefits Table (One-To-Many Relationship with Products)
CREATE TABLE IF NOT EXISTS product_benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================
-- SEED DATA INSERTION FOR INITIAL 5 PRODUCTS
-- ==========================================

-- Seed Products Table
INSERT INTO products (id, name, brand, origin, category, badge, discount_percent, subtitle, reviews_count, price, original_price, image, target_customers, climate_benefit) VALUES
(1, 'Retinol 1% in Squalane', 'THE ORDINARY', 'CANADA', 'Anti Aging', 'BESTSELLER', 17, 'Anti Aging - Age 25+ - Anti-aging skincare', 1248, 4800, 5800, '/images/products/retinol.png', 'Age 25+ and customers interested in anti-aging skincare.', 'Formulated in squalane, which mimics skin\'s natural oils. This provides rich anti-aging support without blocking pores or feeling heavy in Sri Lanka\'s humid weather.'),
(2, 'Ascorbyl Glucoside Solution 12%', 'THE ORDINARY', 'CANADA', 'Brightening', 'SALE', 15, 'Brightening - Pigmentation & uneven skin tone', 876, 3900, 4600, '/images/products/vit_c.png', 'People with pigmentation and uneven skin tone.', 'A water-soluble Vitamin C derivative that is incredibly stable and lightweight. Ideal for brightening and UV antioxidant protection in tropical sunshine without leaving an oily residue.'),
(3, 'Niacinamide 10% + Zinc 1%', 'THE ORDINARY', 'CANADA', 'Acne & Oil Control', 'TOP RATED', NULL, 'Acne & Oil Control - Oily and combination skin types', 2103, 3500, NULL, '/images/products/niacinamide.png', 'Oily and combination skin types.', 'An absolute essential for Sri Lanka\'s climate. Niacinamide regulates sebum production while Zinc calms inflammation, preventing breakouts caused by sweat and humidity.'),
(4, 'Hyaluronic Acid 2% + B5', 'THE ORDINARY', 'CANADA', 'Hydration', 'CLIMATE PICK', 16, 'Hydration - Men and women of all ages', 1654, 4200, 5000, '/images/products/hyaluronic.png', 'Men and women of all ages.', 'Provides deep hydration by binding water to the skin without using heavy emollients. Absorbs instantly and leaves skin feeling plump, fresh, and cooled in warm climates.'),
(5, 'Protect + Hydrate SPF 50 Sunscreen', 'AVEENO', 'CANADA', 'Sun Protection', 'ESSENTIAL', 17, 'Sun Protection - Everyone using skincare products', 934, 6500, 7800, '/images/products/sunscreen.png', 'Everyone using skincare products.', 'Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka\'s warm outdoors and tropical beaches.');

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
