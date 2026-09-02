import { ArrowLeft, CalendarDays, CheckCircle2, Info, MapPin, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ChatBot from '../components/ChatBot.jsx';
import FamousPlacesSection from '../components/FamousPlacesSection.jsx';
import ImageFromSource from '../components/ImageFromSource.jsx';
import { destinations } from '../data/destinations.js';

export default function DestinationDetail() {
  const { destinationId } = useParams();
  const destination = destinations.find((item) => item.id === destinationId);

  if (!destination) {
    return (
      <section className="page-shell py-20">
        <Link
          to="/#destinations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-700 dark:text-emerald-300"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to destinations
        </Link>
        <h1 className="mt-8 text-4xl font-semibold text-stone-950 dark:text-white">Destination not found</h1>
        <p className="mt-3 text-stone-600 dark:text-stone-300">
          This guide is not available. Return to the explorer and choose another destination.
        </p>
      </section>
    );
  }

  return (
    <article>
      <section className="relative isolate min-h-[68vh] overflow-hidden bg-neutral-950 text-white">
        <ImageFromSource
          query={`${destination.name} ${destination.country} skyline travel`}
          alt={`${destination.name}, ${destination.country}`}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/82 via-black/48 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="page-shell flex min-h-[68vh] items-end py-12">
          <div className="max-w-4xl animate-hero-enter">
            <Link
              to="/#destinations"
              className="mb-8 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Back to explorer
            </Link>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-stone-200">
              <MapPin size={16} aria-hidden="true" />
              {destination.region} / {destination.category}
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">{destination.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-200">{destination.description}</p>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-10 py-14 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950 dark:text-white">
              <Sparkles className="text-emerald-800 dark:text-emerald-300" size={19} aria-hidden="true" />
              Highlights
            </h2>
            <ul className="mt-4 space-y-3">
              {destination.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-800 dark:text-emerald-300" size={18} aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950 dark:text-white">
              <CalendarDays className="text-emerald-800 dark:text-emerald-300" size={19} aria-hidden="true" />
              Best time to visit
            </h2>
            <p className="mt-4 leading-7 text-stone-600 dark:text-stone-300">{destination.bestTime}</p>
          </div>
        </aside>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-stone-950 dark:text-white">Overview</h2>
            <p className="mt-4 text-lg leading-8 text-stone-600 dark:text-stone-300">{destination.overview}</p>
            <p className="mt-4 leading-7 text-stone-600 dark:text-stone-300">{destination.details}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-950 dark:text-white">Things to do</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {destination.thingsToDo.map((item) => (
                <div key={item} className="rounded-lg border border-stone-200 bg-white p-4 text-stone-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <FamousPlacesSection places={destination.famousPlaces} />

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-stone-950 dark:text-white">
              <Info className="text-emerald-800 dark:text-emerald-300" size={22} aria-hidden="true" />
              Practical information
            </h2>
            <ul className="mt-5 space-y-3">
              {destination.practicalInfo.map((item) => (
                <li key={item} className="rounded-md bg-stone-100 px-4 py-3 text-stone-700 dark:bg-neutral-900 dark:text-stone-300">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="mx-auto max-w-2xl">
          <ChatBot destination={destination} />
        </div>
      </section>
    </article>
  );
}
