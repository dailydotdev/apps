import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { onboardingHeadlineClasses, REQUIRED_TAGS_THRESHOLD } from './common';
import styles from './TagProgressHeader.module.css';

const SMARTER = 10;
const DIALED_IN = 20;

const MILESTONE_HEADLINES = [
  'Keep tuning your feed',
  'Your feed is getting smarter',
  'Your feed is dialed in',
];

const TYPING_MS_PER_CHAR = 12;

const getMilestones = (requiredTags: number): number[] => [
  requiredTags,
  SMARTER,
  DIALED_IN,
];

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

const pluralTags = (count: number) => `tag${count === 1 ? '' : 's'}`;

const moreTags = (count: number) => `${count} more ${pluralTags(count)}`;

const getReachedMilestones = (milestones: number[], count: number): number =>
  milestones.filter((milestone) => count >= milestone).length;

const getTagGuidance = (count: number, requiredTags: number): string => {
  if (count >= DIALED_IN) {
    return 'Add tags to fine-tune.';
  }

  if (count >= SMARTER) {
    return `Pick ${moreTags(DIALED_IN - count)} to dial it in.`;
  }

  if (count >= requiredTags) {
    return `Pick ${moreTags(SMARTER - count)} for a smarter feed.`;
  }

  return count
    ? `Pick ${moreTags(requiredTags - count)} to get started.`
    : `Pick ${requiredTags} ${pluralTags(requiredTags)} to get started.`;
};

const getTagBarProgress = (count: number, requiredTags: number): number => {
  const stops: [number, number][] = [
    [0, 0],
    [requiredTags, 50],
    [SMARTER, 75],
    [DIALED_IN, 100],
  ];
  const upper = stops.findIndex(([tags]) => count <= tags);

  if (upper <= 0) {
    return upper === 0 ? 0 : 100;
  }

  const [fromTags, fromPercent] = stops[upper - 1];
  const [toTags, toPercent] = stops[upper];

  return (
    fromPercent +
    ((count - fromTags) / (toTags - fromTags)) * (toPercent - fromPercent)
  );
};

const useMilestoneBurst = (count: number, milestones: number[]): number => {
  const [burstKey, setBurstKey] = useState(0);
  const previous = useRef<number | null>(null);
  const celebrated = useRef(new Set<number>());

  useEffect(() => {
    const before = previous.current;
    previous.current = count;

    if (before === null) {
      milestones.forEach(
        (milestone) => count >= milestone && celebrated.current.add(milestone),
      );
      return;
    }

    const crossed = milestones.find(
      (milestone) =>
        before < milestone &&
        count >= milestone &&
        !celebrated.current.has(milestone),
    );

    if (crossed) {
      celebrated.current.add(crossed);
      setBurstKey((key) => key + 1);
    }
  }, [count, milestones]);

  return burstKey;
};

const prefersReducedMotion = () =>
  !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TypingHeadline = ({
  text,
  headlines,
}: {
  text: string;
  headlines: string[];
}): ReactElement => {
  const [visible, setVisible] = useState(text.length);
  const typedText = useRef(text);

  useEffect(() => {
    if (typedText.current === text) {
      return undefined;
    }

    typedText.current = text;

    if (prefersReducedMotion()) {
      setVisible(text.length);
      return undefined;
    }

    let typed = 0;
    setVisible(typed);
    const interval = window.setInterval(() => {
      typed += 1;
      setVisible(typed);

      if (typed >= text.length) {
        window.clearInterval(interval);
      }
    }, TYPING_MS_PER_CHAR);

    return () => window.clearInterval(interval);
  }, [text]);

  // Every headline sits invisibly in one grid cell so a change never moves the
  // step below it.
  return (
    <h1
      aria-label={text}
      className={classNames(onboardingHeadlineClasses, 'grid')}
    >
      {headlines.map((headline) => (
        <span key={headline} aria-hidden className="invisible [grid-area:1/1]">
          {headline}
        </span>
      ))}
      <span aria-hidden className="[grid-area:1/1]">
        {text.slice(0, visible)}
      </span>
    </h1>
  );
};

interface TagProgressHeaderProps {
  count: number;
  headline: string;
  requiredTags?: number;
}

export const TagProgressHeader = ({
  count,
  headline,
  requiredTags = REQUIRED_TAGS_THRESHOLD,
}: TagProgressHeaderProps): ReactElement => {
  const milestones = useMemo(() => getMilestones(requiredTags), [requiredTags]);
  const burstKey = useMilestoneBurst(count, milestones);
  const headlines = [headline, ...MILESTONE_HEADLINES];
  const progress = getTagBarProgress(count, requiredTags);
  const guidance = getTagGuidance(count, requiredTags);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <TypingHeadline
        headlines={headlines}
        text={headlines[getReachedMilestones(milestones, count)]}
      />
      <div className="flex w-full max-w-[22rem] flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Feed personalization"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={guidance}
          className={classNames(
            'relative h-3 w-full rounded-max bg-border-subtlest-tertiary',
            styles.track,
          )}
        >
          {milestones.slice(0, -1).map((milestone) => (
            <span
              key={milestone}
              aria-hidden
              className={classNames(
                'absolute inset-y-0 z-2 w-0.5',
                count >= milestone
                  ? 'bg-background-default'
                  : 'bg-border-subtlest-secondary',
              )}
              style={{ left: `${getTagBarProgress(milestone, requiredTags)}%` }}
            />
          ))}
          {burstKey > 0 && (
            <div
              key={`glow-${burstKey}`}
              aria-hidden
              className={classNames(
                'pointer-events-none absolute left-0 top-0 z-3 h-full rounded-max',
                styles.glow,
              )}
              style={{ width: `${progress}%` }}
            />
          )}
          <div
            className={classNames(
              'relative z-1 h-full overflow-hidden rounded-max transition-[width] duration-300 ease-in-out motion-reduce:transition-none',
              styles.fill,
            )}
            style={{ width: `${progress}%` }}
          >
            <div
              className={classNames(
                'pointer-events-none absolute inset-y-0 w-[55%]',
                styles.shimmer,
              )}
            />
          </div>
          {burstKey > 0 && (
            <div
              key={burstKey}
              aria-hidden
              className="pointer-events-none absolute top-1/2 z-3"
              style={{ left: `${progress}%` }}
            >
              <span
                className={classNames(
                  'absolute size-3 rounded-max border-2',
                  styles.ripple,
                )}
              />
              {SPARKS.map(([x, y], index) => (
                <span
                  key={`${x}${y}`}
                  className={classNames(
                    'absolute -ml-0.5 -mt-0.5 size-1 rounded-max bg-accent-cheese-default',
                    styles.spark,
                  )}
                  style={
                    {
                      '--spark-x': x,
                      '--spark-y': y,
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
          {guidance}
        </p>
      </div>
    </div>
  );
};
