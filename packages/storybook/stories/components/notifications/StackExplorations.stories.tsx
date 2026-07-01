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

// Stack explorations — 20 distinct ways to show a STACK of avatars with the
// green upvote badge sitting ABOVE the stack. Every variant obeys three rules:
//   1. It's a stack of several images (never one).
//   2. It lives inside a FIXED 48px lead box — it can't overlap the text or
//      push it to the right, no matter the arrangement.
//   3. The green upvote badge sits above / on top of the stack.
// All faces are rounded squares (the chosen direction). STORY-LOCAL ONLY.

const meta: Meta = {
  title: 'Components/Notifications/Stack explorations',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '20 different avatar-stack arrangements with the upvote badge above, all rounded squares, all inside a fixed 48px lead so the text never shifts. Pick the number you like and I will wire it into the real NotificationItem lead.',
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
const SEEDS = ['ada', 'bram', 'cleo', 'dana', 'eli'];
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
    src={img(`stk-${seed}`, 64)}
    alt=""
    className={`${size} ${RING} ${className}`}
  />
);

// Rounded-square upvote badge (matches the new badge shape).
const Badge = ({
  size = 'size-4',
  className = '',
}: {
  size?: string;
  className?: string;
}) => (
  <span
    className={`flex ${size} items-center justify-center rounded-8 border-2 border-background-default ${upvote.bg} ${className}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// A "+N" chip in the badge shape/color, for count-carrying variants.
const CountChip = ({
  n,
  className = '',
}: {
  n: number;
  className?: string;
}) => (
  <span
    className={`flex h-4 min-w-4 items-center justify-center rounded-8 border-2 border-background-default px-1 font-bold typo-caption2 ${upvote.bg} ${upvote.fg} ${className}`}
  >
    +{n}
  </span>
);

// Fixed 48px canvas — every variant renders inside this, so the lead footprint
// is identical and the text can never be pushed.
const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="relative size-12">{children}</div>
);
const Center = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    {children}
  </div>
);

// ---- 20 variants ----------------------------------------------------------

const leads: Array<{
  n: number;
  label: string;
  note: string;
  render: () => React.ReactElement;
}> = [
  {
    n: 1,
    label: 'Duo overlap · badge top-left',
    note: 'Two faces overlapping horizontally, badge on the top-left corner (the reference image).',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
          </div>
        </Center>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 2,
    label: 'Trio overlap · badge top-left',
    note: 'Three faces overlapping in a row, badge top-left.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-5" />
            ))}
          </div>
        </Center>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 3,
    label: 'Vertical stack · badge top-center',
    note: 'Two faces stacked vertically, badge centered on top.',
    render: () => (
      <Box>
        <Center>
          <div className="flex flex-col -space-y-2">
            <Face seed="ada" size="size-7" />
            <Face seed="bram" size="size-7" />
          </div>
        </Center>
        <Badge className="absolute left-1/2 top-0 z-3 -translate-x-1/2" />
      </Box>
    ),
  },
  {
    n: 4,
    label: 'Diagonal cascade · badge top-left',
    note: 'Three faces cascading top-left → bottom-right, badge over the first.',
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
        <Badge className="absolute -left-1 -top-1 z-3" />
      </Box>
    ),
  },
  {
    n: 5,
    label: 'Fanned cards · badge top-center',
    note: 'Three faces fanned like a hand of cards, badge above the center.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-2">
            <span className="rotate-[-14deg]">
              <Face seed="ada" size="size-5" />
            </span>
            <span className="z-2">
              <Face seed="bram" size="size-5" />
            </span>
            <span className="rotate-[14deg]">
              <Face seed="cleo" size="size-5" />
            </span>
          </div>
        </Center>
        <Badge className="absolute left-1/2 top-0 z-3 -translate-x-1/2" />
      </Box>
    ),
  },
  {
    n: 6,
    label: 'Triangle · badge top-center',
    note: 'Two faces on top, one below, badge nested above the pair.',
    render: () => (
      <Box>
        <span className="absolute left-0 top-1">
          <Face seed="ada" size="size-5" />
        </span>
        <span className="absolute right-0 top-1">
          <Face seed="cleo" size="size-5" />
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Face seed="bram" size="size-5" />
        </span>
        <Badge className="absolute left-1/2 top-0 z-3 -translate-x-1/2" />
      </Box>
    ),
  },
  {
    n: 7,
    label: 'Diamond · badge is the top point',
    note: 'Three faces (left, right, bottom) with the badge as the top point.',
    render: () => (
      <Box>
        <Badge
          size="size-5"
          className="absolute left-1/2 top-0 z-3 -translate-x-1/2"
        />
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <Face seed="ada" size="size-5" />
        </span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2">
          <Face seed="bram" size="size-5" />
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Face seed="cleo" size="size-5" />
        </span>
      </Box>
    ),
  },
  {
    n: 8,
    label: 'Coin stack · badge top',
    note: 'Faces offset like stacked coins (down-right), badge top-left.',
    render: () => (
      <Box>
        <span className="absolute left-1 top-1">
          <Face seed="ada" size="size-6" />
        </span>
        <span className="absolute left-2.5 top-2.5">
          <Face seed="bram" size="size-6" />
        </span>
        <span className="absolute left-4 top-4">
          <Face seed="cleo" size="size-6" />
        </span>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 9,
    label: 'Depth stack · badge top-left',
    note: 'A smaller face behind a bigger one (depth), badge top-left.',
    render: () => (
      <Box>
        <span className="absolute right-1 top-2">
          <Face seed="bram" size="size-5" className="opacity-90" />
        </span>
        <span className="absolute bottom-1 left-1">
          <Face seed="ada" size="size-8" />
        </span>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 10,
    label: '2×2 grid · badge top-left',
    note: 'Four faces in a tight grid, badge overlapping the top-left.',
    render: () => (
      <Box>
        <Center>
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
            {SEEDS.slice(0, 4).map((s) => (
              <Face key={s} seed={s} size="size-5" />
            ))}
          </div>
        </Center>
        <Badge className="absolute -left-1 -top-1 z-3" />
      </Box>
    ),
  },
  {
    n: 11,
    label: 'Arc · badge top-center',
    note: 'Three faces along a shallow arc (smile), badge above the peak.',
    render: () => (
      <Box>
        <span className="absolute bottom-1 left-0">
          <Face seed="ada" size="size-5" />
        </span>
        <span className="absolute left-1/2 top-2 -translate-x-1/2">
          <Face seed="bram" size="size-5" />
        </span>
        <span className="absolute bottom-1 right-0">
          <Face seed="cleo" size="size-5" />
        </span>
        <Badge className="absolute left-1/2 top-0 z-3 -translate-x-1/2" />
      </Box>
    ),
  },
  {
    n: 12,
    label: 'Heavy overlap · badge top-right',
    note: 'Three faces heavily overlapped into a tight cluster, badge top-right.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-4">
            {SEEDS.slice(0, 3).map((s) => (
              <Face key={s} seed={s} size="size-7" />
            ))}
          </div>
        </Center>
        <Badge className="absolute right-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 13,
    label: 'Row + badge floating above',
    note: 'A tidy row of small faces with the badge floating separately above (no overlap).',
    render: () => (
      <Box>
        <Badge className="absolute left-1/2 top-0 z-3 -translate-x-1/2" />
        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
          {SEEDS.slice(0, 3).map((s) => (
            <Face key={s} seed={s} size="size-5" />
          ))}
        </div>
      </Box>
    ),
  },
  {
    n: 14,
    label: 'Pill container · badge top-left',
    note: 'Two faces inside a rounded surface pill, badge on the corner.',
    render: () => (
      <Box>
        <Center>
          <span className="flex items-center gap-0.5 rounded-8 bg-surface-float p-1">
            <Face seed="ada" size="size-5" />
            <Face seed="bram" size="size-5" />
          </span>
        </Center>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 15,
    label: 'Duo + “+N” · badge top',
    note: 'Two faces + a “+N” chip as the third tile, badge top-left.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-center -space-x-2">
            <Face seed="ada" size="size-6" />
            <Face seed="bram" size="size-6" />
            <CountChip n={22} className="relative z-2 h-6 min-w-6" />
          </div>
        </Center>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 16,
    label: 'Isometric cascade · badge top-left',
    note: 'Faces stepping up-and-to-the-right, badge over the lowest one.',
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
        <Badge className="absolute -bottom-1 -left-1 z-3" />
      </Box>
    ),
  },
  {
    n: 17,
    label: 'Side-by-side · badge bridging top',
    note: 'Two faces side by side with the badge straddling the top seam.',
    render: () => (
      <Box>
        <Center>
          <div className="flex gap-0.5">
            <Face seed="ada" size="size-6" />
            <Face seed="bram" size="size-6" />
          </div>
        </Center>
        <Badge className="absolute left-1/2 top-1 z-3 -translate-x-1/2" />
      </Box>
    ),
  },
  {
    n: 18,
    label: 'Nested sizes · badge top',
    note: 'Three faces of different sizes packed together, badge top-left.',
    render: () => (
      <Box>
        <span className="absolute bottom-0 left-0">
          <Face seed="ada" size="size-7" />
        </span>
        <span className="absolute right-0 top-1">
          <Face seed="bram" size="size-5" />
        </span>
        <span className="absolute bottom-0 right-1">
          <Face seed="cleo" size="size-4" />
        </span>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 19,
    label: 'Staggered heights · badge top',
    note: 'Overlapping row where faces sit at different heights, badge top-left.',
    render: () => (
      <Box>
        <Center>
          <div className="flex items-end -space-x-2">
            <Face seed="ada" size="size-6" className="mb-2" />
            <Face seed="bram" size="size-6" />
            <Face seed="cleo" size="size-6" className="mb-3" />
          </div>
        </Center>
        <Badge className="absolute left-0 top-0 z-3" />
      </Box>
    ),
  },
  {
    n: 20,
    label: 'Badge-hat · centered on top edge',
    note: 'Two overlapping faces with the badge sitting like a hat on the top edge.',
    render: () => (
      <Box>
        <Center>
          <div className="flex -space-x-3">
            <Face seed="ada" size="size-8" />
            <Face seed="bram" size="size-8" />
          </div>
        </Center>
        <Badge
          size="size-5"
          className="absolute left-1/2 top-0 z-3 -translate-x-1/2 -translate-y-1/2"
        />
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
      Stack explorations — 20 variants
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Twenty ways to stack the avatars with the green upvote badge above. Rules:
      always a stack of several rounded-square faces, always inside a fixed 48px
      lead (the text never moves), and the badge always sits above the stack.
      Tell me the number and I’ll wire it into the real notification lead.
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
  name: '20 variants',
  render: () => <Explorations />,
};
