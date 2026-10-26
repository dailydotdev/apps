import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SunIcon } from '../../../components/icons/Sun';
import { IconSize } from '../../../components/Icon';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import type {
  WeatherCondition,
  WeatherForecast,
  WeatherHour,
} from './forecast';
import { weatherConditionLabel } from './forecast';
import { WeatherGlyph, accentColor, weatherTone } from './WeatherGlyph';

const SHOWN_RAIN_CHANCE = 20;

const glowStyle = (
  condition: WeatherCondition,
  isNight?: boolean,
): CSSProperties => {
  let second = 'water';
  if (isNight) {
    second = 'cabbage';
  } else if (condition === 'thunder') {
    second = 'cheese';
  }

  return {
    backgroundImage: `radial-gradient(90% 70% at 100% 0%, ${accentColor(
      weatherTone(condition, isNight),
      30,
    )} 0%, transparent 70%), radial-gradient(70% 60% at 0% 100%, ${accentColor(
      second,
      12,
    )} 0%, transparent 70%)`,
  };
};

/** The widget's material: the sky's condition as a glow in its accent. */
export const WeatherFrame = ({
  condition,
  isNight,
  children,
}: {
  condition: WeatherCondition;
  isNight?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col">
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-4 -z-1"
      style={glowStyle(condition, isNight)}
    />
    {children}
  </div>
);

export const WeatherHeader = ({ city }: { city?: string }): ReactElement => (
  <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
    <SunIcon
      secondary
      size={IconSize.Size16}
      className="shrink-0 text-accent-cheese-default"
    />
    <span className="shrink-0 font-bold text-text-primary typo-caption1">
      Weather
    </span>
    {!!city && (
      <span className="truncate text-text-tertiary typo-caption1">{city}</span>
    )}
  </header>
);

export const WeatherNow = ({
  forecast,
  isCompact,
}: {
  forecast: WeatherForecast;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <WeatherGlyph
      condition={forecast.condition}
      isNight={forecast.isNight}
      size={isCompact ? 36 : 44}
    />
    <div className="flex min-w-0 flex-col">
      <span
        className={classNames(
          'font-bold tabular-nums leading-none text-text-primary',
          isCompact ? 'typo-mega3' : 'typo-mega2',
        )}
      >
        {forecast.temp}°
      </span>
      <span className="mt-1 truncate text-text-tertiary typo-footnote">
        {weatherConditionLabel[forecast.condition]} · H {forecast.high}° L{' '}
        {forecast.low}°
      </span>
    </div>
  </div>
);

/** The next few hours as columns, for Small: time, sky, temperature. */
export const WeatherHourStrip = ({
  hours,
}: {
  hours: WeatherHour[];
}): ReactElement => (
  <ul aria-label="Next hours" className="flex justify-between">
    {hours.map((hour) => (
      <li key={hour.label} className="flex w-8 flex-col items-center gap-1">
        <span className="text-text-tertiary typo-caption2">{hour.label}</span>
        <WeatherGlyph
          condition={hour.condition}
          isNight={hour.isNight}
          size={16}
        />
        <span className="font-bold tabular-nums text-text-primary typo-footnote">
          {hour.temp}°
        </span>
      </li>
    ))}
  </ul>
);

/** The next hours as a line, like a ticker: the shape of the day at a glance. */
export const WeatherHourChart = ({
  forecast,
  hours,
}: {
  forecast: WeatherForecast;
  hours: WeatherHour[];
}): ReactElement => {
  const temps = hours.map(({ temp }) => temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const y = (temp: number) => 26 - ((temp - min) / (max - min || 1)) * 20;
  const x = (index: number) => (index / Math.max(1, hours.length - 1)) * 100;
  const line = hours
    .map(({ temp }, index) => `${index ? 'L' : 'M'}${x(index)},${y(temp)}`)
    .join(' ');
  const color = accentColor(weatherTone(forecast.condition, forecast.isNight));

  return (
    <div className="flex flex-col gap-1.5" aria-label="Next hours" role="group">
      <div className="flex justify-between">
        {hours.map((hour) => (
          <span
            key={hour.label}
            className="w-8 text-center font-bold tabular-nums text-text-primary typo-footnote"
          >
            {hour.temp}°
          </span>
        ))}
      </div>
      <div className="h-8 px-4">
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          aria-hidden
        >
          <path d={`${line} L100,30 L0,30 Z`} fill={color} opacity={0.14} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex justify-between">
        {hours.map((hour) => (
          <span
            key={hour.label}
            className="flex w-8 flex-col items-center gap-1"
          >
            <WeatherGlyph
              condition={hour.condition}
              isNight={hour.isNight}
              size={18}
            />
            <span className="text-text-tertiary typo-caption2">
              {hour.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

/** Days on one shared scale in the sky's accent, now marked on today. */
export const WeatherDays = ({
  forecast,
  count,
}: {
  forecast: WeatherForecast;
  count: number;
}): ReactElement => {
  const days = forecast.days.slice(0, count);
  const min = Math.min(...days.map(({ low }) => low));
  const max = Math.max(...days.map(({ high }) => high));
  const at = (value: number) =>
    Math.min(100, Math.max(0, ((value - min) / (max - min || 1)) * 100));
  const color = accentColor(weatherTone(forecast.condition, forecast.isNight));

  return (
    <ul aria-label="Next days" className="flex flex-col gap-1">
      {days.map((day, index) => (
        <li
          key={day.label}
          className="-mx-2 flex items-center gap-2.5 rounded-10 px-2 py-1 tabular-nums"
        >
          <span className="w-10 font-bold text-text-primary typo-footnote">
            {day.label}
          </span>
          <WeatherGlyph condition={day.condition} size={18} />
          <span className="w-8 text-right text-accent-water-default typo-caption1">
            {day.rain >= SHOWN_RAIN_CHANCE ? `${day.rain}%` : ''}
          </span>
          <span className="w-7 text-right text-text-tertiary typo-footnote">
            {day.low}°
          </span>
          <span className="relative h-1.5 flex-1 rounded-max bg-surface-float">
            <span
              className="absolute inset-y-0 rounded-max"
              style={{
                left: `${at(day.low)}%`,
                right: `${100 - at(day.high)}%`,
                background: color,
              }}
            />
            {index === 0 && (
              <span
                className="absolute top-1/2 size-2 -translate-y-1/2 rounded-max border-2 border-background-subtle bg-text-primary"
                style={{ left: `calc(${at(forecast.temp)}% - 0.25rem)` }}
              />
            )}
          </span>
          <span className="w-7 font-bold text-text-primary typo-footnote">
            {day.high}°
          </span>
        </li>
      ))}
    </ul>
  );
};

const nextHourMarks = ['Now', '15m', '30m', '45m'];

/** Rain within the hour, a bar for each quarter. */
export const WeatherNextHour = ({
  nextHour,
}: {
  nextHour: NonNullable<WeatherForecast['nextHour']>;
}): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
    <span className="font-bold text-accent-water-default typo-footnote">
      {nextHour.line}
    </span>
    <div className="flex h-7 items-end gap-0.5" aria-hidden>
      {nextHour.intensity.map((value, index) => (
        <span
          // The bars are positional, a quarter hour each.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex-1 rounded-t-2"
          style={{
            height: `${Math.max(8, value * 100)}%`,
            background: value ? accentColor('water') : accentColor('salt', 20),
          }}
        />
      ))}
    </div>
    <div className="flex justify-between text-text-quaternary typo-caption2">
      {nextHourMarks.map((mark) => (
        <span key={mark}>{mark}</span>
      ))}
    </div>
  </div>
);

export const WeatherDetails = ({
  forecast,
}: {
  forecast: WeatherForecast;
}): ReactElement => {
  const tiles: [string, string][] = [
    ['Feels like', `${forecast.feelsLike}°`],
    ['Wind', forecast.wind],
    ['Humidity', `${forecast.humidity}%`],
    ['UV', forecast.uv],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
      {tiles.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col border-t border-border-subtlest-tertiary pt-1.5"
        >
          <dt className="text-text-tertiary typo-caption1">{label}</dt>
          <dd className="whitespace-nowrap font-bold tabular-nums text-text-primary typo-callout">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

/** Loading: the layout holds, so nothing jumps when the forecast lands. */
export const WeatherSkeleton = ({
  isSmall,
  city,
}: {
  isSmall: boolean;
  city?: string;
}): ReactElement => (
  <WeatherFrame condition="cloudy">
    <WeatherHeader city={city} />
    <div className="mt-4 flex items-center gap-3 px-4" aria-busy>
      <ElementPlaceholder className="size-11 rounded-max" />
      <span className="flex flex-col gap-2">
        <ElementPlaceholder className="h-9 w-20 rounded-10" />
        <ElementPlaceholder className="h-3 w-32 rounded-6" />
      </span>
    </div>
    {!isSmall && (
      <div className="mt-6 flex flex-col gap-3 px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <ElementPlaceholder
            // A fixed number of placeholder rows; their order never changes.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-3 w-full rounded-6"
          />
        ))}
      </div>
    )}
  </WeatherFrame>
);
