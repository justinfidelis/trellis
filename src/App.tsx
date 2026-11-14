import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { BrowsePage } from '@/pages/BrowsePage/BrowsePage';
import { BookDetailsPage } from '@/pages/BookDetailsPage';
import { BasketPage } from '@/pages/BasketPage';
import { LoginPage } from '@/pages/LoginPage';
import { MyBooksPage } from '@/pages/dashboard/MyBooksPage/MyBooksPage';
import { AddBooksLayout } from '@/pages/dashboard/books-add/Layout';
import { AddBooksInputPage } from '@/pages/dashboard/books-add/InputPage';
import { AddBooksReviewPage } from '@/pages/dashboard/books-add/ReviewPage';
import { AdminPage } from '@/pages/dashboard/AdminPage';
import { AccountPage } from '@/pages/dashboard/AccountPage';
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
              <Route path="/dashboard/books/add" element={<RequireAuth role="lender"><AddBooksLayout /></RequireAuth>}>
                <Route index element={<AddBooksInputPage />} />
                <Route path="review/:index" element={<AddBooksReviewPage />} />
              </Route>
              <Route path="/dashboard/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
              <Route path="/dashboard/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BasketProvider>
    </BrowserRouter>
  );
}
