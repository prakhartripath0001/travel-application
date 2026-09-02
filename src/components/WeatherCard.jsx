import { CloudSun, Loader2 } from 'lucide-react';
import { useWeather } from '../hooks/useWeather.js';

export default function WeatherCard({ location }) {
  const { status, weather } = useWeather(location);

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <CloudSun className="text-emerald-800 dark:text-emerald-300" size={21} aria-hidden="true" />
        <h2 className="text-xl font-bold text-stone-950 dark:text-white">Live weather</h2>
      </div>

      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Current conditions in {location.name}
      </p>

      {status === 'loading' && (
        <p className="mt-5 flex items-center gap-2 text-stone-600 dark:text-stone-300">
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          Loading live weather
        </p>
      )}

      {status === 'error' && (
        <p className="mt-5 text-stone-600 dark:text-stone-300">
          Weather is unavailable right now. Try again later.
        </p>
      )}

      {status === 'ready' && weather && (
        <div className="mt-5 space-y-4 text-stone-700 dark:text-stone-300">
          <div>
            <p className="text-5xl font-semibold text-stone-950 dark:text-white">
              {weather.temperature}°C
            </p>
            <p className="mt-2 capitalize">{weather.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="rounded-md bg-stone-100 p-3 dark:bg-neutral-800">
              Feels like
              <span className="block font-semibold text-stone-950 dark:text-white">
                {weather.feelsLike}°C
              </span>
            </p>
            <p className="rounded-md bg-stone-100 p-3 dark:bg-neutral-800">
              Humidity
              <span className="block font-semibold text-stone-950 dark:text-white">
                {weather.humidity}%
              </span>
            </p>
            <p className="rounded-md bg-stone-100 p-3 dark:bg-neutral-800">
              Wind
              <span className="block font-semibold text-stone-950 dark:text-white">
                {weather.windSpeed} km/h
              </span>
            </p>
            <p className="rounded-md bg-stone-100 p-3 dark:bg-neutral-800">
              Source
              <span className="block font-semibold text-stone-950 dark:text-white">
                {weather.source}
              </span>
            </p>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Updated {weather.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </article>
  );
}
