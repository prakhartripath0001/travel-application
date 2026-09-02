import { Compass, Sparkles } from 'lucide-react';

export default function ItineraryLoadingState({ destinationName, days }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8" role="status" aria-live="polite">
      {/* Loading banner */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-8 text-center dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <div className="relative mb-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 dark:bg-emerald-600">
            <Compass className="animate-spin text-emerald-100" size={28} style={{ animationDuration: '6s' }} />
          </div>
          <Sparkles
            className="absolute -right-1 -top-1 animate-bounce text-emerald-600 dark:text-emerald-400"
            size={18}
          />
        </div>
        <h3 className="text-xl font-bold text-stone-950 dark:text-white">
          Crafting your personalized itinerary
        </h3>
        <p className="mt-2 max-w-md text-sm text-stone-600 dark:text-stone-300">
          Gemini is curating {days || 3} days in {destinationName || 'your destination'}, pacing each day and balancing landmark sights with cultural experiences.
        </p>
      </div>

      {/* Skeleton Day Cards */}
      {[1, 2].map((dayNum) => (
        <div
          key={dayNum}
          className="animate-pulse rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-md bg-stone-200 dark:bg-neutral-800" />
            <div className="h-6 w-48 rounded bg-stone-200 dark:bg-neutral-800" />
          </div>

          <div className="mt-6 space-y-5">
            {[1, 2, 3].map((slot) => (
              <div key={slot} className="flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-stone-200 dark:bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-stone-200 dark:bg-neutral-800" />
                  <div className="h-3 w-full rounded bg-stone-200 dark:bg-neutral-800" />
                  <div className="h-3 w-4/5 rounded bg-stone-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 h-10 w-full rounded-lg bg-stone-100 dark:bg-neutral-800/60" />
        </div>
      ))}
    </div>
  );
}
