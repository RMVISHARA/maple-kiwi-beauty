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
