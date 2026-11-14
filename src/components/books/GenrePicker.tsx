import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from 'cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GENRES } from '@/lib/constants';
import type { Genre } from '@/data/types';

interface GenrePickerProps {
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
}

function parentOf(node: Genre | null): Genre | null {
  if (!node?.parent_id) return null;
  return GENRES.find((g) => g.id === node.parent_id) ?? null;
}

const rowClasses =
  'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent';

export function GenrePicker({ value, onChange, invalid }: GenrePickerProps) {
  const [open, setOpen] = useState(false);
  // The node we've drilled into (null = top level). Its children are listed.
  const [current, setCurrent] = useState<Genre | null>(null);

  const selected = value ? GENRES.find((g) => g.id === value) ?? null : null;

  const trail = useMemo(() => {
    const t: Genre[] = [];
    let node = current;
    while (node) {
      t.unshift(node);
      node = parentOf(node);
    }
    return t;
  }, [current]);

  const items = GENRES.filter((g) => g.parent_id === (current?.id ?? null));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // On open, jump to the branch containing the current selection so it's in view.
    if (next) setCurrent(selected ? parentOf(selected) : null);
  }

  function select(g: Genre) {
    onChange(g.id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-invalid={invalid}
            className={cn(
              'flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              invalid ? 'border-destructive' : 'border-input',
            )}
          >
            <span className={cn('truncate', !selected && 'text-muted-foreground')}>
              {selected ? selected.name : 'Select a genre…'}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent
        align="start"
        className="w-(--anchor-width) max-h-80 gap-0 overflow-y-auto p-1"
      >
        {current && (
          <>
            <button
              type="button"
              onClick={() => setCurrent(parentOf(current))}
              className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <ChevronLeft className="size-3.5 shrink-0" />
              <span className="truncate">{trail.map((t) => t.name).join(' / ')}</span>
            </button>
            <button type="button" onClick={() => select(current)} className={cn(rowClasses, 'font-medium')}>
              <span className="truncate">{current.name}</span>
              {value === current.id ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <span className="shrink-0 text-xs font-normal text-muted-foreground">this category</span>
              )}
            </button>
            <div className="my-1 h-px bg-border" />
          </>
        )}
        {items.map((g) => {
          const hasChildren = GENRES.some((c) => c.parent_id === g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => (hasChildren ? setCurrent(g) : select(g))}
              className={rowClasses}
            >
              <span className="truncate">{g.name}</span>
              {hasChildren ? (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              ) : value === g.id ? (
                <Check className="size-4 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
