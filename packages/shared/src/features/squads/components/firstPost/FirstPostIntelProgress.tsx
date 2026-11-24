import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { SquadIntelHighlights } from '../../../../graphql/squadIntel';
import { startupsLavender } from '../../../../styles/custom';
import { getIntelWeekLabel } from '../../lib/intel';

interface FirstPostIntelProgressProps {
  intel: SquadIntelHighlights;
  name: string;
  /** The topic the intel ends up recommending */
  openingTag?: string;
  onDone: () => void;
}

interface Step {
  /** While it runs, and once it is done */
  label: string;
  done: string;
  ms: number;
  /** A number that runs up while the step does */
  count?: { target: number; format: (value: number) => string };
  /** What it is looking at right now, one after the other */
  looksAt?: string[];
}

const TICK_MS = 80;
const LOOK_MS = 280;
const REST_MS = 500;

const number = (value: number): string => value.toLocaleString('en-US');

const compact = (value: number): string =>
  value.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 0,
  });

/** Four dots that take turns, while something is being worked on */
const WorkingDots = (): ReactElement => (
  // As wide as a step's circle, so the status and the steps share a text edge
  <span
    className="flex size-5 shrink-0 items-center justify-center"
    aria-hidden
  >
    <span className="grid grid-cols-2 gap-1">
      {[0, 1, 2, 3].map((dot) => (
        <span
          key={dot}
          className="size-1 animate-pulse rounded-full"
          style={{
            background: startupsLavender,
            animationDelay: `${dot * 180}ms`,
          }}
        />
      ))}
    </span>
  </span>
);

const StepStatus = ({
  isDone,
  isCurrent,
}: {
  isDone: boolean;
  isCurrent: boolean;
}): ReactElement => {
  if (isDone) {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-background-default"
        style={{ background: startupsLavender }}
      >
        <VIcon size={IconSize.Size16} secondary />
      </span>
    );
  }

  return (
    <span
      className={classNames(
        'size-5 shrink-0 rounded-full border-2',
        isCurrent
          ? 'animate-pulse border-text-primary'
          : 'border-dashed border-text-quaternary',
      )}
    />
  );
};

/**
 * Shown the first time, before the intel: what it is put together from, as
 * work in progress. Every name and number on it comes from the intel itself.
 */
export const FirstPostIntelProgress = ({
  intel,
  name,
  openingTag,
  onDone,
}: FirstPostIntelProgressProps): ReactElement => {
  const steps = useMemo((): Step[] => {
    const site = intel.trial?.pickedFrom ?? `${name}'s page`;
    const tags = intel.topics.map(({ tag }) => `#${tag}`);

    return [
      { label: `Reading ${site}`, done: `Read ${site}`, ms: 900 },
      {
        label: 'Matching the topics developers follow',
        done: `Matched ${tags.length} topics`,
        ms: 1300,
        looksAt: tags,
      },
      {
        label: 'Going through the posts in your topics',
        done:
          intel.postsAnalyzed === null
            ? 'Went through the posts in your topics'
            : `Went through ${number(intel.postsAnalyzed)} posts`,
        ms: 1700,
        count:
          intel.postsAnalyzed === null
            ? undefined
            : { target: intel.postsAnalyzed, format: number },
        looksAt: tags,
      },
      {
        label: `Comparing what developers read, ${getIntelWeekLabel(intel)}`,
        done:
          intel.readers === null
            ? 'Compared what developers read'
            : `Compared what ${compact(intel.readers)} developers read`,
        ms: 1500,
        count:
          intel.readers === null
            ? undefined
            : { target: intel.readers, format: compact },
      },
      {
        label: 'Checking what else your audience reads',
        done: `Found ${intel.alsoRead.length} more tags your audience reads`,
        ms: 1100,
        looksAt: intel.alsoRead.map(({ tag }) => `#${tag}`),
      },
      {
        label: 'Ranking the top posts and the best time to publish',
        done: intel.timing.bestDay
          ? `Ranked the top posts, and ${intel.timing.bestDay} as the best day`
          : 'Ranked the top posts',
        ms: 900,
      },
      {
        label: 'Finding your opening',
        done: openingTag
          ? `Found your opening: #${openingTag}`
          : 'Ranked your topics by reads',
        ms: 900,
      },
    ];
  }, [intel, name, openingTag]);
  const total = steps.reduce((sum, { ms }) => sum + ms, 0);
  const [elapsed, setElapsed] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const now = Date.now() - start;

      setElapsed(now);

      if (now >= total + REST_MS) {
        clearInterval(timer);
        onDoneRef.current();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [total]);

  let startsAt = 0;
  const timeline = steps.map((step) => {
    const from = startsAt;
    startsAt += step.ms;

    return { ...step, from };
  });
  const current = timeline.find(({ from, ms }) => elapsed < from + ms);
  const inStep = current ? elapsed - current.from : 0;
  const looksAt = current?.looksAt;
  const look = looksAt?.[Math.floor(inStep / LOOK_MS) % looksAt.length];

  return (
    <div className="flex w-full flex-col gap-5 py-6">
      <div className="flex items-center gap-3" role="status">
        <WorkingDots />
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <strong className="truncate typo-callout">
            {current?.label ?? 'Your intel is ready'}
          </strong>
          {look && (
            <span className="shrink-0 text-text-tertiary typo-footnote">
              {look}
            </span>
          )}
        </span>
        <span className="shrink-0 tabular-nums text-text-tertiary typo-footnote">
          {`${Math.floor(Math.min(elapsed, total) / 1000)}s`}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {timeline.map((step, index) => {
          const isDone = elapsed >= step.from + step.ms;
          const isCurrent = step === current;
          const progress = isCurrent ? inStep / step.ms : 0;
          const shownTags =
            index === 1 && (isDone || isCurrent)
              ? intel.topics.slice(
                  0,
                  isDone
                    ? intel.topics.length
                    : Math.ceil(progress * intel.topics.length),
                )
              : [];

          return (
            <li key={step.done} className="flex flex-col gap-2">
              <div
                className={classNames(
                  'flex items-center gap-3 typo-callout',
                  !isDone && !isCurrent && 'text-text-quaternary',
                  isDone && 'text-text-secondary',
                )}
              >
                <StepStatus isDone={isDone} isCurrent={isCurrent} />
                <span className="min-w-0 flex-1">
                  {isDone ? step.done : step.label}
                </span>
                {isCurrent && step.count && (
                  <span className="shrink-0 font-bold tabular-nums text-text-primary">
                    {step.count.format(
                      Math.round(step.count.target * progress),
                    )}
                  </span>
                )}
              </div>
              {!!shownTags.length && (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {shownTags.map(({ tag }) => (
                    <span
                      key={tag}
                      className="rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-footnote"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
