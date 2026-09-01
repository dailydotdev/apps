import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { DailyQuestSummary } from '../../../hooks/useQuestDashboard';

// The celebration half of the moment: everything here belongs to daily.dev, no
// partner paint. Gradients and glows are the design's own values in the quest
// palette (cabbage into avocado); they intentionally bypass theme tokens the
// same way brand paint does (see EngagementAdCta).

const panelBackground =
  'radial-gradient(120% 100% at 20% 0%, rgba(177,75,215,0.38) 0%, rgba(177,75,215,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(160deg, rgba(52,209,116,0.18) 0%, rgba(15,18,24,0) 60%)';

const ringGlow =
  'radial-gradient(circle, rgba(177,75,215,0.55) 0%, rgba(52,209,116,0.25) 45%, transparent 70%)';

const claimedStepBackground = 'rgba(177, 75, 215, 0.18)';

// The ring scales with its container, so the geometry is expressed in viewBox
// units rather than pixels.
const RING_VIEWBOX = 132;
const RING_STROKE = 8;
const RING_RADIUS = (RING_VIEWBOX - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const LevelRing = ({
  level,
  progress,
  className,
  levelClassName,
}: {
  level: number;
  progress: number;
  className?: string;
  levelClassName?: string;
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
      style={{ background: ringGlow }}
    />
    <svg
      viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
      fill="none"
      className="relative h-full w-full -rotate-90"
      aria-hidden
    >
      <circle
        cx={RING_VIEWBOX / 2}
        cy={RING_VIEWBOX / 2}
        r={RING_RADIUS}
        strokeWidth={RING_STROKE}
        className="stroke-border-subtlest-tertiary"
      />
      <circle
        cx={RING_VIEWBOX / 2}
        cy={RING_VIEWBOX / 2}
        r={RING_RADIUS}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={
          RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(progress, 100)) / 100)
        }
        className="stroke-accent-cabbage-default"
      />
    </svg>
    <span className="absolute flex flex-col items-center">
      <span className="uppercase tracking-[0.16em] text-text-tertiary typo-caption2">
        Level
      </span>
      <span
        className={classNames(
          'font-bold tabular-nums text-text-primary',
          levelClassName,
        )}
      >
        {level}
      </span>
    </span>
  </div>
);

const XpEarnedChip = ({ xpEarned }: { xpEarned: number }): ReactElement => (
  <span className="w-fit rounded-8 bg-accent-cabbage-default px-2 py-1 font-bold uppercase tracking-[0.16em] text-white typo-caption1">
    {`+${xpEarned.toLocaleString('de-DE')} XP today`}
  </span>
);

const QuestStrip = ({
  total,
  claimed,
  className,
}: {
  total: number;
  claimed: number;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    {Array.from({ length: total }, (_, index) => {
      const isClaimed = index < claimed;

      return (
        <span
          key={`quest-step-${index + 1}`}
          className={classNames(
            'flex h-7 w-7 items-center justify-center rounded-full border text-text-primary typo-caption2',
            isClaimed
              ? 'border-accent-cabbage-default'
              : 'border-border-subtlest-tertiary',
          )}
          style={isClaimed ? { background: claimedStepBackground } : undefined}
        >
          {index + 1}
        </span>
      );
    })}
  </div>
);

export type QuestOfferCelebrationProps = {
  level: number;
  levelProgress: number;
  summary: DailyQuestSummary;
  className?: string;
};

/** The split popup's left panel: level ring, XP earned, headline, quest strip. */
export const QuestOfferCelebration = ({
  level,
  levelProgress,
  summary,
  className,
}: QuestOfferCelebrationProps): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center',
      className,
    )}
    style={{ background: panelBackground }}
  >
    <LevelRing
      level={level}
      progress={levelProgress}
      className="h-40 w-40"
      levelClassName="typo-mega2"
    />
    {summary.xpEarned > 0 && <XpEarnedChip xpEarned={summary.xpEarned} />}
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-center gap-2">
        <span className="font-bold tabular-nums typo-tera">
          {summary.claimed}
        </span>
        <span className="text-text-tertiary typo-title3">
          {`/ ${summary.total} quests`}
        </span>
      </div>
      <h2 className="typo-title3">Daily quests complete</h2>
    </div>
    <QuestStrip total={summary.total} claimed={summary.claimed} />
  </div>
);

/** The carousel's compact header: small ring and the count on one line. */
export const QuestOfferCelebrationCompact = ({
  level,
  levelProgress,
  summary,
  children,
  className,
}: QuestOfferCelebrationProps & { children?: ReactNode }): ReactElement => (
  <div
    className={classNames(
      'flex flex-col items-center gap-2 px-6 pb-4 pt-6',
      className,
    )}
    style={{ background: panelBackground }}
  >
    <div className="flex items-center justify-center gap-3">
      <LevelRing
        level={level}
        progress={levelProgress}
        className="h-20 w-20 shrink-0"
        levelClassName="typo-title2"
      />
      <span className="flex flex-col items-start text-text-primary">
        <span className="font-bold tabular-nums typo-mega2">
          {`${summary.claimed}/${summary.total}`}
        </span>
        <span className="typo-callout">Daily quests complete</span>
      </span>
    </div>
    {children}
  </div>
);
