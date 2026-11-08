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

-- Books (one catalogue entry per title)
CREATE TABLE books (
  id          TEXT PRIMARY KEY,
  isbn        TEXT UNIQUE,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  genre_id    TEXT NOT NULL REFERENCES genres(id),
  description TEXT,
  cover_url   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copies (physical items that can be lent)
CREATE TABLE copies (
  id          TEXT PRIMARY KEY,
  book_id     TEXT NOT NULL REFERENCES books(id),
  owner_id    TEXT NOT NULL REFERENCES users(id),
  owner_notes TEXT,
  status      TEXT NOT NULL DEFAULT 'available'
              CHECK (status IN ('available', 'reserved', 'on_loan', 'unavailable')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Requests (queue entries and active loans in one table)
CREATE TABLE requests (
  id            TEXT PRIMARY KEY,
  book_id       TEXT NOT NULL REFERENCES books(id),
  lender_id     TEXT NOT NULL REFERENCES users(id),
  copy_id       TEXT REFERENCES copies(id),
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
CREATE INDEX idx_books_genre      ON books(genre_id);
CREATE INDEX idx_copies_book      ON copies(book_id);
CREATE INDEX idx_copies_owner     ON copies(owner_id);
CREATE INDEX idx_copies_status    ON copies(status);
CREATE INDEX idx_requests_book    ON requests(book_id);
CREATE INDEX idx_requests_lender  ON requests(lender_id);
CREATE INDEX idx_requests_status  ON requests(status);
CREATE INDEX idx_sessions_user    ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_passcodes_active ON passcodes(active);

-- Seed: default settings
INSERT INTO settings (key, value) VALUES
  ('max_active_requests', '2');
