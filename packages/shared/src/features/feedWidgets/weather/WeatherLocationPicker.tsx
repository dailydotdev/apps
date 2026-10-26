import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { SearchField } from '../../../components/fields/SearchField';
import { SearchIcon } from '../../../components/icons/Search';
import { VIcon } from '../../../components/icons/V';
import useDebounce from '../../../hooks/useDebounce';
import { ONE_MINUTE } from '../../../lib/time';
import type { WeatherCoordinates, WeatherPlace, WeatherUnit } from './forecast';
import {
  MIN_WEATHER_SEARCH,
  toWeatherCoordinates,
  weatherPlacesQueryOptions,
} from './forecast';
import { WeatherGlyph } from './WeatherGlyph';
import { WeatherFrame, WeatherHeader } from './WeatherParts';

const SEARCH_DEBOUNCE_MS = 300;
const LOCATE_TIMEOUT_MS = 15 * 1000;

type LocateStatus = 'idle' | 'locating' | 'denied' | 'failed';

const locateNotice: Partial<Record<LocateStatus, string>> = {
  denied: 'Location access is blocked, so search for your city instead.',
  failed: 'Couldn’t find your location. Search for your city instead.',
};

const canLocate = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.geolocation;

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
    className="flex shrink-0 rounded-8 bg-surface-float p-0.5"
  >
    {(['c', 'f'] as const).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={unit === option}
        onClick={() => onChange(option)}
        className={classNames(
          'h-5 rounded-6 px-1.5 font-bold typo-caption1',
          unit === option
            ? 'bg-background-default text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        °{option.toUpperCase()}
      </button>
    ))}
  </div>
);

const PlaceResults = ({
  query,
  selected,
  onPick,
}: {
  query: string;
  selected?: string;
  onPick: (place: WeatherPlace) => void;
}): ReactElement | null => {
  const {
    data: places,
    isFetching,
    isError,
  } = useQuery(weatherPlacesQueryOptions(query));

  if (query.length < MIN_WEATHER_SEARCH) {
    return null;
  }

  let status: string | undefined;
  if (isError) {
    status = 'Couldn’t search right now. Try again.';
  } else if (!places) {
    status = isFetching ? 'Searching…' : undefined;
  } else if (!places.length) {
    status = `No cities match “${query}”.`;
  }

  if (status || !places) {
    return status ? (
      <li className="px-2 py-1.5 text-text-tertiary typo-footnote">{status}</li>
    ) : null;
  }

  return (
    <>
      {places.map((place) => (
        <li key={`${place.latitude},${place.longitude}`}>
          <button
            type="button"
            onClick={() => onPick(place)}
            className="flex w-full items-center gap-2 rounded-12 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary typo-footnote">
                {place.name}
              </span>
              {!!place.area && (
                <span className="truncate text-text-tertiary typo-caption1">
                  {place.area}
                </span>
              )}
            </span>
            {selected === place.name && (
              <VIcon className="shrink-0 text-text-tertiary" />
            )}
          </button>
        </li>
      ))}
    </>
  );
};

export type WeatherLocationPickerProps = {
  isSmall: boolean;
  /** The widget already shows a place, so the picker can be left as is. */
  isChanging: boolean;
  city?: string;
  unit: WeatherUnit;
  onUnitChange: (unit: WeatherUnit) => void;
  onPick: (place: WeatherPlace) => void;
  onLocate: (coordinates: WeatherCoordinates) => Promise<void>;
  onCancel: () => void;
  /** Why the stored place is not shown, when it is set but not found. */
  notice?: string;
};

/**
 * Where the forecast is for: first a single ask, the reader's location or a
 * city, then a city search that is also how the place is changed later.
 */
export const WeatherLocationPicker = ({
  isSmall,
  isChanging,
  city,
  unit,
  onUnitChange,
  onPick,
  onLocate,
  onCancel,
  notice,
}: WeatherLocationPickerProps): ReactElement => {
  const [isSearching, setIsSearching] = useState(isChanging || !canLocate());
  const [status, setStatus] = useState<LocateStatus>('idle');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const isLocating = status === 'locating';
  const canOfferLocation = canLocate() && status !== 'denied';

  const locate = () => {
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        onLocate(toWeatherCoordinates(coords)).finally(() => setStatus('idle')),
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'failed');
        setIsSearching(true);
      },
      { maximumAge: 30 * ONE_MINUTE, timeout: LOCATE_TIMEOUT_MS },
    );
  };

  if (!isSearching) {
    return (
      <WeatherFrame condition="partly">
        <WeatherHeader />
        <div className="mt-4 flex items-center gap-3 px-4">
          <WeatherGlyph condition="partly" size={isSmall ? 32 : 40} />
          <span
            className={classNames(
              'min-w-0 flex-1 font-bold text-text-primary',
              isSmall ? 'typo-callout' : 'typo-title3',
            )}
          >
            The weather where you code.
          </span>
        </div>
        {!isSmall && (
          <span className="mt-2 px-4 text-text-tertiary typo-footnote">
            {notice ??
              'Use your location once, or pick a city. Your location stays on this device.'}
          </span>
        )}
        <div className="mt-auto flex gap-2 px-4">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            loading={isLocating}
            onClick={locate}
          >
            Use my location
          </Button>
          {isSmall ? (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<SearchIcon />}
              aria-label="Choose a city"
              onClick={() => setIsSearching(true)}
            />
          ) : (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => setIsSearching(true)}
            >
              Choose a city
            </Button>
          )}
        </div>
      </WeatherFrame>
    );
  }

  const message = locateNotice[status] ?? notice;

  return (
    <WeatherFrame condition="partly">
      {!isSmall && <WeatherHeader city={city} />}
      <div className={classNames('px-4', !isSmall && 'mt-2')}>
        <SearchField
          inputId="weather-city-search"
          fieldSize="medium"
          placeholder="Search for a city"
          aria-label="Search for a city"
          value={query}
          valueChanged={setQuery}
          autoFocus
        />
      </div>
      {!!message && (
        <p className="px-4 pt-2 text-text-tertiary typo-footnote">{message}</p>
      )}
      <ul
        aria-label="Places"
        className="mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-2"
      >
        {canOfferLocation && !debouncedQuery && (
          <li>
            <button
              type="button"
              onClick={locate}
              disabled={isLocating}
              aria-busy={isLocating}
              className="flex w-full items-center gap-2 rounded-12 px-2 py-1.5 text-left font-bold text-text-primary transition-colors typo-footnote hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              {isLocating ? 'Finding your location…' : 'Use my location'}
            </button>
          </li>
        )}
        <PlaceResults query={debouncedQuery} selected={city} onPick={onPick} />
      </ul>
      <div className="flex items-center gap-2 px-4 pt-2">
        {(isChanging || canOfferLocation) && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="-ml-2"
            onClick={isChanging ? onCancel : () => setIsSearching(false)}
          >
            {isChanging ? 'Cancel' : 'Back'}
          </Button>
        )}
        <span className="ml-auto">
          <UnitToggle unit={unit} onChange={onUnitChange} />
        </span>
      </div>
    </WeatherFrame>
  );
};
