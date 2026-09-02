import { usePexelsImage } from '../hooks/usePexelsImage.js';

export default function ImageFromSource({ query, alt, className, loading = 'lazy' }) {
  const { image, status } = usePexelsImage(query);

  // Loading shimmer
  if (status === 'loading') {
    return (
      <div
        className={`animate-pulse bg-stone-200 dark:bg-neutral-800 ${className}`}
        role="img"
        aria-label={`Loading image of ${alt}`}
      />
    );
  }

  // Fallback: no API key, error, or no results
  if (!image) {
    return (
      <div
        className={`flex items-end bg-[linear-gradient(135deg,#1c1917,#065f46,#0f172a)] p-5 text-sm font-semibold text-white ${className}`}
        role="img"
        aria-label={alt}
      >
        {alt}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={image.src}
      alt={image.alt || alt}
      loading={loading}
      referrerPolicy="no-referrer"
    />
  );
}
