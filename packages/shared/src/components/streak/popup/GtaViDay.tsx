import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../tooltip/Tooltip';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGtaViFreezeDay } from '../../../lib/featureManagement';
import { dateFormatInTimezone } from '../../../lib/timezones';

export const GTA_VI_RELEASE_DAY = '2026-11-19';

const gtaViTooltipImage =
  'https://media.daily.dev/image/upload/s--WRJeuNmE--/f_auto,q_auto/public/gta-vi-tooltip';

const toDayKey = (date: Date, timezone: string): string =>
  dateFormatInTimezone(date, 'yyyy-MM-dd', timezone);

export const isGtaViReleaseDay = (date: Date, timezone: string): boolean =>
  toDayKey(date, timezone) === GTA_VI_RELEASE_DAY;

export const useIsGtaViDayEnabled = (hasReleaseDay: boolean): boolean => {
  const { value } = useConditionalFeature({
    feature: featureGtaViFreezeDay,
    shouldEvaluate: hasReleaseDay,
  });

  return hasReleaseDay && value;
};

const getGtaViCopy = (
  today: Date,
  timezone: string,
): { title: string; body: string } => {
  const todayKey = toDayKey(today, timezone);

  if (todayKey > GTA_VI_RELEASE_DAY) {
    return {
      title: 'GTA VI is out!',
      body: 'Release day was on us: a free Freeze Day kept your streak safe.',
    };
  }

  return {
    title:
      todayKey === GTA_VI_RELEASE_DAY
        ? 'GTA VI is out!'
        : 'GTA VI drops Nov 19',
    body: "Here's a free Freeze Day so you can dive into Vice City without breaking your streak.",
  };
};

export const getGtaViLabel = (
  date: Date,
  timezone: string,
  isRead = false,
): string =>
  `${dateFormatInTimezone(
    date,
    'EEEE, MMMM d',
    timezone,
  )}: GTA VI release day, free Freeze Day${isRead ? ', read' : ''}`;

export const GtaViTooltip = ({
  timezone,
  appendTo,
  children,
}: {
  timezone: string;
  appendTo?: Element;
  children: ReactNode;
}): ReactElement => {
  const { title, body } = getGtaViCopy(new Date(), timezone);

  return (
    <Tooltip
      side="bottom"
      enableMobileClick
      appendTo={appendTo}
      className="!p-0"
      content={
        <div className="relative flex w-full flex-col gap-1 overflow-hidden rounded-8 p-3 pr-20">
          <img
            src={gtaViTooltipImage}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-4/5 object-cover object-right"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-subtle from-50% to-transparent to-95%"
          />
          <span className="relative flex items-center gap-1.5 font-bold text-text-primary typo-callout">
            <span aria-hidden>🎮</span>
            {title}
          </span>
          <span className="relative font-normal text-text-secondary typo-footnote">
            {body}
          </span>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

const sunsetStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, color-mix(in srgb, var(--theme-accent-onion-default) 55%, var(--theme-accent-cabbage-default)) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 55%, var(--theme-accent-bacon-default)) 32%, var(--theme-accent-bacon-default) 55%, var(--theme-accent-bun-default) 78%, color-mix(in srgb, var(--theme-accent-bun-default) 55%, var(--theme-accent-cheese-default)) 100%)',
};

export const GtaViDisc = ({
  className,
  isToday,
}: {
  className: string;
  isToday?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex items-center justify-center rounded-full font-bold leading-none text-white',
      className,
    )}
    style={sunsetStyle}
  >
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        textLength="60"
        lengthAdjust="spacingAndGlyphs"
        fontSize="64"
        fill="currentColor"
      >
        VI
      </text>
    </svg>
    {isToday && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
      />
    )}
  </span>
);
