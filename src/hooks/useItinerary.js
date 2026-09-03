import { useCallback, useRef, useState } from 'react';
import {
  generateCuratedFallbackItinerary,
  generateItinerary,
  isGeminiConfigured,
  parseGeminiError,
} from '../services/gemini.js';

export function useItinerary() {
  const [itinerary, setItinerary] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const lastParamsRef = useRef(null);

  const generate = useCallback(async (destination, days, preferences) => {
    if (!destination) {
      setErrorMessage('Please select a destination.');
      setErrorDetails(null);
      setStatus('error');
      return;
    }

    lastParamsRef.current = { destination, days, preferences };

    if (!isGeminiConfigured()) {
      const authErr = {
        statusCode: 401,
        isHighDemand: false,
        isRateLimited: false,
        isAuthError: true,
        isRetryable: false,
        message:
          'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file and restart the development server.',
      };
      setErrorMessage(authErr.message);
      setErrorDetails(authErr);
      setStatus('error');
      return;
    }

    setStatus('generating');
    setErrorMessage(null);
    setErrorDetails(null);

    try {
      const result = await generateItinerary(destination, days, preferences);
      setItinerary(result);
      setStatus('ready');
    } catch (err) {
      console.error('Error generating itinerary:', err);
      const parsed = err.details || parseGeminiError(err);
      setErrorMessage(parsed.message);
      setErrorDetails(parsed);
      setStatus('error');
    }
  }, []);

  const generateCurated = useCallback((destination, days, preferences) => {
    const targetDest = destination || lastParamsRef.current?.destination;
    const targetDays = days || lastParamsRef.current?.days || 3;
    const targetPref = preferences !== undefined ? preferences : lastParamsRef.current?.preferences || '';

    if (!targetDest) return;

    setStatus('generating');
    setErrorMessage(null);
    setErrorDetails(null);

    // Brief timeout for smooth UX transition
    setTimeout(() => {
      const curated = generateCuratedFallbackItinerary(targetDest, targetDays, targetPref);
      setItinerary(curated);
      setStatus('ready');
    }, 450);
  }, []);

  const retry = useCallback(() => {
    if (lastParamsRef.current) {
      const { destination, days, preferences } = lastParamsRef.current;
      generate(destination, days, preferences);
    }
  }, [generate]);

  const reset = useCallback(() => {
    setItinerary(null);
    setStatus('idle');
    setErrorMessage(null);
    setErrorDetails(null);
  }, []);

  return {
    itinerary,
    status,
    errorMessage,
    errorDetails,
    generate,
    generateCurated,
    retry,
    reset,
  };
}
