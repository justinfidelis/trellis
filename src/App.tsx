import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { GenreNav } from '@/components/layout/GenreNav';
import { BrowsePage } from '@/pages/BrowsePage';

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
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <GenreNav />
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
