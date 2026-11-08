import { Outlet } from 'react-router-dom';
import { DashboardNav } from './DashboardNav';

export function DashboardLayout() {
  return (
    <>
      <DashboardNav />
      <Outlet />
    </>
  );
}
