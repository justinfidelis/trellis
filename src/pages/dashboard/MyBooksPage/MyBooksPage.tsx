import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageShell } from '@/components/layout/PageShell';
import { useLenderBooks } from '@/hooks/useBooks';
import { useLenderRequests, useUpdateRequest, useUpdateCopyStatus } from '@/hooks/useRequests';
import type { CopyStatus } from '@/data/types';
import { BooksTable, type BookRow, type SortKey, type SortDir } from './BooksTable';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PER_PAGE = 25;

const statusOrder: Record<CopyStatus, number> = {
  reserved: 0, on_loan: 1, available: 2, unavailable: 3,
};

export function MyBooksPage() {
  const navigate = useNavigate();
  const { data: lenderBooks = [], isLoading } = useLenderBooks();
  const { data: requests = [] } = useLenderRequests();
  const updateRequest = useUpdateRequest();
  const updateCopyStatus = useUpdateCopyStatus();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<Set<CopyStatus>>(new Set(['reserved', 'on_loan', 'available', 'unavailable'] as CopyStatus[]));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [loadingCopyId, setLoadingCopyId] = useState<string | null>(null);

  // Join copies with their active requests
  const allRows = useMemo((): BookRow[] => {
    return lenderBooks.map((copy) => {
      const primary = requests.find(
        (r) => r.copy_id === copy.id && (r.status === 'on_loan' || r.status === 'ready'),
      ) ?? null;
      const queue = requests.filter(
        (r) => r.copy_id === copy.id && r.status === 'queued',
      );
      return { copy, primary, queue };
    });
  }, [lenderBooks, requests]);

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
      const row = allRows.find((r) => r.copy.id === copyId);
      if (!row) return;

      switch (action) {
        case 'return':
          if (row.primary) {
            await updateRequest.mutateAsync({ id: row.primary.id, status: 'returned' });
          }
          break;
        case 'hand_off':
          if (row.primary) {
            await updateRequest.mutateAsync({ id: row.primary.id, status: 'on_loan', copy_id: copyId });
          }
          break;
        case 'disable':
          await updateCopyStatus.mutateAsync({ id: copyId, status: 'unavailable' });
          break;
        case 'enable':
          await updateCopyStatus.mutateAsync({ id: copyId, status: 'available' });
          break;
      }
    } finally {
      setLoadingCopyId(null);
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = allRows.filter((r) => {
      if (!statusFilter.has(r.copy.status)) return false;
      if (q && !r.copy.title.toLowerCase().includes(q) && !r.copy.author.toLowerCase().includes(q) && !(r.primary?.borrower_name ?? '').toLowerCase().includes(q) && !(r.primary?.borrower_tele ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === null) {
        const statusCmp = statusOrder[a.copy.status] - statusOrder[b.copy.status];
        if (statusCmp !== 0) return statusCmp;
        return (a.primary?.borrower_name ?? '').localeCompare(b.primary?.borrower_name ?? '');
      }
      let cmp = 0;
      if (sortKey === 'title') cmp = a.copy.title.localeCompare(b.copy.title);
      else if (sortKey === 'author') cmp = a.copy.author.localeCompare(b.copy.author);
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

        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
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
