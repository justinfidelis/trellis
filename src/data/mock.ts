import type { Book, Copy, Request, Settings, User } from './types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'alice@example.com',
    name: 'Alice Tan',
    tele_handle: 'alicetan',
    role: 'lender',
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    name: 'Bob Lim',
    tele_handle: 'boblim',
    role: 'lender',
    created_at: '2025-02-05T09:00:00Z',
  },
  {
    id: 'u3',
    email: 'carol@example.com',
    name: 'Carol Ng',
    tele_handle: 'carolng',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z',
  },
];

export const mockBooks: Book[] = [
  {
    id: 'b1',
    isbn: '9780525559474',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre_id: 'FIC019000',
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever.',
    cover_url: null,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'b2',
    isbn: '9780593311929',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre_id: 'NON000000',
    description:
      'A practical guide to building good habits and breaking bad ones through tiny changes.',
    cover_url: null,
    created_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'b3',
    isbn: '9780385545396',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre_id: 'FIC028000',
    description:
      'A lone astronaut must save Earth from disaster in this propulsive, scientifically rich thriller.',
    cover_url: null,
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'b4',
    isbn: '9781250301697',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    genre_id: 'FIC014000',
    description:
      'A retelling of the Iliad following the love story between Achilles and Patroclus.',
    cover_url: null,
    created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'b5',
    isbn: '9780316346627',
    title: 'Educated',
    author: 'Tara Westover',
    genre_id: 'BIO000000',
    description:
      'A memoir about a woman who grows up in a survivalist family and eventually earns a PhD from Cambridge.',
    cover_url: null,
    created_at: '2025-02-15T10:00:00Z',
  },
  {
    id: 'b6',
    isbn: '9781982137274',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre_id: 'HIS000000',
    description: 'A brief history of humankind, from the Stone Age to the modern era.',
    cover_url: null,
    created_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'b7',
    isbn: '9780385737951',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    genre_id: 'FIC019000',
    description:
      'Two teenagers with cancer fall in love and grapple with the meaning of life.',
    cover_url: null,
    created_at: '2025-03-05T10:00:00Z',
  },
  {
    id: 'b8',
    isbn: '9780735224292',
    title: 'Little Fires Everywhere',
    author: 'Celeste Ng',
    genre_id: 'FIC019000',
    description:
      'Two families in a planned community collide over motherhood, identity, and the power of art.',
    cover_url: null,
    created_at: '2025-03-10T10:00:00Z',
  },
  {
    id: 'b9',
    isbn: '9780593099193',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    genre_id: 'ECO000000',
    description: 'Timeless lessons on wealth, greed, and happiness told through stories.',
    cover_url: null,
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'b10',
    isbn: '9780062316110',
    title: 'Dune',
    author: 'Frank Herbert',
    genre_id: 'FIC028000',
    description:
      'An epic of politics, religion, and ecology set in a desert world where water is life.',
    cover_url: null,
    created_at: '2025-03-20T10:00:00Z',
  },
];

export const mockCopies: Copy[] = [
  { id: 'c1', book_id: 'b1', owner_id: 'u1', owner_notes: null, status: 'available', created_at: '2025-01-16T10:00:00Z' },
  { id: 'c2', book_id: 'b1', owner_id: 'u2', owner_notes: 'Slight crease on cover', status: 'on_loan', created_at: '2025-02-06T10:00:00Z' },
  { id: 'c3', book_id: 'b2', owner_id: 'u1', owner_notes: null, status: 'reserved', created_at: '2025-01-21T10:00:00Z' },
  { id: 'c4', book_id: 'b3', owner_id: 'u1', owner_notes: null, status: 'available', created_at: '2025-02-02T10:00:00Z' },
  { id: 'c5', book_id: 'b4', owner_id: 'u2', owner_notes: null, status: 'on_loan', created_at: '2025-02-11T10:00:00Z' },
  { id: 'c6', book_id: 'b5', owner_id: 'u1', owner_notes: null, status: 'available', created_at: '2025-02-16T10:00:00Z' },
  { id: 'c7', book_id: 'b6', owner_id: 'u2', owner_notes: 'Annotated in pencil', status: 'available', created_at: '2025-03-02T10:00:00Z' },
  { id: 'c8', book_id: 'b7', owner_id: 'u1', owner_notes: null, status: 'unavailable', created_at: '2025-03-06T10:00:00Z' },
  { id: 'c9', book_id: 'b8', owner_id: 'u2', owner_notes: null, status: 'available', created_at: '2025-03-11T10:00:00Z' },
  { id: 'c10', book_id: 'b9', owner_id: 'u1', owner_notes: null, status: 'reserved', created_at: '2025-03-16T10:00:00Z' },
  { id: 'c11', book_id: 'b10', owner_id: 'u2', owner_notes: null, status: 'available', created_at: '2025-03-21T10:00:00Z' },
  { id: 'c12', book_id: 'b10', owner_id: 'u1', owner_notes: null, status: 'on_loan', created_at: '2025-03-22T10:00:00Z' },
  { id: 'c13', book_id: 'b3', owner_id: 'u2', owner_notes: null, status: 'reserved', created_at: '2025-02-03T10:00:00Z' },
  { id: 'c14', book_id: 'b6', owner_id: 'u1', owner_notes: null, status: 'on_loan', created_at: '2025-03-03T10:00:00Z' },
  { id: 'c15', book_id: 'b2', owner_id: 'u2', owner_notes: null, status: 'available', created_at: '2025-01-22T10:00:00Z' },
];

export const mockRequests: Request[] = [
  { id: 'r1', book_id: 'b2', lender_id: 'u1', copy_id: 'c3', borrower_name: 'Dana Lee', borrower_tele: 'danalee', status: 'ready', requested_at: '2025-03-01T09:00:00Z', ready_at: '2025-03-05T09:00:00Z', loaned_at: null, returned_at: null },
  { id: 'r2', book_id: 'b1', lender_id: 'u2', copy_id: 'c2', borrower_name: 'Evan Koh', borrower_tele: 'evankoh', status: 'on_loan', requested_at: '2025-02-20T09:00:00Z', ready_at: '2025-02-22T09:00:00Z', loaned_at: '2025-02-25T09:00:00Z', returned_at: null },
  { id: 'r3', book_id: 'b4', lender_id: 'u2', copy_id: 'c5', borrower_name: 'Fiona Yap', borrower_tele: 'fionayap', status: 'on_loan', requested_at: '2025-02-12T09:00:00Z', ready_at: '2025-02-14T09:00:00Z', loaned_at: '2025-02-18T09:00:00Z', returned_at: null },
  { id: 'r4', book_id: 'b9', lender_id: 'u1', copy_id: 'c10', borrower_name: 'George Wee', borrower_tele: 'georgewee', status: 'queued', requested_at: '2025-03-18T09:00:00Z', ready_at: null, loaned_at: null, returned_at: null },
  { id: 'r5', book_id: 'b3', lender_id: 'u2', copy_id: 'c13', borrower_name: 'Hannah Sim', borrower_tele: 'hannahsim', status: 'queued', requested_at: '2025-03-19T09:00:00Z', ready_at: null, loaned_at: null, returned_at: null },
  { id: 'r6', book_id: 'b6', lender_id: 'u1', copy_id: 'c14', borrower_name: 'Ian Chan', borrower_tele: 'ianchan', status: 'returned', requested_at: '2025-02-10T09:00:00Z', ready_at: '2025-02-12T09:00:00Z', loaned_at: '2025-02-15T09:00:00Z', returned_at: '2025-03-01T09:00:00Z' },
  { id: 'r7', book_id: 'b7', lender_id: 'u1', copy_id: null, borrower_name: 'Jess Ong', borrower_tele: 'jessong', status: 'cancelled', requested_at: '2025-03-10T09:00:00Z', ready_at: null, loaned_at: null, returned_at: null },
  { id: 'r8', book_id: 'b10', lender_id: 'u1', copy_id: 'c12', borrower_name: 'Kevin Tan', borrower_tele: 'kevintan', status: 'on_loan', requested_at: '2025-03-23T09:00:00Z', ready_at: '2025-03-24T09:00:00Z', loaned_at: '2025-03-26T09:00:00Z', returned_at: null },
];

export const mockSettings: Settings = {
  passphrase: 'garden',
  max_active_requests: 2,
};
