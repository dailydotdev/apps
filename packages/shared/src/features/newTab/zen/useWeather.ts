import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

// Open-Meteo is free, keyless, and respects CORS — the pragmatic choice for
// a no-setup ambient weather widget. If we ever need hourly forecasts or
// alerts we'll revisit.
// https://open-meteo.com/

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
// Approximate IP-based geolocation fallback. Zero-auth, small response.
// https://open-meteo.com/en/docs/geocoding-api -- this is the companion IP API.
const IP_GEO_URL = 'https://ipapi.co/json/';

export interface WeatherSnapshot {
  temperatureC: number;
  feelsLikeC: number | null;
  weatherCode: number;
  locationLabel: string;
  isDay: boolean;
}

const CACHE_KEY = 'newtab:weather:last';
const LOCATION_OPT_IN_KEY = 'newtab:weather:use-geolocation';
const STALE_MS = 30 * 60 * 1000; // 30 minutes
const GC_MS = 12 * 60 * 60 * 1000; // 12 hours

interface Coords {
  latitude: number;
  longitude: number;
  label: string;
}

const toFixedDegrees = (value: number): number => Math.round(value);

const browserGeolocate = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5_000,
      maximumAge: 15 * 60 * 1000,
    });
  });

const getCoords = async (preferGeolocation: boolean): Promise<Coords> => {
  if (preferGeolocation) {
    try {
      const position = await browserGeolocate();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Your location',
      };
    } catch {
      // Fall through to IP geo fallback.
    }
  }

  const response = await fetch(IP_GEO_URL, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error('Failed to resolve approximate location');
  }
  const payload = (await response.json()) as {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country_name?: string;
  };
  if (
    typeof payload.latitude !== 'number' ||
    typeof payload.longitude !== 'number'
  ) {
    throw new Error('Location payload missing coordinates');
  }
  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    label: payload.city ?? payload.region ?? payload.country_name ?? 'Nearby',
  };
};

const fetchWeather = async (
  preferGeolocation: boolean,
): Promise<WeatherSnapshot> => {
  const coords = await getCoords(preferGeolocation);
  const params = new URLSearchParams({
    latitude: coords.latitude.toString(),
    longitude: coords.longitude.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,is_day',
    temperature_unit: 'celsius',
  });
  const response = await fetch(`${FORECAST_URL}?${params.toString()}`, {
    credentials: 'omit',
  });
  if (!response.ok) {
    throw new Error('Weather request failed');
  }
  const payload = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      weather_code?: number;
      is_day?: number;
    };
  };
  const { current } = payload;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Weather payload malformed');
  }
  const snapshot: WeatherSnapshot = {
    temperatureC: toFixedDegrees(current.temperature_2m),
    feelsLikeC:
      typeof current.apparent_temperature === 'number'
        ? toFixedDegrees(current.apparent_temperature)
        : null,
    weatherCode: current.weather_code ?? 0,
    locationLabel: coords.label,
    isDay: current.is_day !== 0,
  };

  // Cache outside of React Query as well so we have something to show before
  // the first fetch resolves on subsequent new tabs.
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ snapshot, fetchedAt: Date.now() }),
    );
  } catch {
    // Ignore storage errors (private mode, quota).
  }
  return snapshot;
};

const readCached = (): WeatherSnapshot | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(CACHE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as {
      snapshot?: WeatherSnapshot;
      fetchedAt?: number;
    };
    if (!parsed.snapshot || typeof parsed.fetchedAt !== 'number') {
      return null;
    }
    if (Date.now() - parsed.fetchedAt > GC_MS) {
      return null;
    }
    return parsed.snapshot;
  } catch {
    return null;
  }
};

export const getStoredUseGeolocation = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(LOCATION_OPT_IN_KEY) === 'true';
};

export const setStoredUseGeolocation = (value: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(LOCATION_OPT_IN_KEY, value ? 'true' : 'false');
};

export const useWeather = (enabled: boolean): UseQueryResult<WeatherSnapshot> =>
  useQuery({
    queryKey: ['zen', 'weather', getStoredUseGeolocation()],
    queryFn: () => fetchWeather(getStoredUseGeolocation()),
    enabled,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    initialData: () => readCached() ?? undefined,
    retry: 1,
  });

// WMO weather interpretation codes reduced to the handful we actually need
// for a non-critical ambient widget. Maps to emoji for now — upgrade to real
// icons if users engage.
export const describeWeather = (
  code: number,
  isDay: boolean,
): { label: string; symbol: string } => {
  if (code === 0) {
    return { label: 'Clear', symbol: isDay ? '\u2600\ufe0f' : '\u{1F319}' };
  }
  if (code <= 2) {
    return {
      label: 'Mostly clear',
      symbol: isDay ? '\u{1F324}\ufe0f' : '\u{1F319}',
    };
  }
  if (code === 3) {
    return { label: 'Overcast', symbol: '\u2601\ufe0f' };
  }
  if (code <= 48) {
    return { label: 'Foggy', symbol: '\u{1F32B}\ufe0f' };
  }
  if (code <= 57) {
    return { label: 'Drizzle', symbol: '\u{1F327}\ufe0f' };
  }
  if (code <= 67) {
    return { label: 'Rainy', symbol: '\u{1F327}\ufe0f' };
  }
  if (code <= 77) {
    return { label: 'Snowy', symbol: '\u{1F328}\ufe0f' };
  }
  if (code <= 82) {
    return { label: 'Showers', symbol: '\u{1F326}\ufe0f' };
  }
  if (code <= 86) {
    return { label: 'Snow showers', symbol: '\u{1F328}\ufe0f' };
  }
  return { label: 'Stormy', symbol: '\u26C8\ufe0f' };
};
