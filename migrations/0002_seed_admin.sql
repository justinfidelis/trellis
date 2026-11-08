-- Seed initial admin user
-- Apply after 0001_initial.sql
-- Note: tele_handle stored without the @ prefix
INSERT INTO users (id, email, name, tele_handle, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'justinfidelis@gmail.com',
  'Justin Wong',
  'justinfidelis',
  'admin'
);
