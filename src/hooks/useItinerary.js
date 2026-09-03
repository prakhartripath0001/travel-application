import { useCallback, useState } from 'react';
import { generateItinerary, isGeminiConfigured } from '../services/gemini.js';

export function useItinerary() {
  const [itinerary, setItinerary] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const generate = useCallback(async (destination, days, preferences) => {
    if (!destination) {
      setErrorMessage('Please select a destination.');
      setStatus('error');
      return;
    }

    if (!isGeminiConfigured()) {
      setErrorMessage(
        'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file and restart the development server.',
      );
      setStatus('error');
      return;
    }

    setStatus('generating');
    setErrorMessage(null);

    try {
      const result = await generateItinerary(destination, days, preferences);
      setItinerary(result);
      setStatus('ready');
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setErrorMessage(err.message || 'Failed to generate itinerary. Please try again.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setItinerary(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    itinerary,
    status,
    errorMessage,
    generate,
    reset,
  };
}
