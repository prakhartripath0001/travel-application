const openWeatherKey = import.meta.env.OPENWEATHER_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY;

const openMeteoCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  95: 'Thunderstorm',
};

export async function getLiveWeather(location, signal) {
  if (openWeatherKey) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${openWeatherKey}`,
      { signal },
    );

    if (!response.ok) {
      throw new Error('OpenWeather request failed');
    }

    const data = await response.json();

    return {
      source: 'OpenWeather',
      locationName: data.name || location.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      description: data.weather?.[0]?.description || 'Current conditions',
      updatedAt: data.dt ? new Date(data.dt * 1000) : new Date(),
    };
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`,
    { signal },
  );

  if (!response.ok) {
    throw new Error('Weather request failed');
  }

  const data = await response.json();
  const current = data.current;

  return {
    source: 'Open-Meteo',
    locationName: location.name,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    description: openMeteoCodes[current.weather_code] || 'Current conditions',
    updatedAt: current.time ? new Date(current.time) : new Date(),
  };
}
