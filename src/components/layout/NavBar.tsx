import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useBasket } from '@/context/BasketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BasketDropdown } from '@/components/basket/BasketDropdown';
import { Sprout, Search, ShoppingBasket } from 'lucide-react';

export function NavBar() {
  const { session, logout } = useSession();
  const { count } = useBasket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [basketOpen, setBasketOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value); else next.delete('q');
    navigate(`/?${next.toString()}`, { replace: true });
  };

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Sprout className="h-5 w-5 text-lime-700" />
          <span className="font-semibold tracking-tight text-lg">Trellis</span>
        </Link>

        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-9"
            placeholder="Search books…"
            value={query}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="relative">
            <button
              className="relative flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
              onClick={() => setBasketOpen((o) => !o)}
            >
              <ShoppingBasket className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime-600 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
            {basketOpen && <BasketDropdown onClose={() => setBasketOpen(false)} />}
          </div>
          {session.user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">{session.user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/login" />}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
