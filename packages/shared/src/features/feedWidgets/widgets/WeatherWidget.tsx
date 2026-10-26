import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import type { FeedWidgetComponentProps } from '../registry';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import type {
  WeatherCoordinates,
  WeatherForecast,
  WeatherUnit,
} from '../weather/forecast';
import {
  MIN_WEATHER_SEARCH,
  localeWeatherUnit,
  savedWeatherPlace,
  toWeatherPlaceConfig,
  weatherForecastQueryOptions,
  weatherPlacesQueryOptions,
} from '../weather/forecast';
import { WeatherGlyph } from '../weather/WeatherGlyph';
import {
  WeatherDays,
  WeatherDetails,
  WeatherFrame,
  WeatherHeader,
  WeatherHourChart,
  WeatherHourStrip,
  WeatherNextHour,
  WeatherNow,
  WeatherSkeleton,
} from '../weather/WeatherParts';
import { WeatherLocationPicker } from '../weather/WeatherLocationPicker';

const SMALL_HOURS = 4;
const TALL_HOURS = 5;
const TALL_DAYS = 5;

type WeatherConfig = FeedWidgetConfig<FeedWidgetKind.Weather>;

const ForecastView = ({
  size,
  city,
  forecast,
}: {
  size: FeedWidgetSize;
  city?: string;
  forecast: WeatherForecast;
}): ReactElement => {
  const { nextHour } = forecast;

  if (size === FeedWidgetSize.Small) {
    return (
      <WeatherFrame condition={forecast.condition} isNight={forecast.isNight}>
        <WeatherHeader city={city} hasCredit />
        <div className="mt-3 px-4">
          <WeatherNow forecast={forecast} isCompact />
        </div>
        <div className="mt-auto px-4">
          {nextHour ? (
            <span className="block truncate font-bold text-accent-water-default typo-footnote">
              {nextHour.line}
            </span>
          ) : (
            <WeatherHourStrip hours={forecast.hours.slice(0, SMALL_HOURS)} />
          )}
        </div>
      </WeatherFrame>
    );
  }

  if (size === FeedWidgetSize.Tall) {
    return (
      <WeatherFrame condition={forecast.condition} isNight={forecast.isNight}>
        <WeatherHeader city={city} hasCredit />
        <div className="mt-4 px-4">
          <WeatherNow forecast={forecast} />
        </div>
        <div className="mt-3 px-4">
          {nextHour ? (
            <WeatherNextHour nextHour={nextHour} />
          ) : (
            <WeatherHourChart
              forecast={forecast}
              hours={forecast.hours.slice(0, TALL_HOURS)}
            />
          )}
        </div>
        <div className="mt-auto px-4 pt-2">
          <WeatherDays
            forecast={forecast}
            count={nextHour ? TALL_DAYS - 1 : TALL_DAYS}
          />
        </div>
      </WeatherFrame>
    );
  }

  return (
    <WeatherFrame condition={forecast.condition} isNight={forecast.isNight}>
      <WeatherHeader city={city} hasCredit />
      <div className="mt-4 flex min-h-0 flex-1 gap-6 px-4">
        <div className="flex w-1/2 shrink-0 flex-col">
          <WeatherNow forecast={forecast} />
          <span className="mt-2 line-clamp-2 text-text-secondary typo-footnote">
            {forecast.summary}
          </span>
          <div className="mt-3">
            <WeatherHourChart forecast={forecast} hours={forecast.hours} />
          </div>
          <div className="mt-auto pt-2">
            {nextHour ? (
              <WeatherNextHour nextHour={nextHour} />
            ) : (
              <WeatherDetails forecast={forecast} />
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <WeatherDays forecast={forecast} count={forecast.days.length} />
        </div>
      </div>
    </WeatherFrame>
  );
};

const withoutLocation = ({ unit }: WeatherConfig = {}): WeatherConfig =>
  unit ? { unit } : {};

/** This device's location is the reader's, so another account never sees it. */
export const weatherDeviceLocationKey = (userId?: string): string =>
  `${PersistentContextKeys.WeatherDeviceLocation}_${userId}`;

const WeatherError = ({
  city,
  isOffline,
  isRetrying,
  onRetry,
}: {
  city?: string;
  isOffline: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}): ReactElement => (
  <WeatherFrame condition="cloudy">
    <WeatherHeader city={city} />
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <WeatherGlyph condition="cloudy" size={32} />
      <span className="text-text-tertiary typo-footnote">
        {isOffline
          ? 'Couldn’t load the weather while you’re offline.'
          : 'Couldn’t load the weather.'}
      </span>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.XSmall}
        loading={isRetrying}
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  </WeatherFrame>
);

/**
 * The forecast where the reader is, from Open-Meteo with no backend of ours.
 * The place is a city saved in the widget's config, so it follows the reader
 * across devices, or this device's own location, which never leaves it.
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
  const unit = config?.unit ?? localeWeatherUnit();
  const stored = savedWeatherPlace(config);
  const { user } = useAuthContext();
  const [deviceLocation, setDeviceLocation, isDeviceLocationRead] =
    usePersistentContext<WeatherCoordinates | null>(
      weatherDeviceLocationKey(user?.id),
      null,
    );
  // A city saved by name alone, without its coordinates, is looked up once.
  const lookup =
    stored && !stored.coordinates && stored.name.length >= MIN_WEATHER_SEARCH
      ? stored.name
      : '';
  const lookupQuery = useQuery(weatherPlacesQueryOptions(lookup));
  const { data: lookedUp } = lookupQuery;
  const isLookupOffline = !lookedUp && lookupQuery.fetchStatus === 'paused';
  const hasLookupFailed =
    !!lookup && !lookedUp && (lookupQuery.isError || isLookupOffline);

  let city: string | undefined;
  let coordinates: WeatherCoordinates | undefined;
  if (stored) {
    city = stored.name;
    coordinates = stored.coordinates ?? lookedUp?.[0];
  } else if (deviceLocation) {
    city = 'Current location';
    coordinates = deviceLocation;
  }

  const forecastQuery = useQuery({
    ...weatherForecastQueryOptions({ coordinates, unit }),
    enabled: !!coordinates && !isConfiguring,
  });
  const isSmall = size === FeedWidgetSize.Small;

  if (
    !isDeviceLocationRead ||
    (!!lookup && lookupQuery.isPending && !hasLookupFailed)
  ) {
    return <WeatherSkeleton isSmall={isSmall} city={city} />;
  }

  if (hasLookupFailed && !isConfiguring) {
    return (
      <WeatherError
        city={city}
        isOffline={isLookupOffline}
        isRetrying={lookupQuery.fetchStatus === 'fetching'}
        onRetry={() => lookupQuery.refetch()}
      />
    );
  }

  if (!coordinates || isConfiguring) {
    if (!canConfigure) {
      return (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.Weather}
          message="This widget was set up in a newer version of daily.dev."
        />
      );
    }

    const save = (next: WeatherConfig) => {
      if (onConfigChange(next)) {
        onConfigureEnd();
      }
    };

    return (
      <WeatherLocationPicker
        isSmall={isSmall}
        isChanging={!!coordinates}
        city={city}
        unit={unit}
        notice={
          stored && !coordinates && !hasLookupFailed
            ? `Couldn’t find “${stored.name}”. Pick your city.`
            : undefined
        }
        onUnitChange={(next: WeatherUnit) =>
          onConfigChange({ ...config, unit: next })
        }
        onPick={(place) => save({ ...config, ...toWeatherPlaceConfig(place) })}
        onLocate={async (located) => {
          await setDeviceLocation(located);
          save(withoutLocation(config));
        }}
        onCancel={onConfigureEnd}
      />
    );
  }

  const { data: forecast, isError, fetchStatus, refetch } = forecastQuery;
  const isOffline = !forecast && fetchStatus === 'paused';

  if (forecast) {
    return <ForecastView size={size} city={city} forecast={forecast} />;
  }

  if (!isError && !isOffline) {
    return <WeatherSkeleton isSmall={isSmall} city={city} />;
  }

  return (
    <WeatherError
      city={city}
      isOffline={isOffline}
      isRetrying={fetchStatus === 'fetching'}
      onRetry={() => refetch()}
    />
  );
};
