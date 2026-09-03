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
  ShareIcon,
  TwitterIcon,
  UpvoteIcon,
  WhatsappIcon,
} from '@dailydotdev/shared/src/components/icons';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Control,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'summary' | 'selection' | 'strip' | 'endband' | 'upvote';

const TITLE = 'Why iconic tech brands lost their dominance';

const SUMMARY_LEAD =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn. ';

const SUMMARY_QUOTE =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const isCompact = (device: DeviceName) => device !== 'Desktop';

/* The card from #6544 at a third of its size: it is built for a 1080px canvas,
   so it is drawn full-size and scaled rather than made responsive. */
const PREVIEW_SIZE = 360;

const SnapshotResult = () => (
  <div
    className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
  >
    <div
      style={{
        transform: `scale(${PREVIEW_SIZE / SNAPSHOT_SIZE})`,
        transformOrigin: 'top left',
      }}
    >
      <HighlightTextSnapshotCard
        domain="xda-developers.com"
        postTitle={TITLE}
        seed={SUMMARY_QUOTE}
        source={{ name: 'XDA Developers', image: AVATAR }}
        text={SUMMARY_QUOTE}
      />
    </div>
  </div>
);

/* ------------------------------------------------------------ the real page */

/** Desktop only: the header cluster is `hidden laptop:flex` in production. */
const HeaderActions = () => (
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
  </div>
);

/** Below laptop the same cluster lives in a sticky bar with the back arrow. */
const MobileTopBar = () => (
  <div className="relative flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-2">
    <Button
      aria-label="Back"
      icon={<ArrowIcon className="-rotate-90" />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <HeaderActions />
  </div>
);

const SourceRow = ({ device }: { device: DeviceName }) => (
  <div className="flex items-center text-text-tertiary typo-footnote">
    <span className="text-text-secondary typo-callout">XDA Developers</span>
    <span className="mx-1 text-text-quaternary">·</span>
    <span className="font-bold text-text-link">Follow</span>
    {!isCompact(device) && <HeaderActions />}
  </div>
);

const Summary = ({
  device,
  highlighted,
  inlineTrailing,
  trailing,
}: {
  device: DeviceName;
  highlighted?: boolean;
  /** Runs in at the end of the last line, inside the paragraph. */
  inlineTrailing?: React.ReactNode;
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
      {inlineTrailing}
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
 * link on the clipboard. Icon only, XSmall, inline, and quieter than the body
 * copy it trails — it runs in at the end of the summary's last line, so it has
 * to sit below the text in the reading order without breaking the paragraph.
 */
const CopySummary = () => (
  <Button
    aria-label="Copy summary"
    className="ml-1 align-middle !text-text-quaternary"
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

const CommentBar = () => (
  <div className="flex items-center gap-3">
    <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
    <div className="flex-1 rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-quaternary typo-footnote">
      Share your thoughts
    </div>
  </div>
);

/**
 * DiscussionShareRow, as it ships: copy, X, WhatsApp, up to four squad
 * avatars, then the modal. Only two squads show below tablet.
 */
const ShareStrip = ({ device }: { device: DeviceName }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-text-tertiary typo-footnote">Share this post</span>
    <div className="flex items-center gap-1">
      <BarAction icon={<CopyIcon />} label="Copy link" />
      <BarAction icon={<TwitterIcon />} label="Share on X" />
      <BarAction icon={<WhatsappIcon secondary />} label="Share on WhatsApp" />
      {Array.from(
        { length: device === 'Mobile' ? 2 : 4 },
        (_, index) => index,
      ).map((squad) => (
        <Button
          key={squad}
          aria-label="Share to squad"
          icon={
            <img alt="" className="size-6 rounded-full object-cover" src={AVATAR} />
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      ))}
      <BarAction icon={<ShareIcon />} label="More sharing options" />
    </div>
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

  return (
    <Device height={compact ? 620 : undefined} name={device}>
      {compact && <MobileTopBar />}

      <div
        className={`flex flex-col gap-4 p-4 ${compact ? 'pb-20' : ''}`}
        style={compact ? { height: 620 - 44, overflow: 'hidden' } : undefined}
      >
        <SourceRow device={device} />

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
          inlineTrailing={spot === 'summary' ? <CopySummary /> : undefined}
          trailing={spot === 'selection' ? <SelectionBar /> : undefined}
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

        {spot === 'strip' && (
          <div className="flex flex-col gap-2">
            <CommentBar />
            <ShareStrip device={device} />
          </div>
        )}

        <Comments device={device} />

        {spot === 'endband' && (
          <Band body="24 comments and counting" title="Enjoyed this discussion?">
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          </Band>
        )}
      </div>

      {compact && <FloatingBar />}
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


/* --------------------------------------------------------- the poll variant */

type PollSpot = 'result' | 'postvote';

const PollResults = () => (
  <div className="flex flex-col gap-2">
    {[
      ['Postgres', 62],
      ['Redis', 21],
      ['SQLite', 11],
      ['Something else', 6],
    ].map(([label, share]) => (
      <div
        key={label}
        className="relative overflow-hidden rounded-10 border border-border-subtlest-tertiary px-3 py-2"
      >
        <span
          className="absolute inset-y-0 left-0 bg-overlay-float-cabbage"
          style={{ width: `${share as number}%` }}
        />
        <span className="relative flex justify-between text-text-primary typo-footnote">
          <span>{label}</span>
          <span className="font-bold">{share}%</span>
        </span>
      </div>
    ))}
  </div>
);

const PollView = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: PollSpot;
}) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <span className="text-text-secondary typo-callout">Frontend Fans</span>
        <span className="text-text-quaternary">·</span>
        <span className="font-bold text-text-link">Follow</span>
        <Button
          aria-label="Options"
          className="ml-auto"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <h1
        className={`font-bold text-text-primary ${
          isCompact(device) ? 'typo-title2' : 'typo-large-title'
        }`}
      >
        Which do you reach for first in a new service?
      </h1>

      <PollResults />

      <div className="flex items-center gap-2">
        <span className="flex-1 text-text-quaternary typo-caption1">
          1,284 votes · 2 days left
        </span>
        {spot === 'result' && <Control action="Snapshot" />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-16 bg-action-comment-float p-3">
        <span className="flex items-center gap-1 font-bold text-text-primary typo-footnote">
          <DiscussIcon className="text-action-comment-default" secondary />
          Why did you vote this way?
        </span>
        <div className="flex items-center gap-2">
          {spot === 'postvote' && (
            <Control
              action="Snapshot"
              label={!isCompact(device)}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
            />
          )}
          <Button size={ButtonSize.XSmall} variant={ButtonVariant.Subtle}>
            Comment
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 rounded-16 border border-border-subtlest-tertiary p-2">
        <BarAction icon={<UpvoteIcon />} label="Upvote" />
        <BarAction icon={<DownvoteIcon />} label="Downvote" />
        <BarAction
          icon={<DiscussIcon />}
          label="Comment"
          labelVisible={!isCompact(device)}
        />
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
    </div>
  </Device>
);

const AllPolls = ({ spot }: { spot: PollSpot }) => (
  <Rail>
    <PollView device="Desktop" spot={spot} />
    <PollView device="Tablet" spot={spot} />
    <PollView device="Mobile" spot={spot} />
  </Rail>
);

/* --------------------------------------------------------- the sticky nav */

/** PostNavigation with `inlineActions`: Read post loses its label. */
const NavActions = ({ close }: { close?: boolean }) => (
  <div className="ml-auto flex items-center gap-1">
    <Button
      aria-label="Read post"
      icon={<OpenLinkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Options"
      icon={<MenuIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
  </div>
);

const NavBar = () => (
  <div className="flex items-center gap-1 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-1">
    <Button
      aria-label="Previous"
      className="-rotate-90"
      icon={<ArrowIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Next"
      className="rotate-90"
      icon={<ArrowIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <div className="ml-auto flex items-center gap-1">
      <BarAction icon={<LinkIcon />} label="Copy link" />
      <NavActions />
    </div>
  </div>
);

const StickyNavView = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="p-4 pb-0 text-text-quaternary typo-caption1">
      scrolled past the header
    </div>
    <NavBar />

    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <span className="text-text-secondary typo-callout">XDA Developers</span>
        <span className="text-text-quaternary">·</span>
        <span className="font-bold text-text-link">Follow</span>
        {/* `navigation.actions: ml-auto tablet:hidden` — gone from tablet up. */}
        {device === 'Mobile' && <NavActions />}
      </div>

      <h1
        className={`font-bold text-text-primary ${
          isCompact(device) ? 'typo-title2' : 'typo-large-title'
        }`}
      >
        {TITLE}
      </h1>
      <p className="text-text-secondary typo-footnote">
        {SUMMARY_LEAD}
        <CopySummary />
      </p>

    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const PostPage = () => (
  <SurfacePage
    intro="Our highest-traffic surface by an order of magnitude — 1.38m views in 30 days — so a percentage point of share rate is worth more here than anywhere else. It is also the surface where the least is missing: copy link already ships, labeled, in the action bar."
    map="Sharing map: lead with Copy link (#6350). People want to read the article, not look at a picture of it. Snapshot appears exactly once on this page — on selected text, where the quote is the share and the link is only attribution."
    title="Post page & modal"
  >
    <Category
      covers="#6350 · copy summary · #6352 · text selection"
      title="The two additions"
      verdict="Two payloads on this page stand alone without the article: the summary we generated and a line the reader chose. The summary goes out as text, because the whole point is that it can be pasted into a thread; the selection goes out as an image, because a quote is worth looking at."
    >
      <Variant
        headline="Copy summary — a tiny icon under the TLDR"
        note="One tap copies the headline, the TLDR and the article link together, so pasting into Slack gives a usable message rather than a bare URL. Icon only and XSmall: it sits directly under body copy, and anything larger reads as part of the article."
        step="Shipping · post_copy_summary"
      >
        <AllDevices spot="summary" />
      </Variant>
      <Variant
        headline="Floating bar on selected text"
        note="The only snapshot on the post page. The bar appears exactly when intent exists, so it is also the one control here that costs no permanent chrome."
        step="Shipping · snapshot_selection_share"
      >
        <AllDevices spot="selection" />
      </Variant>
      <Variant
        headline="What the button exports"
        note="The 1080×1080 PNG the bar produces, drawn from the real HighlightTextSnapshotCard and scaled to a third. The quote is the payload; the source and the post title sit under it as attribution, which is why the link stops being the thing being shared."
        step="Result"
      >
        <SnapshotResult />
      </Variant>
    </Category>

    <Category
      covers="DiscussionShareRow.tsx · #6349 · end of conversation · #6351 · post-upvote prompt"
      title="The prompted moments"
      verdict="Three controls that appear on their own rather than waiting to be found, all additive to the action bar rather than replacements for it. The strip is the only one of the three that already exists in code."
    >
      <Variant
        headline="Share strip under the comment bar"
        note="DiscussionShareRow, already shipping in the discussion panel but not on the post page itself. It is the densest share affordance we have — named targets and squads, no menu, no modal — and it sits directly under the composer, where someone has already decided to engage. Two squads below tablet, four above."
        step="Shipping · post_share_prompts"
      >
        <AllDevices spot="strip" />
      </Variant>
      <Variant
        headline="Band under the last comment"
        note="Peak-end: it sits where reading actually stops, and copy link is the whole offer — a still image of a live thread goes stale within hours. On mobile the band and the pinned floating bar both want the bottom of the screen, which is the real design problem here."
        step="Shipping · post_share_prompts"
      >
        <AllDevices spot="endband" />
      </Variant>
      <Variant
        headline="Prompt after an upvote"
        note="The strongest intent signal we get. Snapshot stays out — it would be the same payload twice."
        step="Shipping · post_share_prompts"
      >
        <AllDevices spot="upvote" />
      </Variant>
    </Category>
    <Category
      covers="PollPostContent.tsx · PollSnapshotButton.tsx · poll_snapshot"
      title="Snapshot on the poll"
      verdict="The one post type where snapshot beats a link outright. The result is a bar chart with percentages — self-contained, visual, and worthless as a URL once voting closes. It is also the only type that already renders a peak-intent prompt to attach to."
    >
      <Variant
        headline="Snapshot beside the vote count"
        note="Recommended. Sits with the result rather than in the action bar, because it is the result being shared, not the post. Icon only — the numbers above it are the message."
        step="Shipping · poll_snapshot"
      >
        <AllPolls spot="result" />
      </Variant>
      <Variant
        headline="Snapshot on the post-vote prompt"
        note="PollPostContent already renders “Why did you vote this way?” the moment someone votes — the one prompt in the product that fires on a completed action rather than a scroll position. Snapshot leads and Comment stays; the prompt keeps its original job."
        step="Shipping · poll_snapshot"
      >
        <AllPolls spot="postvote" />
      </Variant>
    </Category>

    <Category
      covers="FixedPostNavigation.tsx · PostNavigation.tsx · post_nav_copy_link"
      title="The sticky nav"
      verdict="Once the header scrolls away the nav bar carries the page's only controls, so anything placed in the source row is out of reach for the rest of the read."
    >
      <Variant
        headline="One copy-link icon in the sticky nav"
        note="Cheapest visibility win on the whole page: a single icon in a bar that is already rendered, already right-aligned, and already on screen for the entire read. No new chrome and nothing moves."
        step="Shipping · post_nav_copy_link"
      >
        <Rail>
          <StickyNavView device="Desktop" />
          <StickyNavView device="Mobile" />
        </Rail>
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
