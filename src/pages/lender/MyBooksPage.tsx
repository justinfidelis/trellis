import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, BookOpen, ListFilter, Search, Plus, ChevronLeft, ChevronRight, Pencil, Loader2 } from 'lucide-react';
import { CoverImage } from '@/components/books/CoverImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PageShell } from '@/components/layout/PageShell';
import { mockBooks, mockCopies, mockRequests } from '@/data/mock';
import type { CopyStatus, RequestStatus, Request, Copy, Book } from '@/data/types';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PER_PAGE = 25;

const MOCK_LENDER_ID = 'u1';

const statusConfig: Record<CopyStatus, { label: string; className?: string }> = {
  available:   { label: 'Available',   className: 'bg-lime-600/10 text-lime-700 dark:text-lime-400' },
  reserved:    { label: 'Reserved',    className: 'bg-amber-600/10 text-amber-700 dark:text-amber-400' },
  on_loan:     { label: 'On loan',     className: 'bg-blue-600/10 text-blue-700 dark:text-blue-400' },
  unavailable: { label: 'Unavailable', className: 'bg-rose-600/10 text-rose-700 dark:text-rose-400' },
};

const statusOrder: Record<CopyStatus, number> = {
  reserved: 0, on_loan: 1, available: 2, unavailable: 3,
};

const ALL_STATUSES: CopyStatus[] = ['reserved', 'on_loan', 'available', 'unavailable'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// TODO(backend): replace with a dedicated lender-copies endpoint that returns
// copies with their active request details (requester name, tele, dates) joined
// server-side. This is intentionally separate from the borrower-facing book-browse
// API — that one omits requester PII and doesn't need per-copy loan state.
function buildRows() {
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

type SortKey = 'title' | 'author';
type SortDir = 'asc' | 'desc';

function SortableHead({
  label, sortKey, activeKey, dir, onSort, className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <Icon className={`size-3.5 ${active ? 'text-foreground' : 'opacity-40'}`} />
      </button>
    </TableHead>
  );
}

function StatusFilterHead({ filter, onChange }: {
  filter: Set<CopyStatus>;
  onChange: (s: Set<CopyStatus>) => void;
}) {
  const isFiltered = filter.size < ALL_STATUSES.length;

  function toggle(status: CopyStatus) {
    const next = new Set(filter);
    if (next.has(status)) {
      next.delete(status);
      if (next.size === 0) { onChange(new Set(ALL_STATUSES)); return; }
    } else {
      next.add(status);
    }
    onChange(next);
  }

  return (
    <TableHead className="min-w-32">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center transition-colors hover:text-foreground">
            <ListFilter className={`size-3.5 ${isFiltered ? 'text-foreground' : 'text-muted-foreground opacity-40 hover:opacity-100'}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto">
            {ALL_STATUSES.map((status) => {
              const { label, className: pillClass } = statusConfig[status];
              return (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filter.has(status)}
                  onCheckedChange={() => toggle(status)}
                  closeOnClick={false}
                >
                  <Badge variant="secondary" className={pillClass}>{label}</Badge>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
}

function TeleHandle({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  return (
    <Tooltip open={copied} onOpenChange={() => {}}>
      <TooltipTrigger
        onClick={handleClick}
        className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
      >
        @{handle}
      </TooltipTrigger>
      <TooltipContent>Copied</TooltipContent>
    </Tooltip>
  );
}

function QueuePopover({ queue }: { queue: Request[] }) {
  const label = queue.length === 1 ? '+1 person in queue' : `+${queue.length} people in queue`;
  return (
    <Popover>
      <PopoverTrigger render={<button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer">{label}</button>} />
      <PopoverContent align="start" className="w-56 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">In queue</p>
        <ul className="space-y-1.5">
          {queue.map((r) => (
            <li key={r.id} className="flex justify-between text-sm">
              <span>{r.borrower_name}</span>
              <span className="text-muted-foreground">@{r.borrower_tele}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

type BookRow = { copy: Copy; book: Book; primary: Request | null; queue: Request[] };

export function MyBooksPage() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<Set<CopyStatus>>(new Set(ALL_STATUSES));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [allRows, setAllRows] = useState<BookRow[]>(() => buildRows());
  const [loadingCopyId, setLoadingCopyId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
      }
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
    return [...filtered].sort((a, b) => {
      if (sortKey === null) {
        // TODO(backend): default ordering (reserved → on_loan → available → unavailable,
        // then by requester name) should be the API's default response order, not
        // computed here. Remove this branch once the real endpoint is wired up.
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
      <TooltipProvider>
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
            <Button className="shrink-0 ml-auto">
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14" />
                    <SortableHead label="Title"  sortKey="title"  activeKey={sortKey} dir={sortDir} onSort={handleSort} className="w-full" />
                    <SortableHead label="Author" sortKey="author" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="min-w-36" />
                    <StatusFilterHead filter={statusFilter} onChange={handleStatusFilter} />
                    <TableHead className="min-w-36 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requester</TableHead>
                    <TableHead className="min-w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">Telegram</TableHead>
                    <TableHead className="min-w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ copy, book, primary, queue }) => {
                    const { label, className } = statusConfig[copy.status];
                    return (
                      <TableRow key={copy.id} className="group">
                        <TableCell className="py-2">
                          <Link to={`/book/${copy.id}`} className="block w-10 aspect-[2/3] rounded overflow-hidden bg-muted">
                            <CoverImage src={book.cover_url} title={book.title} iconClassName="w-4 h-4" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/book/${copy.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                            {book.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{book.author}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className={className}>{label}</Badge>
                            {loadingCopyId === copy.id ? (
                              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
                                  <Pencil className="size-3" />
                                </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-auto">
                                {copy.status === 'on_loan' && (() => {
                                  const target = queue.length > 0 ? 'reserved' : 'available';
                                  return (
                                    <DropdownMenuItem onClick={() => handleStatusAction(copy.id, 'return')}>
                                      Set status to <Badge variant="secondary" className={statusConfig[target].className}>{statusConfig[target].label}</Badge>
                                    </DropdownMenuItem>
                                  );
                                })()}
                                {copy.status === 'reserved' && (
                                  <DropdownMenuItem onClick={() => handleStatusAction(copy.id, 'hand_off')}>
                                    Set status to <Badge variant="secondary" className={statusConfig['on_loan'].className}>{statusConfig['on_loan'].label}</Badge>
                                  </DropdownMenuItem>
                                )}
                                {copy.status === 'available' && (
                                  <DropdownMenuItem onClick={() => handleStatusAction(copy.id, 'disable')}>
                                    Set status to <Badge variant="secondary" className={statusConfig['unavailable'].className}>{statusConfig['unavailable'].label}</Badge>
                                  </DropdownMenuItem>
                                )}
                                {copy.status === 'unavailable' && (
                                  <DropdownMenuItem onClick={() => handleStatusAction(copy.id, 'enable')}>
                                    Set status to <Badge variant="secondary" className={statusConfig['available'].className}>{statusConfig['available'].label}</Badge>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col items-start gap-1">
                            <span>{primary?.borrower_name}</span>
                            {queue.length > 0 && <QueuePopover queue={queue} />}
                          </div>
                        </TableCell>
                        <TableCell>{primary && <TeleHandle handle={primary.borrower_tele} />}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{primary && formatDate(primary.requested_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredRows.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Per page</span>
                    <Select value={String(perPage)} onValueChange={(v) => handlePerPage(Number(v))}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs">
                      {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredRows.length)} of {filteredRows.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft />
                    </Button>
                    <span className="text-sm px-3">{currentPage} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </PageShell>
  );
}
