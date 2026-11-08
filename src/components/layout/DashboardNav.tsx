import { NavLink } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-3 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-lime-700 text-white'
      : 'text-muted-foreground hover:bg-lime-50 hover:text-lime-800'
  }`;

export function DashboardNav() {
  const { user } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-stretch">
        <NavLink to="/dashboard/books" className={linkClass}>My Books</NavLink>
        <NavLink to="/dashboard/account" className={linkClass}>My Account</NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/dashboard/admin" end={false} className={linkClass}>Admin Dashboard</NavLink>
        )}
      </div>
    </nav>
  );
}
