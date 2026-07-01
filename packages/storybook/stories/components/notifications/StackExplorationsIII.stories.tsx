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

// Stack explorations III — variations on the three favorites: #4 diagonal
// cascade, #12 heavy overlap, #16 isometric. Fixes from feedback:
//   • Badge is a clear ROUNDED RECTANGLE (size-5 + rounded-8, same proportion
//     as the faces) — not the near-circle the size-4 badge collapsed into.
//   • Faces are BIGGER (size-6 / size-7).
// Rules still hold: a stack of several rounded-square faces, fixed 48px lead so
// the text never moves. STORY-LOCAL ONLY.

const meta: Meta = {
  title: 'Components/Notifications/Stack explorations III',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Variations on #4 (diagonal cascade), #12 (heavy overlap) and #16 (isometric), with bigger faces and a rounded-rectangle badge. Pick a number and I will wire it into the real lead.',
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
const RING = 'rounded-8 border-2 border-background-default object-cover';

const Face = ({
  seed,
  size,
  className = '',
}: {
  seed: string;
  size: string;
  className?: string;
}) => (
  <img
    src={img(`stk3-${seed}`, 80)}
    alt=""
    className={`${size} ${RING} ${className}`}
  />
);

type Pos = 'br' | 'tr' | 'tl' | 'bl';
const posClass: Record<Pos, string> = {
  br: '-bottom-1 -right-1',
  tr: '-top-1 -right-1',
  tl: '-top-1 -left-1',
  bl: '-bottom-1 -left-1',
};

// Badge whose CENTER sits exactly on the bottom-right corner of its parent
// (wrap the front face in `relative` and drop this inside it).
const CornerCenteredBadge = () => (
  <span
    className={`absolute bottom-0 right-0 z-3 flex size-5 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-8 border-2 border-background-default ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// Rounded-RECTANGLE upvote badge (size-5 + rounded-8 = same corner proportion
// as the faces, so it reads as a rounded square, not a circle).
const Badge = ({ pos = 'br' as Pos }: { pos?: Pos }) => (
  <span
    className={`absolute ${posClass[pos]} z-3 flex size-5 items-center justify-center rounded-8 border-2 border-background-default ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

const CountTile = ({ n, size }: { n: number; size: string }) => (
  <span
    className={`flex ${size} items-center justify-center rounded-8 border-2 border-background-default px-1 font-bold typo-caption2 ${upvote.bg} ${upvote.fg}`}
  >
    +{n}
  </span>
);

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="relative size-12">{children}</div>
);
const Center = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    {children}
  </div>
);

const leads: Array<{
  n: number;
  label: string;
  note: string;
  render: () => React.ReactElement;
}> = [
  // ---- Heavy overlap family (from #12) ----
  {
    n: 41,
    label: 'Overlap duo (big) · BR',
    note: 'Two large faces overlapping, rounded-rect badge bottom-right.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-3">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 42,
    label: 'Overlap trio · BR',
    note: 'Three big faces overlapping in a row.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-3">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-6" />
            ))}
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 43,
    label: 'Tight overlap trio · TR',
    note: 'Heavier overlap into a tight cluster, badge top-right.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-5">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-7" />
            ))}
          </div>
        </Center>
        <Badge pos="tr" />
      </Box>
    ),
  },
  {
    n: 44,
    label: 'Overlap duo · TL',
    note: 'Two big faces, badge tucked top-left.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-3">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
          </div>
        </Center>
        <Badge pos="tl" />
      </Box>
    ),
  },
  // ---- Diagonal cascade family (from #4) ----
  {
    n: 45,
    label: 'Cascade trio ↘ · BR',
    note: 'Three big faces cascading top-left → bottom-right.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-0 right-0">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 46,
    label: 'Cascade duo ↘ · BR',
    note: 'Two large faces on a diagonal, lots of presence.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-7" />
        </span>
        <span className="absolute bottom-0 right-0">
          <Face seed="bram" size="size-7" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 47,
    label: 'Rising cascade ↗ · TR',
    note: 'Three faces climbing bottom-left → top-right, badge top-right.',
    render: () => (
      <Box>
        <span className="absolute bottom-0 left-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute right-0 top-0">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge pos="tr" />
      </Box>
    ),
  },
  {
    n: 48,
    label: 'Cascade + “+N” tail · BR',
    note: 'A two-face diagonal capped by a “+N” tile continuing the line.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-0 right-0">
          <CountTile n={22} size="size-6" />
        </span>
        <Badge pos="tl" />
      </Box>
    ),
  },
  // ---- Isometric family (from #16) ----
  {
    n: 49,
    label: 'Isometric ↗ · BL',
    note: 'Faces stepping up-and-right, badge bottom-left.',
    render: () => (
      <Box>
        <span className="absolute bottom-0 left-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute bottom-2 left-3">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-4 left-6">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge pos="bl" />
      </Box>
    ),
  },
  {
    n: 50,
    label: 'Isometric ↗ · BR',
    note: 'Same up-right steps with the badge bottom-right.',
    render: () => (
      <Box>
        <span className="absolute bottom-0 left-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute bottom-2 left-3">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-4 left-6">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 51,
    label: 'Descending stairs ↘ · TR',
    note: 'Faces stepping down-and-right, badge top-right.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-3 top-2">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute left-6 top-4">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge pos="tr" />
      </Box>
    ),
  },
  // ---- Variations / combos ----
  {
    n: 52,
    label: 'Photo pile (big, tilted) · BR',
    note: 'Overlap trio with slight tilts, like tossed photos.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-1 rotate-[-8deg]">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-1/2 top-0 -translate-x-1/2">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-0 right-1 rotate-[8deg]">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 53,
    label: 'Perspective row · BR',
    note: 'Faces grow left → right for depth (biggest in front).',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-2">
            <Face seed="ada" size="size-5" />
            <Face seed="bram" size="size-6" />
            <Face seed="cleo" size="size-7" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 54,
    label: 'Vertical overlap (big) · BR',
    note: 'Two large faces stacked vertically.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col -space-y-3">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 55,
    label: 'Hero + peeker · BR',
    note: 'One big lead face with a second peeking behind the top-right.',
    render: () => (
      <Box>
        <span className="absolute right-0 top-0">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-0 left-0">
          <Face seed="ada" size="size-8" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 56,
    label: 'Overlap trio + “+N” · BR',
    note: 'Three big faces plus a “+N” tile as the fourth.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-3">
            <Face seed="ada" size="size-6" />
            <Face seed="bram" size="size-6" />
            <CountTile n={21} size="size-6" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 57,
    label: 'Fanned big cards · BR',
    note: 'Three big faces fanned with a gentle rotation.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-4">
            <span className="rotate-[-10deg]">
              <Face seed="ada" size="size-6" />
            </span>
            <span className="z-2">
              <Face seed="bram" size="size-6" />
            </span>
            <span className="rotate-[10deg]">
              <Face seed="cleo" size="size-6" />
            </span>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 58,
    label: 'Brick rows (big) · BR',
    note: 'Two offset rows of big faces.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <Face seed="ada" size="size-5" />
              <Face seed="bram" size="size-5" />
            </div>
            <div className="flex gap-0.5 pl-2">
              <Face seed="cleo" size="size-5" />
              <Face seed="dana" size="size-5" />
            </div>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 59,
    label: 'Front hero overlap · BR',
    note: 'Overlap where the front face is scaled up to lead.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-3">
            <Face seed="ada" size="size-5" className="opacity-90" />
            <Face seed="bram" size="size-7" className="z-2" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 60,
    label: 'Steep cascade ↘ (big) · BR',
    note: 'A tighter, steeper diagonal of two big faces + a third small step.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-7" />
        </span>
        <span className="absolute bottom-0 right-1">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-0 left-0">
          <Face seed="cleo" size="size-4" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 61,
    label: 'Tight overlap trio · badge centered on corner',
    note: 'Variation of #43 — the badge’s center sits exactly on the bottom-right corner of the front profile image (straddling it).',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-5">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
            <span className="relative z-2">
              <Face seed="cleo" size="size-7" />
              <CornerCenteredBadge />
            </span>
          </div>
        </Center>
      </Box>
    ),
  },
];

const Row = ({ lead }: { lead: React.ReactNode }) => (
  <div className="flex min-h-16 flex-row items-start gap-3 bg-background-default px-4 py-3">
    <div className="flex w-12 shrink-0 items-start justify-center">{lead}</div>
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

const Explorations = (): React.ReactElement => (
  <div className="mx-auto max-w-[44rem] p-6">
    <h1 className="font-bold text-text-primary typo-title2">
      Stack explorations III — bigger faces, rounded-rect badge
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Twenty variations on your three favorites — #4 (diagonal cascade), #12
      (heavy overlap) and #16 (isometric) — with larger rounded-square faces and
      a rounded-rectangle upvote badge (no longer a near-circle). Fixed 48px
      lead, so the text never moves. Numbers 41–60.
    </p>

    <div className="mt-6 flex flex-col gap-6">
      {leads.map((lead) => (
        <section key={lead.n} className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-text-primary typo-callout">
              {lead.n}.
            </span>
            <h2 className="font-bold text-text-primary typo-callout">
              {lead.label}
            </h2>
          </div>
          <p className="text-text-tertiary typo-footnote">{lead.note}</p>
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <Row lead={lead.render()} />
          </div>
        </section>
      ))}
    </div>
  </div>
);

export const Compare: Story = {
  name: '20 more (bigger faces + rounded-rect badge)',
  render: () => <Explorations />,
};
