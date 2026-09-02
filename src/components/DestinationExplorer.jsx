import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import DestinationCard from './DestinationCard.jsx';
import { destinationCategories, destinationRegions, destinations } from '../data/destinations.js';
import { getDistanceKm } from '../utils/distance.js';

export default function DestinationExplorer({ selectedLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('All regions');
  const [category, setCategory] = useState('All categories');

  const filteredDestinations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return destinations
      .filter((destination) => {
      const searchableText = [
        destination.name,
        destination.country,
        destination.region,
        destination.category,
        destination.bestFor,
        destination.description,
        ...destination.keywords,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesRegion = region === 'All regions' || destination.region === region;
      const matchesCategory = category === 'All categories' || destination.category === category;

      return matchesSearch && matchesRegion && matchesCategory;
      })
      .map((destination) => ({
        ...destination,
        distanceKm: getDistanceKm(selectedLocation, destination),
      }))
      .sort((a, b) => {
        if (!selectedLocation) {
          return 0;
        }

        return a.distanceKm - b.distanceKm;
      });
  }, [category, region, searchTerm, selectedLocation]);

  return (
    <section className="page-shell py-16" id="destinations">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-300">
            Destination explorer
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-950 sm:text-4xl dark:text-white">
            Find the right place faster.
          </h2>
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            Search by city, mood, landmark, or travel style, then open a dedicated guide for deeper planning.
          </p>
          {selectedLocation && (
            <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Personalized from {selectedLocation.label}. Closest matching destinations appear first.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1.4fr_0.8fr_0.8fr] dark:border-neutral-800 dark:bg-neutral-900">
        <label className="grid gap-2 text-sm font-medium text-stone-800 dark:text-stone-200">
          Search destinations
          <span className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden="true" />
            <input
              className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-base text-stone-950 placeholder:text-stone-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
              type="search"
              placeholder="Try art, beach, Tokyo, museums"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-800 dark:text-stone-200">
          Region
          <select
            className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            {destinationRegions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-800 dark:text-stone-200">
          Category
          <select
            className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {destinationCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        <SlidersHorizontal size={16} aria-hidden="true" />
        Showing {filteredDestinations.length} of {destinations.length} destinations
      </div>

      {filteredDestinations.length > 0 ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              distanceKm={destination.distanceKm}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="text-xl font-semibold text-stone-950 dark:text-white">No destinations found</h3>
          <p className="mx-auto mt-2 max-w-xl text-stone-600 dark:text-stone-300">
            Try a broader search term or reset the region and category filters.
          </p>
        </div>
      )}
    </section>
  );
}
