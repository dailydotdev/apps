import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { IconSize } from '../../../components/Icon';
import { SunIcon } from '../../../components/icons/Sun';
import { MoonIcon } from '../../../components/icons/Moon';
import { VIcon } from '../../../components/icons/V';
import type { FeedWidgetComponentProps } from '../registry';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';
import type {
  WeatherDay,
  WeatherForecast,
  WeatherHour,
  WeatherPlace,
  WeatherUnit,
} from '../weather';
import {
  defaultWeatherUnit,
  formatTemperature,
  formatWeatherDay,
  formatWeatherHour,
  placeSubtitle,
  weatherForecastQueryOptions,
  weatherGlyph,
  weatherLabel,
  weatherPlacesQueryOptions,
  weatherWashStyle,
} from '../weather';

type WeatherConfig = FeedWidgetConfig<FeedWidgetKind.Weather>;

const SEARCH_DEBOUNCE = 300;
// Two decimals is about a kilometer: enough for a forecast, and all the
// reader's settings keep of where they are.
const roundCoordinate = (value: number): number =>
  Math.round(value * 100) / 100;

const Glyph = ({
  code,
  isDay,
  className,
}: {
  code: number;
  isDay: boolean;
  className?: string;
}): ReactElement => (
  <span aria-hidden className={classNames('shrink-0 leading-none', className)}>
    {weatherGlyph(code, isDay)}
  </span>
);

const UnitToggle = ({
  unit,
  onChange,
}: {
  unit: WeatherUnit;
  onChange: (unit: WeatherUnit) => void;
}): ReactElement => (
  <div
    role="group"
    aria-label="Temperature unit"
    className="flex shrink-0 rounded-10 bg-surface-float p-0.5"
  >
    {(['c', 'f'] as const).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={unit === option}
        onClick={() => onChange(option)}
        className={classNames(
          'h-6 rounded-8 px-2 font-bold typo-caption1',
          unit === option
            ? 'bg-background-default text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        °{option.toUpperCase()}
      </button>
    ))}
  </div>
);

const PlacePicker = ({
  config,
  unit,
  message,
  onPick,
  onUnitChange,
  onCancel,
}: {
  config?: WeatherConfig;
  unit: WeatherUnit;
  message: string;
  onPick: (
    place: Pick<WeatherPlace, 'name' | 'latitude' | 'longitude'>,
  ) => void;
  onUnitChange: (unit: WeatherUnit) => void;
  onCancel?: () => void;
}): ReactElement => {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string>();
  const { data: places = [], isFetching } = useQuery(
    weatherPlacesQueryOptions(search),
  );

  useEffect(() => {
    input.current?.focus();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setSearch(query.trim()),
      SEARCH_DEBOUNCE,
    );
    return () => window.clearTimeout(timeout);
  }, [query]);

  const onLocate = () => {
    if (!navigator.geolocation) {
      setLocateError('Your browser can’t share a location. Search instead.');
      return;
    }
    setIsLocating(true);
    setLocateError(undefined);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        onPick({
          name: 'Your location',
          latitude: roundCoordinate(coords.latitude),
          longitude: roundCoordinate(coords.longitude),
        });
      },
      () => {
        setIsLocating(false);
        setLocateError('Couldn’t get your location. Search for a city.');
      },
      { maximumAge: 60 * 60 * 1000, timeout: 10000 },
    );
  };

  let hint = locateError ?? message;
  if (search.length >= 2 && !isFetching && !places.length) {
    hint = `No places match “${search}”.`;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4">
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a city"
          aria-label="Search for a city"
          className="h-9 w-full rounded-10 bg-surface-float px-3 text-text-primary typo-callout placeholder:text-text-quaternary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-subtlest-primary"
        />
      </div>
      {places.length ? (
        <ul
          aria-label="Places"
          className="mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-2"
        >
          {places.map((place) => {
            const isSelected =
              place.latitude === config?.latitude &&
              place.longitude === config?.longitude;

            return (
              <li key={place.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onPick(place)}
                  className="flex w-full items-center gap-2 rounded-12 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-bold text-text-primary typo-footnote">
                      {place.name}
                    </span>
                    <span className="truncate text-text-tertiary typo-caption1">
                      {placeSubtitle(place)}
                    </span>
                  </span>
                  {isSelected && <VIcon className="text-text-tertiary" />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          role={locateError ? 'alert' : undefined}
          className="mt-2 min-h-0 flex-1 px-4 text-text-tertiary typo-footnote"
        >
          {hint}
        </p>
      )}
      <div className="flex shrink-0 items-center gap-1 px-4 pt-2">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          loading={isLocating}
          onClick={onLocate}
          className="-ml-2"
        >
          Use my location
        </Button>
        {!!onCancel && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <span className="ml-auto">
          <UnitToggle unit={unit} onChange={onUnitChange} />
        </span>
      </div>
    </div>
  );
};

const HourRow = ({
  hour,
  unit,
}: {
  hour: WeatherHour;
  unit: WeatherUnit;
}): ReactElement => (
  <li className="flex snap-start items-center gap-2.5 rounded-12 px-2 py-1.5">
    <span className="w-12 shrink-0 tabular-nums text-text-tertiary typo-caption1">
      {formatWeatherHour(hour.time)}
    </span>
    <Glyph code={hour.code} isDay={hour.isDay} className="text-base" />
    <span className="min-w-0 flex-1 truncate text-text-secondary typo-footnote">
      {weatherLabel(hour.code, hour.isDay)}
    </span>
    <span className="shrink-0 font-bold tabular-nums text-text-primary typo-footnote">
      {formatTemperature(hour.temperature, unit)}
    </span>
  </li>
);

const DayRow = ({
  day,
  index,
  unit,
  low,
  high,
}: {
  day: WeatherDay;
  index: number;
  unit: WeatherUnit;
  /** The week's coldest and warmest, which every row's bar is drawn across. */
  low: number;
  high: number;
}): ReactElement => {
  const span = high - low || 1;

  return (
    <li
      className="flex items-center gap-2.5 rounded-12 px-2 py-1.5"
      aria-label={`${formatWeatherDay(day.date, index)}: ${weatherLabel(
        day.code,
      )}, high ${formatTemperature(day.max, unit)}, low ${formatTemperature(
        day.min,
        unit,
      )}`}
    >
      <span className="w-10 shrink-0 font-bold text-text-primary typo-footnote">
        {formatWeatherDay(day.date, index)}
      </span>
      <Glyph code={day.code} isDay className="text-base" />
      <span className="w-8 shrink-0 text-right tabular-nums text-text-tertiary typo-footnote">
        {formatTemperature(day.min, unit)}
      </span>
      <span
        aria-hidden
        className="relative h-1 min-w-0 flex-1 rounded-max bg-border-subtlest-tertiary"
      >
        <span
          className="absolute inset-y-0 rounded-max bg-gradient-to-r from-accent-water-default to-accent-cheese-default"
          style={{
            left: `${((day.min - low) / span) * 100}%`,
            right: `${((high - day.max) / span) * 100}%`,
          }}
        />
      </span>
      <span className="w-8 shrink-0 tabular-nums text-text-primary typo-footnote">
        {formatTemperature(day.max, unit)}
      </span>
    </li>
  );
};

const CurrentWeather = ({
  forecast,
  unit,
  isLarge,
}: {
  forecast: WeatherForecast;
  unit: WeatherUnit;
  isLarge: boolean;
}): ReactElement => {
  const { current, days } = forecast;
  const [today] = days;

  return (
    <div className="flex shrink-0 items-start gap-3 px-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={classNames(
            'font-bold tabular-nums text-text-primary',
            isLarge ? 'typo-mega1' : 'typo-mega3',
          )}
        >
          {formatTemperature(current.temperature, unit)}
        </span>
        <span className="truncate text-text-secondary typo-callout">
          {weatherLabel(current.code, current.isDay)}
        </span>
        {!!today && (
          <span className="truncate tabular-nums text-text-tertiary typo-footnote">
            H {formatTemperature(today.max, unit)} · L{' '}
            {formatTemperature(today.min, unit)}
          </span>
        )}
      </div>
      <Glyph
        code={current.code}
        isDay={current.isDay}
        className={isLarge ? 'text-[3.5rem]' : 'text-[2.75rem]'}
      />
    </div>
  );
};

/**
 * The forecast for a place the reader picked: the sky now at every size,
 * the next hours from Tall, and the week beside them at Large. Nothing is
 * asked of the browser until the reader asks for their own location.
 */
export const WeatherWidget = ({
  widget,
  size,
  onConfigChange,
  canConfigure,
  isConfiguring,
  onConfigureEnd,
}: FeedWidgetComponentProps<FeedWidgetKind.Weather>): ReactElement => {
  const { config } = widget;
  const [isPicking, setIsPicking] = useState(false);
  const scroll = useWidgetScroll();
  const hasPlace =
    config?.latitude !== undefined && config?.longitude !== undefined;
  const unit = config?.unit ?? defaultWeatherUnit();
  const {
    data: forecast,
    isPending,
    isError,
  } = useQuery({
    ...weatherForecastQueryOptions({
      latitude: config?.latitude,
      longitude: config?.longitude,
    }),
    enabled: hasPlace && !isConfiguring,
  });

  const isSetting = isConfiguring || isPicking;
  const onDone = () => {
    setIsPicking(false);
    onConfigureEnd();
  };

  if ((!hasPlace || isSetting) && !canConfigure) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.Weather}
        message="This widget was set up in a newer version of daily.dev."
      />
    );
  }

  if (isSetting) {
    return (
      <PlacePicker
        config={config}
        unit={unit}
        message={
          hasPlace
            ? `Showing ${config.location}. Pick another place.`
            : 'Pick a city, or use your location.'
        }
        onPick={({ name, latitude, longitude }) => {
          if (onConfigChange({ location: name, latitude, longitude, unit })) {
            onDone();
          }
        }}
        onUnitChange={(next) => onConfigChange({ ...config, unit: next })}
        onCancel={onDone}
      />
    );
  }

  if (!hasPlace) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <SunIcon
          secondary
          size={IconSize.Large}
          className="text-accent-cheese-default"
        />
        <span className="text-text-tertiary typo-footnote">
          See the forecast for your city.
        </span>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          onClick={() => setIsPicking(true)}
        >
          Set location
        </Button>
      </div>
    );
  }

  if (!forecast) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.Weather}
        isPending={isPending && !isError}
        message="Couldn’t load the forecast. Try again later."
      />
    );
  }

  const isLarge = size === FeedWidgetSize.Large;
  const { current } = forecast;
  const SkyIcon = current.isDay ? SunIcon : MoonIcon;
  const { days } = forecast;
  const low = Math.min(...days.map(({ min }) => min));
  const high = Math.max(...days.map(({ max }) => max));

  const hours =
    size === FeedWidgetSize.Small ? null : (
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        style={scroll.style}
        className={classNames('mt-3 px-2', scroll.className)}
      >
        <ul aria-label="Next hours" className="flex flex-col">
          {forecast.hours.map((hour) => (
            <HourRow key={hour.time} hour={hour} unit={unit} />
          ))}
        </ul>
      </div>
    );

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={weatherWashStyle(current.code, current.isDay)}
      />
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        <SkyIcon
          secondary
          size={IconSize.Size16}
          className={classNames(
            'shrink-0',
            current.isDay
              ? 'text-accent-cheese-default'
              : 'text-accent-cabbage-default',
          )}
        />
        <span className="truncate font-bold text-text-primary typo-caption1">
          {config.location ?? 'Weather'}
        </span>
      </header>
      <div className="mt-2 flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CurrentWeather forecast={forecast} unit={unit} isLarge={isLarge} />
          {hours}
        </div>
        {isLarge && (
          <ul
            aria-label="Next days"
            className="flex min-w-0 flex-1 flex-col justify-center pr-2"
          >
            {days.map((day, index) => (
              <DayRow
                key={day.date}
                day={day}
                index={index}
                unit={unit}
                low={low}
                high={high}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
