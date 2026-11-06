import { Link } from 'react-router-dom';
import { ShoppingBasket, User, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoverImage } from '@/components/books/CoverImage';
import { StatusBadge } from '@/components/requests/StatusBadge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useBasket, BASKET_LIMIT } from '@/context/BasketContext';
import type { CopyWithBook } from '@/hooks/useBooks';

interface BookCardProps {
  item: CopyWithBook;
}

export function BookCard({ item }: BookCardProps) {
  const isAvailable = item.status === 'available';
  const ownerFirstName = item.owner_name.split(' ')[0];
  const { hasItem, addItem, removeItem, atLimit } = useBasket();
  const inBasket = hasItem(item.id);
  const disabled = atLimit && !inBasket;

  return (
    <Link to={`/book/${item.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md h-full ring-transparent group-hover:ring-foreground/10 gap-1">
        <div className="aspect-[3/2] flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[3/4] overflow-hidden">
            <CoverImage src={item.cover_url} title={item.title} />
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <div className="space-y-0.5">
            <p className={`font-medium text-sm leading-snug line-clamp-2 ${!isAvailable ? 'text-muted-foreground' : ''}`}>
              {item.title}
            </p>
            <p className="text-muted-foreground text-xs">{item.author}</p>
          </div>
          <div className="flex items-center gap-2 h-5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="size-3" />
              <span className="text-xs">{ownerFirstName}</span>
            </div>
            {!isAvailable && <div className="ml-auto"><StatusBadge status={item.status} /></div>}
          </div>
          <div className="pt-2">
            {disabled ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<span className="block w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />}>
                    <Button
                      size="sm"
                      variant={isAvailable ? 'default' : 'secondary'}
                      className={`w-full${!isAvailable ? ' bg-white text-lime-700 border-lime-600' : ''}`}
                      disabled
                    >
                      <ShoppingBasket />
                      {isAvailable ? 'Add to basket' : 'Reserve'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Basket full ({BASKET_LIMIT}/{BASKET_LIMIT})</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                size="sm"
                variant={inBasket ? 'outline' : isAvailable ? 'default' : 'secondary'}
                className={`w-full${!isAvailable && !inBasket ? ' bg-white text-lime-700 border-lime-600 hover:bg-lime-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  inBasket ? removeItem(item.id) : addItem(item.id);
                }}
              >
                {inBasket ? <Check /> : <ShoppingBasket />}
                {inBasket ? 'In basket' : isAvailable ? 'Add to basket' : 'Reserve'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

