import type { User } from './types';

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
