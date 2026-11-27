import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { ReputationReasonTotal } from '../../../graphql/reputation';
import { ReputationReason } from '../../../graphql/reputation';
import { formatSignedAmount, getReasonMeta } from './common';

type Side = 'top' | 'right' | 'bottom' | 'left';

interface Axis {
  side: Side;
  label: string;
  /** What one unit on this axis is, for the legend. */
  unit: [string, string];
  reason: ReputationReason;
}

// One axis per way to earn reputation, always in the same place, so the
// shape itself says what kind of contributor someone is.
const axes: Axis[] = [
  {
    side: 'top',
    label: 'Comments',
    unit: ['upvote', 'upvotes'],
    reason: ReputationReason.CommentUpvoted,
  },
  {
    side: 'right',
    label: 'Curation',
    unit: ['source approved', 'sources approved'],
    reason: ReputationReason.SourceRequestApproved,
  },
  {
    side: 'bottom',
    label: 'Moderation',
    unit: ['report confirmed', 'reports confirmed'],
    reason: ReputationReason.PostReportConfirmed,
  },
  {
    side: 'left',
    label: 'Posts',
    unit: ['upvote', 'upvotes'],
    reason: ReputationReason.PostUpvoted,
  },
];

// Wide enough for the side labels, tall enough for two-line labels above
// and below.
const WIDTH = 320;
const HEIGHT = 260;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const RADIUS = 80;

const direction: Record<Side, [number, number]> = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

/** Whole percentages that add up to 100 (largest remainder). */
const toPercentages = (amounts: number[]): number[] => {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);

  if (!total) {
    return amounts.map(() => 0);
  }

  const exact = amounts.map((amount) => (amount / total) * 100);
  const floored = exact.map(Math.floor);
  let left = 100 - floored.reduce((sum, value) => sum + value, 0);

  exact
    .map((value, index) => ({ index, remainder: value - floored[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ index }) => {
      if (left > 0) {
        floored[index] += 1;
        left -= 1;
      }
    });

  return floored;
};

const pointAt = (side: Side, share: number): [number, number] => {
  const [x, y] = direction[side];

  return [CENTER_X + x * RADIUS * share, CENTER_Y + y * RADIUS * share];
};

const AxisLabel = ({
  side,
  label,
  percentage,
}: {
  side: Side;
  label: string;
  percentage: number;
}): ReactElement => {
  const [x, y] = pointAt(side, 1);
  const anchor = (
    {
      top: 'middle',
      bottom: 'middle',
      left: 'end',
      right: 'start',
    } as const
  )[side];
  const offsetX = { top: 0, bottom: 0, left: -10, right: 10 }[side];
  // Two lines (percentage over label) sit above the top axis and below the
  // bottom one; the side labels center on their axis.
  const firstLineY = { top: y - 26, bottom: y + 18, left: y - 4, right: y - 4 }[
    side
  ];

  return (
    <text
      x={x + offsetX}
      y={firstLineY}
      textAnchor={anchor}
      fill="var(--theme-text-tertiary)"
      className="typo-footnote"
    >
      {percentage > 0 && (
        <tspan
          x={x + offsetX}
          fill="var(--theme-text-primary)"
          className="font-bold"
        >
          {percentage}%
        </tspan>
      )}
      <tspan x={x + offsetX} dy={percentage > 0 ? '1.2em' : '0.6em'}>
        {label}
      </tspan>
    </text>
  );
};

interface ReputationShapeProps {
  breakdown: ReputationReasonTotal[];
}

export const ReputationShape = ({
  breakdown,
}: ReputationShapeProps): ReactElement => {
  const totalFor = (reason: ReputationReason) =>
    breakdown.find((total) => total.reason === reason);
  const amounts = axes.map(({ reason }) =>
    Math.max(totalFor(reason)?.amount ?? 0, 0),
  );
  const percentages = toPercentages(amounts);
  const losses = breakdown.filter((total) => total.amount < 0);
  const lost = losses.reduce((sum, total) => sum + total.amount, 0);
  const otherGains = [
    ...breakdown
      .filter(
        (total) =>
          total.amount > 0 &&
          !axes.some(({ reason }) => reason === total.reason),
      )
      .reduce((gains, total) => {
        const { label } = getReasonMeta(total.reason);

        return gains.set(label, (gains.get(label) ?? 0) + total.amount);
      }, new Map<string, number>()),
  ];

  if (!amounts.some(Boolean)) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {lost < 0
          ? `Nothing earned in this period, ${formatSignedAmount(lost)} lost`
          : 'Nothing earned or lost in this period'}
      </Typography>
    );
  }

  const points = axes.map(({ side }, index) =>
    pointAt(side, percentages[index] / 100),
  );

  return (
    <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:items-center tablet:gap-10">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full max-w-[20rem] shrink-0"
        role="img"
        aria-label={axes
          .map(({ label }, index) => `${label} ${percentages[index]}%`)
          .join(', ')}
      >
        {axes.map(({ side }) => {
          const [x, y] = pointAt(side, 1);

          return (
            <line
              key={side}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x}
              y2={y}
              stroke="var(--theme-border-subtlest-secondary)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        <polygon
          points={points.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="var(--theme-accent-onion-default)"
          fillOpacity={0.35}
          stroke="var(--theme-accent-onion-default)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {points.map(([x, y], index) =>
          percentages[index] > 0 ? (
            <circle
              key={axes[index].side}
              cx={x}
              cy={y}
              r={4}
              fill="var(--theme-background-default)"
              stroke="var(--theme-accent-onion-default)"
              strokeWidth={2}
            />
          ) : null,
        )}
        {axes.map(({ side, label }, index) => (
          <AxisLabel
            key={side}
            side={side}
            label={label}
            percentage={percentages[index]}
          />
        ))}
      </svg>
      <div className="flex w-full min-w-0 flex-col gap-3 tablet:w-auto tablet:flex-1">
        <ul className="flex flex-col gap-2">
          {axes.map(({ side, label, unit, reason }, index) => {
            const total = totalFor(reason);
            const count = total?.count ?? 0;

            return (
              <li key={side} className="flex items-baseline gap-2">
                <Typography
                  type={TypographyType.Footnote}
                  className="min-w-0 flex-1"
                  color={
                    count ? TypographyColor.Primary : TypographyColor.Tertiary
                  }
                >
                  {label}
                  <span className="text-text-tertiary">
                    {' · '}
                    {count.toLocaleString('en-US')}{' '}
                    {count === 1 ? unit[0] : unit[1]}
                  </span>
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  bold
                  className={
                    amounts[index]
                      ? 'tabular-nums text-status-success'
                      : 'tabular-nums text-text-quaternary'
                  }
                >
                  {formatSignedAmount(amounts[index])}
                </Typography>
              </li>
            );
          })}
        </ul>
        {(lost < 0 || otherGains.length > 0) && (
          <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-3">
            {lost < 0 && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                <span className="font-bold tabular-nums text-status-error">
                  {formatSignedAmount(lost)}
                </span>{' '}
                from{' '}
                {losses
                  .map(
                    ({ reason, count }) =>
                      `${getReasonMeta(reason).label.toLowerCase()} (${count})`,
                  )
                  .join(', ')}
              </Typography>
            )}
            {otherGains.map(([label, amount]) => (
              <Typography
                key={label}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                <span className="font-bold tabular-nums text-status-success">
                  {formatSignedAmount(amount)}
                </span>{' '}
                {label.toLowerCase()}
              </Typography>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
