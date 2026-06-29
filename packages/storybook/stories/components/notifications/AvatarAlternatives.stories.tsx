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

// Round 4 — variations on the "diamond cluster" (the chosen direction), each
// rendered with circular faces AND rounded-square faces so the shape can be
// compared directly. Same rules: never overlap the text/layout, always show
// several faces. STORY-LOCAL ONLY.

const meta: Meta = {
  title: 'Components/Notifications/Avatar alternatives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Variations of the diamond cluster, shown with circular vs rounded-square faces. Pick a variation + a face shape and I will wire it into the real NotificationItem lead.',
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

type Shape = 'circle' | 'square';
const radius = (shape: Shape) =>
  shape === 'square' ? 'rounded-8' : 'rounded-full';

const Face = ({
  seed,
  size,
  shape,
}: {
  seed: string;
  size: string;
  shape: Shape;
}) => (
  <img
    src={img(`alt-${seed}`, 64)}
    alt=""
    className={`${size} ${radius(
      shape,
    )} border-2 border-background-default object-cover`}
  />
);

// The upvote mark, shape-matched so the whole cluster stays cohesive.
const Mark = ({
  size,
  shape,
  className = '',
}: {
  size: string;
  shape: Shape;
  className?: string;
}) => (
  <span
    className={`flex ${size} items-center justify-center ${radius(
      shape,
    )} border-2 border-background-default ${upvote.bg} ${className}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// --- 4A · Triad + mark: 3 faces (top, left, right) + the upvote mark at the
// bottom point. The original diamond.
const DiamondTriad = (shape: Shape) => (
  <div className="relative size-10">
    <span className="absolute left-1/2 top-0 -translate-x-1/2">
      <Face seed="ada" size="size-5" shape={shape} />
    </span>
    <span className="absolute left-0 top-1/2 -translate-y-1/2">
      <Face seed="bram" size="size-5" shape={shape} />
    </span>
    <span className="absolute right-0 top-1/2 -translate-y-1/2">
      <Face seed="cleo" size="size-5" shape={shape} />
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <Mark size="size-5" shape={shape} />
    </span>
  </div>
);

// --- 4B · Quad + center hub: 4 faces in the diamond, the upvote mark in the
// middle. Shows the most faces.
const DiamondQuad = (shape: Shape) => (
  <div className="relative size-10">
    <span className="absolute left-1/2 top-0 -translate-x-1/2">
      <Face seed="ada" size="size-5" shape={shape} />
    </span>
    <span className="absolute left-0 top-1/2 -translate-y-1/2">
      <Face seed="bram" size="size-5" shape={shape} />
    </span>
    <span className="absolute right-0 top-1/2 -translate-y-1/2">
      <Face seed="cleo" size="size-5" shape={shape} />
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <Face seed="dana" size="size-5" shape={shape} />
    </span>
    <span className="absolute left-1/2 top-1/2 z-3 -translate-x-1/2 -translate-y-1/2">
      <Mark size="size-4" shape={shape} />
    </span>
  </div>
);

// --- 4C · Triad + "+N": 3 faces + a count chip at the bottom point (carries
// the number for big milestones).
const DiamondCount = (shape: Shape, total: number) => (
  <div className="relative size-10">
    <span className="absolute left-1/2 top-0 -translate-x-1/2">
      <Face seed="ada" size="size-5" shape={shape} />
    </span>
    <span className="absolute left-0 top-1/2 -translate-y-1/2">
      <Face seed="bram" size="size-5" shape={shape} />
    </span>
    <span className="absolute right-0 top-1/2 -translate-y-1/2">
      <Face seed="cleo" size="size-5" shape={shape} />
    </span>
    <span
      className={`absolute bottom-0 left-1/2 flex h-5 min-w-5 -translate-x-1/2 items-center justify-center border-2 border-background-default px-1 font-bold typo-caption2 ${radius(
        shape,
      )} ${upvote.bg} ${upvote.fg}`}
    >
      +{total - 3}
    </span>
  </div>
);

// --- 4D · Loose quad: 4 smaller faces with more separation (less overlap) +
// corner mark. Reads as four distinct people.
const DiamondLoose = (shape: Shape) => (
  <div className="relative size-10">
    <span className="absolute left-1/2 top-0 -translate-x-1/2">
      <Face seed="ada" size="size-4" shape={shape} />
    </span>
    <span className="absolute left-0 top-1/2 -translate-y-1/2">
      <Face seed="bram" size="size-4" shape={shape} />
    </span>
    <span className="absolute right-0 top-1/2 -translate-y-1/2">
      <Face seed="cleo" size="size-4" shape={shape} />
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <Face seed="dana" size="size-4" shape={shape} />
    </span>
    <Mark
      size="size-4"
      shape={shape}
      className="absolute -bottom-1 -right-1 z-3"
    />
  </div>
);

interface Variant {
  key: string;
  label: string;
  note: string;
  recommended?: boolean;
  lead: (shape: Shape) => React.ReactElement;
}

const variants: Variant[] = [
  {
    key: '4A',
    label: '4A · Triad + mark',
    note: 'Three faces with the upvote mark as the fourth point — the original diamond. Count stays in the title.',
    recommended: true,
    lead: (shape) => DiamondTriad(shape),
  },
  {
    key: '4B',
    label: '4B · Quad + center hub',
    note: 'Four faces around a central upvote hub. The most faces, with the mark anchoring the middle.',
    recommended: true,
    lead: (shape) => DiamondQuad(shape),
  },
  {
    key: '4C',
    label: '4C · Triad + “+N”',
    note: 'Three faces + a count chip at the bottom point — carries the exact number for big milestones.',
    lead: (shape) => DiamondCount(shape, 24),
  },
  {
    key: '4D',
    label: '4D · Loose quad',
    note: 'Four smaller faces with more breathing room (less overlap) and the mark tucked in the corner — reads as four distinct people.',
    lead: (shape) => DiamondLoose(shape),
  },
];

const Row = ({ lead }: { lead: React.ReactNode }) => (
  <div className="flex min-h-16 flex-row items-start gap-3 bg-background-default px-4 py-3">
    <div className="flex w-10 shrink-0 items-start justify-start">{lead}</div>
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

const ShapeColumn = ({
  caption,
  lead,
}: {
  caption: string;
  lead: React.ReactElement;
}) => (
  <div className="flex flex-1 flex-col gap-2">
    <span className="text-text-quaternary typo-caption1">{caption}</span>
    <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
      <Row lead={lead} />
    </div>
  </div>
);

const Alternatives = (): React.ReactElement => (
  <div className="mx-auto max-w-[48rem] p-6">
    <h1 className="font-bold text-text-primary typo-title2">
      Diamond cluster — variations & face shape
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Building on #4. Each variation is shown with <b>circular</b> faces (left)
      and <b>rounded-square</b> faces (right) so you can judge the shape. All
      stay inside the lead box and show several people.
    </p>

    <div className="mt-6 flex flex-col gap-8">
      {variants.map((variant) => (
        <section key={variant.key} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-text-primary typo-title3">
              {variant.label}
            </h2>
            {variant.recommended && (
              <span className="rounded-6 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-black typo-caption2">
                recommended
              </span>
            )}
          </div>
          <p className="text-text-tertiary typo-footnote">{variant.note}</p>
          <div className="flex flex-col gap-3 tablet:flex-row">
            <ShapeColumn caption="Circles" lead={variant.lead('circle')} />
            <ShapeColumn
              caption="Rounded squares"
              lead={variant.lead('square')}
            />
          </div>
        </section>
      ))}
    </div>

    <div className="mt-8 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
      <b className="text-text-primary">My take:</b> <b>4B</b> (quad + center
      hub) is the strongest evolution — four faces and the upvote mark anchored
      in the middle. On shape, <b>rounded-squares</b> give the cluster a
      tighter, more deliberate “app icon” feel and the diamond points read
      cleaner; circles feel softer and more social. Tell me the variation +
      shape and I’ll wire it into the real lead and the in-app popup.
    </div>
  </div>
);

export const Compare: Story = {
  name: 'Compare options',
  render: () => <Alternatives />,
};
