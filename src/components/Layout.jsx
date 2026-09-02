import { Globe2 } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8faf7] text-stone-900 dark:bg-neutral-950 dark:text-stone-100">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8faf7]/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <nav className="page-shell flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-100">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white dark:bg-emerald-600">
              <Globe2 size={19} aria-hidden="true" />
            </span>
            WorldTrip AI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Plan Itinerary
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-stone-200 py-8 dark:border-neutral-800">
        <div className="page-shell flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between dark:text-stone-400">
          <p>&copy; 2026 WorldTrip AI</p>
          <p>Explore destinations, weather, places, and plans.</p>
        </div>
      </footer>
    </div>
  );
}
