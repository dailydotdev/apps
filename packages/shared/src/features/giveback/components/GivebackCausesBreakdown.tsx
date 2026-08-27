import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { ContributionCauseCategoryBreakdown } from '../types';
import { formatDonationAmount } from '../utils';
import { useCountUp, useInView } from '../useGivebackMotion';

// One stable food-palette accent per slice, pinned by the slice's sorted
// position so a category keeps the same colour across the donut arc and its
// legend dot. `fill` paints the legend dot; `text` drives `currentColor` for
// the SVG arc stroke. Ordered so the earliest slices are maximally distinct
// hues and the two magenta-family tones (cabbage purple, bacon pink) sit at
// opposite ends - a typical 4-5 slice chart never shows both, so no two slices
// read as the same colour.
const SLICE_COLORS = [
  { fill: 'bg-accent-cabbage-default', text: 'text-accent-cabbage-default' },
  { fill: 'bg-accent-cheese-default', text: 'text-accent-cheese-default' },
  { fill: 'bg-accent-water-default', text: 'text-accent-water-default' },
  { fill: 'bg-accent-avocado-default', text: 'text-accent-avocado-default' },
  { fill: 'bg-accent-bun-default', text: 'text-accent-bun-default' },
  { fill: 'bg-accent-bacon-default', text: 'text-accent-bacon-default' },
] as const;

// The label for the bucket of causes without a category (`category: null`).
const UNCATEGORISED_LABEL = 'Other causes';

interface Slice {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  color: (typeof SLICE_COLORS)[number];
}

// The backend already groups the pool by cause category (points map 1:1 to
// dollars), so we only sort biggest-first, compute each share and pin a stable
// colour by sorted position. Zero rows are dropped so the donut never renders an
// empty "$0 / 0%" slice.
const toSlices = (
  breakdown: ContributionCauseCategoryBreakdown[],
  total: number,
): Slice[] =>
  [...breakdown]
    .filter(({ points }) => points > 0)
    .sort((a, b) => b.points - a.points)
    .map(({ category, points }, index) => ({
      key: category ?? UNCATEGORISED_LABEL,
      label: category ?? UNCATEGORISED_LABEL,
      amount: points,
      percentage: total > 0 ? (points / total) * 100 : 0,
      color: SLICE_COLORS[index % SLICE_COLORS.length],
    }));

const formatPercentage = (percentage: number): string =>
  `${percentage < 1 ? '<1' : Math.round(percentage)}%`;

const Dot = ({ className }: { className: string }): ReactElement => (
  <span className={classNames('size-2.5 shrink-0 rounded-full', className)} />
);

// Name + percentage + amount rows beside the donut. The percentage and amount
// stay in fixed-width, right-aligned columns so the numbers line up across
// rows; the whole entry is capped (`max-w`) so those columns sit close to the
// title instead of being pushed to the far edge of the wide legend grid.
const Legend = ({ slices }: { slices: Slice[] }): ReactElement => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 tablet:grid-cols-2">
    {slices.map((slice) => (
      <FlexRow key={slice.key} className="w-full max-w-72 items-center gap-2">
        <Dot className={slice.color.fill} />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0 flex-1 truncate"
        >
          {slice.label}
        </Typography>
        <FlexRow className="shrink-0 items-center gap-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="w-9 text-right tabular-nums"
          >
            {formatPercentage(slice.percentage)}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            bold
            className="w-16 text-right tabular-nums"
          >
            {formatDonationAmount(slice.amount)}
          </Typography>
        </FlexRow>
      </FlexRow>
    ))}
  </div>
);

// A normalised circle (`pathLength=100`) lets each arc's dasharray read straight
// as a percentage; arcs stack by accumulating the offset. The pool total counts
// up in the hole. Arcs grow from zero once the block scrolls into view.
const Donut = ({
  slices,
  total,
}: {
  slices: Slice[];
  total: number;
}): ReactElement => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const animatedTotal = useCountUp(total, inView);

  let cumulative = 0;

  return (
    <FlexCol
      ref={ref}
      className="items-start gap-6 tablet:flex-row tablet:items-center tablet:gap-8"
    >
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 36 36"
          className={classNames(
            'size-20 -rotate-90 transition-opacity duration-500',
            inView ? 'opacity-100' : 'opacity-0',
          )}
          role="img"
          aria-label="Share of the community pool by cause"
        >
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            className="stroke-border-subtlest-tertiary"
            strokeWidth="3"
          />
          {slices.map((slice) => {
            const offset = 25 - cumulative;
            cumulative += slice.percentage;
            return (
              <circle
                key={slice.key}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="currentColor"
                pathLength={100}
                strokeLinecap="round"
                className={classNames(
                  'transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none',
                  slice.color.text,
                )}
                strokeWidth="4"
                strokeDasharray={
                  inView
                    ? `${slice.percentage} ${100 - slice.percentage}`
                    : '0 100'
                }
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <FlexCol className="absolute inset-0 items-center justify-center">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            bold
            className="tabular-nums"
          >
            {formatDonationAmount(animatedTotal)}
          </Typography>
        </FlexCol>
      </div>
      <div className="min-w-0 flex-1">
        <Legend slices={slices} />
      </div>
    </FlexCol>
  );
};

interface GivebackCausesBreakdownProps {
  breakdown: ContributionCauseCategoryBreakdown[];
  title?: ReactNode;
  description?: ReactNode;
  // Drops the card chrome (border, surface fill, padding, glow) so the block
  // sits open in the page flow like the rest of the onboarded tabs. The framed
  // card is kept for standalone/Storybook use.
  flat?: boolean;
  className?: string;
}

// The causes breakdown that sits below the hero and above the tabs: turns "the
// pool you're growing" into a picture. Same visual vocabulary as the rest of
// giveback (food-palette accents, hairline dark tracks, count-up motion).
// `flat` renders it open in the page flow; the default is a framed card with a
// soft brand glow for standalone use.
export const GivebackCausesBreakdown = ({
  breakdown,
  title = 'Where the money will go',
  description,
  flat = false,
  className,
}: GivebackCausesBreakdownProps): ReactElement | null => {
  const total = breakdown.reduce((sum, { points }) => sum + points, 0);

  if (total === 0) {
    return null;
  }

  const slices = toSlices(breakdown, total);

  return (
    <section
      className={classNames(
        'relative w-full',
        !flat &&
          'overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5 tablet:p-6',
        className,
      )}
    >
      {!flat && (
        <div
          aria-hidden
          className="bg-accent-cabbage-default/15 pointer-events-none absolute -right-16 -top-20 size-56 rounded-full blur-3xl motion-safe:animate-glow-pulse"
        />
      )}

      <FlexCol className="relative gap-6">
        <FlexCol className="gap-1.5">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {title}
          </Typography>
          {description != null && (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
              className="max-w-xl [text-wrap:pretty]"
            >
              {description}
            </Typography>
          )}
        </FlexCol>

        <Donut slices={slices} total={total} />
      </FlexCol>
    </section>
  );
};
