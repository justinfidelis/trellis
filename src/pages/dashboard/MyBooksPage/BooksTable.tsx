import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, ListFilter, ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react';
import { CoverImage } from '@/components/books/CoverImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CopyStatus, Request, Copy } from '@/data/types';

export type SortKey = 'title' | 'author';
export type SortDir = 'asc' | 'desc';
export type BookRow = { copy: Copy; primary: Request | null; queue: Request[] };

const statusConfig: Record<CopyStatus, { label: string; className?: string }> = {
  available:   { label: 'Available',   className: 'bg-lime-600/10 text-lime-700 dark:text-lime-400' },
  reserved:    { label: 'Reserved',    className: 'bg-amber-600/10 text-amber-700 dark:text-amber-400' },
  on_loan:     { label: 'On loan',     className: 'bg-blue-600/10 text-blue-700 dark:text-blue-400' },
  unavailable: { label: 'Unavailable', className: 'bg-rose-600/10 text-rose-700 dark:text-rose-400' },
};

const ALL_STATUSES: CopyStatus[] = ['reserved', 'on_loan', 'available', 'unavailable'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

interface BooksTableProps {
  rows: BookRow[];
  filteredTotal: number;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  statusFilter: Set<CopyStatus>;
  onStatusFilter: (s: Set<CopyStatus>) => void;
  loadingCopyId: string | null;
  onStatusAction: (copyId: string, action: 'return' | 'hand_off' | 'disable' | 'enable') => void;
  currentPage: number;
  totalPages: number;
  perPage: number;
  pageSizeOptions: number[];
  onPageChange: (p: number) => void;
  onPerPageChange: (size: number) => void;
}

export function BooksTable({
  rows, filteredTotal, sortKey, sortDir, onSort,
  statusFilter, onStatusFilter, loadingCopyId, onStatusAction,
  currentPage, totalPages, perPage, pageSizeOptions, onPageChange, onPerPageChange,
}: BooksTableProps) {
  return (
    <TooltipProvider>
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <SortableHead label="Title"  sortKey="title"  activeKey={sortKey} dir={sortDir} onSort={onSort} className="w-full" />
              <SortableHead label="Author" sortKey="author" activeKey={sortKey} dir={sortDir} onSort={onSort} className="min-w-36" />
              <StatusFilterHead filter={statusFilter} onChange={onStatusFilter} />
              <TableHead className="min-w-36 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requester</TableHead>
              <TableHead className="min-w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">Telegram</TableHead>
              <TableHead className="min-w-32 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ copy, primary, queue }) => {
              const { label, className } = statusConfig[copy.status];
              return (
                <TableRow key={copy.id} className="group">
                  <TableCell className="py-2">
                    <Link to={`/book/${copy.id}`} className="block w-10 aspect-[2/3] rounded overflow-hidden bg-muted">
                      <CoverImage src={copy.cover_url} title={copy.title} iconClassName="w-4 h-4" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/book/${copy.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                      {copy.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{copy.author}</TableCell>
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
                                <DropdownMenuItem onClick={() => onStatusAction(copy.id, 'return')}>
                                  Set status to <Badge variant="secondary" className={statusConfig[target].className}>{statusConfig[target].label}</Badge>
                                </DropdownMenuItem>
                              );
                            })()}
                            {copy.status === 'reserved' && (
                              <DropdownMenuItem onClick={() => onStatusAction(copy.id, 'hand_off')}>
                                Set status to <Badge variant="secondary" className={statusConfig['on_loan'].className}>{statusConfig['on_loan'].label}</Badge>
                              </DropdownMenuItem>
                            )}
                            {copy.status === 'available' && (
                              <DropdownMenuItem onClick={() => onStatusAction(copy.id, 'disable')}>
                                Set status to <Badge variant="secondary" className={statusConfig['unavailable'].className}>{statusConfig['unavailable'].label}</Badge>
                              </DropdownMenuItem>
                            )}
                            {copy.status === 'unavailable' && (
                              <DropdownMenuItem onClick={() => onStatusAction(copy.id, 'enable')}>
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

        {filteredTotal > 0 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Per page</span>
              <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs">
                {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredTotal)} of {filteredTotal}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm px-3">{currentPage} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}
