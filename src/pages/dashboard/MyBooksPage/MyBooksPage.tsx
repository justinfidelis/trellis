import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageShell } from '@/components/layout/PageShell';
import { mockBooks, mockCopies, mockRequests } from '@/data/mock';
import type { CopyStatus, RequestStatus } from '@/data/types';
import { BooksTable, type BookRow, type SortKey, type SortDir } from './BooksTable';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PER_PAGE = 25;
const MOCK_LENDER_ID = 'u1';

const statusOrder: Record<CopyStatus, number> = {
  reserved: 0, on_loan: 1, available: 2, unavailable: 3,
};

// TODO(backend): replace with a dedicated lender-copies endpoint that returns
// copies with their active request details (requester name, tele, dates) joined
// server-side. This is intentionally separate from the borrower-facing book-browse
// API — that one omits requester PII and doesn't need per-copy loan state.
function buildRows(): BookRow[] {
  const copies = mockCopies.filter((c) => c.owner_id === MOCK_LENDER_ID);
  return copies.map((copy) => {
    const book = mockBooks.find((b) => b.id === copy.book_id)!;
    const active = mockRequests.filter(
      (r) => r.copy_id === copy.id && (r.status === 'on_loan' || r.status === 'ready')
    );
    const queue = mockRequests.filter(
      (r) => r.copy_id === copy.id && r.status === 'queued'
    );
    return { copy, book, primary: active[0] ?? null, queue };
  });
}

export function MyBooksPage() {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<Set<CopyStatus>>(new Set(['reserved', 'on_loan', 'available', 'unavailable'] as CopyStatus[]));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [allRows, setAllRows] = useState<BookRow[]>(() => buildRows());
  const [loadingCopyId, setLoadingCopyId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilter(next: Set<CopyStatus>) {
    setStatusFilter(next);
    setPage(1);
  }

  function handlePerPage(size: number) {
    setPerPage(size);
    setPage(1);
  }

  async function handleStatusAction(copyId: string, action: 'return' | 'hand_off' | 'disable' | 'enable') {
    setLoadingCopyId(copyId);
    try {
      // TODO(backend): replace the optimistic update below with an API call, e.g.:
      // await api.patch(`/copies/${copyId}/status`, { action });
      // then re-fetch or update from the response.
      setAllRows(prev => prev.map(row => {
        if (row.copy.id !== copyId) return row;
        switch (action) {
          case 'return': {
            const hasQueue = row.queue.length > 0;
            const newPrimary = hasQueue ? { ...row.queue[0], status: 'ready' as RequestStatus } : null;
            return {
              ...row,
              copy: { ...row.copy, status: (hasQueue ? 'reserved' : 'available') as CopyStatus },
              primary: newPrimary,
              queue: hasQueue ? row.queue.slice(1) : [],
            };
          }
          case 'hand_off':
            return {
              ...row,
              copy: { ...row.copy, status: 'on_loan' as CopyStatus },
              primary: row.primary ? { ...row.primary, status: 'on_loan' as RequestStatus } : row.primary,
            };
          case 'disable':
            return { ...row, copy: { ...row.copy, status: 'unavailable' as CopyStatus } };
          case 'enable':
            return { ...row, copy: { ...row.copy, status: 'available' as CopyStatus } };
        }
      }));
    } finally {
      setLoadingCopyId(null);
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = allRows.filter((r) => {
      if (!statusFilter.has(r.copy.status)) return false;
      if (q && !r.book.title.toLowerCase().includes(q) && !r.book.author.toLowerCase().includes(q) && !(r.primary?.borrower_name ?? '').toLowerCase().includes(q) && !(r.primary?.borrower_tele ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
    // TODO(backend): default ordering (reserved → on_loan → available → unavailable,
    // then by requester name) should be the API's default response order, not
    // computed here. Remove this sort once the real endpoint is wired up.
    return [...filtered].sort((a, b) => {
      if (sortKey === null) {
        const statusCmp = statusOrder[a.copy.status] - statusOrder[b.copy.status];
        if (statusCmp !== 0) return statusCmp;
        return (a.primary?.borrower_name ?? '').localeCompare(b.primary?.borrower_name ?? '');
      }
      let cmp = 0;
      if (sortKey === 'title') cmp = a.book.title.localeCompare(b.book.title);
      else if (sortKey === 'author') cmp = a.book.author.localeCompare(b.book.author);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [allRows, sortKey, sortDir, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const rows = filteredRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="space-y-0.5 shrink-0">
            <h1 className="text-2xl font-semibold tracking-tight">My Books</h1>
            <p className="text-sm text-muted-foreground">{allRows.length} {allRows.length === 1 ? 'book' : 'books'} in your library</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title, author, requester…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-72"
            />
          </div>
          <Button className="shrink-0 ml-auto" onClick={() => navigate('/dashboard/books/add')}>
            <Plus className="size-4" />
            Add Book
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">{search ? 'No results found' : 'No books yet'}</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term.' : 'Your lending library is empty.'}
              </p>
            </div>
          </div>
        ) : (
          <BooksTable
            rows={rows}
            filteredTotal={filteredRows.length}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            statusFilter={statusFilter}
            onStatusFilter={handleStatusFilter}
            loadingCopyId={loadingCopyId}
            onStatusAction={handleStatusAction}
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPerPageChange={handlePerPage}
          />
        )}
      </div>
    </PageShell>
  );
}
