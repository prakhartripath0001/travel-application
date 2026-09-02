import { Calendar, Lightbulb, MapPin, Moon, Sun, Sunset } from 'lucide-react';
import ImageFromSource from './ImageFromSource.jsx';

function ActivityBlock({ period, icon: Icon, iconColor, activities, destinationName }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        <Icon size={16} className={iconColor} aria-hidden="true" />
        <span>{period}</span>
      </div>

      <div className="grid gap-3">
        {activities.map((act, index) => (
          <div
            key={index}
            className="group flex flex-col gap-3 rounded-lg border border-stone-200/80 bg-stone-50/60 p-3.5 transition hover:border-emerald-300 hover:bg-emerald-50/20 sm:flex-row sm:items-start dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
          >
            {act.place && (
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-28">
                <ImageFromSource
                  query={`${act.place} ${destinationName}`}
                  alt={act.place}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-stone-900 dark:text-white">{act.activity}</h4>
                {act.place && (
                  <span className="inline-flex items-center gap-1 rounded bg-stone-200/70 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-neutral-700 dark:text-stone-300">
                    <MapPin size={11} aria-hidden="true" />
                    {act.place}
                  </span>
                )}
              </div>
              {act.description && (
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {act.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ItineraryDayCard({ dayData, destinationName }) {
  const { day, title, morning, afternoon, evening, tips } = dayData;

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header bar with Day badge and title */}
      <div className="flex flex-col gap-2 border-b border-stone-100 bg-stone-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/80 dark:bg-neutral-800/30">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white dark:bg-emerald-600">
            <Calendar size={13} aria-hidden="true" />
            Day {day}
          </span>
          <h3 className="text-lg font-bold text-stone-950 dark:text-white">{title}</h3>
        </div>
      </div>

      {/* Activities for Morning, Afternoon, Evening */}
      <div className="space-y-6 p-6">
        <ActivityBlock
          period="Morning"
          icon={Sun}
          iconColor="text-amber-500"
          activities={morning}
          destinationName={destinationName}
        />

        <ActivityBlock
          period="Afternoon"
          icon={Sunset}
          iconColor="text-orange-500"
          activities={afternoon}
          destinationName={destinationName}
        />

        <ActivityBlock
          period="Evening"
          icon={Moon}
          iconColor="text-indigo-500"
          activities={evening}
          destinationName={destinationName}
        />

        {/* Travel tip callout */}
        {tips && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3.5 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <div>
              <strong className="font-semibold">Insider Tip: </strong>
              <span>{tips}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
