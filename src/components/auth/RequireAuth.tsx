import { Navigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import type { Role } from '@/data/types';

interface Props {
  role?: Role;
  children: React.ReactNode;
}

export function RequireAuth({ role, children }: Props) {
  const { user, isLoading } = useSession();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && !(role === 'lender' && user.role === 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
