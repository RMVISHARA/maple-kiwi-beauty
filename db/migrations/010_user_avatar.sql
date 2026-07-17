-- Profile avatar storage on users.
ALTER TABLE users ADD COLUMN avatar_data MEDIUMBLOB DEFAULT NULL;
ALTER TABLE users ADD COLUMN avatar_mime_type VARCHAR(50) DEFAULT NULL;
