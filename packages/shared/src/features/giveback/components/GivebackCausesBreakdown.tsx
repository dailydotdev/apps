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
import type { ContributionCause } from '../types';
import { formatDonationAmount } from '../utils';
import { useCountUp, useInView } from '../useGivebackMotion';
import { CauseEmblem } from './CauseEmblem';

// A slice of the community pool directed at one cause. `amount` is in whole
// currency units, matching the funding meter (points map 1:1 to dollars), so it
// formats straight through `formatDonationAmount`.
export interface GivebackCauseAllocation {
  cause: ContributionCause;
  amount: number;
}

export type GivebackBreakdownVariant = 'stacked' | 'donut' | 'silos' | 'mosaic';

// One stable food-palette accent per cause, reused across every variant so a
// cause keeps the same colour whether it's a bar segment, a donut arc, a tank
// or a tile. `dot`/`fill` paint solids; `text` drives `currentColor` for SVG
// strokes; `soft` is the flat tint behind emblems.
const CAUSE_COLORS = [
  {
    fill: 'bg-accent-cabbage-default',
    text: 'text-accent-cabbage-default',
    soft: 'bg-accent-cabbage-flat',
  },
  {
    fill: 'bg-accent-avocado-default',
    text: 'text-accent-avocado-default',
    soft: 'bg-accent-avocado-flat',
  },
  {
    fill: 'bg-accent-cheese-default',
    text: 'text-accent-cheese-default',
    soft: 'bg-accent-cheese-flat',
  },
  {
    fill: 'bg-accent-bacon-default',
    text: 'text-accent-bacon-default',
    soft: 'bg-accent-bacon-flat',
  },
  {
    fill: 'bg-accent-water-default',
    text: 'text-accent-water-default',
    soft: 'bg-accent-water-flat',
  },
  {
    fill: 'bg-accent-bun-default',
    text: 'text-accent-bun-default',
    soft: 'bg-accent-bun-flat',
  },
] as const;

interface Slice {
  cause: ContributionCause;
  amount: number;
  percentage: number;
  color: (typeof CAUSE_COLORS)[number];
  index: number;
}

// Sort biggest-first so the visuals lead with the causes the community backs
// most, and pin a stable colour to each by its sorted position.
const toSlices = (
  allocations: GivebackCauseAllocation[],
  total: number,
): Slice[] =>
  [...allocations]
    .sort((a, b) => b.amount - a.amount)
    .map((allocation, index) => ({
      cause: allocation.cause,
      amount: allocation.amount,
      percentage: total > 0 ? (allocation.amount / total) * 100 : 0,
      color: CAUSE_COLORS[index % CAUSE_COLORS.length],
      index,
    }));

const formatPercentage = (percentage: number): string =>
  `${percentage < 1 ? '<1' : Math.round(percentage)}%`;

const Dot = ({ className }: { className: string }): ReactElement => (
  <span className={classNames('size-2.5 shrink-0 rounded-full', className)} />
);

// Shared name + percentage + amount row used under the stacked bar and the
// donut so both read from the same legend. The percentage and amount stay in
// fixed-width, right-aligned columns so the numbers line up across rows; the
// whole entry is capped (`max-w`) so those columns sit close to the title
// instead of being pushed to the far edge of the wide legend grid.
const Legend = ({ slices }: { slices: Slice[] }): ReactElement => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 tablet:grid-cols-2">
    {slices.map((slice) => (
      <FlexRow
        key={slice.cause.id}
        className="w-full max-w-72 items-center gap-2"
      >
        <Dot className={slice.color.fill} />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0 flex-1 truncate"
        >
          {slice.cause.title}
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

// Variant 1 — the "one pool, one split" bar. Mirrors the hero funding meter (a
// dark, hairline-bordered track) but divides the fill into a coloured segment
// per cause. Segments grow from zero once the block scrolls into view.
const StackedBar = ({ slices }: { slices: Slice[] }): ReactElement => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <FlexCol className="gap-5">
      <div
        ref={ref}
        className="relative flex h-6 w-full overflow-hidden rounded-8 border border-border-subtlest-tertiary bg-background-default"
      >
        {slices.map((slice) => (
          <span
            key={slice.cause.id}
            className={classNames(
              'h-full transition-[width] duration-700 ease-out first:rounded-l-6 last:rounded-r-6 motion-reduce:transition-none',
              slice.color.fill,
            )}
            style={{ width: inView ? `${slice.percentage}%` : '0%' }}
          >
            <span className="via-white/20 block h-full w-full bg-gradient-to-b from-transparent to-transparent" />
          </span>
        ))}
      </div>
      <Legend slices={slices} />
    </FlexCol>
  );
};

// Variant 2 — the donut. A normalised circle (`pathLength=100`) lets each arc's
// dasharray read straight as a percentage; arcs stack by accumulating the offset
// from 12 o'clock. The pool total counts up in the hole.
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
    <FlexRow
      ref={ref}
      className="flex-col items-center gap-6 tablet:flex-row tablet:gap-8"
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
                key={slice.cause.id}
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
    </FlexRow>
  );
};

// Variant 3 — the "storage tanks". The playful, store-storage take: one tank per
// cause, filled to its share of the biggest backer's level so the tallest tank
// is nearly full and the rest read against it. A travelling shine sells the
// "liquid". Fills rise from the base on reveal.
const StorageTanks = ({ slices }: { slices: Slice[] }): ReactElement => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const maxAmount = slices.reduce(
    (max, slice) => Math.max(max, slice.amount),
    0,
  );

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 gap-3 tablet:grid-cols-6 tablet:gap-4"
    >
      {slices.map((slice) => {
        const level = maxAmount > 0 ? (slice.amount / maxAmount) * 100 : 0;
        return (
          <FlexCol key={slice.cause.id} className="items-center gap-2.5">
            <div className="relative h-36 w-full max-w-16 overflow-hidden rounded-14 border border-border-subtlest-tertiary bg-background-default">
              <div
                className={classNames(
                  'absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out motion-reduce:transition-none',
                  slice.color.fill,
                )}
                style={{ height: inView ? `${Math.max(level, 6)}%` : '0%' }}
              >
                {/* Liquid surface + a slow travelling gleam so a tank reads as
                    filled storage, not a flat block. */}
                <span className="via-white/25 absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/40 to-transparent" />
                <span className="via-white/20 absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-meter-shine" />
              </div>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                bold
                className="absolute inset-x-0 top-2 text-center tabular-nums"
              >
                {formatPercentage(slice.percentage)}
              </Typography>
            </div>
            <CauseEmblem
              cause={slice.cause}
              index={slice.index}
              className="size-8 rounded-12 [&_img]:size-5"
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="line-clamp-2 text-center"
            >
              {slice.cause.title}
            </Typography>
          </FlexCol>
        );
      })}
    </div>
  );
};

// A plain flex-wrap can't size tiles by share (grow only splits leftover space,
// and the last item strands on its own full-width row). Instead lay the slices
// into rows and let each tile flex-grow by its percentage *within its row*, so
// widths read as weight. Up to three causes stay on one row; more balance across
// two rows by dropping each cause (biggest-first) into the lighter row - which
// keeps the smallest tiles wide enough to stay legible.
const toMosaicRows = (slices: Slice[]): Slice[][] => {
  if (slices.length <= 3) {
    return [slices];
  }

  const rows: [Slice[], Slice[]] = [[], []];
  const sums = [0, 0];
  slices.forEach((slice) => {
    const target = sums[0] <= sums[1] ? 0 : 1;
    rows[target].push(slice);
    sums[target] += slice.percentage;
  });
  return rows.filter((row) => row.length > 0);
};

const MosaicTile = ({ slice }: { slice: Slice }): ReactElement => (
  <FlexCol
    className={classNames(
      // A floor width keeps the smallest tiles legible (percentage never clips)
      // when the row is squeezed on mobile; above it, flex-grow sizes by share.
      'h-24 min-w-[4.5rem] justify-between gap-2 overflow-hidden rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary',
      slice.color.soft,
    )}
    style={{ flexGrow: slice.percentage, flexBasis: 0 }}
  >
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Title2}
      bold
      className={classNames('tabular-nums', slice.color.text)}
    >
      {formatPercentage(slice.percentage)}
    </Typography>
    <FlexCol className="min-w-0 gap-0.5">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        bold
        className="truncate"
      >
        {slice.cause.title}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {formatDonationAmount(slice.amount)}
      </Typography>
    </FlexCol>
  </FlexCol>
);

// Variant 4 — the mosaic. Each tile's footprint is its weight in the pool, so
// the split reads as a picture of area, not just a list.
const Mosaic = ({ slices }: { slices: Slice[] }): ReactElement => (
  <FlexCol className="gap-3">
    {toMosaicRows(slices).map((row) => (
      <FlexRow
        key={row.map((slice) => slice.cause.id).join('-')}
        className="flex-wrap gap-3"
      >
        {row.map((slice) => (
          <MosaicTile key={slice.cause.id} slice={slice} />
        ))}
      </FlexRow>
    ))}
  </FlexCol>
);

interface GivebackCausesBreakdownProps {
  allocations: GivebackCauseAllocation[];
  variant?: GivebackBreakdownVariant;
  title?: ReactNode;
  description?: ReactNode;
  // Drops the card chrome (border, surface fill, padding, glow) so the block
  // sits open in the page flow like the rest of the onboarded tabs. The framed
  // card is kept for standalone/Storybook use.
  flat?: boolean;
  className?: string;
}

const renderVariant = (
  variant: GivebackBreakdownVariant,
  slices: Slice[],
  total: number,
) => {
  if (variant === 'donut') {
    return <Donut slices={slices} total={total} />;
  }
  if (variant === 'silos') {
    return <StorageTanks slices={slices} />;
  }
  if (variant === 'mosaic') {
    return <Mosaic slices={slices} />;
  }
  return <StackedBar slices={slices} />;
};

// The causes breakdown that sits below the hero and above the tabs: turns "the
// pool you're growing" into a picture. Same visual vocabulary as the rest of
// giveback (food-palette accents, hairline dark tracks, count-up motion) with a
// swappable `variant`. `flat` renders it open in the page flow; the default is a
// framed card with a soft brand glow for standalone use.
export const GivebackCausesBreakdown = ({
  allocations,
  variant = 'stacked',
  title = 'Where the money will go',
  description,
  flat = false,
  className,
}: GivebackCausesBreakdownProps): ReactElement | null => {
  const total = allocations.reduce((sum, { amount }) => sum + amount, 0);

  if (allocations.length === 0 || total === 0) {
    return null;
  }

  const slices = toSlices(allocations, total);

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

        {renderVariant(variant, slices, total)}
      </FlexCol>
    </section>
  );
};
