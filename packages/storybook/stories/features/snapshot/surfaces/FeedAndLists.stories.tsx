import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DownvoteIcon,
  MenuIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Control,
  Device,
  OverflowMenu,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'today' | 'row' | 'lead';

/* -------------------------------------------------------------- hot takes */

const TAKES = [
  {
    emoji: '🔥',
    title: 'Microservices were a mistake for most teams',
    subtitle: 'Distributed systems are a tax, not a feature',
    upvotes: 128,
  },
  {
    emoji: '🧊',
    title: 'Code review is mostly theatre',
    subtitle: 'Two approvals, forty seconds of reading',
    upvotes: 64,
  },
];

/**
 * HotTakeItem: a surface-float row with a 48px emoji tile, title and
 * subtitle, then the upvote counter. Edit and delete are owner-only and
 * hover-revealed. There is no menu on this row and no author avatar.
 */
const HotTakeRow = ({
  take,
  spot,
}: {
  take: (typeof TAKES)[number];
  spot: Spot;
}) => (
  <div className="group relative flex items-center gap-4 rounded-16 bg-surface-float p-4">
    <div className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-overlay-quaternary-cabbage">
      <span className="text-2xl">{take.emoji}</span>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-bold text-text-primary typo-body">
        {take.title}
      </span>
      <span className="text-text-tertiary typo-footnote">{take.subtitle}</span>
    </div>
    <div className="flex items-center gap-1">
      {spot === 'row' && (
        <Control action="Snapshot" size={ButtonSize.XSmall} />
      )}
      {spot === 'lead' && (
        <Control
          action="Snapshot"
          label
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
        />
      )}
      <Button
        icon={<UpvoteIcon />}
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
      >
        {take.upvotes}
      </Button>
    </div>
  </div>
);

const HotTakesScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <span className="font-bold text-text-primary typo-title3">Hot takes</span>
      {TAKES.map((take) => (
        <HotTakeRow key={take.title} spot={spot} take={take} />
      ))}
    </div>
  </Device>
);

/* -------------------------------------------------------- reading history */

const HISTORY = [
  'Why iconic tech brands lost their dominance',
  'The case against microservices',
  'Postgres is all you need, again',
];

/**
 * PostItemCard: a 64px thumbnail with the source avatar overlapping its
 * bottom-left, a two-line title, metadata, then vote buttons and the ⋯ menu.
 * The vote buttons and the hide X are `hidden laptop:flex`.
 */
const HistoryRow = ({
  title,
  device,
  spot,
  menu,
}: {
  title: string;
  device: DeviceName;
  spot: Spot;
  menu?: boolean;
}) => (
  <div className="relative flex items-center rounded-16 px-2 py-3">
    <div className="relative">
      <div className="size-16 rounded-16 bg-surface-float" />
      <img
        alt=""
        className="absolute -bottom-1 left-6 size-6 rounded-full border-2 border-background-default object-cover"
        src={AVATAR}
      />
    </div>
    <div className="ml-4 flex min-w-0 flex-1 flex-col">
      <h3 className="mr-6 line-clamp-2 break-words text-left text-text-primary typo-callout">
        {title}
      </h3>
      <span className="text-text-tertiary typo-footnote">
        4 min read · 128 upvotes
      </span>
    </div>
    <div className="ml-4 flex items-center">
      {device === 'Desktop' && (
        <>
          <Button
            aria-label="Upvote"
            icon={<UpvoteIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <Button
            aria-label="Downvote"
            icon={<DownvoteIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </>
      )}
      {spot === 'row' && <Control action="Link" />}
      {spot === 'lead' && (
        <Control action="Link" label variant={ButtonVariant.Secondary} />
      )}
      <div className="relative">
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {menu && (
          <OverflowMenu
            className="right-0 top-9"
            highlight="Share post via..."
            items={[
              'Share post via...',
              'Save to bookmarks',
              'Remove post',
            ]}
          />
        )}
      </div>
    </div>
  </div>
);

const HistoryScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => (
  <Device name={device}>
    <div className="flex flex-col p-4">
      <span className="mb-2 font-bold text-text-primary typo-title3">
        Reading history
      </span>
      {HISTORY.map((title, index) => (
        <HistoryRow
          key={title}
          device={device}
          menu={spot === 'today' && index === 0}
          spot={spot}
          title={title}
        />
      ))}
    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const Rails = ({
  Screen,
  spot,
}: {
  Screen: React.ComponentType<{ device: DeviceName; spot: Spot }>;
  spot: Spot;
}) => (
  <Rail>
    <Screen device="Desktop" spot={spot} />
    <Screen device="Tablet" spot={spot} />
    <Screen device="Mobile" spot={spot} />
  </Rail>
);

const FeedAndLists = () => (
  <SurfacePage
    intro="Two lists that are not feeds. A hot take is a self-contained opinion with nowhere to link to; a reading-history row is a pointer back to a post. Feed cards are covered on the post page and left out here."
    map="Sharing map: Snapshot leads on hot takes (#6365) — an opinion is quotable and the row is the whole payload. Copy link leads on reading history (#6361), where each row is just a post."
    title="Hot takes & reading history"
  >
    <Category
      covers="HotTakeItem.tsx"
      title="Hot takes"
      verdict="Corrected: the row is an emoji tile, a title, a subtitle and an upvote counter. There is no ⋯ menu, no author avatar and no ‘HOT TAKE’ label — which means this is the only list in the product with no share route at all, not even a buried one. Edit and delete exist but are owner-only and hover-revealed."
    >
      <Variant
        headline="Nothing to share, and no menu to bury it in"
        note="The most quotable content in the product. The only interactive control on a non-owner's view is the upvote."
        step="Today"
      >
        <Rails Screen={HotTakesScreen} spot="today" />
      </Variant>
      <Variant
        headline="Snapshot beside the upvote"
        note="Recommended. XSmall to match the upvote counter it sits next to, and placed before it so the count stays at the edge where the eye expects it."
        step="Recommended"
      >
        <Rails Screen={HotTakesScreen} spot="row" />
      </Variant>
      <Variant
        headline="Snapshot labeled and filled"
        note="Hot takes are where snapshot has the clearest right to lead, so this is the lowest-risk place to test the loudest treatment. The row has the width for it."
        step="Push"
      >
        <Rails Screen={HotTakesScreen} spot="lead" />
      </Variant>
    </Category>

    <Category
      covers="PostItemCard.tsx · ReadingHistoryOptionsMenu.tsx"
      title="Reading history"
      verdict="Each row is just a post, so the payload question never arises — only reach does. The ⋯ leads with ‘Share post via...’, and the vote buttons beside it are `hidden laptop:flex`, so the row is already three different widths."
    >
      <Variant
        headline="⋯ → Share post via..."
        note="A 64px thumbnail with the source avatar overlapping it, a two-line title, then votes and the menu. Sharing is two taps and the wording differs from every other menu in the product."
        step="Today"
      >
        <Rails Screen={HistoryScreen} spot="today" />
      </Variant>
      <Variant
        headline="Copy link before the menu"
        note="Recommended, and always visible rather than hover-gated: this row already drops its vote buttons below laptop, so a hover-only control would leave mobile with nothing but the menu."
        step="Recommended"
      >
        <Rails Screen={HistoryScreen} spot="row" />
      </Variant>
      <Variant
        headline="Labeled copy link"
        note="On a utilitarian list the noise is affordable, but it makes the row wider than the thumbnail needs and pushes the title into a third line on mobile."
        step="Push"
      >
        <Rails Screen={HistoryScreen} spot="lead" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof FeedAndLists> = {
  title: 'Features/Snapshot/Surfaces/Hot takes & history',
  component: FeedAndLists,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof FeedAndLists> = {};
