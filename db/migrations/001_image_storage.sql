-- Product image BLOB storage + staging table for admin uploads.
-- Applied automatically by: npm run db:migrate (or npm run dev via predev).

CREATE TABLE IF NOT EXISTS image_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_data MEDIUMBLOB NOT NULL,
    image_mime_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN image_data MEDIUMBLOB DEFAULT NULL;
ALTER TABLE products ADD COLUMN image_mime_type VARCHAR(50) DEFAULT NULL;
