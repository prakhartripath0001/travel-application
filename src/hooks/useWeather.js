import { useEffect, useState } from 'react';
import { getLiveWeather } from '../services/weather.js';

export function useWeather(location) {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      setStatus('loading');

      try {
        const liveWeather = await getLiveWeather(location, controller.signal);
        setWeather(liveWeather);
        setStatus('ready');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setWeather(null);
          setStatus('error');
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [location]);

  return { status, weather };
}
