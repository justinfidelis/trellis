import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, X } from 'lucide-react';
import { useBasket, BASKET_LIMIT } from '@/context/BasketContext';
import { useCopiesWithBooks } from '@/hooks/useBooks';
import { CoverImage } from '@/components/books/CoverImage';
import { Button } from '@/components/ui/button';

interface BasketDropdownProps {
  onClose: () => void;
}

export function BasketDropdown({ onClose }: BasketDropdownProps) {
  const { items, atLimit, removeItem } = useBasket();
  const copies = useCopiesWithBooks(items);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-background shadow-lg z-50 flex flex-col"
    >
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <p className="font-medium text-sm">My Basket</p>
        <span className={`text-xs font-medium ${atLimit ? 'text-amber-500' : 'text-muted-foreground'}`}>
          {items.length} / {BASKET_LIMIT}
        </span>
      </div>

      {copies.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          Your basket is empty
        </div>
      ) : (
        <ul className="divide-y max-h-80 overflow-y-auto">
          {copies.map((item) => {
            const toReserve = item.status !== 'available';
            return (
              <li key={item.id} className="group flex items-center gap-3 px-4 py-3">
                <div className="w-8 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
                  <CoverImage src={item.cover_url} title={item.title} iconClassName="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                  {toReserve && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">To Reserve</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded text-muted-foreground hover:text-red-500"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-4 py-3 border-t">
        <Button size="sm" className="w-full" disabled={copies.length === 0} nativeButton={false} render={<Link to="/basket" />} onClick={onClose}>
          <ShoppingBasket />
          Checkout
        </Button>
      </div>
    </div>
  );
}
