import { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useBasket } from '@/context/BasketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BasketDropdown } from '@/components/basket/BasketDropdown';
import { Sprout, Search, ShoppingBasket } from 'lucide-react';

export function NavBar() {
  const { user, logout } = useSession();
  const { count, atLimit } = useBasket();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const [basketOpen, setBasketOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const next = new URLSearchParams(searchParams);
    if (inputValue) next.set('q', inputValue); else next.delete('q');
    next.delete('page');
    navigate(`/?${next.toString()}`);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Sprout className="h-5 w-5 text-lime-700" />
          <span className="font-semibold tracking-tight text-lg">Trellis</span>
        </Link>

        {isDashboard ? (
          <span className="flex-1 max-w-sm text-sm font-medium text-muted-foreground">Dashboard</span>
        ) : (
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 h-9"
              placeholder="Search books…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="relative">
            <button
              className="relative flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
              onClick={() => setBasketOpen((o) => !o)}
            >
              <ShoppingBasket className="h-5 w-5" />
              {count > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white ${atLimit ? 'bg-amber-500' : 'bg-lime-600'}`}>
                  {count}
                </span>
              )}
            </button>
            {basketOpen && <BasketDropdown onClose={() => setBasketOpen(false)} />}
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none rounded-full cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-lime-700 text-white text-xs font-semibold">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="font-semibold text-sm text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link to="/dashboard/books" />}>My Books</DropdownMenuItem>
                <DropdownMenuItem render={<Link to="/dashboard/account" />}>My Account</DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem render={<Link to="/dashboard/admin" />}>Admin Dashboard</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive" className="cursor-pointer">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
