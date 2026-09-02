import { MapPin } from 'lucide-react';
import ImageFromSource from './ImageFromSource.jsx';

export default function FamousPlacesSection({ places, compact = false }) {
  const visiblePlaces = compact ? places.slice(0, 3) : places;
  const hasMore = compact && places.length > visiblePlaces.length;

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-300">
            Famous places
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950 sm:text-3xl dark:text-white">
            Places worth making time for
          </h2>
        </div>
        {hasMore && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing the most important places first
          </p>
        )}
      </div>

      <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-3 md:grid md:snap-none md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {visiblePlaces.map((place) => (
          <article
            key={place.name}
            className="group min-w-[82%] snap-start overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-w-[48%] md:min-w-0 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative h-56 overflow-hidden">
              <ImageFromSource
                query={`${place.name} ${place.area} landmark`}
                alt={place.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {place.category && (
                <span className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-950 backdrop-blur">
                  {place.category}
                </span>
              )}
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h3 className="text-xl font-semibold text-stone-950 dark:text-white">{place.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                  <MapPin size={15} aria-hidden="true" />
                  {place.area}
                </p>
              </div>
              <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">{place.description}</p>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="mt-3 rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-neutral-700 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
        >
          Explore more places
        </button>
      )}
    </section>
  );
}
