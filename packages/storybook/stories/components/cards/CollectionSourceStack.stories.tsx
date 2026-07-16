import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { Image, ImageType } from '@dailydotdev/shared/src/components/image/Image';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import HoverCard from '@dailydotdev/shared/src/components/cards/common/HoverCard';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib';
import { CollectionPillSources } from '@dailydotdev/shared/src/components/post/collection/CollectionPillSources';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { CollectionGrid } from '@dailydotdev/shared/src/components/cards/collection/CollectionGrid';
import { CollectionList } from '@dailydotdev/shared/src/components/cards/collection/CollectionList';
// Real card primitives, so the previews look like actual feed cards.
import {
  Card as GridCardShell,
  CardTextContainer as GridTextContainer,
  CardImage as GridCardImage,
  FreeformCardTitle,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import {
  ListCard as ListCardShell,
  CardContainer,
  CardTitle as ListCardTitle,
} from '@dailydotdev/shared/src/components/cards/common/list/ListCard';
import PostMetadata from '@dailydotdev/shared/src/components/cards/common/PostMetadata';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

import ExtensionProviders from '../../extension/_providers';

/**
 * DESIGN PROTOTYPE — not wired into the real cards yet.
 *
 * Replaces the "Collection" pill on collection cards (grid + mobile list) with
 * the collection's own source avatars.
 *
 * - Resting state: a compact stack of at most 4 circles — up to 3 source
 *   avatars + a single "+N" counter — sitting tightly on top of each other.
 * - Hover: the stack opens out to the right to the spacing sources use today,
 *   so almost the full logo of each source is visible.
 * - Per-source tooltip: either a plain name label, or the rich source hover
 *   card we use elsewhere in the product (avatar, followers, upvotes, Follow).
 */

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const logo = (name: string) =>
  `https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/${name}`;

type StackSource = {
  id: string;
  handle: string;
  name: string;
  image: string;
  description?: string;
  followers?: number;
  upvotes?: number;
};

const mockSources: StackSource[] = [
  {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    image: logo('tds'),
    description: 'Your home for data science and AI, sharing concepts and ideas.',
    followers: 128_400,
    upvotes: 984_000,
  },
  {
    id: 'react',
    handle: 'reactjs',
    name: 'React Blog',
    image: logo('reactjs'),
    description: 'The official source for the latest React news and releases.',
    followers: 342_000,
    upvotes: 1_240_000,
  },
  {
    id: 'css',
    handle: 'csstricks',
    name: 'CSS-Tricks',
    image: logo('css_tricks'),
    description: 'Tips, tricks, and techniques on using CSS.',
    followers: 96_200,
    upvotes: 512_300,
  },
  {
    id: 'vercel',
    handle: 'vercel',
    name: 'Vercel',
    image: logo('vercel'),
    description: 'Develop. Preview. Ship. The frontend cloud.',
    followers: 210_000,
    upvotes: 730_500,
  },
  {
    id: 'gh',
    handle: 'github',
    name: 'GitHub Blog',
    image: logo('github'),
    description: 'Updates, ideas, and inspiration from GitHub.',
    followers: 415_000,
    upvotes: 1_890_000,
  },
  {
    id: 'mdn',
    handle: 'mdn',
    name: 'MDN Web Docs',
    image: logo('mdn'),
    description: 'Resources for developers, by developers.',
    followers: 288_000,
    upvotes: 1_050_000,
  },
];

const basePost: Partial<Post> = {
  numUpvotes: 42,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['javascript', 'react', 'typescript'],
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
};

const collectionPost = {
  ...basePost,
  id: 'collection-1',
  title: 'Essential React Hooks Every Developer Should Know in 2026',
  summary: 'A curated collection of the most useful React hooks from across the web',
  permalink: 'https://api.daily.dev/r/collection-1',
  createdAt: '2026-01-15T10:30:00.000Z',
  source: mockSources[0],
  readTime: 15,
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/6',
  commentsPermalink: 'https://daily.dev/posts/collection-1',
  type: PostType.Collection,
  collectionSources: mockSources,
  numCollectionSources: mockSources.length,
} as unknown as Post;

const actionHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

// ---------------------------------------------------------------------------
// Dedicated source hover card (mirrors the product's SourceEntityCard, but
// self-contained with mock stats so it renders reliably in Storybook).
// ---------------------------------------------------------------------------

const SourceHoverCard = ({ source }: { source: StackSource }): ReactElement => (
  <div className="w-72 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
    <div className="flex items-start justify-between">
      <Image
        src={source.image}
        alt={`Avatar of ${source.name}`}
        type={ImageType.Squad}
        className="size-12 rounded-full object-cover"
      />
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        Follow
      </Button>
    </div>
    <div className="mt-3 flex flex-col gap-2">
      <Typography type={TypographyType.Body} color={TypographyColor.Primary} bold>
        {source.name}
      </Typography>
      {source.description && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {source.description}
        </Typography>
      )}
      <div className="flex items-center gap-1 text-text-tertiary">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {largeNumberFormat(source.followers ?? 0)} Followers
        </Typography>
        <Separator />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {largeNumberFormat(source.upvotes ?? 0)} Upvotes
        </Typography>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Prototype component
// ---------------------------------------------------------------------------

// Max source avatars before the "+N" counter. 3 avatars + 1 counter = 4 circles.
const MAX_AVATARS = 3;

// 'none' = no hover card at all (mobile/touch — there is no cursor to hover).
type TooltipVariant = 'name' | 'source' | 'none';

interface CollectionSourceStackProps {
  sources: StackSource[];
  total: number;
  size?: ProfileImageSize;
  /** Fraction of an avatar's width the circles overlap while resting (0–0.9). */
  restOverlap?: number;
  /** 'name' = plain text label; 'source' = rich source hover card. */
  tooltipVariant?: TooltipVariant;
  /**
   * Render permanently open (no hover needed) — for touch surfaces where there
   * is no hover.
   */
  alwaysExpanded?: boolean;
}

const sizePx: Partial<Record<ProfileImageSize, number>> = {
  [ProfileImageSize.Small]: 24,
  [ProfileImageSize.Medium]: 32,
  [ProfileImageSize.Large]: 40,
};

const avatarSizeClass: Partial<Record<ProfileImageSize, string>> = {
  [ProfileImageSize.Small]: 'size-6',
  [ProfileImageSize.Medium]: 'size-8',
  [ProfileImageSize.Large]: 'size-10',
};

const counterTypoClass: Partial<Record<ProfileImageSize, string>> = {
  [ProfileImageSize.Small]: 'typo-caption2',
  [ProfileImageSize.Medium]: 'typo-caption1',
  [ProfileImageSize.Large]: 'typo-footnote',
};

const CollectionSourceStack = ({
  sources,
  total,
  size = ProfileImageSize.Medium,
  restOverlap = 0.62,
  tooltipVariant = 'source',
  alwaysExpanded = false,
}: CollectionSourceStackProps): ReactElement => {
  const shown = sources.slice(0, MAX_AVATARS);
  const remaining = Math.max(total - shown.length, 0);
  const px = sizePx[size] ?? 32;

  const restPx = Math.round(px * restOverlap);
  // Open spacing matches how sources sit today (~6px overlap, i.e. -ml-1.5).
  const openPx = 6;

  // Expansion is pure CSS: the stack container is a named group and each circle
  // reads its margin from CSS vars via a class (never inline), so `group-hover`
  // can override it. Driving it with React mouse-state instead fights the Radix
  // per-source hover cards and collapses the stack. `alwaysExpanded` (touch)
  // just makes the resting margin equal the open margin.
  const restStep = alwaysExpanded ? openPx : restPx;

  const marginVars = (index: number): React.CSSProperties =>
    ({
      '--ml-rest': `${index === 0 ? 0 : -restStep}px`,
      '--ml-open': `${index === 0 ? 0 : -openPx}px`,
    } as React.CSSProperties);

  const marginStyle: React.CSSProperties = {
    transitionProperty: 'margin-left',
    transitionDuration: '260ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  };

  // margin-left is applied through classes (referencing the vars), so the
  // group-hover variant can win. No inline `marginLeft`.
  const marginClass =
    'ml-[var(--ml-rest)] group-hover/srcstack:ml-[var(--ml-open)]';

  const wrapTooltip = (
    source: StackSource,
    child: ReactElement,
  ): ReactElement => {
    if (tooltipVariant === 'none') {
      return <React.Fragment key={source.id}>{child}</React.Fragment>;
    }
    if (tooltipVariant === 'source') {
      return (
        <HoverCard
          key={source.id}
          appendTo={globalThis?.document?.body}
          side="bottom"
          align="start"
          sideOffset={10}
          trigger={child}
        >
          <SourceHoverCard source={source} />
        </HoverCard>
      );
    }
    return (
      <Tooltip key={source.id} content={source.name} side="bottom">
        {child}
      </Tooltip>
    );
  };

  return (
    // `pointer-events-auto` is required: the card's text container is
    // `pointer-events-none` (so post clicks fall through to the card link), and
    // that inherits down. Without re-enabling it here, the stack can't be
    // hovered (no expand) and the avatars can't trigger their source cards.
    <div className="group/srcstack pointer-events-auto flex w-fit items-center">
      {shown.map((source, index) =>
        wrapTooltip(
          source,
          <div
            style={{
              ...marginStyle,
              ...marginVars(index),
              zIndex: shown.length - index,
            }}
            className={classNames('relative rounded-full', marginClass)}
          >
            <Image
              src={source.image}
              alt={`Avatar of ${source.name}`}
              type={ImageType.Squad}
              className={classNames(
                'rounded-full bg-background-default object-cover ring-2 ring-background-default',
                avatarSizeClass[size],
              )}
            />
          </div>,
        ),
      )}
      {remaining > 0 &&
        (() => {
          const counter = (
            <div
              style={{
                ...marginStyle,
                ...marginVars(shown.length),
                zIndex: 0,
              }}
              className={classNames(
                'flex items-center justify-center rounded-full bg-surface-float font-bold tabular-nums text-text-secondary ring-2 ring-background-default',
                avatarSizeClass[size],
                counterTypoClass[size],
                marginClass,
              )}
            >
              +{remaining}
            </div>
          );
          if (tooltipVariant === 'none') {
            return counter;
          }
          return (
            <Tooltip
              content={`${remaining} more source${remaining > 1 ? 's' : ''}`}
              side="bottom"
            >
              {counter}
            </Tooltip>
          );
        })()}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

const Panel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-16 border border-border-subtlest-tertiary p-6">
    <h3 className="mb-1 font-bold text-text-primary typo-title3">{title}</h3>
    {subtitle && (
      <p className="mb-5 text-text-tertiary typo-callout">{subtitle}</p>
    )}
    {children}
  </section>
);

// ---------------------------------------------------------------------------
// Playground story — interactive controls
// ---------------------------------------------------------------------------

interface PlaygroundArgs {
  totalSources: number;
  size: ProfileImageSize;
  restOverlap: number;
  tooltipVariant: TooltipVariant;
  alwaysExpanded: boolean;
}

const Playground = (args: PlaygroundArgs): ReactElement => {
  const { totalSources, size, restOverlap, tooltipVariant, alwaysExpanded } =
    args;
  const previewPost = {
    ...collectionPost,
    collectionSources: mockSources.slice(
      0,
      Math.min(totalSources, mockSources.length),
    ),
    numCollectionSources: totalSources,
  } as Post;

  return (
    <ExtensionProviders>
      <div className="mx-auto max-w-4xl space-y-8 bg-background-default p-8">
        <header>
          <h1 className="font-bold text-text-primary typo-title2">
            Collection source stack — playground
          </h1>
          <p className="mt-2 text-text-secondary typo-body">
            The new source stack inside the real collection cards. On the
            desktop card, <strong>hover the source icons</strong> to expand and
            reveal the rich source card. Use the <strong>Controls</strong> tab
            below to change source count, size, overlap, and tooltip style.
          </p>
        </header>

        <div className="flex flex-wrap items-start justify-center gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-text-tertiary typo-footnote">
              Desktop grid card — hover the icons to expand
            </span>
            <div className="w-80">
              <CollectionGridPreview
                post={previewPost}
                size={size}
                restOverlap={restOverlap}
                tooltipVariant={tooltipVariant}
                alwaysExpanded={alwaysExpanded}
              />
            </div>
            <label className="flex items-center gap-2 text-text-tertiary typo-footnote">
              (toggle <code>alwaysExpanded</code> in Controls to preview the
              expanded state without hovering)
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-text-tertiary typo-footnote">
              Mobile list card — expanded, no hover card
            </span>
            <div className="w-[390px] overflow-hidden rounded-24 border border-border-subtlest-tertiary">
              <CollectionListPreview
                post={previewPost}
                size={size}
                restOverlap={restOverlap}
                tooltipVariant="none"
                alwaysExpanded
              />
            </div>
          </div>
        </div>

        <p className="text-center text-text-quaternary typo-footnote">
          At most {MAX_AVATARS} avatars + a &ldquo;+N&rdquo; counter = 4 circles.
          {totalSources > MAX_AVATARS
            ? ` Showing ${MAX_AVATARS} + “+${totalSources - MAX_AVATARS}”.`
            : ` Showing ${totalSources} (no counter).`}
        </p>
      </div>
    </ExtensionProviders>
  );
};

// ---------------------------------------------------------------------------
// Showcase story — before / after + tooltip comparison + in context
// ---------------------------------------------------------------------------

const Showcase = (): ReactElement => (
  <ExtensionProviders>
    <div className="mx-auto max-w-4xl space-y-8 bg-background-default p-8">
      <header>
        <h1 className="font-bold text-text-primary typo-title1">
          Collection sources — stacked
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary typo-body">
          The &ldquo;Collection&rdquo; pill is gone. In its place: up to 3 source
          avatars plus a &ldquo;+N&rdquo; counter, resting tightly on top of each
          other. Hover to open them out to the right, then hover a source for its
          hover card.
        </p>
      </header>

      <div className="grid gap-4 tablet:grid-cols-2">
        <Panel
          title="Before — the pill"
          subtitle="Static “Collection” badge; reveals sources only on hover."
        >
          <div className="group flex h-16 items-center">
            <CollectionPillSources
              sources={mockSources}
              totalSources={mockSources.length}
              size={ProfileImageSize.Medium}
            />
          </div>
        </Panel>

        <Panel
          title="After — the stack"
          subtitle="3 sources + “+N”, always visible. Hover to open."
        >
          <div className="flex h-16 items-center">
            <CollectionSourceStack
              sources={mockSources}
              total={mockSources.length}
              size={ProfileImageSize.Medium}
            />
          </div>
        </Panel>
      </div>

      <Panel
        title="Tooltip styles"
        subtitle="Hover a source. Left: plain name. Right: the rich source hover card."
      >
        <div className="flex flex-wrap items-center gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-text-tertiary typo-footnote">Plain name</span>
            <CollectionSourceStack
              sources={mockSources}
              total={mockSources.length}
              tooltipVariant="name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-text-tertiary typo-footnote">
              Rich source card
            </span>
            <CollectionSourceStack
              sources={mockSources}
              total={mockSources.length}
              tooltipVariant="source"
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Counts"
        subtitle="Hover each row. Never more than 4 circles; the counter uses tabular figures."
      >
        <div className="flex flex-col gap-6">
          {[2, 3, 4, 6, 24].map((n) => (
            <div key={n} className="flex items-center gap-6">
              <span className="w-24 shrink-0 text-text-tertiary typo-footnote">
                {n} sources
              </span>
              <CollectionSourceStack
                sources={mockSources.slice(0, Math.min(n, mockSources.length))}
                total={n}
                size={ProfileImageSize.Medium}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Touch surfaces (no hover)"
        subtitle="Mobile has no cursor, so the stack renders open and has no hover card."
      >
        <div className="flex h-16 items-center">
          <CollectionSourceStack
            sources={mockSources}
            total={mockSources.length}
            size={ProfileImageSize.Medium}
            tooltipVariant="none"
            alwaysExpanded
          />
        </div>
      </Panel>

      <div className="grid gap-8 laptop:grid-cols-2">
        <Panel
          title="In context — grid card (today)"
          subtitle="Reference: the current pill inside a real CollectionGrid card."
        >
          <div style={{ maxWidth: 320 }}>
            <CollectionGrid post={collectionPost} {...actionHandlers} />
          </div>
        </Panel>
        <Panel
          title="In context — list card (today)"
          subtitle="The mobile list row where the pill currently lives."
        >
          <CollectionList post={collectionPost} {...actionHandlers} />
        </Panel>
      </div>
    </div>
  </ExtensionProviders>
);

// ---------------------------------------------------------------------------
// Real-card previews — the new stack dropped into the actual feed card chrome
// (built from the same shared primitives CollectionGrid / CollectionList use).
// ---------------------------------------------------------------------------

const OptionsButton = (): ReactElement => (
  <button
    type="button"
    aria-label="Options"
    className="ml-auto flex size-8 items-center justify-center rounded-10 text-text-tertiary hover:bg-surface-float"
  >
    <MenuIcon size={IconSize.Small} />
  </button>
);

interface PreviewCardProps {
  post: Post;
  tooltipVariant?: TooltipVariant;
  size?: ProfileImageSize;
  restOverlap?: number;
  alwaysExpanded?: boolean;
}

const CollectionGridPreview = ({
  post,
  tooltipVariant = 'source',
  size = ProfileImageSize.Medium,
  restOverlap,
  alwaysExpanded,
}: PreviewCardProps): ReactElement => (
  <GridCardShell className="group min-h-card">
    <GridTextContainer className="mx-4 flex-1">
      <div className="mb-1 mt-3 flex flex-row items-center">
        <CollectionSourceStack
          sources={(post.collectionSources ?? []) as StackSource[]}
          total={post.numCollectionSources ?? 0}
          size={size}
          restOverlap={restOverlap}
          alwaysExpanded={alwaysExpanded}
          tooltipVariant={tooltipVariant}
        />
        <OptionsButton />
      </div>
      <FreeformCardTitle className="line-clamp-4 font-bold text-text-primary typo-title3">
        {post.title}
      </FreeformCardTitle>
    </GridTextContainer>
    <PostMetadata
      createdAt={post.createdAt}
      readTime={post.readTime}
      numSources={post.numCollectionSources}
      className="mx-4 my-0"
    />
    <div className="px-2 pt-2">
      <GridCardImage src={post.image} alt="Post cover" className="w-full" />
    </div>
    <ActionButtons
      post={post}
      {...actionHandlers}
      variant="grid"
      className="mt-auto px-1 pb-1"
    />
  </GridCardShell>
);

const CollectionListPreview = ({
  post,
  tooltipVariant = 'source',
  size = ProfileImageSize.Medium,
  restOverlap,
  alwaysExpanded = false,
}: PreviewCardProps): ReactElement => (
  <ListCardShell>
    <CardContainer>
      <div className="mb-2 flex flex-row items-center">
        <CollectionSourceStack
          sources={(post.collectionSources ?? []) as StackSource[]}
          total={post.numCollectionSources ?? 0}
          size={size}
          restOverlap={restOverlap}
          tooltipVariant={tooltipVariant}
          alwaysExpanded={alwaysExpanded}
        />
        <PostMetadata
          createdAt={post.createdAt}
          numSources={post.numCollectionSources}
          className="ml-2 mr-2 flex-1"
        />
        <OptionsButton />
      </div>
      {/* Forced mobile stacked layout: cover full-width below the title. The
          shared list CardContent/CardImage use `mobileXL:` classes that key off
          the viewport (a wide Storybook iframe), which would wrongly render the
          desktop row layout and overflow this narrow frame. */}
      <div className="flex flex-col">
        <ListCardTitle className="mb-2 line-clamp-3">
          {post.title}
        </ListCardTitle>
        {post.image && (
          <img
            src={post.image}
            alt="Post cover"
            className="mt-1 h-40 w-full rounded-12 object-cover"
          />
        )}
      </div>
    </CardContainer>
    <ActionButtons
      post={post}
      {...actionHandlers}
      variant="list"
      className="mt-2 justify-between"
    />
  </ListCardShell>
);

const gridFeedStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
} as React.CSSProperties;

const feedPosts: Post[] = [
  collectionPost,
  {
    ...collectionPost,
    id: 'collection-2',
    title: 'The Best CSS Layout Techniques for Modern Responsive Design',
    collectionSources: mockSources.slice(1, 4),
    numCollectionSources: 3,
  } as Post,
  {
    ...collectionPost,
    id: 'collection-3',
    title: 'Frontend Performance: 24 Sources on Shipping Faster Sites',
    collectionSources: mockSources,
    numCollectionSources: 24,
  } as Post,
];

const FeedPreview = (): ReactElement => (
  <ExtensionProviders>
    <div className="space-y-12 bg-background-default p-8">
      <header>
        <h1 className="font-bold text-text-primary typo-title1">
          Collection stack — on real cards
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary typo-body">
          The new source stack dropped into the real feed card chrome. On
          desktop cards it rests tight and expands when you hover the source
          icons; on mobile it&rsquo;s expanded by default (no hover).
        </p>
      </header>

      <section>
        <h2 className="mb-2 font-bold text-text-primary typo-title2">
          Desktop feed (grid)
        </h2>
        <p className="mb-6 text-text-tertiary typo-callout">
          Rests as a tight stack. Hover the source icons to expand, then hover a
          source for its card.
        </p>
        <div
          className="mx-auto grid grid-cols-3 gap-8"
          style={{
            ...gridFeedStyle,
            maxWidth:
              'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
          }}
        >
          {feedPosts.map((post) => (
            <CollectionGridPreview key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bold text-text-primary typo-title2">
          Mobile (list)
        </h2>
        <p className="mb-6 text-text-tertiary typo-callout">
          Phone-width column. On mobile the stack is expanded by default — no
          hover needed.
        </p>
        <div className="mx-auto w-[390px] overflow-hidden rounded-24 border border-border-subtlest-tertiary">
          {feedPosts.map((post) => (
            <CollectionListPreview
              key={post.id}
              post={post}
              tooltipVariant="none"
              alwaysExpanded
            />
          ))}
        </div>
      </section>
    </div>
  </ExtensionProviders>
);

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Cards/Collection Source Stack',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type PlaygroundStory = StoryObj<PlaygroundArgs>;
type Story = StoryObj;

export const Playground_: PlaygroundStory = {
  name: 'Playground',
  render: (args) => <Playground {...args} />,
  args: {
    totalSources: 6,
    size: ProfileImageSize.Medium,
    restOverlap: 0.62,
    tooltipVariant: 'source',
    alwaysExpanded: false,
  },
  argTypes: {
    totalSources: {
      control: { type: 'range', min: 1, max: 24, step: 1 },
      description: 'Total sources in the collection (numCollectionSources).',
    },
    size: {
      control: { type: 'inline-radio' },
      options: [
        ProfileImageSize.Small,
        ProfileImageSize.Medium,
        ProfileImageSize.Large,
      ],
      description: 'Avatar size.',
    },
    restOverlap: {
      control: { type: 'range', min: 0, max: 0.9, step: 0.02 },
      description: 'How tightly the circles overlap while resting.',
    },
    tooltipVariant: {
      control: { type: 'inline-radio' },
      options: ['none', 'name', 'source'],
      description:
        'Desktop hover card: none, plain name, or rich source card. (Mobile always uses none.)',
    },
    alwaysExpanded: {
      control: 'boolean',
      description: 'Render permanently open (touch/mobile — no hover).',
    },
  },
};

export const Overview: Story = {
  name: 'Overview',
  render: () => <Showcase />,
};

export const InFeed: Story = {
  name: 'On real cards (feed + mobile)',
  render: () => <FeedPreview />,
};

// ---------------------------------------------------------------------------
// Before / after — a single collection card, nothing else
// ---------------------------------------------------------------------------

const BeforeAfterCard = ({
  label,
  sublabel,
  header,
}: {
  label: string;
  sublabel: string;
  header: ReactElement;
}): ReactElement => (
  <div className="flex w-80 flex-col gap-3">
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-callout">{label}</span>
      <span className="text-text-tertiary typo-footnote">{sublabel}</span>
    </div>
    <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <div className="p-4">
        <div className="mb-3 flex h-9 items-center">{header}</div>
        <h4 className="line-clamp-2 font-bold text-text-primary typo-title3">
          {collectionPost.title}
        </h4>
      </div>
      <img
        src={collectionPost.image}
        alt="Post cover"
        className="h-40 w-full object-cover"
      />
    </div>
  </div>
);

const BeforeAfter = (): ReactElement => (
  <ExtensionProviders>
    <div className="mx-auto max-w-3xl space-y-6 bg-background-default p-8">
      <header>
        <h1 className="font-bold text-text-primary typo-title2">
          Collection card — before &amp; after
        </h1>
        <p className="mt-2 max-w-xl text-text-secondary typo-body">
          The only thing that changes is the little bit at the top of the card.
          Everything else stays the same.
        </p>
      </header>
      <div className="flex flex-wrap gap-8">
        <BeforeAfterCard
          label="Before"
          sublabel="The grey “Collection” badge"
          header={
            // `group` so the old pill reveals its avatars on hover, as it does today.
            <div className="group flex items-center">
              <CollectionPillSources
                sources={mockSources}
                totalSources={mockSources.length}
                label="Collection"
              />
            </div>
          }
        />
        <BeforeAfterCard
          label="After"
          sublabel="The collection’s sources — hover to open them"
          header={
            <CollectionSourceStack
              sources={mockSources}
              total={mockSources.length}
            />
          }
        />
      </div>
    </div>
  </ExtensionProviders>
);

export const BeforeAfterStory: Story = {
  name: 'Before & after (just the collection card)',
  render: () => <BeforeAfter />,
};
