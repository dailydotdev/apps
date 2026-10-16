import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  onboardingHeadlineClasses,
  REQUIRED_TAGS_THRESHOLD,
} from '@dailydotdev/shared/src/components/onboarding/common';

// Ported from Tomer's swipe onboarding progress header (dailydotdev/apps#5838):
// the typing headline, the flowing tri-color bar and the milestone burst. The
// thresholds move to the tag step's: 5 unlocks Continue, 10 and 20 make the
// feed smarter.
export const TAG_MILESTONES = [REQUIRED_TAGS_THRESHOLD, 10, 20] as const;
const [UNLOCK, SMARTER, DIALED_IN] = TAG_MILESTONES;

const TYPING_MS_PER_CHAR = 12;

const plural = (count: number, word: string) =>
  `${count} more ${word}${count === 1 ? '' : 's'}`;

export const getTagHeadline = (count: number): string => {
  if (count < UNLOCK) {
    return 'Tune your feed';
  }

  if (count < SMARTER) {
    return 'Nice start! Your feed is ready.';
  }

  if (count < DIALED_IN) {
    return 'Getting smarter!';
  }

  return "You're all set!";
};

export const getTagGuidance = (count: number): string => {
  if (count >= DIALED_IN) {
    return 'Add tags to fine-tune.';
  }

  if (count >= SMARTER) {
    return `Pick ${plural(DIALED_IN - count, 'tag')} to dial it in.`;
  }

  if (count >= UNLOCK) {
    return `Pick ${plural(SMARTER - count, 'tag')} for a smarter feed.`;
  }

  return count
    ? `Pick ${plural(UNLOCK - count, 'tag')} to get started.`
    : `Pick ${UNLOCK} tags to get started.`;
};

// Reaching the minimum fills half the bar, so every early pick visibly
// counts; the smarter tiers fill the rest.
const BAR_STOPS: [number, number][] = [
  [0, 0],
  [UNLOCK, 50],
  [SMARTER, 75],
  [DIALED_IN, 100],
];

export const getTagBarProgress = (count: number): number => {
  const upper = BAR_STOPS.findIndex(([tags]) => count <= tags);

  if (upper <= 0) {
    return upper === 0 ? 0 : 100;
  }

  const [fromTags, fromPercent] = BAR_STOPS[upper - 1];
  const [toTags, toPercent] = BAR_STOPS[upper];

  return (
    fromPercent +
    ((count - fromTags) / (toTags - fromTags)) * (toPercent - fromPercent)
  );
};

// Fires once each time the count climbs past a milestone, never on the way
// down, so unpicking and re-picking the fifth tag doesn't replay the burst.
export const useMilestoneBurst = (count: number): number => {
  const [burstKey, setBurstKey] = useState(0);
  const previous = useRef<number | null>(null);
  const celebrated = useRef(new Set<number>());

  useEffect(() => {
    const before = previous.current;
    previous.current = count;

    if (before === null) {
      TAG_MILESTONES.forEach(
        (milestone) => count >= milestone && celebrated.current.add(milestone),
      );
      return;
    }

    const crossed = TAG_MILESTONES.find(
      (milestone) =>
        before < milestone &&
        count >= milestone &&
        !celebrated.current.has(milestone),
    );

    if (crossed) {
      celebrated.current.add(crossed);
      setBurstKey((key) => key + 1);
    }
  }, [count]);

  return burstKey;
};

const TypingHeadline = ({ text }: { text: string }): ReactElement => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisible(Math.min(index, text.length));

      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, TYPING_MS_PER_CHAR);

    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <h1
      aria-label={text}
      className={classNames(
        onboardingHeadlineClasses,
        'min-h-[4.5rem] tablet:min-h-[2.5rem]',
      )}
    >
      <span aria-hidden>{text.slice(0, visible)}</span>
    </h1>
  );
};

const SPARKS = [
  ['0rem', '-1.5rem'],
  ['0.6875rem', '-1.25rem'],
  ['-0.6875rem', '-1.25rem'],
  ['1.125rem', '-0.5rem'],
  ['-1.125rem', '-0.5rem'],
  ['1.375rem', '0rem'],
  ['-1.375rem', '0rem'],
  ['0.9375rem', '0.5625rem'],
  ['-0.9375rem', '0.5625rem'],
  ['0.5rem', '1.0625rem'],
  ['-0.5rem', '1.0625rem'],
  ['1rem', '-1rem'],
  ['-1rem', '-1rem'],
];

const tint = (accent: string, alpha: number) =>
  `rgb(from var(--theme-accent-${accent}-default) r g b / ${alpha})`;

const KEYFRAMES = `
@keyframes tagProgressFlow { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
@keyframes tagProgressShimmer { from { transform: translateX(-130%); } to { transform: translateX(320%); } }
@keyframes tagProgressBreath { 0%, 100% { opacity: 1; } 50% { opacity: 0.72; } }
@keyframes tagProgressGlow {
  0% { opacity: 0; box-shadow: 0 0 0 0 transparent; }
  10% { opacity: 1; box-shadow: 0 0 0.5rem 0.25rem ${tint(
    'cheese',
    0.85,
  )}, 0 0 1.75rem 0.75rem ${tint('cabbage', 0.6)}, 0 0 3rem 1.25rem ${tint(
  'avocado',
  0.35,
)}; }
  100% { opacity: 0; box-shadow: 0 0 0 0 transparent; }
}
@keyframes tagProgressRipple {
  from { transform: translate(-50%, -50%) scale(0.35); opacity: 0.95; }
  to { transform: translate(-50%, -50%) scale(6); opacity: 0; }
}
@keyframes tagProgressSpark {
  from { transform: translate(0, 0) scale(2.1); opacity: 1; }
  to { transform: translate(var(--spark-tx), var(--spark-ty)) scale(0.15); opacity: 0; }
}`;

export const TagProgressBar = ({
  count,
  burstKey,
  max,
  caption,
  className,
}: {
  count: number;
  burstKey: number;
  // Fills against this total instead of the tag milestones.
  max?: number;
  caption?: string;
  className?: string;
}): ReactElement => {
  const progress = max
    ? Math.min(count / max, 1) * 100
    : getTagBarProgress(count);
  const notches = max ? [] : TAG_MILESTONES.slice(0, -1);

  return (
    <div className={classNames('flex w-full flex-col gap-2', className)}>
      <style>{KEYFRAMES}</style>
      <div
        className="relative h-3 w-full rounded-max bg-border-subtlest-tertiary"
        style={{ animation: 'tagProgressBreath 2.8s ease-in-out infinite' }}
      >
        {notches.map((milestone) => (
          <span
            key={milestone}
            aria-hidden
            className={classNames(
              'absolute inset-y-0 w-0.5',
              count >= milestone
                ? 'bg-background-default'
                : 'bg-border-subtlest-secondary',
            )}
            style={{ left: `${getTagBarProgress(milestone)}%`, zIndex: 2 }}
          />
        ))}
        {burstKey > 0 && (
          <div
            key={`glow-${burstKey}`}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full rounded-max"
            style={{
              width: `${progress}%`,
              zIndex: 3,
              animation:
                'tagProgressGlow 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
          />
        )}
        <div
          className="relative h-full overflow-hidden rounded-max transition-[width] duration-300 ease-in-out"
          style={{
            width: `${progress}%`,
            zIndex: 1,
            backgroundImage: `linear-gradient(105deg, ${[
              'cabbage',
              'avocado',
              'cheese',
              'cabbage',
              'avocado',
              'cheese',
            ]
              .map((accent) => `var(--theme-accent-${accent}-default)`)
              .join(', ')})`,
            backgroundSize: '240% 100%',
            animation: 'tagProgressFlow 2.2s linear infinite',
          }}
        >
          <div
            className="pointer-events-none absolute inset-y-0 w-[55%]"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${tint(
                'cheese',
                0.5,
              )}, transparent)`,
              animation: 'tagProgressShimmer 1.85s linear infinite',
            }}
          />
        </div>
        {burstKey > 0 && (
          <div
            key={burstKey}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${progress}%`, top: '50%', zIndex: 4 }}
          >
            <span
              className="absolute size-3 rounded-max border-2"
              style={{
                borderColor: tint('cheese', 0.9),
                backgroundColor: tint('cheese', 0.42),
                animation:
                  'tagProgressRipple 0.85s cubic-bezier(0.15, 0.85, 0.2, 1) forwards',
              }}
            />
            {SPARKS.map(([tx, ty], index) => (
              <span
                key={`${tx}${ty}`}
                className="absolute -ml-0.5 -mt-0.5 size-1 rounded-max bg-accent-cheese-default"
                style={
                  {
                    '--spark-tx': tx,
                    '--spark-ty': ty,
                    boxShadow: `0 0 0.375rem ${tint(
                      'cheese',
                      0.9,
                    )}, 0 0 0.75rem ${tint('cabbage', 0.75)}`,
                    animation:
                      'tagProgressSpark 0.75s cubic-bezier(0.12, 0.9, 0.22, 1) forwards',
                    animationDelay: `${index * 22}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
      <p
        aria-live="polite"
        className="text-center font-bold text-text-secondary typo-caption1"
      >
        {caption ?? getTagGuidance(count)}
      </p>
    </div>
  );
};

export const TagProgressHeader = ({
  count,
  burstKey,
}: {
  count: number;
  burstKey: number;
}): ReactElement => {
  const headline = useMemo(() => getTagHeadline(count), [count]);

  return (
    <div className="flex w-full max-w-[22rem] flex-col items-center gap-6">
      <TypingHeadline text={headline} />
      <TagProgressBar burstKey={burstKey} count={count} />
    </div>
  );
};
