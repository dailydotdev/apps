import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  milestoneForStreak,
  streakTierArt,
  streakWeekDays,
} from './streakTiers';

// The celebration half of the moment, per the milestone-rewards design
// exploration: everything here belongs to daily.dev, no partner paint.
// Gradients and glows are the design's own values; they intentionally bypass
// theme tokens the same way brand paint does (see EngagementAdCta).

const panelBackground =
  'radial-gradient(120% 100% at 20% 0%, rgba(236,82,122,0.38) 0%, rgba(236,82,122,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(160deg, rgba(177,75,215,0.18) 0%, rgba(15,18,24,0) 60%)';

const badgeGlow =
  'radial-gradient(circle, rgba(236,82,122,0.55) 0%, rgba(177,75,215,0.25) 45%, transparent 70%)';

export const FlameBadge = ({
  tier,
  label,
  className,
}: {
  tier: string;
  label: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex items-center justify-center',
      className,
    )}
  >
    <span
      aria-hidden
      className="opacity-70 absolute inset-0 rounded-full blur-2xl"
      style={{ background: badgeGlow }}
    />
    <img
      src={streakTierArt(tier)}
      alt={`${label} streak badge`}
      className="relative h-full w-full object-contain"
      style={{ filter: 'drop-shadow(0 8px 34px rgba(236, 82, 122, 0.5))' }}
    />
  </div>
);

const TierName = ({ label }: { label: string }): ReactElement => (
  <span className="w-fit rounded-8 bg-accent-bacon-default px-2 py-1 font-bold uppercase tracking-[0.16em] text-white typo-caption1">
    {label}
  </span>
);

const DayStrip = ({ className }: { className?: string }): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    {streakWeekDays.map((label, index) => (
      <span
        key={`${label}-${streakWeekDays.length - index}`}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-bacon-default text-text-primary typo-caption2"
        style={{ background: 'rgba(255, 131, 61, 0.18)' }}
      >
        {label}
      </span>
    ))}
  </div>
);

/** The split popup's left panel: flame, tier, count, headline, week strip. */
export const StreakOfferCelebration = ({
  currentStreak,
  className,
}: {
  currentStreak: number;
  className?: string;
}): ReactElement => {
  const milestone = milestoneForStreak(currentStreak);

  return (
    <div
      className={classNames(
        'relative flex flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center',
        className,
      )}
      style={{ background: panelBackground }}
    >
      <FlameBadge
        tier={milestone.tier}
        label={milestone.label}
        className="h-40 w-40"
      />
      <TierName label={milestone.label} />
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-bold tabular-nums typo-tera">
            {currentStreak}
          </span>
          <span className="text-text-tertiary typo-title3">day streak</span>
        </div>
        <h2 className="typo-title3">{milestone.headline}</h2>
      </div>
      <DayStrip />
    </div>
  );
};

/** The carousel's compact header: small flame and the count on one line. */
export const StreakOfferCelebrationCompact = ({
  currentStreak,
  children,
  className,
}: {
  currentStreak: number;
  children?: ReactNode;
  className?: string;
}): ReactElement => {
  const milestone = milestoneForStreak(currentStreak);

  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-2 px-6 pb-4 pt-6',
        className,
      )}
      style={{ background: panelBackground }}
    >
      <div className="flex items-center justify-center gap-3">
        <FlameBadge
          tier={milestone.tier}
          label={milestone.label}
          className="h-20 w-20 shrink-0"
        />
        <span className="flex items-baseline gap-2 text-text-primary">
          <span className="font-bold tabular-nums typo-mega2">
            {currentStreak}
          </span>
          <span className="typo-title3">day streak</span>
        </span>
      </div>
      {children}
    </div>
  );
};
