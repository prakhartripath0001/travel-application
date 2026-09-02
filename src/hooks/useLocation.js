import { useMemo, useState } from 'react';

const DENIED_KEY = 'worldtrip-location-denied';

function formatLocation(result) {
  const address = result.address || {};
  const city = address.city || address.town || address.village || address.municipality || result.name;
  const region = address.state || address.region || address.county;
  const country = address.country;

  return [city, region, country].filter(Boolean).join(', ');
}

async function reverseGeocode(lat, lon) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
  );

  if (!response.ok) {
    throw new Error('Could not read your location');
  }

  const data = await response.json();
  return {
    label: formatLocation(data) || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    lat,
    lon,
    source: 'browser',
  };
}

async function searchLocation(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const results = await response.json();
  return results.map((result) => ({
    id: result.place_id,
    label: formatLocation(result) || result.display_name,
    lat: Number(result.lat),
    lon: Number(result.lon),
    source: 'manual',
  }));
}

export function useLocation() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(
    () => localStorage.getItem(DENIED_KEY) === 'true',
  );
  const [geoStatus, setGeoStatus] = useState('idle');
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const canAskForLocation = useMemo(
    () => 'geolocation' in navigator && !permissionDenied,
    [permissionDenied],
  );

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setError('Your browser does not support location detection.');
      setGeoStatus('error');
      return;
    }

    if (permissionDenied) {
      setError('Location permission was denied. Use manual search instead.');
      setGeoStatus('denied');
      return;
    }

    setGeoStatus('loading');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const location = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          setSelectedLocation(location);
          setGeoStatus('ready');
        } catch (geocodeError) {
          setError(geocodeError.message);
          setGeoStatus('error');
        }
      },
      (locationError) => {
        if (locationError.code === locationError.PERMISSION_DENIED) {
          localStorage.setItem(DENIED_KEY, 'true');
          setPermissionDenied(true);
          setGeoStatus('denied');
          setError('Location permission was denied. You can still search manually.');
          return;
        }

        setGeoStatus('error');
        setError('We could not detect your location. Try manual search.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }

  async function findLocations(query) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchStatus('idle');
      setError('');
      return;
    }

    setSearchStatus('loading');
    setError('');

    try {
      const results = await searchLocation(trimmedQuery);
      setSearchResults(results);
      setSearchStatus(results.length ? 'ready' : 'empty');
      if (!results.length) {
        setError('No matching location found. Try another city, region, or country.');
      }
    } catch (searchError) {
      setSearchResults([]);
      setSearchStatus('error');
      setError(searchError.message);
    }
  }

  function chooseLocation(location) {
    setSelectedLocation(location);
    setSearchResults([]);
    setSearchStatus('idle');
    setError('');
  }

  function clearLocation() {
    setSelectedLocation(null);
    setSearchResults([]);
    setSearchStatus('idle');
    setError('');
  }

  return {
    canAskForLocation,
    chooseLocation,
    clearLocation,
    error,
    findLocations,
    geoStatus,
    permissionDenied,
    searchResults,
    searchStatus,
    selectedLocation,
    useCurrentLocation,
  };
}
