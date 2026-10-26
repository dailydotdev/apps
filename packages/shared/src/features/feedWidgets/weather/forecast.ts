import { RequestKey, StaleTime } from '../../../lib/query';
import { ONE_MINUTE } from '../../../lib/time';

/**
 * Open-Meteo: keyless and CORS-enabled, so the forecast needs no daily.dev
 * backend. Its free tier is for non-commercial use; swapping the provider or
 * moving to a paid plan starts here.
 */
export const OPEN_METEO_URL = 'https://open-meteo.com/';
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';

export type WeatherUnit = 'c' | 'f';

export type WeatherCondition =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'thunder'
  | 'snow';

export const weatherConditionLabel: Record<WeatherCondition, string> = {
  clear: 'Clear',
  partly: 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  rain: 'Rain',
  thunder: 'Thunderstorms',
  snow: 'Snow',
};

export type WeatherCoordinates = { latitude: number; longitude: number };

export type WeatherPlace = WeatherCoordinates & {
  name: string;
  /** Region and country, to tell same-named cities apart in the search. */
  area?: string;
};

export type WeatherHour = {
  label: string;
  temp: number;
  condition: WeatherCondition;
  isNight: boolean;
};

export type WeatherDay = {
  label: string;
  low: number;
  high: number;
  condition: WeatherCondition;
  /** Chance of rain, in percent. */
  rain: number;
};

export type WeatherForecast = {
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  isNight: boolean;
  high: number;
  low: number;
  humidity: number;
  wind: string;
  uv: string;
  summary: string;
  hours: WeatherHour[];
  days: WeatherDay[];
  /** Rain starting or stopping within the hour, when it does. */
  nextHour?: { line: string; intensity: number[] };
};

export const WEATHER_HOURS = 6;
export const WEATHER_DAYS = 7;
const NEXT_HOUR_SLOTS = 4;
const RAIN_MM = 0.1;
const LIKELY_RAIN = 50;
const COORDINATE_DECIMALS = 2;
const MAX_LOCATION_LENGTH = 100;

/** WMO weather interpretation codes, as Open-Meteo reports them. */
export const conditionFromWmo = (code: number): WeatherCondition => {
  if (code <= 1) {
    return 'clear';
  }
  if (code === 2) {
    return 'partly';
  }
  if (code === 45 || code === 48) {
    return 'fog';
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'rain';
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return 'snow';
  }
  if (code >= 95) {
    return 'thunder';
  }
  return 'cloudy';
};

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(COORDINATE_DECIMALS));

export const toWeatherCoordinates = ({
  latitude,
  longitude,
}: WeatherCoordinates): WeatherCoordinates => ({
  latitude: roundCoordinate(latitude),
  longitude: roundCoordinate(longitude),
});

/**
 * A picked city in the widget's `location`, as `name@latitude,longitude`, so
 * the forecast needs no geocoding on load and the config keeps its shape.
 */
export const encodeWeatherLocation = (place: WeatherPlace): string => {
  const { latitude, longitude } = toWeatherCoordinates(place);
  const coordinates = `@${latitude},${longitude}`;
  const name = place.name
    .replace(/@/g, ' ')
    .trim()
    .slice(0, MAX_LOCATION_LENGTH - coordinates.length);

  return `${name}${coordinates}`;
};

const locationPattern = /^(.+)@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/;

/**
 * The stored `location`: a city with its coordinates, or only a name (set by
 * hand or by another client) that is looked up by name.
 */
export const parseWeatherLocation = (
  location?: string,
): { name: string; coordinates?: WeatherCoordinates } | undefined => {
  const value = location?.trim();
  if (!value) {
    return undefined;
  }
  const match = value.match(locationPattern);
  const latitude = Number(match?.[2]);
  const longitude = Number(match?.[3]);
  if (!match || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { name: value };
  }

  return { name: match[1].trim(), coordinates: { latitude, longitude } };
};

const fahrenheitRegions = ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM'];

/** The reader's unit when they never picked one: Fahrenheit where it is used. */
export const localeWeatherUnit = (
  locale = typeof navigator === 'undefined' ? undefined : navigator.language,
): WeatherUnit => {
  if (!locale) {
    return 'c';
  }
  try {
    const { region } = new Intl.Locale(locale).maximize();
    return region && fahrenheitRegions.includes(region) ? 'f' : 'c';
  } catch {
    return 'c';
  }
};

const hourLabel = (time: string, index: number): string => {
  if (index === 0) {
    return 'Now';
  }
  const hour = Number(time.slice(11, 13));
  return `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
};

const dayLabel = (date: string, index: number): string =>
  index === 0
    ? 'Today'
    : new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      });

const uvLabel = (index: number): string => {
  if (index < 3) {
    return 'Low';
  }
  if (index < 6) {
    return 'Moderate';
  }
  if (index < 8) {
    return 'High';
  }
  return index < 11 ? 'Very high' : 'Extreme';
};

const isWet = (amount: number): boolean => amount >= RAIN_MM;

const nextHourLine = (
  isRaining: boolean,
  slots: number[],
): string | undefined => {
  const changeAt = slots.findIndex(
    (amount, index) => index > 0 && isWet(amount) !== isRaining,
  );
  if (changeAt > 0) {
    return `Rain ${isRaining ? 'stopping' : 'starting'} in ${
      changeAt * 15
    } min`;
  }

  return isRaining ? 'Rain for the next hour' : undefined;
};

const forecastSummary = (
  condition: WeatherCondition,
  days: WeatherDay[],
): string => {
  const [today] = days;
  const lead = `${weatherConditionLabel[condition]} now. High of ${today.high}°, low of ${today.low}°.`;
  const rainyDay = days.find(({ rain }) => rain >= LIKELY_RAIN);
  if (!rainyDay) {
    return `${lead} Dry for the next ${days.length} days.`;
  }

  return `${lead} Rain likely ${
    rainyDay === today ? 'today' : rainyDay.label
  }.`;
};

type OpenMeteoForecast = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
  };
  minutely_15?: { precipitation: number[] };
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
    precipitation_probability_max: (number | null)[];
    uv_index_max: (number | null)[];
  };
};

export const toWeatherForecast = (
  data: OpenMeteoForecast,
  unit: WeatherUnit,
): WeatherForecast => {
  const { current, hourly, daily } = data;
  const condition = conditionFromWmo(current.weather_code);
  const isRaining = isWet(current.precipitation);
  const slots = data.minutely_15?.precipitation.slice(0, NEXT_HOUR_SLOTS) ?? [];
  const line = nextHourLine(isRaining, slots);
  const wettest = Math.max(RAIN_MM, ...slots);
  const days = daily.time.map((date, index) => ({
    label: dayLabel(date, index),
    low: Math.round(daily.temperature_2m_min[index]),
    high: Math.round(daily.temperature_2m_max[index]),
    condition: conditionFromWmo(daily.weather_code[index]),
    rain: daily.precipitation_probability_max[index] ?? 0,
  }));

  const temp = Math.round(current.temperature_2m);
  const isNight = !current.is_day;

  return {
    temp,
    feelsLike: Math.round(current.apparent_temperature),
    condition,
    isNight,
    high: days[0].high,
    low: days[0].low,
    humidity: Math.round(current.relative_humidity_2m),
    wind: `${Math.round(current.wind_speed_10m)} ${
      unit === 'f' ? 'mph' : 'km/h'
    }`,
    uv: uvLabel(daily.uv_index_max[0] ?? 0),
    summary: forecastSummary(condition, days),
    hours: hourly.time.map((time, index) =>
      index === 0
        ? { label: hourLabel(time, index), temp, condition, isNight }
        : {
            label: hourLabel(time, index),
            temp: Math.round(hourly.temperature_2m[index]),
            condition: conditionFromWmo(hourly.weather_code[index]),
            isNight: !hourly.is_day[index],
          },
    ),
    days,
    ...(line && {
      nextHour: {
        line,
        intensity: slots.map((amount) => Math.min(1, amount / wettest)),
      },
    }),
  };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }

  return response.json();
};

export const weatherForecastQueryOptions = ({
  coordinates,
  unit,
}: {
  coordinates?: WeatherCoordinates;
  unit: WeatherUnit;
}) => ({
  queryKey: [
    RequestKey.Weather,
    coordinates?.latitude,
    coordinates?.longitude,
    unit,
  ],
  queryFn: async (): Promise<WeatherForecast> => {
    if (!coordinates) {
      throw new Error('No place to forecast');
    }
    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,is_day',
      minutely_15: 'precipitation',
      forecast_minutely_15: String(NEXT_HOUR_SLOTS),
      hourly: 'temperature_2m,weather_code,is_day',
      forecast_hours: String(WEATHER_HOURS),
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
      forecast_days: String(WEATHER_DAYS),
      temperature_unit: unit === 'f' ? 'fahrenheit' : 'celsius',
      wind_speed_unit: unit === 'f' ? 'mph' : 'kmh',
      timezone: 'auto',
    });
    const data = await fetchJson<OpenMeteoForecast>(
      `${OPEN_METEO_FORECAST_URL}?${params}`,
    );

    return toWeatherForecast(data, unit);
  },
  enabled: !!coordinates,
  staleTime: 15 * ONE_MINUTE,
});

type OpenMeteoPlaces = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }[];
};

export const MIN_WEATHER_SEARCH = 2;

export const weatherPlacesQueryOptions = (query: string) => ({
  queryKey: [RequestKey.WeatherPlaces, query],
  queryFn: async (): Promise<WeatherPlace[]> => {
    const params = new URLSearchParams({
      name: query,
      count: '5',
      language: 'en',
      format: 'json',
    });
    const { results = [] } = await fetchJson<OpenMeteoPlaces>(
      `${OPEN_METEO_GEOCODING_URL}?${params}`,
    );

    return results.map(({ name, latitude, longitude, admin1, country }) => ({
      name,
      ...toWeatherCoordinates({ latitude, longitude }),
      area: [admin1, country].filter(Boolean).join(', ') || undefined,
    }));
  },
  enabled: query.length >= MIN_WEATHER_SEARCH,
  staleTime: StaleTime.OneDay,
});
