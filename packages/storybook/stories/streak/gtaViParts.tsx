import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { HotIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Feature } from '@dailydotdev/shared/src/lib/feature';
import { dateFormatInTimezone } from '@dailydotdev/shared/src/lib/timezones';
import tooltipArt from './assets/gta-vi-tooltip.webp';

/*
 * The GTA VI day's own pieces: copy, tooltip and disc. The design catalog
 * (gtaVi.tsx) and the production overrides (production/) both draw these,
 * so the two can never disagree. Nothing here imports DayStreak or the
 * streak hooks, which the overrides replace.
 */

export const GTA_VI_RELEASE_DAY = '2026-11-19';

/** The flag production would ship behind; off is the control. */
export const gtaViFreezeDayFeature = new Feature('gta_vi_freeze_day', false);

export const isGtaViReleaseDay = (date: Date, timezone: string): boolean =>
  dateFormatInTimezone(date, 'yyyy-MM-dd', timezone) === GTA_VI_RELEASE_DAY;

/** The copy for where today sits against release day. */
export const getGtaViCopy = (
  today: Date,
  timezone: string,
): { title: string; body: string } => {
  const todayKey = dateFormatInTimezone(today, 'yyyy-MM-dd', timezone);
  if (todayKey < GTA_VI_RELEASE_DAY) {
    return {
      title: 'GTA VI drops Nov 19',
      body: "Here's a free Freeze Day so you can dive into Vice City without breaking your streak.",
    };
  }
  if (todayKey === GTA_VI_RELEASE_DAY) {
    return {
      title: 'GTA VI is out!',
      body: "Here's a free Freeze Day so you can dive into Vice City without breaking your streak.",
    };
  }
  return {
    title: 'GTA VI is out!',
    body: 'Release day was on us: a free Freeze Day kept your streak safe.',
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

/** Pins every GTA VI tooltip below it open, for side-by-side review. */
export const GtaViPinOpenContext = createContext(false);

/** Production's Tooltip: hover or focus on laptop, tap on phone and tablet. */
export const GtaViTooltip = ({
  today,
  timezone,
  forceOpen,
  appendTo,
  children,
}: {
  today: Date;
  timezone: string;
  forceOpen?: boolean;
  /** Portal target, for triggers inside a layer above the tooltip's. */
  appendTo?: Element;
  children: ReactNode;
}): ReactElement => {
  const isPinned = useContext(GtaViPinOpenContext) || !!forceOpen;
  const { title, body } = getGtaViCopy(today, timezone);

  return (
    <Tooltip
      side="bottom"
      enableMobileClick
      appendTo={appendTo}
      open={isPinned || undefined}
      avoidCollisions={!isPinned}
      className="!p-0"
      content={
        <div className="relative flex w-full flex-col gap-1 overflow-hidden rounded-8 p-3 pr-20">
          <img
            src={tooltipArt}
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

// Vice City sunset: violet, magenta, pink, orange, gold, from the accent tokens.
const sunsetStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, color-mix(in srgb, var(--theme-accent-onion-default) 55%, var(--theme-accent-cabbage-default)) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 55%, var(--theme-accent-bacon-default)) 32%, var(--theme-accent-bacon-default) 55%, var(--theme-accent-bun-default) 78%, color-mix(in srgb, var(--theme-accent-bun-default) 55%, var(--theme-accent-cheese-default)) 100%)',
};

export const GtaViDisc = ({
  className,
  isToday,
  showReadFlame,
}: {
  className: string;
  isToday?: boolean;
  showReadFlame?: boolean;
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
    {showReadFlame && (
      <span
        aria-hidden
        className="absolute -bottom-1 -right-1 z-2 flex size-3 items-center justify-center rounded-full bg-accent-bacon-default ring-2 ring-background-default"
      >
        <HotIcon
          secondary
          size={IconSize.XXSmall}
          className="!size-2 text-white"
        />
      </span>
    )}
  </span>
);
