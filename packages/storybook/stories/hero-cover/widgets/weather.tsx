import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { WidgetSize } from './catalog';
import { WidgetLabel } from './production';

/*
 * Weather, in daily.dev's language: our surface, our type, our line icons,
 * with the condition as a glow in one of our accents. The temperature is the
 * hero, and bigger sizes add the next hours, then the next days.
 *
 * Data: no backend work. The location comes from the browser (one permission
 * prompt) or the reader's city in settings, and the forecast from a keyless
 * public API (Open-Meteo), cached for 15 minutes.
 */

export type Condition =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'rain'
  | 'thunder'
  | 'snow'
  | 'fog';

type Hour = {
  at: string;
  condition: Condition;
  temp: number;
  isNight?: boolean;
};
type Day = {
  day: string;
  condition: Condition;
  low: number;
  high: number;
  rain?: number;
};

export type WeatherScene = {
  id: string;
  label: string;
  city: string;
  temp: number;
  condition: Condition;
  isNight?: boolean;
  high: number;
  low: number;
  unit: 'C' | 'F';
  summary: string;
  hourly: Hour[];
  daily: Day[];
  /** Minute-by-minute rain: 0–1 intensity for the next hour. */
  nextHour?: { line: string; intensity: number[] };
  alert?: { title: string; detail: string };
};

/* ------------------------------------------------------------------ */
/* Look: daily.dev, not Apple                                          */
/* ------------------------------------------------------------------ */

/*
 * The widget sits on our surface like every other widget. The condition
 * shows as a glow in one of our accents, the glyphs are line icons at our
 * icon weight, the type is our scale, and the hours read as a chart, the
 * way the trending widget reads a tag.
 */

const accent = (name: string, percent = 100): string =>
  percent === 100
    ? `var(--theme-accent-${name}-default)`
    : `color-mix(in srgb, var(--theme-accent-${name}-default) ${percent}%, transparent)`;

/** Each condition's accent: warm for sun, cool for rain, violet at night. */
const tone = (condition: Condition, isNight?: boolean): string => {
  if (isNight) {
    return 'onion';
  }
  switch (condition) {
    case 'clear':
      return 'cheese';
    case 'partly':
      return 'bun';
    case 'cloudy':
      return 'salt';
    case 'rain':
      return 'water';
    case 'thunder':
      return 'ketchup';
    case 'snow':
      return 'blueCheese';
    case 'fog':
      return 'salt';
    default:
      return 'water';
  }
};

const glow = (condition: Condition, isNight?: boolean): string => {
  const main = tone(condition, isNight);
  const second = isNight
    ? 'cabbage'
    : condition === 'thunder'
    ? 'cheese'
    : 'water';
  return `radial-gradient(90% 70% at 100% 0%, ${accent(
    main,
    30,
  )} 0%, transparent 70%), radial-gradient(70% 60% at 0% 100%, ${accent(
    second,
    12,
  )} 0%, transparent 70%)`;
};

/* ------------------------------------------------------------------ */
/* Glyphs: line icons at our weight                                    */
/* ------------------------------------------------------------------ */

const stroke = {
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CloudPath = ({ y = 0 }: { y?: number }): ReactElement => (
  <path
    transform={`translate(0 ${y})`}
    d="M7.5 18h9.25a3.75 3.75 0 0 0 .6-7.45A5.5 5.5 0 0 0 6.9 11.2 3.4 3.4 0 0 0 7.5 18z"
    stroke="currentColor"
    {...stroke}
  />
);

export const WeatherGlyph = ({
  condition,
  isNight,
  size = 24,
}: {
  condition: Condition;
  isNight?: boolean;
  size?: number;
}): ReactElement => {
  const sun = (
    <g stroke={accent('cheese')} {...stroke}>
      <circle cx="12" cy="12" r="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={12 + Math.cos(a) * 6.8}
            y1={12 + Math.sin(a) * 6.8}
            x2={12 + Math.cos(a) * 8.8}
            y2={12 + Math.sin(a) * 8.8}
          />
        );
      })}
    </g>
  );
  const moon = (
    <path
      d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7z"
      stroke={accent('onion')}
      {...stroke}
    />
  );
  const body = (() => {
    switch (condition) {
      case 'clear':
        return isNight ? moon : sun;
      case 'partly':
        return (
          <>
            <g transform="translate(-3.5 -4.5) scale(0.75)">
              {isNight ? moon : sun}
            </g>
            <g
              className="text-text-primary"
              transform="translate(1.5 2) scale(0.9)"
            >
              <CloudPath />
            </g>
          </>
        );
      case 'cloudy':
        return (
          <g className="text-text-primary">
            <CloudPath />
          </g>
        );
      case 'rain':
        return (
          <>
            <g className="text-text-primary">
              <CloudPath y={-3} />
            </g>
            <g stroke={accent('water')} {...stroke}>
              <line x1="9" y1="18" x2="8" y2="21" />
              <line x1="13" y1="18" x2="12" y2="21" />
              <line x1="17" y1="18" x2="16" y2="21" />
            </g>
          </>
        );
      case 'thunder':
        return (
          <>
            <g className="text-text-primary">
              <CloudPath y={-3} />
            </g>
            <path
              d="M13 15.5 10.5 19h3l-1.5 3.5"
              stroke={accent('cheese')}
              {...stroke}
            />
          </>
        );
      case 'snow':
        return (
          <>
            <g className="text-text-primary">
              <CloudPath y={-3} />
            </g>
            <g fill={accent('blueCheese')}>
              <circle cx="9" cy="19.5" r="1.1" />
              <circle cx="13" cy="21" r="1.1" />
              <circle cx="17" cy="19.5" r="1.1" />
            </g>
          </>
        );
      case 'fog':
        return (
          <g className="text-text-tertiary" stroke="currentColor" {...stroke}>
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="6" y1="13" x2="18" y2="13" />
            <line x1="4" y1="17" x2="16" y2="17" />
          </g>
        );
      default:
        return sun;
    }
  })();
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      {body}
    </svg>
  );
};

const conditionLabel: Record<Condition, string> = {
  clear: 'Clear',
  partly: 'Partly cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain',
  thunder: 'Thunderstorms',
  snow: 'Snow',
  fog: 'Fog',
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const Header = ({
  scene,
  link,
}: {
  scene: WeatherScene;
  link?: string;
}): ReactElement => (
  <WidgetLabel
    kind="weather"
    afterName={
      <span className="truncate text-text-tertiary typo-caption1">
        {scene.city}
      </span>
    }
    link={link}
  >
    Weather
  </WidgetLabel>
);

const Now = ({
  scene,
  isCompact,
}: {
  scene: WeatherScene;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <WeatherGlyph
      condition={scene.condition}
      isNight={scene.isNight}
      size={isCompact ? 36 : 44}
    />
    <div className="flex min-w-0 flex-col">
      <span
        className={classNames(
          'font-bold tabular-nums leading-none text-text-primary',
          isCompact ? 'typo-mega3' : 'typo-mega2',
        )}
      >
        {scene.temp}°
      </span>
      <span className="mt-1 truncate text-text-tertiary typo-footnote">
        {conditionLabel[scene.condition]} · H {scene.high}° L {scene.low}°
      </span>
    </div>
  </div>
);

/** The next hours as a line, like a ticker: the shape of the day at a glance. */
const HourChart = ({
  scene,
  count,
}: {
  scene: WeatherScene;
  count: number;
}): ReactElement => {
  const hours = scene.hourly.slice(0, count);
  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const y = (t: number) => 26 - ((t - min) / (max - min || 1)) * 20;
  const x = (i: number) => (i / (hours.length - 1)) * 100;
  const line = hours
    .map((h, i) => `${i ? 'L' : 'M'}${x(i)},${y(h.temp)}`)
    .join(' ');
  const color = accent(tone(scene.condition, scene.isNight));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        {hours.map((h) => (
          <span
            key={h.at}
            className="w-8 text-center font-bold tabular-nums text-text-primary typo-footnote"
          >
            {h.temp}°
          </span>
        ))}
      </div>
      <div className="relative -mx-0 h-8 px-4">
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
        {hours.map((h) => (
          <span key={h.at} className="flex w-8 flex-col items-center gap-1">
            <WeatherGlyph
              condition={h.condition}
              isNight={h.isNight}
              size={18}
            />
            <span className="text-text-tertiary typo-caption2">{h.at}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/** The next few hours as columns, for Small: time, sky, temperature. */
const HourStrip = ({
  scene,
  count,
}: {
  scene: WeatherScene;
  count: number;
}): ReactElement => (
  <div className="flex justify-between">
    {scene.hourly.slice(0, count).map((h) => (
      <span key={h.at} className="flex w-8 flex-col items-center gap-1">
        <span className="text-text-tertiary typo-caption2">{h.at}</span>
        <WeatherGlyph condition={h.condition} isNight={h.isNight} size={16} />
        <span className="font-bold tabular-nums text-text-primary typo-footnote">
          {h.temp}°
        </span>
      </span>
    ))}
  </div>
);

/** Days on one shared scale, in our accent gradient, today marked. */
const Days = ({
  scene,
  count,
}: {
  scene: WeatherScene;
  count: number;
}): ReactElement => {
  const days = scene.daily.slice(0, count);
  const min = Math.min(...days.map((d) => d.low));
  const max = Math.max(...days.map((d) => d.high));
  const at = (v: number) => ((v - min) / (max - min || 1)) * 100;
  return (
    <ul className="flex flex-col gap-1">
      {days.map((day, index) => (
        <li
          key={day.day}
          className="-mx-2 flex items-center gap-2.5 rounded-10 px-2 py-1 tabular-nums transition-colors hover:bg-surface-hover"
        >
          <span className="w-10 font-bold text-text-primary typo-footnote">
            {day.day}
          </span>
          <WeatherGlyph condition={day.condition} size={18} />
          <span className="w-8 text-right text-accent-water-default typo-caption1">
            {day.rain ? `${day.rain}%` : ''}
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
                background: accent(tone(scene.condition, scene.isNight)),
              }}
            />
            {index === 0 && (
              <span
                className="absolute top-1/2 size-2 -translate-y-1/2 rounded-max border-2 border-background-subtle bg-text-primary"
                style={{ left: `calc(${at(scene.temp)}% - 4px)` }}
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

const NextHour = ({
  nextHour,
}: {
  nextHour: NonNullable<WeatherScene['nextHour']>;
}): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
    <span className="font-bold text-accent-water-default typo-footnote">
      {nextHour.line}
    </span>
    <div className="flex h-7 items-end gap-0.5">
      {nextHour.intensity.map((value, i) => (
        <span
          // The bars are positional, a minute each.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="flex-1 rounded-t-2"
          style={{
            height: `${Math.max(8, value * 100)}%`,
            background: value ? accent('water') : accent('salt', 20),
          }}
        />
      ))}
    </div>
    <div className="flex justify-between text-text-quaternary typo-caption2">
      <span>Now</span>
      <span>15m</span>
      <span>30m</span>
      <span>45m</span>
    </div>
  </div>
);

const AlertBanner = ({
  alert,
}: {
  alert: NonNullable<WeatherScene['alert']>;
}): ReactElement => (
  <div className="flex items-start gap-2 rounded-12 bg-accent-ketchup-flat p-3">
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <path d="M12 4 21 19.5H3z" stroke={accent('ketchup')} {...stroke} />
      <path d="M12 10v4.5M12 17v.2" stroke={accent('ketchup')} {...stroke} />
    </svg>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold text-accent-ketchup-default typo-footnote">
        {alert.title}
      </span>
      <span className="line-clamp-2 text-text-secondary typo-caption1">
        {alert.detail}
      </span>
    </span>
  </div>
);

const Details = ({ scene }: { scene: WeatherScene }): ReactElement => {
  const isF = scene.unit === 'F';
  const tiles: [string, string][] = [
    ['Feels like', `${scene.temp + (isF ? 2 : 1)}°`],
    ['Wind', isF ? '9 mph' : '15 km/h'],
    [
      'Humidity',
      `${scene.condition === 'rain' || scene.condition === 'fog' ? 88 : 54}%`,
    ],
    ['UV', scene.isNight || scene.condition !== 'clear' ? 'Low' : 'High'],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {tiles.map(([label, value]) => (
        <span
          key={label}
          className="flex flex-col gap-0.5 border-t border-border-subtlest-tertiary pt-2"
        >
          <span className="text-text-tertiary typo-caption1">{label}</span>
          <span className="whitespace-nowrap font-bold tabular-nums text-text-primary typo-callout">
            {value}
          </span>
        </span>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The widget                                                          */
/* ------------------------------------------------------------------ */

const Frame = ({
  scene,
  children,
}: {
  scene: Pick<WeatherScene, 'condition' | 'isNight'>;
  children: React.ReactNode;
}): ReactElement => (
  <div className="relative isolate flex h-full min-h-0 flex-col">
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-4 -z-1"
      style={
        {
          backgroundImage: glow(scene.condition, scene.isNight),
        } as CSSProperties
      }
    />
    {children}
  </div>
);

export const WeatherWidget = ({
  size,
  scene,
}: {
  size: WidgetSize;
  scene: WeatherScene;
}): ReactElement => {
  if (size === 's') {
    return (
      <Frame scene={scene}>
        <Header scene={scene} />
        <div className="mt-3">
          <Now scene={scene} isCompact />
        </div>
        <div className="mt-auto">
          {scene.alert && (
            <span className="block truncate font-bold text-accent-ketchup-default typo-footnote">
              {scene.alert.title}
            </span>
          )}
          {!scene.alert && scene.nextHour && (
            <span className="block truncate font-bold text-accent-water-default typo-footnote">
              {scene.nextHour.line}
            </span>
          )}
          {!scene.alert && !scene.nextHour && (
            <HourStrip scene={scene} count={4} />
          )}
        </div>
      </Frame>
    );
  }
  if (size === 'm') {
    return (
      <Frame scene={scene}>
        <Header scene={scene} link="10-day" />
        <div className="mt-4">
          <Now scene={scene} />
        </div>
        <div className="mt-4">
          {scene.alert && <AlertBanner alert={scene.alert} />}
          {!scene.alert && scene.nextHour && (
            <NextHour nextHour={scene.nextHour} />
          )}
          {!scene.alert && !scene.nextHour && (
            <HourChart scene={scene} count={5} />
          )}
        </div>
        <div className="mt-auto pt-3">
          <Days scene={scene} count={scene.alert || scene.nextHour ? 4 : 5} />
        </div>
      </Frame>
    );
  }
  return (
    <Frame scene={scene}>
      <Header scene={scene} link="10-day" />
      <div className="mt-4 flex min-h-0 flex-1 gap-6">
        <div className="flex w-1/2 shrink-0 flex-col">
          <Now scene={scene} />
          <span className="mt-3 line-clamp-2 text-text-secondary typo-footnote">
            {scene.summary}
          </span>
          <div className="mt-4">
            <HourChart scene={scene} count={6} />
          </div>
          <div className="mt-auto">
            {scene.alert && <AlertBanner alert={scene.alert} />}
            {!scene.alert && scene.nextHour && (
              <NextHour nextHour={scene.nextHour} />
            )}
            {!scene.alert && !scene.nextHour && <Details scene={scene} />}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Days scene={scene} count={7} />
        </div>
      </div>
    </Frame>
  );
};

/** No location yet: one clear ask, in the widget's own material. */
export const WeatherSetup = ({ size }: { size: WidgetSize }): ReactElement => (
  <Frame scene={{ condition: 'partly' }}>
    <WidgetLabel kind="weather" />
    <div className="mt-4 flex items-center gap-3">
      <WeatherGlyph condition="partly" size={size === 's' ? 32 : 40} />
      <span
        className={classNames(
          'min-w-0 flex-1 font-bold text-text-primary',
          size === 's' ? 'typo-callout' : 'typo-title3',
        )}
      >
        The weather where you code.
      </span>
    </div>
    {size !== 's' && (
      <span className="mt-2 text-text-tertiary typo-footnote">
        Use your location once, or pick a city. It stays on this device.
      </span>
    )}
    <div className="mt-auto flex gap-2">
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        Use my location
      </Button>
      {size !== 's' && (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Choose a city
        </Button>
      )}
    </div>
  </Frame>
);

/** Loading: the layout holds, so nothing jumps when the forecast lands. */
export const WeatherLoading = ({
  size,
}: {
  size: WidgetSize;
}): ReactElement => (
  <Frame scene={{ condition: 'cloudy' }}>
    <WidgetLabel kind="weather" />
    <div className="mt-4 flex items-center gap-3">
      <span className="size-11 animate-pulse rounded-max bg-surface-float" />
      <span className="flex flex-col gap-2">
        <span className="h-9 w-20 animate-pulse rounded-10 bg-surface-float" />
        <span className="h-3 w-32 animate-pulse rounded-6 bg-surface-float" />
      </span>
    </div>
    {size !== 's' && (
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span
            key={i}
            className="h-3 w-full animate-pulse rounded-6 bg-surface-float"
          />
        ))}
      </div>
    )}
  </Frame>
);

/* ------------------------------------------------------------------ */
/* Scenes: every case the widget has to carry                          */
/* ------------------------------------------------------------------ */

const week = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const days = (rows: [Condition, number, number, number?][]): Day[] =>
  rows.map(([condition, low, high, rain], i) => ({
    day: week[i],
    condition,
    low,
    high,
    rain,
  }));

const hours = (
  start: number,
  rows: [Condition, number][],
  nightFrom = 19,
): Hour[] =>
  rows.map(([condition, temp], i) => {
    const h = (start + i) % 24;
    return {
      at: i === 0 ? 'Now' : `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}`,
      condition,
      temp,
      isNight: h >= nightFrom || h < 6,
    };
  });

export const weatherScenes: WeatherScene[] = [
  {
    id: 'clear',
    label: 'Clear, daytime',
    city: 'Tel Aviv',
    temp: 27,
    condition: 'clear',
    high: 29,
    low: 21,
    unit: 'C',
    summary: 'Sunny all afternoon. Wind up to 15 km/h from the sea.',
    hourly: hours(13, [
      ['clear', 27],
      ['clear', 28],
      ['clear', 28],
      ['partly', 27],
      ['partly', 25],
      ['clear', 24],
    ]),
    daily: days([
      ['clear', 21, 29],
      ['clear', 22, 30],
      ['partly', 21, 28],
      ['cloudy', 20, 26, 20],
      ['rain', 18, 23, 70],
      ['partly', 19, 25],
      ['clear', 20, 27],
    ]),
  },
  {
    id: 'night',
    label: 'Clear, night',
    city: 'Tel Aviv',
    temp: 19,
    condition: 'clear',
    isNight: true,
    high: 29,
    low: 18,
    unit: 'C',
    summary: 'Clear tonight. Low of 18°.',
    hourly: hours(22, [
      ['clear', 19],
      ['clear', 19],
      ['clear', 18],
      ['clear', 18],
      ['clear', 18],
      ['clear', 18],
    ]),
    daily: days([
      ['clear', 18, 29],
      ['clear', 22, 30],
      ['partly', 21, 28],
      ['cloudy', 20, 26, 20],
      ['rain', 18, 23, 70],
      ['partly', 19, 25],
      ['clear', 20, 27],
    ]),
  },
  {
    id: 'partly',
    label: 'Partly cloudy',
    city: 'London',
    temp: 14,
    condition: 'partly',
    high: 16,
    low: 9,
    unit: 'C',
    summary: 'Clouds come and go. Dry until Thursday.',
    hourly: hours(10, [
      ['partly', 14],
      ['partly', 15],
      ['cloudy', 15],
      ['cloudy', 16],
      ['partly', 15],
      ['partly', 14],
    ]),
    daily: days([
      ['partly', 9, 16],
      ['cloudy', 10, 15],
      ['cloudy', 11, 15],
      ['rain', 10, 13, 80],
      ['rain', 9, 12, 60],
      ['partly', 8, 14],
      ['clear', 7, 15],
    ]),
  },
  {
    id: 'rain',
    label: 'Rain, next hour',
    city: 'Seattle',
    temp: 11,
    condition: 'rain',
    high: 13,
    low: 8,
    unit: 'C',
    summary: 'Light rain stopping around 10:40, then cloudy.',
    nextHour: {
      line: 'Rain stopping in 20 min',
      intensity: [
        0.8, 0.85, 0.7, 0.75, 0.6, 0.5, 0.45, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    hourly: hours(10, [
      ['rain', 11],
      ['cloudy', 12],
      ['cloudy', 12],
      ['partly', 13],
      ['partly', 12],
      ['cloudy', 11],
    ]),
    daily: days([
      ['rain', 8, 13, 90],
      ['rain', 7, 12, 80],
      ['cloudy', 8, 13],
      ['partly', 7, 14],
      ['rain', 8, 12, 60],
      ['rain', 7, 11, 70],
      ['cloudy', 6, 12],
    ]),
  },
  {
    id: 'thunder',
    label: 'Severe weather alert',
    city: 'Miami',
    temp: 29,
    condition: 'thunder',
    high: 31,
    low: 25,
    unit: 'C',
    summary: 'Storms through the evening, easing after midnight.',
    alert: {
      title: 'Severe thunderstorm warning',
      detail:
        'Until 9:00 PM. Gusts up to 90 km/h and heavy rain. National Weather Service.',
    },
    hourly: hours(16, [
      ['thunder', 29],
      ['thunder', 28],
      ['rain', 27],
      ['rain', 26],
      ['cloudy', 26],
      ['cloudy', 25],
    ]),
    daily: days([
      ['thunder', 25, 31, 90],
      ['rain', 25, 30, 70],
      ['partly', 24, 31],
      ['clear', 24, 32],
      ['partly', 25, 32],
      ['thunder', 25, 31, 60],
      ['partly', 24, 31],
    ]),
  },
  {
    id: 'snow',
    label: 'Snow',
    city: 'Oslo',
    temp: -3,
    condition: 'snow',
    high: -1,
    low: -7,
    unit: 'C',
    summary: 'Snow showers until noon, 5–8 cm.',
    hourly: hours(8, [
      ['snow', -3],
      ['snow', -3],
      ['snow', -2],
      ['cloudy', -1],
      ['cloudy', -2],
      ['cloudy', -4],
    ]),
    daily: days([
      ['snow', -7, -1, 80],
      ['cloudy', -8, -2],
      ['clear', -10, -3],
      ['clear', -9, -2],
      ['snow', -6, 0, 60],
      ['snow', -5, 1, 70],
      ['cloudy', -6, -1],
    ]),
  },
  {
    id: 'fog',
    label: 'Fog',
    city: 'San Francisco',
    temp: 13,
    condition: 'fog',
    high: 17,
    low: 11,
    unit: 'C',
    summary: 'Fog until late morning, then sun.',
    hourly: hours(8, [
      ['fog', 13],
      ['fog', 13],
      ['partly', 14],
      ['clear', 16],
      ['clear', 17],
      ['clear', 17],
    ]),
    daily: days([
      ['fog', 11, 17],
      ['partly', 11, 18],
      ['clear', 12, 20],
      ['clear', 12, 21],
      ['fog', 11, 17],
      ['partly', 11, 18],
      ['clear', 12, 19],
    ]),
  },
  {
    id: 'fahrenheit',
    label: 'Fahrenheit',
    city: 'New York',
    temp: 64,
    condition: 'partly',
    high: 68,
    low: 55,
    unit: 'F',
    summary: 'Mild and breezy. Rain likely Friday.',
    hourly: hours(14, [
      ['partly', 64],
      ['partly', 65],
      ['cloudy', 65],
      ['cloudy', 63],
      ['partly', 61],
      ['clear', 59],
    ]),
    daily: days([
      ['partly', 55, 68],
      ['clear', 54, 70],
      ['clear', 57, 72],
      ['cloudy', 58, 69],
      ['rain', 56, 63, 80],
      ['partly', 52, 64],
      ['clear', 50, 66],
    ]),
  },
];

export const defaultWeather = weatherScenes[0];
