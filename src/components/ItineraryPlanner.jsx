import { AlertCircle, ArrowRight, Calendar, Compass, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { destinations } from '../data/destinations.js';
import { useItinerary } from '../hooks/useItinerary.js';
import ItineraryDayCard from './ItineraryDayCard.jsx';
import ItineraryLoadingState from './ItineraryLoadingState.jsx';

const PRESET_INTERESTS = [
  'Hidden gems & quiet walks',
  'Art, architecture & history',
  'Food, cafes & culinary markets',
  'Outdoor scenic views & photography',
  'Relaxed family-friendly pace',
  'High-energy sightseeing',
];

export default function ItineraryPlanner({ initialDestinationId }) {
  const {
    itinerary,
    status,
    errorMessage,
    errorDetails,
    generate,
    generateCurated,
    retry,
    reset,
  } = useItinerary();

  const [selectedDestinationId, setSelectedDestinationId] = useState(
    initialDestinationId || destinations[0]?.id || 'paris',
  );
  const [days, setDays] = useState(3);
  const [preferences, setPreferences] = useState('');

  // Update selection if prop changes
  useEffect(() => {
    if (initialDestinationId) {
      setSelectedDestinationId(initialDestinationId);
    }
  }, [initialDestinationId]);

  const selectedDestination =
    destinations.find((d) => d.id === selectedDestinationId) || destinations[0];

  function handleSubmit(e) {
    e.preventDefault();
    generate(selectedDestination, days, preferences.trim());
  }

  function handleAddPreference(interest) {
    if (preferences.includes(interest)) return;
    setPreferences((prev) => (prev ? `${prev}, ${interest}` : interest));
  }

  // Result state
  if (status === 'ready' && itinerary) {
    return (
      <div className="space-y-8 animate-hero-enter">
        {/* Curated Fallback Notification Banner */}
        {itinerary.isCuratedFallback && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">Curated Backup Itinerary Active</p>
                <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300">
                  Because Gemini AI servers are currently experiencing high demand, we loaded our verified curated guide for {itinerary.destination}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <RefreshCw size={13} />
              Retry with Live AI
            </button>
          </div>
        )}

        {/* Itinerary Header Bar */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <Sparkles size={15} aria-hidden="true" />
                <span>{itinerary.isCuratedFallback ? 'Curated Destination Guide' : 'AI-Curated Journey'}</span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-stone-950 sm:text-3xl dark:text-white">
                {itinerary.duration} Days in {itinerary.destination}
              </h2>
              {itinerary.overview && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {itinerary.overview}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Plan Another Trip
            </button>
          </div>
        </div>

        {/* Day-by-Day Cards */}
        <div className="space-y-6">
          {itinerary.days.map((dayData) => (
            <ItineraryDayCard
              key={dayData.day}
              dayData={dayData}
              destinationName={itinerary.destination}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Customize another itinerary
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === 'generating') {
    return <ItineraryLoadingState destinationName={selectedDestination?.name} days={days} />;
  }

  // Form / Initial State
  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="border-b border-stone-100 pb-5 dark:border-neutral-800">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Compass size={14} aria-hidden="true" />
            AI Travel Itinerary Generator
          </div>
          <h2 className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl dark:text-white">
            Plan your next journey in seconds
          </h2>
          <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300">
            Select your destination, how long you plan to stay, and what matters most to you. Gemini will create a structured day-by-day plan.
          </p>
        </div>

        {/* Error Alert with 503 High Demand Recovery */}
        {errorMessage && (
          <div
            className={`mt-6 rounded-xl border p-4 text-sm ${
              errorDetails?.isHighDemand
                ? 'border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'
                : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className={`mt-0.5 shrink-0 ${
                  errorDetails?.isHighDemand
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              />
              <div className="flex-1">
                <p className="font-semibold text-stone-950 dark:text-white">
                  {errorDetails?.isHighDemand
                    ? 'AI Service Under High Demand (503)'
                    : errorDetails?.isRateLimited
                    ? 'Rate Limit Reached (429)'
                    : 'Unable to generate itinerary'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {errorMessage}
                </p>
                {errorDetails?.isRetryable && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={retry}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <RefreshCw size={13} />
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => generateCurated(selectedDestination, days, preferences)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 shadow-sm transition hover:border-emerald-600 hover:text-emerald-850 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-200 dark:hover:border-emerald-400"
                    >
                      <Sparkles size={13} className="text-amber-500" />
                      View Curated Backup Itinerary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Destination Selector */}
          <div>
            <label
              htmlFor="itinerary-destination"
              className="block text-sm font-semibold text-stone-900 dark:text-white"
            >
              Select Destination
            </label>
            <select
              id="itinerary-destination"
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-stone-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            >
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}, {dest.country} ({dest.bestFor})
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="itinerary-days"
                className="text-sm font-semibold text-stone-900 dark:text-white"
              >
                Trip Duration (Days)
              </label>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                <Calendar size={13} aria-hidden="true" />
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <input
                id="itinerary-days"
                type="range"
                min="1"
                max="10"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-emerald-800 dark:accent-emerald-500"
              />
            </div>

            {/* Quick selector buttons */}
            <div className="mt-2 flex gap-2">
              {[2, 3, 5, 7].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDays(preset)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    days === preset
                      ? 'bg-emerald-900 text-white dark:bg-emerald-600'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-neutral-800 dark:text-stone-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {preset} Days
                </button>
              ))}
            </div>
          </div>

          {/* Travel Preferences */}
          <div>
            <label
              htmlFor="itinerary-preferences"
              className="block text-sm font-semibold text-stone-900 dark:text-white"
            >
              Travel Preferences & Interests <span className="text-xs font-normal text-stone-500">(Optional)</span>
            </label>
            <input
              id="itinerary-preferences"
              type="text"
              placeholder="e.g. food markets, museum walks, quiet cafes, photography"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-950 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-stone-500"
            />

            {/* Suggested Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESET_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleAddPreference(interest)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-stone-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
                >
                  + {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 border-t border-stone-100 pt-5 dark:border-neutral-800">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Sparkles size={18} aria-hidden="true" />
            Generate Itinerary for {selectedDestination.name}
          </button>
        </div>
      </form>
    </div>
  );
}
