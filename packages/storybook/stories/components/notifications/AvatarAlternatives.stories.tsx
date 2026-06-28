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
// The current production lead is a 2x2 face grid; these are alternatives to
// choose from. STORY-LOCAL ONLY — nothing here changes the shipped component
// until a direction is picked.

const meta: Meta = {
  title: 'Components/Notifications/Avatar alternatives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Alternatives to the 3-image grid + upvote stack. Each option is shown as a full row so it can be judged in context. Pick a direction and I will wire it into the real NotificationItem lead.',
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

const upvoteBadge =
  notificationCategoryBadge[NotificationFilterCategory.Upvotes];

const FACES = ['ada', 'bram', 'cleo', 'dana', 'eli'];
const face = (seed: string, size: string) => (
  <img
    key={seed}
    src={img(`alt-${seed}`, 80)}
    alt=""
    className={`${size} rounded-full border-2 border-background-default object-cover`}
  />
);

const UpvotePill = ({ children }: { children: React.ReactNode }) => (
  <span
    className={`flex items-center justify-center rounded-full ${upvoteBadge.bg}`}
  >
    {children}
  </span>
);

// The colored upvote badge as it sits on the corner of a single avatar.
const CornerBadge = () => (
  <span
    className={`absolute -bottom-1 -right-1 z-2 flex size-5 items-center justify-center rounded-full border-2 border-background-default ${upvoteBadge.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvoteBadge.fg} />
  </span>
);

// ---- The lead variants ----------------------------------------------------

// A — current: 2x2 grid of 3 faces + the action badge cell.
const LeadGrid = () => (
  <div className="grid size-8 grid-cols-2 grid-rows-2 gap-0.5">
    {FACES.slice(0, 3).map((s) => (
      <img
        key={s}
        src={img(`alt-${s}`, 80)}
        alt=""
        className="size-full rounded-4 object-cover"
      />
    ))}
    <UpvotePill>
      <UpvoteIcon
        secondary
        size={IconSize.XXSmall}
        className={upvoteBadge.fg}
      />
    </UpvotePill>
  </div>
);

// B — overlapping avatar stack (3) with the upvote badge on the corner.
const LeadStack = () => (
  <div className="relative flex items-center">
    <div className="flex -space-x-2">
      {FACES.slice(0, 3).map((s) => face(s, 'size-7'))}
    </div>
    <CornerBadge />
  </div>
);

// C — single avatar + upvote badge (the count lives in the title). Matches how
// comments/mentions/follows already render — one consistent lead everywhere.
const LeadSingle = () => (
  <div className="relative flex items-center">
    <img
      src={img('alt-ada', 80)}
      alt=""
      className="size-9 rounded-full object-cover"
    />
    <CornerBadge />
  </div>
);

// D — single avatar + a "+N" count pill instead of the glyph badge.
const LeadCount = () => (
  <div className="relative flex items-center">
    <img
      src={img('alt-ada', 80)}
      alt=""
      className="size-9 rounded-full object-cover"
    />
    <span
      className={`absolute -bottom-1 -right-1 z-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background-default px-1 typo-caption2 ${upvoteBadge.bg} ${upvoteBadge.fg}`}
    >
      +22
    </span>
  </div>
);

// E — icon only: the upvote glyph in a filled circle, no faces at all.
const LeadIconOnly = () => (
  <UpvotePill>
    <span className="flex size-9 items-center justify-center">
      <UpvoteIcon secondary size={IconSize.Small} className={upvoteBadge.fg} />
    </span>
  </UpvotePill>
);

// F — two overlapping avatars + badge (lighter than three).
const LeadDuo = () => (
  <div className="relative flex items-center">
    <div className="flex -space-x-2">
      {FACES.slice(0, 2).map((s) => face(s, 'size-8'))}
    </div>
    <CornerBadge />
  </div>
);

interface Option {
  key: string;
  label: string;
  note: string;
  recommended?: boolean;
  Lead: () => React.ReactElement;
}

const options: Option[] = [
  {
    key: 'A',
    label: 'A · Current — 2×2 grid',
    note: 'Three faces + the upvote cell. Busy at a small size; the faces are tiny and the grid reads as a cluster of squares.',
    Lead: LeadGrid,
  },
  {
    key: 'B',
    label: 'B · Overlapping stack',
    note: 'Three circular faces overlapping with a ring, badge on the corner. Familiar social-proof pattern (Slack/Linear), still shows multiple people.',
    recommended: true,
    Lead: LeadStack,
  },
  {
    key: 'C',
    label: 'C · Single avatar + badge',
    note: 'One avatar + the upvote badge; the count stays in the title. Identical lead to comments/mentions/follows — most consistent and calmest.',
    recommended: true,
    Lead: LeadSingle,
  },
  {
    key: 'D',
    label: 'D · Single avatar + "+N" pill',
    note: 'One avatar with a count pill instead of the glyph. Communicates volume directly, but loses the upvote color/glyph cue.',
    Lead: LeadCount,
  },
  {
    key: 'E',
    label: 'E · Icon only',
    note: 'No faces — just the upvote glyph in a filled circle. Cleanest and most scalable, but drops the human social proof.',
    Lead: LeadIconOnly,
  },
  {
    key: 'F',
    label: 'F · Two-avatar overlap',
    note: 'A lighter version of the stack with two faces. Good middle ground between “one person” and “a crowd”.',
    Lead: LeadDuo,
  },
];

const Row = ({ Lead }: { Lead: () => React.ReactElement }) => (
  <div className="flex min-h-16 flex-row items-start gap-3 bg-surface-float px-4 py-4">
    <div className="flex w-10 shrink-0 items-start justify-start">
      <Lead />
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
      Multi-actor lead — alternatives
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      How to show the lead when several people act (upvote milestones, multiple
      actors). The count is already in the title, so the avatars are social
      proof — they don’t need to carry the number. Pick a direction.
    </p>

    <div className="mt-6 flex flex-col gap-6">
      {options.map((option) => (
        <section key={option.key} className="flex flex-col gap-2">
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
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <Row Lead={option.Lead} />
          </div>
        </section>
      ))}
    </div>

    <div className="mt-8 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
      <b className="text-text-primary">My take:</b> <b>C</b> (single avatar +
      badge) is the most consistent — every notification then leads the same way
      and the row stays calm. If you want to keep visible social proof, <b>B</b>{' '}
      (overlapping stack) is the strongest “multiple people” option without the
      boxy grid. Tell me which to ship and I’ll wire it into the real lead.
    </div>
  </div>
);

export const Compare: Story = {
  name: 'Compare options',
  render: () => <Alternatives />,
};
