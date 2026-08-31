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

type Spot =
  | 'today'
  | 'bar'
  | 'summary'
  | 'selection'
  | 'endband'
  | 'upvote';

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
const ActionBar = ({
  device,
  extra,
}: {
  device: Device;
  extra?: React.ReactNode;
}) => {
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
        {extra}
      </div>
    </div>
  );
};

/* #6351 as it ships: PostContentWidget + InviteLinkInput, shown only after
   an upvote. The copy is "Should anyone else see this post?" */
const UpvoteWidget = ({ withSnapshot }: { withSnapshot?: boolean }) => (
  <div className="flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 laptop:flex-row laptop:gap-4">
    <span className="font-bold text-text-tertiary typo-callout">
      Should anyone else see this post?
    </span>
    <div className="flex w-full flex-1 items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-subtle px-3 py-1.5">
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
        dly.to/9xKp2mQ
      </span>
      {withSnapshot && <Control action="Snapshot" />}
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

const MobileFloatingBar = ({ withSnapshot }: { withSnapshot?: boolean }) => (
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
    {withSnapshot && <Control action="Snapshot" />}
  </div>
);

const PostScreen = ({ device, spot }: { device: Device; spot: Spot }) => {
  const compact = isCompact(device);
  const snapshotInBar = spot === 'bar';

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

        {spot === 'summary' && (
          <div className="flex items-center gap-2">
            <span className="flex-1 text-text-quaternary typo-caption1">
              Summary by daily.dev
            </span>
            <Control action="Snapshot" label variant={ButtonVariant.Float} />
          </div>
        )}

        <Tags />

        <span className="text-text-tertiary typo-footnote">
          Aug 12, 2026 · 4 min read
        </span>

        <div className="h-28 rounded-12 bg-surface-float" />

        <span className="text-text-tertiary typo-footnote">
          128 Upvotes · 24 Comments
        </span>

        <ActionBar
          device={device}
          extra={snapshotInBar ? <Control action="Snapshot" /> : undefined}
        />

        {spot === 'upvote' && <UpvoteWidget withSnapshot />}

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
            <Control action="Snapshot" />
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
              Copy link
            </Button>
          </div>
        )}
      </div>

      {compact && (
        <MobileFloatingBar withSnapshot={spot === 'bar' && device === 'mobile'} />
      )}
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
    intro="Our highest-traffic surface by an order of magnitude — 1.38m views in 30 days — so a percentage point of share rate is worth more here than anywhere else. Drawn from the production components: PostSourceInfo, PostActions, PostContentWidget and MobilePostFloatingBar."
    map="Sharing map: lead with Copy link (#6350, #6352, #6349, #6351). The destination is the value — people want to read the article, not look at a picture of it. Snapshot earns its place on the quote and the summary, which stand alone."
    title="Post page & modal"
  >
    <Category
      covers="PostOptionButton · PostActions · MobilePostFloatingBar"
      title="What actually ships today"
      verdict="Correcting an earlier version of this page: there is no Copy link in the ⋯ menu. The menu offers Share via, which opens the share modal, and Copy link already sits in the engagement bar as Copy."
    >
      <Variant
        headline="⋯ opens with Share via; the bar ends with Copy"
        note="Two share affordances already exist and neither is missing — which means the visibility problem here is not a missing control. Note the breakpoint: Read post and ⋯ are hidden below laptop, so on tablet the only share action on the whole screen is Copy in the bar."
        step="Today"
        wide
      >
        <Rail spot="today" />
      </Variant>
    </Category>

    <Category
      covers="#6350 · the engagement bar"
      title="Adding snapshot to the bar"
      verdict="The bar is full at six actions and already collapses its labels when it runs out of room. A seventh has to earn its width."
    >
      <Variant
        headline="Snapshot after Copy"
        note="Consistent with the other actions and cheap to build. On mobile it lands in the floating bar, which is where every share on a phone actually happens — worth more than the desktop placement."
        step="Recommended"
        wide
      >
        <Rail spot="bar" />
      </Variant>
      <Variant
        headline="Snapshot beside the summary"
        note="Built and live. The summary is a self-contained payload, so this is the one place on the post page where an image genuinely beats a link. It also sits above the fold, unlike the bar."
        step="Also"
        wide
      >
        <Rail spot="summary" />
      </Variant>
    </Category>

    <Category
      covers="#6352 · selection · #6349 · end of conversation · #6351 · post-upvote"
      title="The moments inside the post"
      verdict="Three moments where intent spikes and the control can appear on its own rather than waiting to be found."
    >
      <Variant
        headline="Floating bar on selected text"
        note="Snapshot leads here: the quote is the share, the link is only attribution. Selection is awkward on touch, so this is a desktop-first bet — the mobile equivalent is the native selection callout, which we cannot restyle."
        step="Selection"
        wide
      >
        <Rail spot="selection" />
      </Variant>
      <Variant
        headline="Band under the last comment"
        note="Peak-end. The band sits where reading actually stops. Built on PostContentWidget so it matches the upvote prompt rather than inventing a second band style."
        step="End of thread"
        wide
      >
        <Rail spot="endband" />
      </Variant>
      <Variant
        headline="Snapshot inside the existing upvote prompt"
        note="This widget already ships — a short URL and a Copy link button, shown only after an upvote. Adding snapshot beside the field costs nothing and needs no new moment."
        step="After upvote"
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
