import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { WidgetSize } from './catalog';

/*
 * Weather, in Apple's grammar: the sky is the widget. The background is the
 * condition at that hour, the temperature is the hero, and bigger sizes add
 * the next hours, then the next days, never a second topic.
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
/* Skies                                                               */
/* ------------------------------------------------------------------ */

const sky = (condition: Condition, isNight?: boolean): string => {
  if (isNight) {
    return condition === 'clear' || condition === 'partly'
      ? 'linear-gradient(180deg, #0B1530 0%, #1B2A55 100%)'
      : 'linear-gradient(180deg, #1A2030 0%, #2E3648 100%)';
  }
  switch (condition) {
    case 'clear':
      return 'linear-gradient(180deg, #2E7FE0 0%, #63ADF2 100%)';
    case 'partly':
      return 'linear-gradient(180deg, #4A86C8 0%, #86B3DE 100%)';
    case 'cloudy':
      return 'linear-gradient(180deg, #5F7286 0%, #8E9DAE 100%)';
    case 'rain':
      return 'linear-gradient(180deg, #3D4F66 0%, #61738A 100%)';
    case 'thunder':
      return 'linear-gradient(180deg, #232A3A 0%, #464F66 100%)';
    case 'snow':
      return 'linear-gradient(180deg, #7D93AE 0%, #B8C6D6 100%)';
    case 'fog':
      return 'linear-gradient(180deg, #8C949C 0%, #B4BAC0 100%)';
    default:
      return '#3D4F66';
  }
};

/* ------------------------------------------------------------------ */
/* Glyphs: filled, the way the system weather icons are                */
/* ------------------------------------------------------------------ */

const SUN = '#FFD43B';
const CLOUD = '#FFFFFF';
const DROP = '#6EC1FF';

const Cloud = ({
  x = 0,
  y = 0,
  s = 1,
  fill = CLOUD,
}: {
  x?: number;
  y?: number;
  s?: number;
  fill?: string;
}): ReactElement => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M7 18h10.5a4.5 4.5 0 0 0 .4-8.98A6 6 0 0 0 6.3 10.1 4 4 0 0 0 7 18z"
    fill={fill}
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
  const body = (() => {
    const sun = (
      <g>
        <circle cx="12" cy="12" r="4.6" fill={SUN} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 7}
              y1={12 + Math.sin(a) * 7}
              x2={12 + Math.cos(a) * 9.4}
              y2={12 + Math.sin(a) * 9.4}
              stroke={SUN}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    );
    const moon = (
      <path
        d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4A7 7 0 0 1 15.5 3.5z"
        fill="#F4F1DE"
      />
    );
    switch (condition) {
      case 'clear':
        return isNight ? moon : sun;
      case 'partly':
        return (
          <>
            <g transform="translate(-3 -4) scale(0.8)">
              {isNight ? moon : sun}
            </g>
            <Cloud x={2} y={3} s={0.9} />
          </>
        );
      case 'cloudy':
        return (
          <>
            <Cloud x={3} y={-3} s={0.75} fill="#D5DCE4" />
            <Cloud />
          </>
        );
      case 'rain':
        return (
          <>
            <Cloud y={-3} />
            {[8, 12, 16].map((x) => (
              <line
                key={x}
                x1={x}
                y1="17.5"
                x2={x - 1.4}
                y2="21.5"
                stroke={DROP}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ))}
          </>
        );
      case 'thunder':
        return (
          <>
            <Cloud y={-3} fill="#C9CFD8" />
            <path
              d="M12.6 14.5 9.5 19h2.6l-1.2 4.2 4.1-5.6h-2.7l1.4-3.1z"
              fill={SUN}
            />
          </>
        );
      case 'snow':
        return (
          <>
            <Cloud y={-3} />
            {[8, 12, 16].map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={i === 1 ? 21 : 19.5}
                r="1.2"
                fill={CLOUD}
              />
            ))}
          </>
        );
      case 'fog':
        return (
          <>
            <Cloud y={-4} s={0.95} />
            {[16.5, 19.5, 22.5].map((y, i) => (
              <line
                key={y}
                x1={4 + i}
                y1={y}
                x2={20 - i}
                y2={y}
                stroke={CLOUD}
                strokeOpacity={0.85}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}
          </>
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

const LocationArrow = (): ReactElement => (
  <svg viewBox="0 0 24 24" width={12} height={12} aria-hidden>
    <path d="M21 3 3 10.5l7.6 2.9L13.5 21z" fill="currentColor" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const ink = 'text-white';
const soft = 'text-white/[0.72]';

const Current = ({
  scene,
  isCompact,
}: {
  scene: WeatherScene;
  isCompact?: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    <span
      className={classNames(
        'flex items-center gap-1 font-bold typo-callout',
        ink,
      )}
    >
      {scene.city}
      <LocationArrow />
    </span>
    <span
      className={classNames('font-light tabular-nums leading-none', ink)}
      style={{ fontSize: isCompact ? 44 : 56, letterSpacing: '-0.03em' }}
    >
      {scene.temp}°
    </span>
  </div>
);

const ConditionLine = ({ scene }: { scene: WeatherScene }): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <WeatherGlyph
      condition={scene.condition}
      isNight={scene.isNight}
      size={20}
    />
    <span className={classNames('font-bold typo-footnote', ink)}>
      {conditionLabel[scene.condition]}
    </span>
    <span className={classNames('tabular-nums typo-footnote', ink)}>
      H:{scene.high}° L:{scene.low}°
    </span>
  </div>
);

const Hourly = ({
  hours,
  count,
}: {
  hours: Hour[];
  count: number;
}): ReactElement => (
  <div className="flex justify-between">
    {hours.slice(0, count).map((hour) => (
      <div key={hour.at} className="flex flex-col items-center gap-1.5">
        <span className={classNames('typo-caption1', soft)}>{hour.at}</span>
        <WeatherGlyph
          condition={hour.condition}
          isNight={hour.isNight}
          size={20}
        />
        <span
          className={classNames('font-bold tabular-nums typo-footnote', ink)}
        >
          {hour.temp}°
        </span>
      </div>
    ))}
  </div>
);

/** The ten-day range: one bar per day on a shared scale, today's dot on it. */
const Daily = ({
  scene,
  count,
}: {
  scene: WeatherScene;
  count: number;
}): ReactElement => {
  const days = scene.daily.slice(0, count);
  const min = Math.min(...days.map((d) => d.low));
  const max = Math.max(...days.map((d) => d.high));
  const at = (value: number) => ((value - min) / (max - min || 1)) * 100;
  return (
    <ul className="flex flex-col gap-2">
      {days.map((day, index) => (
        <li key={day.day} className="flex items-center gap-2.5 tabular-nums">
          <span className={classNames('w-9 font-bold typo-footnote', ink)}>
            {day.day}
          </span>
          <span className="flex w-9 flex-col items-center">
            <WeatherGlyph condition={day.condition} size={18} />
            {!!day.rain && (
              <span className="font-bold text-[#7CC8FF] typo-caption2">
                {day.rain}%
              </span>
            )}
          </span>
          <span className={classNames('w-7 text-right typo-footnote', soft)}>
            {day.low}°
          </span>
          <span className="relative h-1 flex-1 rounded-max bg-white/[0.2]">
            <span
              className="absolute inset-y-0 rounded-max"
              style={{
                left: `${at(day.low)}%`,
                right: `${100 - at(day.high)}%`,
                background: 'linear-gradient(90deg, #7DD3FC, #FDE047, #FB923C)',
              }}
            />
            {index === 0 && (
              <span
                className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-max bg-white ring-2 ring-black/[0.25]"
                style={{ left: `calc(${at(scene.temp)}% - 3px)` }}
              />
            )}
          </span>
          <span className={classNames('w-7 typo-footnote', ink)}>
            {day.high}°
          </span>
        </li>
      ))}
    </ul>
  );
};

/** The numbers people check next, the way the Weather app's tiles do. */
const Details = ({ scene }: { scene: WeatherScene }): ReactElement => {
  const isF = scene.unit === 'F';
  const tiles: [string, string][] = [
    ['Feels like', `${scene.temp + (isF ? 2 : 1)}°`],
    ['Wind', isF ? '9 mph' : '15 km/h'],
    [
      'Humidity',
      `${scene.condition === 'rain' || scene.condition === 'fog' ? 88 : 54}%`,
    ],
    ['UV index', scene.isNight || scene.condition !== 'clear' ? 'Low' : 'High'],
  ];
  return (
    <div className="grid grid-cols-4 gap-2 rounded-12 bg-black/[0.12] p-3">
      {tiles.map(([label, value]) => (
        <span key={label} className="flex flex-col gap-0.5">
          <span className={classNames('typo-caption2', soft)}>{label}</span>
          <span
            className={classNames('font-bold tabular-nums typo-footnote', ink)}
          >
            {value}
          </span>
        </span>
      ))}
    </div>
  );
};

const NextHour = ({
  nextHour,
}: {
  nextHour: NonNullable<WeatherScene['nextHour']>;
}): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 bg-black/[0.16] p-3">
    <span className={classNames('font-bold typo-footnote', ink)}>
      {nextHour.line}
    </span>
    <div className="flex h-8 items-end gap-0.5">
      {nextHour.intensity.map((value, i) => (
        <span
          // The bars are positional, a minute each.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="flex-1 rounded-t-2 bg-[#7CC8FF]"
          style={{
            height: `${Math.max(4, value * 100)}%`,
            opacity: value ? 1 : 0.3,
          }}
        />
      ))}
    </div>
    <div className={classNames('flex justify-between typo-caption2', soft)}>
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
  <div className="flex items-start gap-2 rounded-12 bg-black/[0.24] p-2.5">
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <path d="M12 3 22 20H2z" fill="#FFD43B" />
      <path
        d="M12 9.5v5M12 17.2v.3"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <span className="flex min-w-0 flex-col">
      <span className={classNames('font-bold typo-footnote', ink)}>
        {alert.title}
      </span>
      <span className={classNames('line-clamp-2 typo-caption1', soft)}>
        {alert.detail}
      </span>
    </span>
  </div>
);

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
  <div
    className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4"
    style={{ background: sky(scene.condition, scene.isNight) } as CSSProperties}
  >
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
        <Current scene={scene} isCompact />
        <div className="mt-auto">
          {scene.alert ? (
            <span className="flex items-center gap-1.5 font-bold text-[#FFD43B] typo-footnote">
              ⚠ {scene.alert.title}
            </span>
          ) : (
            <ConditionLine scene={scene} />
          )}
        </div>
      </Frame>
    );
  }
  if (size === 'm') {
    return (
      <Frame scene={scene}>
        <div className="flex items-start justify-between">
          <Current scene={scene} />
          <div className="mt-1 flex flex-col items-end text-right">
            <WeatherGlyph
              condition={scene.condition}
              isNight={scene.isNight}
              size={28}
            />
            <span className={classNames('mt-1 font-bold typo-footnote', ink)}>
              {conditionLabel[scene.condition]}
            </span>
            <span className={classNames('tabular-nums typo-footnote', ink)}>
              H:{scene.high}° L:{scene.low}°
            </span>
          </div>
        </div>
        <div className="mt-4">
          {scene.alert && <AlertBanner alert={scene.alert} />}
          {!scene.alert && scene.nextHour && (
            <NextHour nextHour={scene.nextHour} />
          )}
          {!scene.alert && !scene.nextHour && (
            <Hourly hours={scene.hourly} count={5} />
          )}
        </div>
        <div className="mt-auto border-t border-white/[0.2] pt-3">
          <Daily scene={scene} count={scene.alert || scene.nextHour ? 4 : 6} />
        </div>
      </Frame>
    );
  }
  return (
    <Frame scene={scene}>
      <div className="flex h-full min-h-0 gap-6">
        <div className="flex w-1/2 shrink-0 flex-col">
          <div className="flex items-start justify-between">
            <Current scene={scene} />
            <div className="mt-1 flex flex-col items-end text-right">
              <WeatherGlyph
                condition={scene.condition}
                isNight={scene.isNight}
                size={28}
              />
              <span className={classNames('mt-1 font-bold typo-footnote', ink)}>
                {conditionLabel[scene.condition]}
              </span>
              <span className={classNames('tabular-nums typo-footnote', ink)}>
                H:{scene.high}° L:{scene.low}°
              </span>
            </div>
          </div>
          <span className={classNames('mt-3 line-clamp-2 typo-footnote', soft)}>
            {scene.summary}
          </span>
          <div className="mt-4 border-t border-white/[0.2] pt-3">
            <Hourly hours={scene.hourly} count={6} />
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
          <span
            className={classNames(
              'mb-3 font-bold uppercase tracking-wide typo-caption2',
              soft,
            )}
          >
            10-day forecast
          </span>
          <Daily scene={scene} count={7} />
        </div>
      </div>
    </Frame>
  );
};

/** No location yet: the one thing to ask, in the sky's own material. */
export const WeatherSetup = ({ size }: { size: WidgetSize }): ReactElement => (
  <Frame scene={{ condition: 'partly' }}>
    <span
      className={classNames(
        'flex items-center gap-1.5 font-bold typo-callout',
        ink,
      )}
    >
      <WeatherGlyph condition="partly" size={22} />
      Weather
    </span>
    <span
      className={classNames(
        'mt-3 font-bold',
        ink,
        size === 's' ? 'typo-callout' : 'typo-title3',
      )}
    >
      See the weather where you code.
    </span>
    {size !== 's' && (
      <span className={classNames('mt-1 typo-footnote', soft)}>
        Use your location once, or pick a city. We never share it.
      </span>
    )}
    <div className="mt-auto flex flex-col gap-2">
      <button
        type="button"
        className="h-8 rounded-max bg-white font-bold text-[#1B2A55] typo-footnote"
      >
        Use my location
      </button>
      {size !== 's' && (
        <button
          type="button"
          className="h-8 rounded-max bg-white/[0.2] font-bold text-white typo-footnote"
        >
          Choose a city
        </button>
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
    <span className="h-4 w-24 animate-pulse rounded-6 bg-white/[0.24]" />
    <span className="mt-2 h-12 w-20 animate-pulse rounded-10 bg-white/[0.24]" />
    {size !== 's' && (
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: size === 'l' ? 6 : 5 }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span
            key={i}
            className="h-3 w-full animate-pulse rounded-6 bg-white/[0.18]"
          />
        ))}
      </div>
    )}
    <span className="mt-auto h-3 w-28 animate-pulse rounded-6 bg-white/[0.2]" />
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
