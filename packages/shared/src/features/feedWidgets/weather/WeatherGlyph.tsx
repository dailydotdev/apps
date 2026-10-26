import type { ReactElement } from 'react';
import React from 'react';
import type { WeatherCondition } from './forecast';

export const accentColor = (name: string, percent = 100): string =>
  percent === 100
    ? `var(--theme-accent-${name}-default)`
    : `color-mix(in srgb, var(--theme-accent-${name}-default) ${percent}%, transparent)`;

const conditionTone: Record<WeatherCondition, string> = {
  clear: 'cheese',
  partly: 'bun',
  cloudy: 'salt',
  fog: 'salt',
  rain: 'water',
  thunder: 'ketchup',
  snow: 'blueCheese',
};

/** The sky's one accent: warm for sun, cool for rain, violet at night. */
export const weatherTone = (
  condition: WeatherCondition,
  isNight?: boolean,
): string => (isNight ? 'onion' : conditionTone[condition]);

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

const Sun = (): ReactElement => (
  <g stroke={accentColor('cheese')} {...stroke}>
    <circle cx="12" cy="12" r="4" />
    {Array.from({ length: 8 }, (_, ray) => {
      const angle = (ray * Math.PI) / 4;
      return (
        <line
          key={ray}
          x1={12 + Math.cos(angle) * 6.8}
          y1={12 + Math.sin(angle) * 6.8}
          x2={12 + Math.cos(angle) * 8.8}
          y2={12 + Math.sin(angle) * 8.8}
        />
      );
    })}
  </g>
);

const Moon = (): ReactElement => (
  <path
    d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7z"
    stroke={accentColor('onion')}
    {...stroke}
  />
);

const RainingCloud = ({ children }: { children: ReactElement }) => (
  <>
    <g className="text-text-primary">
      <CloudPath y={-3} />
    </g>
    {children}
  </>
);

const GlyphBody = ({
  condition,
  isNight,
}: {
  condition: WeatherCondition;
  isNight?: boolean;
}): ReactElement => {
  const sky = isNight ? <Moon /> : <Sun />;

  switch (condition) {
    case 'partly':
      return (
        <>
          <g transform="translate(-3.5 -4.5) scale(0.75)">{sky}</g>
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
        <RainingCloud>
          <g stroke={accentColor('water')} {...stroke}>
            <line x1="9" y1="18" x2="8" y2="21" />
            <line x1="13" y1="18" x2="12" y2="21" />
            <line x1="17" y1="18" x2="16" y2="21" />
          </g>
        </RainingCloud>
      );
    case 'thunder':
      return (
        <RainingCloud>
          <path
            d="M13 15.5 10.5 19h3l-1.5 3.5"
            stroke={accentColor('cheese')}
            {...stroke}
          />
        </RainingCloud>
      );
    case 'snow':
      return (
        <RainingCloud>
          <g fill={accentColor('blueCheese')}>
            <circle cx="9" cy="19.5" r="1.1" />
            <circle cx="13" cy="21" r="1.1" />
            <circle cx="17" cy="19.5" r="1.1" />
          </g>
        </RainingCloud>
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
      return sky;
  }
};

/** The sky as a line icon at our icon weight, its accents from the theme. */
export const WeatherGlyph = ({
  condition,
  isNight,
  size = 24,
}: {
  condition: WeatherCondition;
  isNight?: boolean;
  size?: number;
}): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className="shrink-0 overflow-visible"
    aria-hidden
  >
    <GlyphBody condition={condition} isNight={isNight} />
  </svg>
);
