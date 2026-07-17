-- Product additional images storage table for supporting multiple images from different angles.
-- Applied automatically by: npm run db:migrate (or npm run dev via predev).

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image VARCHAR(255) NOT NULL, -- Serve URL path like /api/product-images/:id/image
    image_data MEDIUMBLOB NOT NULL,
    image_mime_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
