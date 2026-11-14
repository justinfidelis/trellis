-- Users (lenders and admin only; borrowers are not stored)
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  tele_handle TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('lender', 'admin')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Genres (adjacency list + materialized path)
CREATE TABLE genres (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  parent_id TEXT REFERENCES genres(id),
  path      TEXT NOT NULL UNIQUE
);

-- Book cache (bibliographic data fetched from Open Library, keyed by ISBN)
-- Pure read-through cache: pre-fills the add-book form. Not referenced by copies.
-- A cache miss simply means the user fills the details in by hand.
CREATE TABLE book_cache (
  id         TEXT PRIMARY KEY,
  isbn       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  author     TEXT NOT NULL,
  cover_url  TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copies (self-contained listings: one row per physical item a lender offers)
-- Carries its own metadata snapshot (title/author/genre/etc.) so two lenders
-- listing the same ISBN never share each other's edits.
CREATE TABLE copies (
  id          TEXT PRIMARY KEY,
  isbn        TEXT,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  genre_id    TEXT NOT NULL REFERENCES genres(id),
  description TEXT,
  cover_url   TEXT,
  owner_id    TEXT NOT NULL REFERENCES users(id),
  owner_notes TEXT,
  status      TEXT NOT NULL DEFAULT 'available'
              CHECK (status IN ('available', 'reserved', 'on_loan', 'unavailable')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Requests (queue entries and active loans in one table; one queue per copy)
CREATE TABLE requests (
  id            TEXT PRIMARY KEY,
  copy_id       TEXT NOT NULL REFERENCES copies(id),
  lender_id     TEXT NOT NULL REFERENCES users(id),
  borrower_name TEXT NOT NULL,
  borrower_tele TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued', 'ready', 'on_loan', 'returned', 'cancelled')),
  requested_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ready_at      TEXT,
  loaned_at     TEXT,
  returned_at   TEXT
);

-- Sessions (server-side auth for lenders and admin)
CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Passcodes (one row per group; multiple active codes are all valid)
CREATE TABLE passcodes (
  id         TEXT PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,  -- admin-facing label, e.g. "St Andrew's group"
  active     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings (key–value pairs for site-wide config)
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_copies_genre    ON copies(genre_id);
CREATE INDEX idx_copies_owner     ON copies(owner_id);
CREATE INDEX idx_copies_status    ON copies(status);
CREATE INDEX idx_copies_isbn      ON copies(isbn);
CREATE INDEX idx_requests_copy    ON requests(copy_id);
CREATE INDEX idx_requests_lender  ON requests(lender_id);
CREATE INDEX idx_requests_status  ON requests(status);
CREATE INDEX idx_sessions_user    ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_passcodes_active ON passcodes(active);

-- Seed: genre tree (mirrors GENRES in src/lib/constants.ts)
INSERT INTO genres (id, name, parent_id, path) VALUES
  ('FIC000000', 'Fiction',                      NULL,        'fiction'),
  ('FIC019000', 'Literary Fiction',             'FIC000000', 'fiction/literary'),
  ('FIC010000', 'Contemporary Fiction',         'FIC000000', 'fiction/contemporary'),
  ('FIC014000', 'Historical Fiction',           'FIC000000', 'fiction/historical'),
  ('FIC009000', 'Fantasy',                      'FIC000000', 'fiction/fantasy'),
  ('FIC028000', 'Science Fiction',              'FIC000000', 'fiction/sci-fi'),
  ('FIC060000', 'Christian',                    'FIC000000', 'fiction/christian'),
  ('NON000000', 'Non Fiction',                  NULL,        'non-fiction'),
  ('HIS000000', 'History',                      'NON000000', 'non-fiction/history'),
  ('BIO000000', 'Biography & Memoir',           'NON000000', 'non-fiction/biography'),
  ('COM000000', 'Computing',                    'NON000000', 'non-fiction/computing'),
  ('SCI000000', 'Science & Nature',             'NON000000', 'non-fiction/science'),
  ('SCI040000', 'Physics',                      'SCI000000', 'non-fiction/science/physics'),
  ('SCI013000', 'Chemistry',                    'SCI000000', 'non-fiction/science/chemistry'),
  ('NAT000000', 'Biology & Natural History',    'SCI000000', 'non-fiction/science/biology'),
  ('MED000000', 'Medicine & Health',            'SCI000000', 'non-fiction/science/medicine'),
  ('MAT000000', 'Mathematics',                  'SCI000000', 'non-fiction/science/mathematics'),
  ('SCI026000', 'Environment & Climate Change', 'SCI000000', 'non-fiction/science/environment'),
  ('POL000000', 'Social Sciences & Politics',   'NON000000', 'non-fiction/social-sciences'),
  ('ECO000000', 'Economics',                    'POL000000', 'non-fiction/social-sciences/economics'),
  ('PHI000000', 'Philosophy',                   'NON000000', 'non-fiction/philosophy'),
  ('PHI015000', 'Political Philosophy',         'PHI000000', 'non-fiction/philosophy/political'),
  ('PHI012000', 'Epistemology',                 'PHI000000', 'non-fiction/philosophy/epistemology'),
  ('PHI017000', 'Philosophy of Religion',       'PHI000000', 'non-fiction/philosophy/philosophy-of-religion'),
  ('ARC014000', 'Urban Planning',               'NON000000', 'non-fiction/urban-planning'),
  ('REL000000', 'Religion',                     'NON000000', 'non-fiction/religion'),
  ('REL027000', 'Islam',                        'REL000000', 'non-fiction/religion/islam'),
  ('REL010000', 'Christianity',                 'REL000000', 'non-fiction/religion/christianity'),
  ('REL012000', 'Christian Living',             'REL010000', 'non-fiction/religion/christianity/christian-living'),
  ('REL011000', 'Christian Teaching',           'REL010000', 'non-fiction/religion/christianity/christian-teaching'),
  ('REL011010', 'Ecclesiology',                 'REL011000', 'non-fiction/religion/christianity/christian-teaching/ecclesiology'),
  ('REL011020', 'Doctrine',                     'REL011000', 'non-fiction/religion/christianity/christian-teaching/doctrine'),
  ('REL011030', 'Apologetics',                  'REL011000', 'non-fiction/religion/christianity/christian-teaching/apologetics');

-- Seed: default settings
INSERT INTO settings (key, value) VALUES
  ('max_active_requests', '2');
