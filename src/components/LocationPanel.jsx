import { LocateFixed, Loader2, MapPin, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from '../hooks/useLocation.js';

export default function LocationPanel({ onLocationChange }) {
  const [query, setQuery] = useState('');
  const {
    canAskForLocation,
    chooseLocation,
    clearLocation,
    error,
    findLocations,
    geoStatus,
    permissionDenied,
    searchResults,
    searchStatus,
    selectedLocation,
    useCurrentLocation,
  } = useLocation();

  function handleChooseLocation(location) {
    chooseLocation(location);
    onLocationChange(location);
    setQuery('');
  }

  function handleClearLocation() {
    clearLocation();
    onLocationChange(null);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    findLocations(query);
  }

  return (
    <section className="page-shell -mt-8 relative z-10">
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-300">
              Discover places near you
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950 dark:text-white">
              Choose your starting location
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Location is optional. Use your current location or search manually by city, region, or
              country.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={!canAskForLocation || geoStatus === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-neutral-700 dark:disabled:text-stone-400"
              >
                {geoStatus === 'loading' ? (
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                ) : (
                  <LocateFixed size={18} aria-hidden="true" />
                )}
                Use my location
              </button>

              <form className="flex flex-1 gap-2" onSubmit={handleSearchSubmit}>
                <label className="sr-only" htmlFor="manual-location">
                  Search for a location
                </label>
                <span className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                    aria-hidden="true"
                  />
                  <input
                    id="manual-location"
                    className="w-full rounded-md border border-stone-300 bg-white py-3 pl-10 pr-3 text-base text-stone-950 placeholder:text-stone-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    type="search"
                    placeholder="Search city, region, or country"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </span>
                <button
                  type="submit"
                  className="rounded-md border border-stone-300 px-4 py-3 font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-neutral-700 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                >
                  Search
                </button>
              </form>
            </div>

            {selectedLocation && (
              <div className="flex flex-col gap-3 rounded-md bg-emerald-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:bg-emerald-950/50">
                <p className="flex items-center gap-2 font-medium text-emerald-950 dark:text-emerald-100">
                  <MapPin size={17} aria-hidden="true" />
                  Selected: {selectedLocation.label}
                </p>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="inline-flex items-center gap-1 self-start font-semibold text-emerald-900 hover:text-emerald-700 dark:text-emerald-200"
                >
                  <X size={16} aria-hidden="true" />
                  Change
                </button>
              </div>
            )}

            {permissionDenied && (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
                Location permission was denied. Manual search is available and will not trigger a
                permission prompt.
              </p>
            )}

            {error && (
              <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-800 dark:text-stone-200">
                {error}
              </p>
            )}

            {searchStatus === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                <Loader2 className="animate-spin" size={17} aria-hidden="true" />
                Searching locations
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="grid gap-2" aria-label="Location search results">
                {searchResults.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => handleChooseLocation(location)}
                    className="rounded-md border border-stone-200 bg-white px-3 py-2 text-left text-sm text-stone-700 transition hover:border-emerald-700 hover:text-emerald-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-300 dark:hover:border-emerald-500 dark:hover:text-emerald-200"
                  >
                    {location.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
