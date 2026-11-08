import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { BrowsePage } from '@/pages/BrowsePage';
import { BookDetailsPage } from '@/pages/BookDetailsPage';
import { BasketPage } from '@/pages/BasketPage';
import { LoginPage } from '@/pages/LoginPage';
import { AccountPage } from '@/pages/AccountPage';
import { MyBooksPage } from '@/pages/lender/MyBooksPage';
import { LendersPage } from '@/pages/admin/LendersPage';
import { BasketProvider } from '@/context/BasketContext';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      Page not found.
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BasketProvider>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/books" element={<RequireAuth role="lender"><MyBooksPage /></RequireAuth>} />
              <Route path="/dashboard/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
              <Route path="/dashboard/admin" element={<RequireAuth role="admin"><LendersPage /></RequireAuth>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BasketProvider>
    </BrowserRouter>
  );
}
