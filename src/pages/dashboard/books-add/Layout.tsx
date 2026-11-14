import { Outlet } from 'react-router-dom';
import { AddBooksProvider } from '@/context/AddBooksContext';

export function AddBooksLayout() {
  return (
    <AddBooksProvider>
      <Outlet />
    </AddBooksProvider>
  );
}
