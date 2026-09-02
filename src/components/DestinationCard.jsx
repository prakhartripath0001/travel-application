import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageFromSource from './ImageFromSource.jsx';

export default function DestinationCard({ destination, distanceKm }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <Link to={`/destinations/${destination.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <ImageFromSource
            query={`${destination.name} ${destination.country} travel`}
            alt={`${destination.name}, ${destination.country}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-950 backdrop-blur">
            {destination.category}
          </span>
          <span className="absolute bottom-4 left-4 text-sm font-medium text-white">
            {destination.region}
          </span>
          {typeof distanceKm === 'number' && (
            <span className="absolute bottom-4 right-4 rounded-md bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {distanceKm.toLocaleString()} km away
            </span>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-stone-950 dark:text-white">{destination.name}</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{destination.country}</p>
            </div>
            <ArrowUpRight
              className="mt-1 shrink-0 text-stone-400 transition group-hover:text-emerald-800 dark:group-hover:text-emerald-300"
              size={20}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">{destination.description}</p>
        </div>
      </Link>
    </article>
  );
}
