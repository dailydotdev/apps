import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  NotificationFilterCategory,
  notificationCategoryBadge,
} from '@dailydotdev/shared/src/components/notifications/utils';
import ExtensionProviders from '../../extension/_providers';
import { img } from './_mock';

// Design comparison for the multi-actor lead (upvote milestones / many actors).
//
// Feedback from round 1: the grid won because it's the only option that shows
// several faces WHILE staying inside the fixed lead box — it never overlaps
// neighboring content or breaks row alignment. The overlapping stack bled
// outside the box. So round 2 keeps that hard constraint (everything fits the
// 40px lead column, faces stay circular) and explores nicer contained grids
// plus how each handles "a few" vs "many" actors.
//
// STORY-LOCAL ONLY — nothing here changes the shipped component yet.

const meta: Meta = {
  title: 'Components/Notifications/Avatar alternatives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Contained multi-face leads for upvote milestones / multi-actor rows. Every option fits the fixed lead box (no overlap onto other content) and is shown at "a few" (3) and "many" (24).',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const upvote = notificationCategoryBadge[NotificationFilterCategory.Upvotes];
const SEEDS = ['ada', 'bram', 'cleo', 'dana'];

const RoundFace = ({
  seed,
  className,
}: {
  seed: string;
  className: string;
}) => (
  <img
    src={img(`alt-${seed}`, 80)}
    alt=""
    className={`${className} rounded-full object-cover`}
  />
);

const BadgeCell = () => (
  <span
    className={`flex items-center justify-center rounded-full ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// The badge as a corner overlay (used when the grid cells are all faces).
const CornerBadge = () => (
  <span
    className={`absolute -bottom-1 -right-1 z-2 flex size-4 items-center justify-center rounded-full border-2 border-background-default ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

const CountChip = ({ n }: { n: number }) => (
  <span
    className={`absolute -bottom-1 -right-1 z-2 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background-default px-1 font-bold typo-caption2 ${upvote.bg} ${upvote.fg}`}
  >
    +{n}
  </span>
);

// ---- Round 2: contained grids (everything fits the 40px lead box) ----------
type Lead = (total: number) => React.ReactElement;

const cells = (seeds: string[], count: number) =>
  seeds
    .slice(0, count)
    .map((s) => <RoundFace key={s} seed={s} className="size-full" />);

// G — rounded 2x2: 3 faces + the upvote badge cell (the softened current grid).
const leadRoundedGrid: Lead = () => (
  <div className="grid size-10 grid-cols-2 grid-rows-2 gap-0.5">
    {cells(SEEDS, 3)}
    <BadgeCell />
  </div>
);

// H — rounded 2x2: up to 4 faces, badge floats on the corner (frees the 4th
// cell for another face).
const leadGridFour: Lead = (total) => (
  <div className="relative size-10">
    <div className="grid size-10 grid-cols-2 grid-rows-2 gap-0.5">
      {cells(SEEDS, Math.min(4, total))}
    </div>
    <CornerBadge />
  </div>
);

// K — rounded 2x2: 3 faces + a 4th cell that is the badge when few, or a green
// "+N" count when many (keeps the upvote color, shows the count in place).
const leadGridCountCell: Lead = (total) => (
  <div className="grid size-10 grid-cols-2 grid-rows-2 gap-0.5">
    {cells(SEEDS, 3)}
    {total > 3 ? (
      <span
        className={`flex items-center justify-center rounded-full font-bold typo-caption2 ${upvote.bg} ${upvote.fg}`}
      >
        +{total - 3}
      </span>
    ) : (
      <BadgeCell />
    )}
  </div>
);

// L — rounded 2x2: up to 4 faces with a "+N" count chip on the corner when
// there are more than fit.
const leadGridCountChip: Lead = (total) => (
  <div className="relative size-10">
    <div className="grid size-10 grid-cols-2 grid-rows-2 gap-0.5">
      {cells(SEEDS, Math.min(4, total))}
    </div>
    {total > 4 ? <CountChip n={total - 4} /> : <CornerBadge />}
  </div>
);

interface RefinedOption {
  key: string;
  label: string;
  note: string;
  recommended?: boolean;
  lead: Lead;
}

const refined: RefinedOption[] = [
  {
    key: 'G',
    label: 'G · Rounded grid (3 + badge)',
    note: 'The current grid, but circular faces instead of squares — same contained footprint, much softer. Count stays in the title.',
    recommended: true,
    lead: leadRoundedGrid,
  },
  {
    key: 'H',
    label: 'H · Rounded grid, 4 faces + corner badge',
    note: 'Frees the 4th cell for another face by floating the badge on the corner — shows more people, still fully inside the box.',
    recommended: true,
    lead: leadGridFour,
  },
  {
    key: 'K',
    label: 'K · Rounded grid, 3 faces + "+N" cell',
    note: 'The 4th cell carries the overflow count in the upvote color (badge when there is nothing extra). Faces + explicit count, no overlap.',
    lead: leadGridCountCell,
  },
  {
    key: 'L',
    label: 'L · Rounded grid, 4 faces + "+N" chip',
    note: 'Four faces fill the grid; a small "+N" chip on the corner adds the count for big numbers. Most information, still contained.',
    lead: leadGridCountChip,
  },
];

// ---- Round 1 (reference): the options shown previously -----------------------
const FACES3 = SEEDS.slice(0, 3);

const leadOriginalGrid = () => (
  <div className="grid size-8 grid-cols-2 grid-rows-2 gap-0.5">
    {FACES3.map((s) => (
      <RoundFace key={s} seed={s} className="size-full !rounded-4" />
    ))}
    <BadgeCell />
  </div>
);
const leadSingle = () => (
  <div className="relative flex items-center">
    <RoundFace seed="ada" className="size-9" />
    <CornerBadge />
  </div>
);
const leadIconOnly = () => (
  <span
    className={`flex size-9 items-center justify-center rounded-full ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.Small} className={upvote.fg} />
  </span>
);

// ---- Layout helpers ---------------------------------------------------------

const LeadOnChip = ({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-12 bg-surface-float p-4">
    <div className="flex h-10 w-10 items-center justify-start">{children}</div>
    <span className="text-text-tertiary typo-caption1">{caption}</span>
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-16 flex-row items-start gap-3 bg-surface-float px-4 py-4">
    <div className="flex w-10 shrink-0 items-start justify-start">
      {children}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
      <div className="break-words font-normal text-text-primary typo-callout">
        24 upvotes on your comment!{' '}
        <span className="whitespace-nowrap text-text-tertiary typo-footnote">
          · 2h
        </span>
      </div>
      <div className="break-words text-text-tertiary typo-subhead">
        “Have you tried the new view transitions API?”
      </div>
    </div>
  </div>
);

const Alternatives = (): React.ReactElement => (
  <div className="mx-auto max-w-[44rem] p-6">
    <h1 className="font-bold text-text-primary typo-title2">
      Multi-actor lead — round 2 (contained)
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Constraint locked in from your feedback: the lead must show several faces{' '}
      <b>inside the fixed 40px box</b> — never overlapping other content or
      breaking row alignment. These all satisfy that; each is shown with{' '}
      <b>a few (3)</b> and <b>many (24)</b> actors, plus a full row for context.
    </p>

    <div className="mt-6 flex flex-col gap-6">
      {refined.map((option) => (
        <section key={option.key} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-text-primary typo-title3">
              {option.label}
            </h2>
            {option.recommended && (
              <span className="rounded-6 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-black typo-caption2">
                recommended
              </span>
            )}
          </div>
          <p className="text-text-tertiary typo-footnote">{option.note}</p>
          <div className="flex flex-row flex-wrap items-stretch gap-3">
            <LeadOnChip caption="a few (3)">{option.lead(3)}</LeadOnChip>
            <LeadOnChip caption="many (24)">{option.lead(24)}</LeadOnChip>
          </div>
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <Row>{option.lead(24)}</Row>
          </div>
        </section>
      ))}
    </div>

    <div className="mt-8 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
      <b className="text-text-primary">My take:</b> <b>H</b> (4 faces + corner
      badge) shows the most people while staying contained, and <b>L</b> adds a{' '}
      <b>+N</b> for very large counts. If you want the calmest version, <b>G</b>{' '}
      is just the current grid with circular faces. All three keep faces inside
      the box and never touch the title or the cover image. Tell me the letter
      and I’ll wire it into the real lead.
    </div>

    <h2 className="mt-12 font-bold text-text-primary typo-title3">
      Round 1 (for reference)
    </h2>
    <p className="text-text-tertiary typo-footnote">
      The earlier options — the boxy grid, single avatar, and icon-only.
    </p>
    <div className="mt-3 flex flex-col gap-4">
      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
        <Row>{leadOriginalGrid()}</Row>
      </div>
      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
        <Row>{leadSingle()}</Row>
      </div>
      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
        <Row>{leadIconOnly()}</Row>
      </div>
    </div>
  </div>
);

export const Compare: Story = {
  name: 'Compare options',
  render: () => <Alternatives />,
};
