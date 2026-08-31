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
  | 'strip'
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


/* -------------------------------------------------------------- post types */

type PostKind =
  | 'article'
  | 'video'
  | 'freeform'
  | 'poll'
  | 'collection'
  | 'shared'
  | 'twitter';

const TYPE_TITLE: Record<PostKind, string> = {
  article: 'Why iconic tech brands lost their dominance',
  video: 'I rebuilt my homelab around one mini PC',
  freeform: 'What we learned shipping a design system in six weeks',
  poll: 'Which do you reach for first in a new service?',
  collection: 'Everything announced at the Postgres 19 launch',
  shared: 'Worth reading if you touch CI at all',
  twitter: 'The org chart is the product roadmap',
};

/** Article and video carry a summary. Nothing else does. */
const HAS_SUMMARY: PostKind[] = ['article', 'video', 'collection'];

const PollBody = () => (
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
    <span className="text-text-quaternary typo-caption1">
      1,284 votes · 2 days left
    </span>
    <div className="flex items-center justify-between rounded-16 bg-action-comment-float p-3">
      <span className="flex items-center gap-1 font-bold text-text-primary typo-footnote">
        <DiscussIcon className="text-action-comment-default" secondary />
        Why did you vote this way?
      </span>
      <Button size={ButtonSize.XSmall} variant={ButtonVariant.Subtle}>
        Comment
      </Button>
    </div>
  </div>
);

const TypeBody = ({ kind }: { kind: PostKind }) => {
  if (kind === 'poll') {
    return <PollBody />;
  }

  if (kind === 'video') {
    return (
      <div className="flex h-32 items-center justify-center rounded-12 bg-surface-float text-text-quaternary typo-footnote">
        YouTube player
      </div>
    );
  }

  if (kind === 'twitter') {
    return (
      <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
        <div className="flex items-center gap-2">
          <img alt="" className="size-6 rounded-full object-cover" src={AVATAR} />
          <span className="text-text-tertiary typo-caption1">
            @bobbyiliev · on X
          </span>
        </div>
        <span className="text-text-primary typo-footnote">
          Every reorg is a bet about what the product will need in a year.
        </span>
      </div>
    );
  }

  if (kind === 'shared') {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary typo-footnote">
          Worth reading if you touch CI at all.
        </span>
        <div className="flex gap-3 rounded-12 border border-border-subtlest-tertiary p-3">
          <div className="size-12 shrink-0 rounded-8 bg-surface-float" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold text-text-primary typo-footnote">
              Why iconic tech brands lost their dominance
            </span>
            <span className="text-text-quaternary typo-caption1">
              xda-developers.com
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'collection') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-secondary typo-footnote">{SUMMARY_LEAD}</p>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <img
                key={i}
                alt=""
                className="-ml-2 size-6 rounded-full border-2 border-background-default object-cover first:ml-0"
                src={AVATAR}
              />
            ))}
          </div>
          <span className="text-text-tertiary typo-caption1">
            12 sources · updated 2h ago
          </span>
        </div>
      </div>
    );
  }

  if (kind === 'freeform') {
    return (
      <div className="flex flex-col gap-2 text-text-secondary typo-footnote">
        <p>
          We gave ourselves six weeks and one rule: no component ships without a
          consumer. Here is what broke.
        </p>
        <p className="font-bold text-text-primary">1. Tokens before components</p>
        <p>
          Naming the colours took longer than building anything that used them.
        </p>
      </div>
    );
  }

  return <p className="text-text-secondary typo-body">{SUMMARY_LEAD}</p>;
};

const TypeView = ({
  kind,
  gap,
}: {
  kind: PostKind;
  /** What sharing gets wrong on this type. */
  gap: string;
}) => (
  <div className="flex w-[420px] shrink-0 flex-col gap-2">
    <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
          <span className="text-text-secondary typo-callout">
            {kind === 'freeform' || kind === 'poll' || kind === 'shared'
              ? 'Frontend Fans'
              : 'XDA Developers'}
          </span>
          {kind !== 'shared' && (
            <>
              <span className="text-text-quaternary">·</span>
              <span className="font-bold text-text-link">Follow</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            {kind !== 'shared' && kind !== 'poll' && kind !== 'freeform' && (
              <Button
                icon={<OpenLinkIcon />}
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Secondary}
              >
                Read post
              </Button>
            )}
            <Button
              aria-label="Options"
              icon={<MenuIcon />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
            />
          </div>
        </div>

        <h3 className="font-bold text-text-primary typo-title3">
          {TYPE_TITLE[kind]}
        </h3>

        <TypeBody kind={kind} />

        {HAS_SUMMARY.includes(kind) && <CopySummary />}

        <div className="flex items-center justify-between gap-1 rounded-16 border border-border-subtlest-tertiary p-2">
          <BarAction icon={<UpvoteIcon />} label="Upvote" />
          <BarAction icon={<DownvoteIcon />} label="Downvote" />
          <BarAction icon={<DiscussIcon />} label="Comment" labelVisible />
          <BarAction icon={<BookmarkIcon />} label="Bookmark" labelVisible />
          <BarAction icon={<LinkIcon />} label="Copy" labelVisible />
        </div>
      </div>
    </div>
    <span className="text-text-tertiary typo-caption1">{gap}</span>
  </div>
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
      covers="types.ts · PostType has eleven members"
      title="The gap: not every post is an article"
      verdict="Everything above assumes an article with a summary and an external link. Eleven post types route through the same BasePostContent and the same action bar, and the share affordances break differently on each. None of the sharing PRs mentions a post type."
    >
      <Variant
        headline="Seven types, seven different problems"
        note="Each frame notes what sharing gets wrong on that type. The action bar is identical on all of them — it is everything above the bar that differs."
        step="Audit"
      >
        <Rail>
          <TypeView
            gap="Baseline. Summary and external link both exist, so Copy summary and Copy link both mean something."
            kind="article"
          />
          <TypeView
            gap="Has a summary, so Copy summary works — but a video share almost always wants a timestamp, and nothing carries one."
            kind="video"
          />
          <TypeView
            gap="No summary field at all. Copy summary cannot exist here, and the markdown body has no obvious excerpt — the first paragraph is a guess."
            kind="freeform"
          />
          <TypeView
            gap="The strongest unclaimed snapshot payload in the product: a result with percentages, self-contained, and stale the moment voting closes. 'Why did you vote this way?' is a peak-intent moment with no share option on it."
            kind="poll"
          />
          <TypeView
            gap="Summary plus a source stack. Uses its own CollectionPostHeaderActions, so any header-level control has to be added twice."
            kind="collection"
          />
          <TypeView
            gap="Two links exist — the squad post and the original article — and nothing says which one Copy copies. No Read post button either (hideShareReadButton)."
            kind="shared"
          />
          <TypeView
            gap="An embedded tweet we did not write. A snapshot here reproduces someone else's post inside our frame, which is an attribution question before it is a design one."
            kind="twitter"
          />
        </Rail>
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
        step="Share strip"
      >
        <AllDevices spot="strip" />
      </Variant>
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
