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

/* #6351 as it ships: PostContentWidget + InviteLinkInput, shown only after
   an upvote. The copy is "Should anyone else see this post?" */
const UpvoteWidget = () => (
  <div className="flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 laptop:flex-row laptop:gap-4">
    <span className="font-bold text-text-tertiary typo-callout">
      Should anyone else see this post?
    </span>
    <div className="flex w-full flex-1 items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-subtle px-3 py-1.5">
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
        dly.to/9xKp2mQ
      </span>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
        Copy link
      </Button>
    </div>
  </div>
);

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

        {spot === 'upvote' && <UpvoteWidget />}

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

        {spot === 'endband' && (
          <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-4 py-3">
            <span className="flex-1 font-bold text-text-tertiary typo-callout">
              Enjoyed this discussion?
            </span>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
              Copy link
            </Button>
          </div>
        )}
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
    intro="Our highest-traffic surface by an order of magnitude — 1.38m views in 30 days. It is also the one surface that already has a real per-post OG image, which settles the payload question: the link renders as a card with the title, source and artwork, so copying it loses nothing."
    map="Decision: no snapshot on the post page or modal. The post already has an OG image, so Copy link carries the payload on its own. The single exception is selected text — a highlighted line has no OG of its own, and that is the one place a snapshot adds something the link cannot."
    title="Post page & modal"
  >
    <Category
      covers="PostOptionButton · PostActions · MobilePostFloatingBar"
      title="What actually ships today"
      verdict="Correcting an earlier version of this page: there is no Copy link in the ⋯ menu. The menu offers Share via, which opens the share modal, and Copy link already sits in the engagement bar as Copy."
    >
      <Variant
        headline="⋯ opens with Share via; the bar ends with Copy"
        note="Two share affordances already exist and neither is missing. Note the breakpoint: Read post and ⋯ are hidden below laptop, so on tablet the only share action on the whole screen is Copy in the bar."
        step="Today"
        wide
      >
        <Rail spot="today" />
      </Variant>
    </Category>

    <Category
      covers="#6352 · text-selection share bar"
      title="The one place snapshot belongs"
      verdict="A highlighted line has no OG image of its own. The quote is the share and the link is only attribution — the only moment on this page where an image beats the URL."
    >
      <Variant
        headline="Snapshot in the floating selection bar"
        note="The bar appears exactly when intent exists, so nothing is added to the page for everyone else. Icon-only, alongside copy link, copy text and quote-in-a-comment. On mobile the browser's own selection callout takes over and we cannot restyle it, so treat this as a desktop-first bet and measure it there."
        step="Recommended"
        wide
      >
        <Rail spot="selection" />
      </Variant>
    </Category>

    <Category
      covers="the engagement bar · the summary · #6349 · #6351"
      title="Ruled out, and why"
      verdict="Every other placement on this page was considered and dropped. They are drawn here as they ship — with no snapshot — so the decision stays visible rather than becoming a gap someone re-opens later."
    >
      <Variant
        headline="Not in the engagement bar, not beside the summary"
        note="Both were built and both are being removed. The bar is already full at six actions and collapses its labels under pressure; the summary is covered by the OG image, which carries the same text to the same recipient with one fewer step."
        step="Dropped"
        wide
      >
        <Rail spot="endband" />
      </Variant>
      <Variant
        headline="End-of-thread band and post-upvote prompt stay link-only"
        note="Both are real moments and both belong to #6349 and #6351 rather than to snapshot. The upvote prompt already ships a short URL and a Copy link button — the payload it sends is the OG card, which is the right one."
        step="Dropped"
        wide
      >
        <Rail spot="upvote" />
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
