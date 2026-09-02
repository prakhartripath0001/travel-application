import { useEffect, useState } from 'react';
import { fetchPexelsImage } from '../services/images.js';

export function usePexelsImage(query) {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function loadImage() {
      setStatus('loading');

      try {
        const result = await fetchPexelsImage(query, controller.signal);
        setImage(result);
        setStatus(result ? 'ready' : 'empty');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setImage(null);
          setStatus('error');
        }
      }
    }

    loadImage();

    return () => controller.abort();
  }, [query]);

  return { image, status };
}
