export type Role = 'lender' | 'admin';

export interface Genre {
  id: string;          // BISAC code, e.g. "FIC028000"
  name: string;        // display name, may differ from BISAC label (e.g. "Sci-Fi" not "Science Fiction / General")
  parent_id: string | null; // BISAC code of parent genre, or null for root nodes
  path: string;        // name-based slug path, e.g. "fiction/sci-fi" — drives URLs and subtree queries
}
export type CopyStatus = 'available' | 'reserved' | 'on_loan' | 'unavailable';
export type RequestStatus = 'queued' | 'ready' | 'on_loan' | 'returned' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  tele_handle: string;
  role: Role;
  created_at: string;
}

// A copy is a self-contained listing: one physical item a lender offers, carrying
// its own metadata snapshot (title/author/genre/etc.). There is no shared "book"
// entity — bibliographic data from Open Library lives only in the server-side cache.
export interface Copy {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  genre_id: string;
  description: string | null;
  cover_url: string | null;
  owner_id: string;
  owner_notes: string | null;
  status: CopyStatus;
  created_at: string;
}

export interface Request {
  id: string;
  copy_id: string;
  lender_id: string;
  borrower_name: string;
  borrower_tele: string;
  status: RequestStatus;
  requested_at: string;
  ready_at: string | null;
  loaned_at: string | null;
  returned_at: string | null;
}

export interface Passcode {
  id: string;
  code: string;
  label: string;
  active: boolean;
  created_at: string;
}

export interface Settings {
  max_active_requests: number;
}
