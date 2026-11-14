import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { submitISBNList } from '@/api/books';

export type BookDraft = {
  isbn: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  owner_note: string;
  has_owner_note: boolean;
  status: 'available' | 'unavailable';
};

type AddBooksContextValue = {
  isbns: string[];
  drafts: Record<string, BookDraft>;
  submitISBNs: (isbns: string[]) => Promise<void>;
  updateDraft: (isbn: string, updates: Partial<BookDraft>) => void;
};

const AddBooksContext = createContext<AddBooksContextValue | null>(null);

function createEmptyDraft(isbn: string): BookDraft {
  return { isbn, title: '', author: '', description: '', cover_url: '', owner_note: '', has_owner_note: false, status: 'available' };
}

export function AddBooksProvider({ children }: { children: React.ReactNode }) {
  const [isbns, setISBNs] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, BookDraft>>({});
  const submissionIdRef = useRef(0);

  const submitISBNs = useCallback(async (newISBNs: string[]) => {
    ++submissionIdRef.current;
    setISBNs(newISBNs);
    setDrafts(Object.fromEntries(newISBNs.map((isbn) => [isbn, createEmptyDraft(isbn)])));
    await submitISBNList(newISBNs);
  }, []);

  const updateDraft = useCallback((isbn: string, updates: Partial<BookDraft>) => {
    setDrafts((prev) => {
      const existing = prev[isbn];
      if (!existing) return prev;
      return { ...prev, [isbn]: { ...existing, ...updates } };
    });
  }, []);

  return (
    <AddBooksContext.Provider value={{ isbns, drafts, submitISBNs, updateDraft }}>
      {children}
    </AddBooksContext.Provider>
  );
}

export function useAddBooks(): AddBooksContextValue {
  const ctx = useContext(AddBooksContext);
  if (!ctx) throw new Error('useAddBooks must be used within AddBooksProvider');
  return ctx;
}
