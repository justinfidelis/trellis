import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { GenreNav } from '@/components/layout/GenreNav';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { BrowsePage } from '@/pages/BrowsePage';
import { BookDetailsPage } from '@/pages/BookDetailsPage';
import { BasketPage } from '@/pages/BasketPage';
import { LoginPage } from '@/pages/LoginPage';
import { MyBooksPage } from '@/pages/lender/MyBooksPage';
import { MyLoansPage } from '@/pages/lender/MyLoansPage';
import { LendersPage } from '@/pages/admin/LendersPage';
import { CataloguePage } from '@/pages/admin/CataloguePage';
import { RequestsPage } from '@/pages/admin/RequestsPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
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
          <GenreNav />
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/lender/books" element={<RequireAuth role="lender"><MyBooksPage /></RequireAuth>} />
            <Route path="/lender/loans" element={<RequireAuth role="lender"><MyLoansPage /></RequireAuth>} />
            <Route path="/admin/lenders" element={<RequireAuth role="admin"><LendersPage /></RequireAuth>} />
            <Route path="/admin/catalogue" element={<RequireAuth role="admin"><CataloguePage /></RequireAuth>} />
            <Route path="/admin/requests" element={<RequireAuth role="admin"><RequestsPage /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth role="admin"><SettingsPage /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BasketProvider>
    </BrowserRouter>
  );
}
