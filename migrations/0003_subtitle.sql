-- Add subtitle to book cache and copies
ALTER TABLE book_cache ADD COLUMN subtitle TEXT NOT NULL DEFAULT '';
ALTER TABLE copies ADD COLUMN subtitle TEXT NOT NULL DEFAULT '';
