import type { D1Database } from '@cloudflare/workers-types';

export function generateId(): string {
  return crypto.randomUUID();
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(db: D1Database, email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<{
    id: string; email: string; name: string; tele_handle: string; role: string; created_at: string;
  }>();
}

export async function getUserById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<{
    id: string; email: string; name: string; tele_handle: string; role: string; created_at: string;
  }>();
}

export async function getAllLenders(db: D1Database) {
  return (await db.prepare("SELECT * FROM users WHERE role = 'lender' ORDER BY created_at ASC").all()).results;
}

export async function createUser(db: D1Database, user: { email: string; name: string; tele_handle: string; role: string }) {
  const id = generateId();
  await db.prepare('INSERT INTO users (id, email, name, tele_handle, role) VALUES (?, ?, ?, ?, ?)')
    .bind(id, user.email, user.name, user.tele_handle, user.role)
    .run();
  return id;
}

export async function deleteUser(db: D1Database, id: string) {
  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
}

// ── Genres ───────────────────────────────────────────────────────────────────

export async function getAllGenres(db: D1Database) {
  return (await db.prepare('SELECT * FROM genres ORDER BY path ASC').all()).results;
}

// ── Books ────────────────────────────────────────────────────────────────────

export async function getBooksWithCopies(db: D1Database, opts: {
  query?: string;
  genrePath?: string;
  availableOnly?: boolean;
}) {
  const conditions: string[] = ["c.status != 'unavailable'"];
  const bindings: unknown[] = [];

  if (opts.availableOnly) {
    conditions.push("c.status = 'available'");
  }
  if (opts.genrePath) {
    conditions.push("(g.path = ? OR g.path LIKE ?)");
    bindings.push(opts.genrePath, opts.genrePath + '/%');
  }
  if (opts.query) {
    conditions.push("(b.title LIKE ? OR b.author LIKE ?)");
    const like = `%${opts.query}%`;
    bindings.push(like, like);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const sql = `
    SELECT b.*, c.id as copy_id, c.owner_id, c.owner_notes, c.status, c.created_at as copy_created_at,
           u.name as owner_name
    FROM copies c
    JOIN books b ON b.id = c.book_id
    JOIN genres g ON g.id = b.genre_id
    JOIN users u ON u.id = c.owner_id
    ${where}
    ORDER BY b.title ASC
  `;
  return (await db.prepare(sql).bind(...bindings).all()).results;
}

export async function getBookById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM books WHERE id = ?').bind(id).first();
}

export async function getCopyWithBook(db: D1Database, copyId: string) {
  const sql = `
    SELECT b.*, c.id as copy_id, c.owner_id, c.owner_notes, c.status, c.created_at as copy_created_at,
           u.name as owner_name
    FROM copies c
    JOIN books b ON b.id = c.book_id
    JOIN users u ON u.id = c.owner_id
    WHERE c.id = ?
  `;
  return db.prepare(sql).bind(copyId).first();
}

export async function createBook(db: D1Database, book: {
  isbn?: string; title: string; author: string; genre_id: string; description?: string; cover_url?: string;
}) {
  const id = generateId();
  await db.prepare('INSERT INTO books (id, isbn, title, author, genre_id, description, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, book.isbn ?? null, book.title, book.author, book.genre_id, book.description ?? null, book.cover_url ?? null)
    .run();
  return id;
}

// ── Copies ───────────────────────────────────────────────────────────────────

export async function getCopiesByOwner(db: D1Database, ownerId: string) {
  const sql = `
    SELECT b.*, c.id as copy_id, c.owner_id, c.owner_notes, c.status, c.created_at as copy_created_at
    FROM copies c
    JOIN books b ON b.id = c.book_id
    WHERE c.owner_id = ?
    ORDER BY b.title ASC
  `;
  return (await db.prepare(sql).bind(ownerId).all()).results;
}

export async function createCopy(db: D1Database, copy: {
  book_id: string; owner_id: string; owner_notes?: string;
}) {
  const id = generateId();
  await db.prepare('INSERT INTO copies (id, book_id, owner_id, owner_notes) VALUES (?, ?, ?, ?)')
    .bind(id, copy.book_id, copy.owner_id, copy.owner_notes ?? null)
    .run();
  return id;
}

export async function updateCopy(db: D1Database, id: string, fields: {
  status?: string; owner_notes?: string;
}) {
  const sets: string[] = [];
  const bindings: unknown[] = [];
  if (fields.status !== undefined) { sets.push('status = ?'); bindings.push(fields.status); }
  if (fields.owner_notes !== undefined) { sets.push('owner_notes = ?'); bindings.push(fields.owner_notes); }
  if (!sets.length) return;
  bindings.push(id);
  await db.prepare(`UPDATE copies SET ${sets.join(', ')} WHERE id = ?`).bind(...bindings).run();
}

export async function getCopyById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM copies WHERE id = ?').bind(id).first<{
    id: string; book_id: string; owner_id: string; owner_notes: string | null; status: string; created_at: string;
  }>();
}

// ── Requests ─────────────────────────────────────────────────────────────────

export async function createRequest(db: D1Database, req: {
  book_id: string; lender_id: string; borrower_name: string; borrower_tele: string;
}) {
  const id = generateId();
  await db.prepare('INSERT INTO requests (id, book_id, lender_id, borrower_name, borrower_tele) VALUES (?, ?, ?, ?, ?)')
    .bind(id, req.book_id, req.lender_id, req.borrower_name, req.borrower_tele)
    .run();
  return id;
}

export async function getRequestById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM requests WHERE id = ?').bind(id).first<{
    id: string; book_id: string; lender_id: string; copy_id: string | null;
    borrower_name: string; borrower_tele: string; status: string;
    requested_at: string; ready_at: string | null; loaned_at: string | null; returned_at: string | null;
  }>();
}

export async function updateRequest(db: D1Database, id: string, fields: {
  status?: string; copy_id?: string; ready_at?: string; loaned_at?: string; returned_at?: string;
}) {
  const sets: string[] = [];
  const bindings: unknown[] = [];
  if (fields.status !== undefined)     { sets.push('status = ?');      bindings.push(fields.status); }
  if (fields.copy_id !== undefined)    { sets.push('copy_id = ?');     bindings.push(fields.copy_id); }
  if (fields.ready_at !== undefined)   { sets.push('ready_at = ?');    bindings.push(fields.ready_at); }
  if (fields.loaned_at !== undefined)  { sets.push('loaned_at = ?');   bindings.push(fields.loaned_at); }
  if (fields.returned_at !== undefined){ sets.push('returned_at = ?'); bindings.push(fields.returned_at); }
  if (!sets.length) return;
  bindings.push(id);
  await db.prepare(`UPDATE requests SET ${sets.join(', ')} WHERE id = ?`).bind(...bindings).run();
}

export async function getRequestsByLender(db: D1Database, lenderId: string) {
  const sql = `
    SELECT r.*, b.title as book_title, b.author as book_author
    FROM requests r
    JOIN books b ON b.id = r.book_id
    WHERE r.lender_id = ? AND r.status NOT IN ('returned', 'cancelled')
    ORDER BY r.requested_at ASC
  `;
  return (await db.prepare(sql).bind(lenderId).all()).results;
}

export async function getAllActiveRequests(db: D1Database) {
  const sql = `
    SELECT r.*, b.title as book_title, b.author as book_author, u.name as lender_name
    FROM requests r
    JOIN books b ON b.id = r.book_id
    JOIN users u ON u.id = r.lender_id
    WHERE r.status NOT IN ('returned', 'cancelled')
    ORDER BY r.requested_at ASC
  `;
  return (await db.prepare(sql).all()).results;
}

export async function getActiveRequestCountForBorrower(db: D1Database, name: string, tele: string) {
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM requests WHERE borrower_name = ? AND borrower_tele = ? AND status IN ('queued', 'ready', 'on_loan')"
  ).bind(name, tele).first<{ count: number }>();
  return result?.count ?? 0;
}

export async function getNextInQueue(db: D1Database, bookId: string, lenderId: string) {
  return db.prepare(
    "SELECT * FROM requests WHERE book_id = ? AND lender_id = ? AND status = 'queued' ORDER BY requested_at ASC LIMIT 1"
  ).bind(bookId, lenderId).first<{ id: string; borrower_name: string; borrower_tele: string }>();
}

// ── Passcodes ─────────────────────────────────────────────────────────────────

export async function isValidPasscode(db: D1Database, code: string): Promise<boolean> {
  const row = await db.prepare("SELECT id FROM passcodes WHERE code = ? AND active = 1").bind(code).first();
  return row !== null;
}

export async function getAllPasscodes(db: D1Database) {
  return (await db.prepare('SELECT * FROM passcodes ORDER BY created_at ASC').all()).results;
}

export async function createPasscode(db: D1Database, code: string, label: string) {
  const id = generateId();
  await db.prepare('INSERT INTO passcodes (id, code, label) VALUES (?, ?, ?)').bind(id, code, label).run();
  return id;
}

export async function updatePasscode(db: D1Database, id: string, active: boolean) {
  await db.prepare('UPDATE passcodes SET active = ? WHERE id = ?').bind(active ? 1 : 0, id).run();
}

export async function deletePasscode(db: D1Database, id: string) {
  await db.prepare('DELETE FROM passcodes WHERE id = ?').bind(id).run();
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSetting(db: D1Database, key: string, value: string) {
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, value).run();
}
