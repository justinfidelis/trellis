import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, X } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { CoverImage } from '@/components/books/CoverImage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useBasket, BASKET_LIMIT } from '@/context/BasketContext';
import { useCopiesWithBooks, type CopyWithBook } from '@/hooks/useBooks';

function ClearBasketDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary">Empty Basket</Button>} />
      <DialogContent showCloseButton={false}>
        <DialogTitle>Empty basket?</DialogTitle>
        <DialogDescription>
          All books will be removed from your basket. This cannot be undone.
        </DialogDescription>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose render={<Button variant="destructive">Empty basket</Button>} onClick={onConfirm} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FormErrors {
  name?: string;
  telegram?: string;
  accessCode?: string;
}

export function BasketPage() {
  const { items, atLimit, removeItem, clearItems } = useBasket();
  const copies = useCopiesWithBooks(items);

  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const ownerGroups = useMemo(() => {
    const map = new Map<string, { ownerName: string; books: CopyWithBook[] }>();
    for (const copy of copies) {
      if (!map.has(copy.owner_id)) {
        map.set(copy.owner_id, { ownerName: copy.owner_name, books: [] });
      }
      map.get(copy.owner_id)!.books.push(copy);
    }
    return Array.from(map.values());
  }, [copies]);

  function handleCheckout() {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!telegram.trim()) newErrors.telegram = 'Required';
    if (!accessCode.trim()) newErrors.accessCode = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setCheckoutOpen(true);
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">My Basket</h1>
            <span className={`text-sm font-medium ${atLimit ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {copies.length} / {BASKET_LIMIT}
            </span>
          </div>
        </div>

        {copies.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <ShoppingBasket className="h-10 w-10 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">Your basket is empty</p>
              <p className="text-sm text-muted-foreground">Browse books and add them to your basket.</p>
            </div>
            <Button size="sm" nativeButton={false} render={<Link to="/" />}>Browse books</Button>
          </div>
        ) : (
          <div className="flex items-start">
            <div className="flex-[2] min-w-0 space-y-6">
              <div className="space-y-4">
                {ownerGroups.map(({ ownerName, books }) => (
                  <div key={ownerName}>
                    <p className="text-xs font-medium text-muted-foreground tracking-wide px-2 pb-1">{ownerName}</p>
                    <ul className="divide-y">
                      {books.map((item) => {
                        const toReserve = item.status !== 'available';
                        return (
                          <li key={item.id} className="group flex items-center gap-4 px-4 py-3 bg-background hover:bg-muted/30 transition-colors">
                            <Link to={`/book/${item.id}`} className="w-10 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
                              <CoverImage src={item.cover_url} title={item.title} iconClassName="w-4 h-4" />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link to={`/book/${item.id}`} className="text-sm font-medium hover:underline leading-snug line-clamp-1 w-fit">
                                {item.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">{item.author}</p>
                              {toReserve && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">To Reserve</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                            >
                              <X className="size-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="px-4">
                <ClearBasketDialog onConfirm={clearItems} />
              </div>
            </div>

            <div className="border-l self-stretch mx-8" />

            <div className="flex-[1] min-w-[300px] max-w-[400px] space-y-4">
              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>
                <Field data-invalid={!!errors.telegram}>
                  <FieldLabel htmlFor="telegram">Telegram Handle</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <Input
                      id="telegram"
                      className="pl-6"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      aria-invalid={!!errors.telegram}
                    />
                  </div>
                  <FieldError>{errors.telegram}</FieldError>
                </Field>
                <Field data-invalid={!!errors.accessCode}>
                  <FieldLabel htmlFor="access-code" className="uppercase tracking-wide text-xs">Access Code</FieldLabel>
                  <Input
                    id="access-code"
                    className="uppercase tracking-widest"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    aria-invalid={!!errors.accessCode}
                  />
                  <FieldError>{errors.accessCode}</FieldError>
                </Field>
              </FieldGroup>
              <Button className="w-full" onClick={handleCheckout}>
                <ShoppingBasket />
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Confirm checkout</DialogTitle>
          <DialogDescription>
            The following owners will be notified about your loan request.
          </DialogDescription>
          <ul className="space-y-1">
            {ownerGroups.map(({ ownerName, books }) => (
              <li key={ownerName}>
                <p className="text-sm font-medium">{ownerName}</p>
                <ul className="mt-0.5 space-y-0.5 pl-3">
                  {books.map((book) => (
                    <li key={book.id} className="text-xs text-muted-foreground">{book.title}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose render={<Button>Confirm</Button>} />
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
