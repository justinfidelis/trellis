import { useEffect, useState } from 'react';
import { getSession, setSession, type Session } from '@/data/session';
import type { User } from '@/data/types';

export function useSession() {
  const [session, _setSession] = useState<Session>(getSession);

  useEffect(() => {
    // subscribe to external changes (e.g. DevToolbar)
    let current = true;
    const interval = setInterval(() => {
      if (!current) return;
      const s = getSession();
      _setSession((prev) => (prev === s ? prev : s));
    }, 100);
    return () => {
      current = false;
      clearInterval(interval);
    };
  }, []);

  const login = (user: User) => {
    setSession({ user });
    _setSession({ user });
  };

  const logout = () => {
    setSession({ user: null });
    _setSession({ user: null });
  };

  return { session, login, logout };
}
