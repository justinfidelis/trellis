import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/data/types';
import { mockUsers } from '@/data/mock';

// DEV ONLY — remove before merging
const DEV_USER = mockUsers.find((u) => u.role === 'admin')!;

async function fetchMe(): Promise<User | null> {
  if (import.meta.env.DEV) return DEV_USER;
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  return res.json();
}

export function useSession() {
  const queryClient = useQueryClient();
  const { data: user = null, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchMe,
    staleTime: Infinity,
    retry: false,
  });

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    queryClient.setQueryData(['session'], null);
    queryClient.invalidateQueries({ queryKey: ['session'] });
  };

  return { user, isLoading, logout };
}
