import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BookmarkIcon,
  CopyIcon,
  DiscussIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  MenuIcon,
  OpenLinkIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  OverflowMenu,
  POST_MENU,
  Control,
  Device,
  Rail,
  ShareSheet,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot =
  | 'plain'
  | 'today'
  | 'today-sheet'
  | 'summary'
  | 'selection'
  | 'endband'
  | 'upvote';

const TITLE = 'Why iconic tech brands lost their dominance';

const SUMMARY_LEAD =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn. ';

const SUMMARY_QUOTE =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const isCompact = (device: DeviceName) => device !== 'Desktop';

/* ------------------------------------------------------------ the real page */

/** Desktop only: the header cluster is `hidden laptop:flex` in production. */
const HeaderActions = ({ menu }: { menu?: boolean }) => (
  <div className="relative ml-auto flex items-center gap-2">
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
    {menu && <OverflowMenu
        className="right-0 top-9"
        highlight="Share via"
        items={POST_MENU}
      />}
  </div>
);

/** Below laptop the same cluster lives in a sticky bar with the back arrow. */
const MobileTopBar = ({ menu }: { menu?: boolean }) => (
  <div className="relative flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-2">
    <Button
      aria-label="Back"
      icon={<ArrowIcon className="-rotate-90" />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <HeaderActions menu={menu} />
  </div>
);

const SourceRow = ({
  device,
  menu,
}: {
  device: DeviceName;
  menu?: boolean;
}) => (
  <div className="flex items-center text-text-tertiary typo-footnote">
    <span className="text-text-secondary typo-callout">XDA Developers</span>
    <span className="mx-1 text-text-quaternary">·</span>
    <span className="font-bold text-text-link">Follow</span>
    {!isCompact(device) && <HeaderActions menu={menu} />}
  </div>
);

const Summary = ({
  device,
  highlighted,
  trailing,
}: {
  device: DeviceName;
  highlighted?: boolean;
  trailing?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <p
      className={`select-text break-words text-text-secondary ${
        isCompact(device) ? 'typo-callout' : 'typo-body'
      }`}
    >
      {SUMMARY_LEAD}
      <span
        className={
          highlighted
            ? 'rounded-4 bg-overlay-float-cabbage text-text-primary'
            : undefined
        }
      >
        {SUMMARY_QUOTE}
      </span>
    </p>
    {trailing}
  </div>
);

const Tags = () => (
  <div className="flex flex-wrap gap-2">
    {['#tech-industry', '#brands', '#strategy'].map((tag) => (
      <span
        key={tag}
        className="rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption1"
      >
        {tag}
      </span>
    ))}
  </div>
);

const Metadata = () => (
  <span className="text-text-quaternary typo-footnote">
    Aug 31, 2026 · 4 min read · From xda-developers.com
  </span>
);

const BarAction = ({
  icon,
  label,
  labelVisible,
}: {
  icon: React.ReactElement;
  label: string;
  labelVisible?: boolean;
}) => (
  <Button
    aria-label={label}
    icon={icon}
    size={ButtonSize.Small}
    variant={ButtonVariant.Tertiary}
  >
    {labelVisible ? label : undefined}
  </Button>
);

/** PostActions.v2: a bordered bar, labels visible from Comment rightwards. */
const InlineActionBar = ({ device }: { device: DeviceName }) => (
  <div className="flex items-center justify-between gap-1 rounded-16 border border-border-subtlest-tertiary p-2">
    <BarAction icon={<UpvoteIcon />} label="Upvote" />
    <BarAction icon={<DownvoteIcon />} label="Downvote" />
    <BarAction
      icon={<DiscussIcon />}
      label="Comment"
      labelVisible={!isCompact(device)}
    />
    {!isCompact(device) && (
      <BarAction icon={<MedalBadgeIcon />} label="Award" labelVisible />
    )}
    <BarAction
      icon={<BookmarkIcon />}
      label="Bookmark"
      labelVisible={!isCompact(device)}
    />
    <BarAction
      icon={<LinkIcon />}
      label="Copy"
      labelVisible={!isCompact(device)}
    />
  </div>
);

/** MobilePostFloatingBar.v2: pinned, icons only, copy link last. */
const FloatingBar = () => (
  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-2">
    <Button
      icon={<UpvoteIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      128
    </Button>
    <BarAction icon={<DownvoteIcon />} label="Downvote" />
    <Button
      icon={<DiscussIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      24
    </Button>
    <BarAction icon={<BookmarkIcon />} label="Bookmark" />
    <BarAction icon={<LinkIcon />} label="Copy link" />
  </div>
);

/**
 * #6350's 'Copy summary': one tap puts the headline, the TLDR and the article
 * link on the clipboard. Icon only and XSmall — it sits under body copy, so
 * anything larger reads as part of the article.
 */
const CopySummary = () => (
  <Button
    aria-label="Copy summary"
    className="self-start"
    icon={<CopyIcon />}
    size={ButtonSize.XSmall}
    variant={ButtonVariant.Tertiary}
  />
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

const Comments = ({ device }: { device: DeviceName }) => (
  <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4">
    <span className="font-bold text-text-primary typo-callout">24 comments</span>
    <div className="flex gap-3">
      <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-bold text-text-primary typo-footnote">
          Bobby Iliev
        </span>
        <span
          className={`text-text-tertiary ${
            isCompact(device) ? 'typo-caption1' : 'typo-footnote'
          }`}
        >
          The org chart point is the whole article, honestly.
        </span>
      </div>
    </div>
  </div>
);

const Band = ({
  title,
  body,
  children,
  accent,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <div
    className={`flex flex-wrap items-center gap-3 rounded-12 p-3 ${
      accent
        ? 'border border-accent-cabbage-default bg-overlay-float-cabbage'
        : 'bg-surface-float'
    }`}
  >
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold text-text-primary typo-footnote">{title}</span>
      <span className="text-text-tertiary typo-caption1">{body}</span>
    </div>
    {children}
  </div>
);

const PostView = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => {
  const compact = isCompact(device);
  const showsMenu = spot === 'today';

  return (
    <Device height={compact ? 620 : undefined} name={device}>
      {compact && <MobileTopBar menu={showsMenu} />}

      <div
        className={`flex flex-col gap-4 p-4 ${compact ? 'pb-20' : ''}`}
        style={compact ? { height: 620 - 44, overflow: 'hidden' } : undefined}
      >
        <SourceRow device={device} menu={showsMenu} />

        <h1
          className={`break-words font-bold text-text-primary ${
            compact ? 'typo-title2' : 'typo-large-title'
          }`}
        >
          {TITLE}
        </h1>

        <Summary
          device={device}
          highlighted={spot === 'selection'}
          trailing={
            (spot === 'selection' && <SelectionBar />) ||
            (spot === 'summary' && <CopySummary />) ||
            undefined
          }
        />

        <Tags />
        <Metadata />

        {!compact && (
          <InlineActionBar device={device} />
        )}

        {spot === 'upvote' && (
          <Band
            accent
            body="You upvoted it — pass it on"
            title="Should anyone else see this?"
          >
            <Control action="Link" label variant={ButtonVariant.Primary} />
          </Band>
        )}

        <Comments device={device} />

        {spot === 'endband' && (
          <Band body="24 comments and counting" title="Enjoyed this discussion?">
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          </Band>
        )}
      </div>

      {compact && <FloatingBar />}
      {spot === 'today-sheet' && <ShareSheet />}
    </Device>
  );
};

const AllDevices = ({ spot }: { spot: Spot }) => (
  <Rail>
    <PostView device="Desktop" spot={spot} />
    <PostView device="Tablet" spot={spot} />
    <PostView device="Mobile" spot={spot} />
  </Rail>
);

/* -------------------------------------------------------------------- page */

const PostPage = () => (
  <SurfacePage
    intro="Our highest-traffic surface by an order of magnitude — 1.38m views in 30 days — so a percentage point of share rate is worth more here than anywhere else. It is also the surface where the least is missing: copy link already ships, labeled, in the action bar."
    map="Sharing map: lead with Copy link (#6350). People want to read the article, not look at a picture of it. Snapshot appears exactly once on this page — on selected text, where the quote is the share and the link is only attribution."
    title="Post page & modal"
  >
    <Category
      covers="PostOptionButton.tsx · PostActions.v2.tsx · MobilePostFloatingBar.v2.tsx"
      title="What actually ships today"
      verdict="Corrected: there is no “Copy link” item in the ⋯ menu anywhere in the product. The menu leads with “Share via”, which opens the share sheet — copy link is one level deeper. Meanwhile the desktop action bar already carries a labeled Copy, and mobile carries it as an icon in the floating bar. So the post page is not a visibility problem; it is a snapshot-has-nowhere-to-go problem."
    >
      <Variant
        headline="⋯ → Share via, then the sheet"
        note="Two levels to reach a URL. Note the header cluster is `hidden laptop:flex` — on tablet and mobile the ⋯ is not in the article header at all, it moves to the sticky back-bar."
        step="Today · the menu"
      >
        <AllDevices spot="today" />
      </Variant>
      <Variant
        headline="The share sheet the menu opens"
        note="Copy link is the first and only Primary-weighted item, then the eight named targets. This is where a snapshot option would slot in without adding any new chrome to the page."
        step="Today · the sheet"
      >
        <Rail>
          <PostView device="Desktop" spot="today-sheet" />
          <PostView device="Mobile" spot="today-sheet" />
        </Rail>
      </Variant>
      <Variant
        headline="Copy is already labeled in the action bar"
        note="PostActions.v2 renders Comment, Award, Bookmark and Copy with `labelVisible`. Below laptop the labels drop and the bar becomes the pinned floating bar, icons only. Nothing is added here."
        step="Today · the action bar"
      >
        <AllDevices spot="plain" />
      </Variant>
    </Category>

    <Category
      covers="#6350 · copy summary · #6352 · text selection"
      title="The two additions"
      verdict="Two payloads on this page stand alone without the article: the summary we generated and a line the reader chose. The summary goes out as text, because the whole point is that it can be pasted into a thread; the selection goes out as an image, because a quote is worth looking at."
    >
      <Variant
        headline="Copy summary — a tiny icon under the TLDR"
        note="One tap copies the headline, the TLDR and the article link together, so pasting into Slack gives a usable message rather than a bare URL. Icon only and XSmall: it sits directly under body copy, and anything larger reads as part of the article."
        step="Recommended"
      >
        <AllDevices spot="summary" />
      </Variant>
      <Variant
        headline="Floating bar on selected text"
        note="The only snapshot on the post page. The bar appears exactly when intent exists, so it is also the one control here that costs no permanent chrome."
        step="Recommended"
      >
        <AllDevices spot="selection" />
      </Variant>
    </Category>

    <Category
      covers="#6349 · end of conversation · #6351 · post-upvote prompt"
      title="The two prompted moments"
      verdict="Both add a control that appears on its own rather than waiting to be found. Both are additive to the action bar, not replacements for it."
    >
      <Variant
        headline="Band under the last comment"
        note="Peak-end: it sits where reading actually stops, and copy link is the whole offer — a still image of a live thread goes stale within hours. On mobile the band and the pinned floating bar both want the bottom of the screen, which is the real design problem here."
        step="End of thread"
      >
        <AllDevices spot="endband" />
      </Variant>
      <Variant
        headline="Prompt after an upvote"
        note="The strongest intent signal we get. Snapshot stays out — it would be the same payload twice."
        step="After upvote"
      >
        <AllDevices spot="upvote" />
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
