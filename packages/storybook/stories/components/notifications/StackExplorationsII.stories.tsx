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

// Stack explorations II — 20 MORE arrangements, more experimental than round 1.
// New/updated rules:
//   1. Always a stack of several rounded-square faces (never one).
//   2. Fixed 48px lead box — the text never shifts.
//   3. The upvote badge sits at the BOTTOM-RIGHT corner, same rounded-square
//      style as everywhere else.
// STORY-LOCAL ONLY.

const meta: Meta = {
  title: 'Components/Notifications/Stack explorations II',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '20 more avatar-stack arrangements, badge pinned bottom-right (rounded square). Fixed 48px lead so text never moves. Pick a number and I will wire it into the real lead.',
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
    src={img(`stk2-${seed}`, 64)}
    alt=""
    className={`${size} ${RING} ${className}`}
  />
);

// Rounded-square upvote badge, always bottom-right (matches the shared corner
// badge: -bottom-1 -right-1 with a background-default notch).
const Badge = () => (
  <span
    className={`absolute -bottom-1 -right-1 z-3 flex size-4 items-center justify-center rounded-8 border-2 border-background-default ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// Fixed 48px canvas so every lead has the same footprint.
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
  {
    n: 21,
    label: 'Trio overlap · badge BR',
    note: 'The baseline for this round: three faces overlapping, badge bottom-right.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-5" />
            ))}
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 22,
    label: 'Pinwheel',
    note: 'Four faces around the center, each tilted for a pinwheel spin.',
    render: () => (
      <Box>
        <span className="absolute left-1/2 top-0 -translate-x-1/2 rotate-[18deg]">
          <Face seed="ada" size="size-5" />
        </span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 rotate-[18deg]">
          <Face seed="bram" size="size-5" />
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-[18deg]">
          <Face seed="cleo" size="size-5" />
        </span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 rotate-[18deg]">
          <Face seed="dana" size="size-5" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 23,
    label: 'Honeycomb',
    note: 'Two faces up top, one tucked below between them — a tight hex cluster.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col items-center">
            <div className="flex -space-x-1">
              <Face seed="ada" size="size-5" />
              <Face seed="bram" size="size-5" />
            </div>
            <span className="-mt-1.5">
              <Face seed="cleo" size="size-5" />
            </span>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 24,
    label: 'Brick rows',
    note: 'Two rows of two, the bottom row offset like bricks.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <Face seed="ada" size="size-4" />
              <Face seed="bram" size="size-4" />
            </div>
            <div className="flex gap-0.5 pl-2">
              <Face seed="cleo" size="size-4" />
              <Face seed="dana" size="size-4" />
            </div>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 25,
    label: 'Plus / cross',
    note: 'Four faces arranged in a plus, open center.',
    render: () => (
      <Box>
        <span className="absolute left-1/2 top-0 -translate-x-1/2">
          <Face seed="ada" size="size-4" />
        </span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2">
          <Face seed="bram" size="size-4" />
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Face seed="cleo" size="size-4" />
        </span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <Face seed="dana" size="size-4" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 26,
    label: 'Picture-in-picture',
    note: 'A big lead face with a small one perched in the top-right.',
    render: () => (
      <Box>
        <Center>
          <Face seed="ada" size="size-9" />
        </Center>
        <span className="absolute right-0 top-0">
          <Face seed="bram" size="size-4" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 27,
    label: 'Deck peeking',
    note: 'Faces heavily overlapped so the deck peeks out on the left.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-4">
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
    n: 28,
    label: 'Leaning cards',
    note: 'Two faces skewed in opposite directions for a dynamic tilt.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2">
            <span className="skew-y-[-8deg]">
              <Face seed="ada" size="size-6" />
            </span>
            <span className="skew-y-[8deg]">
              <Face seed="bram" size="size-6" />
            </span>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 29,
    label: 'Framed pair',
    note: 'Faces sit inside a rounded surface frame; badge on the corner.',
    render: () => (
      <Box>
        <Center>
          <span className="flex gap-0.5 rounded-8 border border-border-subtlest-tertiary bg-surface-float p-0.5">
            <Face seed="ada" size="size-5" />
            <Face seed="bram" size="size-5" />
          </span>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 30,
    label: 'Totem column',
    note: 'Three faces stacked in a slim vertical column.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col -space-y-1.5">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-4" />
            ))}
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 31,
    label: 'L-shape',
    note: 'Faces trace an L along the left and bottom edges.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="ada" size="size-5" />
        </span>
        <span className="absolute bottom-0 left-0">
          <Face seed="bram" size="size-5" />
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Face seed="cleo" size="size-5" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 32,
    label: 'Photo scatter',
    note: 'Three faces tossed at small random angles like a photo pile.',
    render: () => (
      <Box>
        <span className="absolute left-1 top-1 rotate-[-10deg]">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute right-1 top-2 rotate-[9deg]">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rotate-[-4deg]">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge />
      </Box>
    ),
  },
  {
    n: 33,
    label: 'Hero + peekers',
    note: 'One big face in front with two small ones peeking over the top.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-0">
          <Face seed="bram" size="size-4" />
        </span>
        <span className="absolute right-0 top-0">
          <Face seed="cleo" size="size-4" />
        </span>
        <Center>
          <Face seed="ada" size="size-8" />
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 34,
    label: 'Perspective row',
    note: 'Faces grow left → right for a sense of depth.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-2">
            <Face seed="ada" size="size-4" />
            <Face seed="bram" size="size-5" />
            <Face seed="cleo" size="size-6" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 35,
    label: 'Quad grid',
    note: 'A clean 2×2 of four faces, badge bottom-right.',
    render: () => (
      <Box>
        <Center>
          <div className="grid grid-cols-2 gap-0.5">
            {SEEDS.slice(0, 4).map((s) => (
              <Face key={s} seed={s} size="size-5" />
            ))}
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 36,
    label: 'Fan downward',
    note: 'Three faces fanning down like a dealt hand.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2 pt-1">
            <span className="rotate-[14deg]">
              <Face seed="ada" size="size-5" />
            </span>
            <span>
              <Face seed="bram" size="size-5" />
            </span>
            <span className="rotate-[-14deg]">
              <Face seed="cleo" size="size-5" />
            </span>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 37,
    label: 'Rising diagonal',
    note: 'Faces climb from bottom-left to top-right.',
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
        <Badge />
      </Box>
    ),
  },
  {
    n: 38,
    label: 'Zigzag',
    note: 'An overlapping row where faces alternate up and down.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-2">
            <Face seed="ada" size="size-5" className="mt-2" />
            <Face seed="bram" size="size-5" className="mb-2" />
            <Face seed="cleo" size="size-5" className="mt-2" />
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 39,
    label: 'Crossed pair',
    note: 'Two faces rotated into an X for a bold, graphic mark.',
    render: () => (
      <Box>
        <Center>
          <div className="relative flex items-center justify-center">
            <span className="absolute rotate-45">
              <Face seed="ada" size="size-6" />
            </span>
            <span className="-rotate-45">
              <Face seed="bram" size="size-6" />
            </span>
          </div>
        </Center>
        <Badge />
      </Box>
    ),
  },
  {
    n: 40,
    label: 'Orbit',
    note: 'A center face with two small satellites at opposite corners.',
    render: () => (
      <Box>
        <Center>
          <Face seed="ada" size="size-7" />
        </Center>
        <span className="absolute right-0 top-0">
          <Face seed="bram" size="size-4" />
        </span>
        <span className="absolute bottom-0 left-0">
          <Face seed="cleo" size="size-4" />
        </span>
        <Badge />
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
      Stack explorations II — 20 more
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      More experimental arrangements, all with the upvote badge pinned
      bottom-right (rounded square, like the reference). Same guarantees: always
      a stack of several rounded-square faces, always inside a fixed 48px lead
      so the text never moves. Numbers continue from the first page (21–40).
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
  name: '20 more (badge bottom-right)',
  render: () => <Explorations />,
};
