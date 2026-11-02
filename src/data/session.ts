import { useState } from 'react';
import type { User } from './types';
import { mockUsers } from './mock';

export interface Session {
  user: User | null;
}

let _session: Session = { user: null };
const _listeners = new Set<() => void>();

export function getSession(): Session {
  return _session;
}

export function setSession(session: Session): void {
  _session = session;
  _listeners.forEach((l) => l());
}

export function useSessionStore() {
  const [, rerender] = useState(0);

  const subscribe = () => {
    const cb = () => rerender((n) => n + 1);
    _listeners.add(cb);
    return () => _listeners.delete(cb);
  };

  return { session: _session, setSession, subscribe };
}

export const devUsers = mockUsers;
