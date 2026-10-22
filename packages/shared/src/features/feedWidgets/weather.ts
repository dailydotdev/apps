import type { CSSProperties } from 'react';
import { queryOptions } from '@tanstack/react-query';
import { ONE_MINUTE } from '../../lib/time';

// Open-Meteo takes no key and keeps no account, so the browser asks it
// directly and the reader's location never passes through our API.
const forecastUrl = 'https://api.open-meteo.com/v1/forecast';
const geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

export type WeatherUnit = 'c' | 'f';

export enum WeatherSky {
  Clear = 'clear',
  Partly = 'partly',
  Cloudy = 'cloudy',
  Fog = 'fog',
  Drizzle = 'drizzle',
  Rain = 'rain',
  Snow = 'snow',
  Storm = 'storm',
}

export type WeatherHour = {
  /** Local wall time at the place, as Open-Meteo gives it: `2026-10-22T14:00`. */
  time: string;
  temperature: number;
  code: number;
  isDay: boolean;
};

export type WeatherDay = {
  /** Local date at the place: `2026-10-22`. */
  date: string;
  code: number;
  max: number;
  min: number;
};

/** Temperatures in Celsius; a unit is only applied when shown. */
export type WeatherForecast = {
  current: WeatherHour;
  hours: WeatherHour[];
  days: WeatherDay[];
};

export type WeatherPlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

// Fahrenheit countries, by region code.
const fahrenheitRegions = ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM'];

/** The unit the reader's locale reads temperatures in. */
export const defaultWeatherUnit = (
  locale = typeof navigator === 'undefined' ? undefined : navigator.language,
): WeatherUnit => {
  const region = locale?.split('-')[1]?.toUpperCase();
  return region && fahrenheitRegions.includes(region) ? 'f' : 'c';
};

export const formatTemperature = (celsius: number, unit: WeatherUnit): string =>
  `${Math.round(unit === 'f' ? (celsius * 9) / 5 + 32 : celsius)}°`;

/** WMO weather codes, as Open-Meteo reports them, in the sky's own words. */
export const weatherSky = (code: number): WeatherSky => {
  if (code <= 1) {
    return WeatherSky.Clear;
  }
  if (code === 2) {
    return WeatherSky.Partly;
  }
  if (code === 3) {
    return WeatherSky.Cloudy;
  }
  if (code === 45 || code === 48) {
    return WeatherSky.Fog;
  }
  if (code >= 51 && code <= 57) {
    return WeatherSky.Drizzle;
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return WeatherSky.Snow;
  }
  if (code >= 95) {
    return WeatherSky.Storm;
  }
  return WeatherSky.Rain;
};

const skyLabel: Record<WeatherSky, string> = {
  [WeatherSky.Clear]: 'Clear',
  [WeatherSky.Partly]: 'Partly cloudy',
  [WeatherSky.Cloudy]: 'Cloudy',
  [WeatherSky.Fog]: 'Fog',
  [WeatherSky.Drizzle]: 'Drizzle',
  [WeatherSky.Rain]: 'Rain',
  [WeatherSky.Snow]: 'Snow',
  [WeatherSky.Storm]: 'Thunderstorm',
};

export const weatherLabel = (code: number, isDay = true): string => {
  const sky = weatherSky(code);
  if (sky === WeatherSky.Clear) {
    return isDay ? 'Sunny' : 'Clear';
  }
  return skyLabel[sky];
};

/** The glyph a weather app would show, read as decoration beside the label. */
export const weatherGlyph = (code: number, isDay = true): string => {
  switch (weatherSky(code)) {
    case WeatherSky.Clear:
      return isDay ? '☀️' : '🌙';
    case WeatherSky.Partly:
      return isDay ? '⛅' : '☁️';
    case WeatherSky.Cloudy:
      return '☁️';
    case WeatherSky.Fog:
      return '🌫️';
    case WeatherSky.Drizzle:
      return '🌦️';
    case WeatherSky.Snow:
      return '🌨️';
    case WeatherSky.Storm:
      return '⛈️';
    default:
      return '🌧️';
  }
};

const wash = (top: string, bottom: string, strength = 22): string =>
  `radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--theme-accent-${top}-default) ${strength}%, transparent) 0%, transparent 70%), linear-gradient(to top, color-mix(in srgb, var(--theme-accent-${bottom}-default) 14%, transparent) 0%, transparent 60%)`;

/** The widget's material: the sky over the place, kept low so text leads. */
export const weatherWashStyle = (
  code: number,
  isDay: boolean,
): CSSProperties => {
  const sky = weatherSky(code);
  if (sky === WeatherSky.Storm) {
    return { backgroundImage: wash('onion', 'cabbage') };
  }
  if (!isDay) {
    return { backgroundImage: wash('cabbage', 'blueCheese', 18) };
  }
  if (sky === WeatherSky.Clear || sky === WeatherSky.Partly) {
    return { backgroundImage: wash('cheese', 'water') };
  }
  if (sky === WeatherSky.Snow || sky === WeatherSky.Fog) {
    return { backgroundImage: wash('salt', 'blueCheese', 16) };
  }
  if (sky === WeatherSky.Cloudy) {
    return { backgroundImage: wash('salt', 'water', 14) };
  }
  return { backgroundImage: wash('water', 'blueCheese') };
};

export const HOURS_AHEAD = 12;
export const DAYS_AHEAD = 5;

type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }
  return response.json();
};

export const getWeatherForecast = async (
  latitude: number,
  longitude: number,
): Promise<WeatherForecast> => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    // Local times at the place, so its hours and days read as its own.
    timezone: 'auto',
    forecast_days: String(DAYS_AHEAD),
    forecast_hours: String(HOURS_AHEAD + 1),
  });
  const { current, hourly, daily } = await getJson<ForecastResponse>(
    `${forecastUrl}?${params}`,
  );

  return {
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      code: current.weather_code,
      isDay: !!current.is_day,
    },
    // The hourly series starts at the current hour, which `current` covers.
    hours: hourly.time.slice(1).map((time, index) => ({
      time,
      temperature: hourly.temperature_2m[index + 1],
      code: hourly.weather_code[index + 1],
      isDay: !!hourly.is_day[index + 1],
    })),
    days: daily.time.map((date, index) => ({
      date,
      code: daily.weather_code[index],
      max: daily.temperature_2m_max[index],
      min: daily.temperature_2m_min[index],
    })),
  };
};

export const searchWeatherPlaces = async (
  name: string,
): Promise<WeatherPlace[]> => {
  const params = new URLSearchParams({
    name,
    count: '6',
    language: 'en',
    format: 'json',
  });
  const { results } = await getJson<{ results?: WeatherPlace[] }>(
    `${geocodingUrl}?${params}`,
  );
  return results ?? [];
};

export const weatherForecastQueryOptions = ({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) =>
  queryOptions({
    queryKey: ['feed-widget-weather', latitude, longitude],
    queryFn: () => getWeatherForecast(latitude as number, longitude as number),
    enabled: latitude !== undefined && longitude !== undefined,
    staleTime: 30 * ONE_MINUTE,
  });

export const weatherPlacesQueryOptions = (name: string) =>
  queryOptions({
    queryKey: ['feed-widget-weather-places', name],
    queryFn: () => searchWeatherPlaces(name),
    enabled: name.length >= 2,
    staleTime: Infinity,
  });

/** `14:00` → `2 PM` in the reader's locale. */
export const formatWeatherHour = (time: string): string => {
  const [date, clock] = time.split('T');
  const [hour] = clock.split(':').map(Number);
  // Parsed as the reader's local time, which only the label reads.
  return new Date(`${date}T${String(hour).padStart(2, '0')}:00`)
    .toLocaleTimeString(undefined, { hour: 'numeric' })
    .replace(/\s/g, ' ');
};

export const formatWeatherDay = (date: string, index: number): string =>
  index === 0
    ? 'Today'
    : new Date(`${date}T12:00`).toLocaleDateString(undefined, {
        weekday: 'short',
      });

export const placeSubtitle = ({ admin1, country }: WeatherPlace): string =>
  [admin1, country].filter(Boolean).join(', ');
