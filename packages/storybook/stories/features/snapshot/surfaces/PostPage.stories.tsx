import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  CopyIcon,
  DiscussIcon,
  DownvoteIcon,
  LinkIcon,
  MenuIcon,
  OpenLinkIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { Device } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Control,
  DeviceFrame,
  DeviceRail,
  DEVICES,
  OverflowMenu,
  POST_MENU,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'today' | 'selection' | 'endband' | 'upvote';

const TITLE = 'Why iconic tech brands lost their dominance';

const SUMMARY =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn: they optimised the product they had instead of the one their customers were moving to.';

const TAGS = ['tech', 'business', 'startups'];

const isCompact = (device: Device) => device !== 'desktop';

/* Source row. PostHeaderActions is `hidden laptop:flex`, so Read post and the
   ⋯ menu only exist on desktop; below that the Follow link takes their place. */
const SourceRow = ({
  device,
  menu,
}: {
  device: Device;
  menu?: boolean;
}) => (
  <div className="relative flex items-center gap-2 text-text-tertiary typo-footnote">
    <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
    <a className="text-text-secondary typo-callout" href="#s">
      XDA Developers
    </a>
    {isCompact(device) ? (
      <>
        <span className="text-text-quaternary">·</span>
        <span className="text-text-link">Follow</span>
      </>
    ) : (
      <div className="ml-auto flex items-center gap-2">
        <Button
          icon={<OpenLinkIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          Read post
        </Button>
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>
    )}
    {menu && <OverflowMenu highlight="Share via" items={POST_MENU} />}
  </div>
);

const Tags = () => (
  <ul className="flex flex-wrap gap-2">
    {TAGS.map((tag) => (
      <li
        key={tag}
        className="inline-flex h-6 items-center rounded-8 bg-surface-float px-2 text-text-tertiary typo-caption1"
      >
        #{tag}
      </li>
    ))}
  </ul>
);

/* The production engagement bar: a bordered pill, labels on everything but
   the votes, and Copy — not Share — as the last action. */
const ActionBar = ({ device }: { device: Device }) => {
  const labels = !isCompact(device);

  return (
    <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
      <div className="flex flex-1 items-center justify-between gap-x-1 overflow-hidden py-2 pl-4 pr-6">
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
        <Button
          aria-label="Comment"
          icon={<DiscussIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        >
          {labels ? 'Comment' : undefined}
        </Button>
        <Button
          aria-label="Bookmark"
          icon={<BookmarkIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        >
          {labels ? 'Bookmark' : undefined}
        </Button>
        <Button
          aria-label="Copy"
          icon={<LinkIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        >
          {labels ? 'Copy' : undefined}
        </Button>
      </div>
    </div>
  );
};


const SelectionBar = () => (
  <div
    aria-label="Share selected text"
    className="inline-flex items-center gap-1 self-start rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
    role="toolbar"
  >
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Copy text"
      icon={<CopyIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Quote in a comment"
      icon={<DiscussIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Control action="Snapshot" />
  </div>
);

const MobileFloatingBar = () => (
  <div className="sticky bottom-2 mx-2 mb-2 flex w-auto items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-2 backdrop-blur-[2.5rem]">
    <Button
      aria-label="Upvote"
      icon={<UpvoteIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      128
    </Button>
    <Button
      aria-label="Downvote"
      icon={<DownvoteIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Comment"
      icon={<DiscussIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      24
    </Button>
    <Button
      aria-label="Bookmark"
      icon={<BookmarkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
  </div>
);

const PostScreen = ({ device, spot }: { device: Device; spot: Spot }) => {
  const compact = isCompact(device);

  return (
    <Screen width={DEVICES[device].width}>
      <div className="flex flex-col gap-4 p-4">
        <SourceRow device={device} menu={spot === 'today' && !compact} />

        <h1
          className={`break-words font-bold ${
            compact ? 'typo-title2' : 'typo-large-title'
          }`}
        >
          {TITLE}
        </h1>

        <p className="select-text break-words text-text-secondary typo-callout">
          The pattern repeats across decades.{' '}
          <span
            className={
              spot === 'selection'
                ? 'rounded-4 bg-overlay-float-cabbage text-text-primary'
                : undefined
            }
          >
            {SUMMARY}
          </span>
        </p>
        {spot === 'selection' && <SelectionBar />}

        <Tags />

        <span className="text-text-tertiary typo-footnote">
          Aug 12, 2026 · 4 min read
        </span>

        <div className="h-28 rounded-12 bg-surface-float" />

        <span className="text-text-tertiary typo-footnote">
          128 Upvotes · 24 Comments
        </span>

        <ActionBar device={device} />


        <div className="flex gap-3 border-t border-border-subtlest-tertiary pt-3">
          <img
            alt=""
            className="size-8 shrink-0 rounded-full object-cover"
            src={AVATAR}
          />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-text-primary typo-footnote">
              Bobby Iliev
            </span>
            <span className="text-text-tertiary typo-footnote">
              The org chart point is the whole article, honestly.
            </span>
          </div>
        </div>

      </div>

      {compact && <MobileFloatingBar />}
    </Screen>
  );
};

const Rail = ({ spot }: { spot: Spot }) => (
  <DeviceRail>
    <DeviceFrame device="desktop">
      <PostScreen device="desktop" spot={spot} />
    </DeviceFrame>
    <DeviceFrame device="tablet" note="no header actions">
      <PostScreen device="tablet" spot={spot} />
    </DeviceFrame>
    <DeviceFrame device="mobile" note="floating bar">
      <PostScreen device="mobile" spot={spot} />
    </DeviceFrame>
  </DeviceRail>
);

const PostPage = () => (
  <SurfacePage
    intro="Our highest-traffic surface by an order of magnitude — 1.38m views in 30 days. It is also the one surface that already has a real per-post OG image, which settles the payload question before it is asked. Drawn from the production components: PostSourceInfo, PostActions and MobilePostFloatingBar."
    map="Decision: no snapshot on the post page or the modal. The post already has an OG image, so a copied link previews properly wherever it lands — an image would be a second, worse copy of something we already generate. The one exception is highlighted text, where the quote is the payload and no OG exists for it."
    title="Post page & modal"
  >
    <Category
      covers="PostOptionButton · PostActions · MobilePostFloatingBar"
      title="What actually ships today"
      verdict="Correcting an earlier version of this page: there is no Copy link in the ⋯ menu. The menu offers Share via, which opens the share modal, and Copy link already sits in the engagement bar as Copy."
    >
      <Variant
        headline="⋯ opens with Share via; the bar ends with Copy"
        note="Two share affordances already exist and neither is missing, so the visibility problem here is not a missing control. Note the breakpoint: Read post and ⋯ are hidden below laptop, so on tablet the only share action on the whole screen is Copy in the bar."
        step="Today"
        wide
      >
        <Rail spot="today" />
      </Variant>
    </Category>

    <Category
      covers="#6352 · text-selection share bar"
      title="The one addition: selected text"
      verdict="Snapshot leads here and nowhere else on this page. A quote has no URL of its own and no OG image — the card is the only way it travels with attribution."
    >
      <Variant
        headline="Floating bar on selected text"
        note="Copy link, copy text and quote-in-a-comment are the bar from #6352; snapshot is the fourth. Selection is awkward on touch, so this is a desktop-first bet — on mobile the native selection callout takes over and we cannot restyle it."
        step="Recommended"
        wide
      >
        <Rail spot="selection" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof PostPage> = {
  title: 'Features/Snapshot/Surfaces/Post page',
  component: PostPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof PostPage> = {};
