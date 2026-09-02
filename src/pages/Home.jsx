import { ArrowRight, ChevronDown, Landmark, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatBot from '../components/ChatBot.jsx';
import DestinationExplorer from '../components/DestinationExplorer.jsx';
import FamousPlacesSection from '../components/FamousPlacesSection.jsx';
import ImageFromSource from '../components/ImageFromSource.jsx';
import LocationPanel from '../components/LocationPanel.jsx';
import WeatherCard from '../components/WeatherCard.jsx';
import { destinations } from '../data/destinations.js';

export default function Home() {
  const [selectedId, setSelectedId] = useState(destinations[0].id);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === selectedId) || destinations[0],
    [selectedId],
  );

  return (
    <div>
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-neutral-950 text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80"
          aria-hidden="true"
        >
          <source
            src="https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/82 via-black/52 to-black/24" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

        <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center py-20">
          <div className="max-w-3xl animate-hero-enter">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-200">
              WorldTrip AI Studio
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.03] text-white sm:text-6xl lg:text-7xl">
              Design-led journeys for a wider world.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200 sm:text-lg">
              Explore global destinations, read the conditions now, discover landmark places, and shape a
              refined trip plan with an AI assistant.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#destinations"
                className="inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 font-semibold text-neutral-950 transition hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore Destinations
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <Link
                to="/itinerary"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Sparkles size={18} aria-hidden="true" />
                Plan My Trip
              </Link>
            </div>
          </div>
        </div>

        <a
          href="#destinations"
          className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-300 transition hover:text-white"
          aria-label="Scroll to destinations"
        >
          Scroll
          <ChevronDown className="animate-scroll-cue" size={22} aria-hidden="true" />
        </a>
      </section>

      <LocationPanel onLocationChange={setSelectedLocation} />

      <DestinationExplorer selectedLocation={selectedLocation} />

      {/* Itinerary CTA Banner */}
      <section className="page-shell py-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-900 via-neutral-900 to-emerald-950 p-8 text-white shadow-md md:flex-row dark:border-neutral-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              AI Itinerary Planner
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Want a day-by-day travel schedule?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-stone-300">
              Let Gemini curate morning, afternoon, and evening activities with insider tips tailored to {selectedDestination.name} or any destination.
            </p>
          </div>
          <Link
            to={`/itinerary?destination=${selectedDestination.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow transition hover:bg-emerald-500"
          >
            <Sparkles size={17} aria-hidden="true" />
            Generate Itinerary for {selectedDestination.name}
          </Link>
        </div>
      </section>

      <section className="page-shell grid gap-6 py-6 lg:grid-cols-3" id="planner">
        <WeatherCard location={selectedDestination} />

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <Landmark className="text-emerald-800 dark:text-emerald-300" size={21} aria-hidden="true" />
            <h2 className="text-xl font-bold text-stone-950 dark:text-white">Famous places</h2>
          </div>
          <div className="mt-5 space-y-4">
            {selectedDestination.famousPlaces.slice(0, 3).map((place) => (
              <div key={place.name} className="grid grid-cols-[5rem_1fr] gap-3">
                <ImageFromSource
                  query={`${place.name} ${place.area}`}
                  alt={place.name}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div>
                  <p className="font-semibold text-stone-950 dark:text-white">{place.name}</p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{place.area}</p>
                  <p className="mt-1 text-sm leading-5 text-stone-600 dark:text-stone-300">{place.description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <ChatBot destination={selectedDestination} />
      </section>

      <section className="page-shell py-12">
        <FamousPlacesSection places={selectedDestination.famousPlaces} compact />
      </section>
    </div>
  );
}
