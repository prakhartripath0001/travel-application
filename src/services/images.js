const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
const cache = new Map();

export async function fetchPexelsImage(query, signal) {
  if (!pexelsKey) {
    return null;
  }

  const cacheKey = query.toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
    {
      headers: {
        Authorization: pexelsKey,
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error('Image search failed');
  }

  const data = await response.json();
  const photo = data.photos?.[0];

  if (!photo) {
    return null;
  }

  const image = {
    alt: photo.alt || query,
    src: photo.src.large2x || photo.src.large || photo.src.landscape,
    photographer: photo.photographer,
  };

  cache.set(cacheKey, image);
  return image;
}
