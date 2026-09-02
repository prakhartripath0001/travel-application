import { ArrowLeft, Compass } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ItineraryPlanner from '../components/ItineraryPlanner.jsx';

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  const initialDestinationId = searchParams.get('destination') || '';

  return (
    <div className="py-10">
      <div className="page-shell">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to explorer
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Compass size={14} aria-hidden="true" />
            AI Travel Planning
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-stone-950 sm:text-4xl lg:text-5xl dark:text-white">
            Custom Day-by-Day Itineraries
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-stone-600 sm:text-lg dark:text-stone-300">
            Let Gemini design a balanced travel schedule with morning, afternoon, and evening sights tailored to your travel style.
          </p>
        </div>

        {/* Planner Component */}
        <ItineraryPlanner initialDestinationId={initialDestinationId} />
      </div>
    </div>
  );
}
