-- Product categories managed from the admin dashboard
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO categories (id, name, sort_order) VALUES
(1, 'Anti Aging', 1),
(2, 'Brightening', 2),
(3, 'Acne & Oil Control', 3),
(4, 'Hydration', 4),
(5, 'Sun Protection', 5);
