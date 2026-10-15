import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleFeaturedWideGridCard } from '@dailydotdev/shared/src/components/cards/article/ArticleFeaturedWideGridCard';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import {
  SourceCardBorderColor,
  SquadGrid,
} from '@dailydotdev/shared/src/components/cards/squad/SquadGrid';
import { HighlightCardContent } from '@dailydotdev/shared/src/components/cards/highlight/common';
import { BriefCardReady } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardReady';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { formatDistanceToNowStrict } from 'date-fns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  adWithoutCta,
  cardHandlers,
  highlights,
} from '../../features/feed/feedHero.mocks';
import { sampleNotifications } from '../../components/notifications/_mock';
import { realAgentUpdates, realHeroPosts, realPosts } from '../realData';
import type { Tone } from '../data';
import { toneClass } from '../data';
import type { WidgetKind, WidgetSize } from './catalog';
import { widgetCatalog } from './catalog';
import { briefing, SourceChip } from './briefing';
import { toMonitorItems } from '@dailydotdev/shared/src/features/interests/monitorItems';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';
import { Scroll } from './scroll';
import { AdSlot, campaignStrips, RichStrip } from './adSlot';

/*
 * The widget system. One set of rules every widget follows, the way every
 * iOS widget shares margins, corners and type roles while still looking like
 * its own app:
 *  - 16px outer padding everywhere.
 *  - A header row: a 16px glyph (or a count bubble) and a caption in the
 *    widget's accent, top-left; the way out ("View all") top-right as a
 *    tertiary xsmall button, so the bottom stays content.
 *  - Lists run to the widget's bottom edge, scroll inside and fade out.
 *  - Five type roles: label (caption1), meta (caption1/footnote), body
 *    (footnote/callout), title (title3/title2), hero (large-title).
 *  - One primary action at most, floating bottom-right over the fade.
 *  - Small is one tap: no buttons, as much content as the square holds.
 */

const preventDefault = (event: React.MouseEvent): void =>
  event.preventDefault();

export const WidgetLabel = ({
  kind,
  children,
  trailing,
  link,
  isLinkPrimary,
  badge,
  isSquareBadge,
  leading,
  afterName,
  isOnMedia,
  className,
}: {
  kind: WidgetKind;
  children?: ReactNode;
  trailing?: ReactNode;
  /** The way out, top-right: "View all" and friends. */
  link?: string;
  /** A filled button instead of a quiet link, where opening is the point. */
  isLinkPrimary?: boolean;
  /** A count that replaces the glyph, the way an app badge does. */
  badge?: number;
  /** Messages: a rounded square, so it doesn't read as an alert. */
  isSquareBadge?: boolean;
  /** Replaces the glyph, e.g. a live dot. */
  leading?: ReactNode;
  afterName?: ReactNode;
  /** Over artwork the accent fights the image, so the glyph goes white. */
  isOnMedia?: boolean;
  className?: string;
}): ReactElement => {
  const def = widgetCatalog[kind];
  return (
    <header
      className={classNames(
        'relative z-3 flex h-6 min-w-0 shrink-0 items-center gap-1.5',
        className,
      )}
      style={{ paddingRight: 'var(--stack-inset, 0px)' }}
    >
      {leading}
      {!leading && badge !== undefined && (
        <span
          className={classNames(
            'flex h-5 min-w-5 shrink-0 items-center justify-center px-1.5 font-bold tabular-nums text-white typo-caption2',
            isSquareBadge
              ? 'rounded-6 bg-accent-cabbage-default'
              : 'rounded-max bg-accent-ketchup-default',
          )}
        >
          {badge}
        </span>
      )}
      {!leading && badge === undefined && (
        <span
          className={classNames(
            'flex shrink-0',
            isOnMedia ? 'text-white' : toneClass[def.tone].text,
          )}
        >
          {def.icon(IconSize.Size16)}
        </span>
      )}
      <span
        className={classNames(
          'truncate font-bold typo-caption1',
          isOnMedia
            ? 'text-white [text-shadow:0_1px_8px_rgba(15,18,24,0.6)]'
            : 'text-text-primary',
        )}
      >
        {children ?? def.name}
      </span>
      {afterName}
      {(trailing || link) && (
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {trailing}
          {link && (
            <Button
              tag="a"
              href="#"
              onClick={preventDefault}
              variant={
                isLinkPrimary ? ButtonVariant.Primary : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              className={isLinkPrimary ? undefined : '-mr-2'}
            >
              {link}
            </Button>
          )}
        </span>
      )}
    </header>
  );
};

/** The one action a widget may carry: a design-system button. */
export const Action = ({
  children,
  icon,
  isPrimary = true,
}: {
  children: ReactNode;
  icon?: ReactElement;
  isPrimary?: boolean;
}): ReactElement => (
  <Button
    tag="a"
    href="#"
    onClick={preventDefault}
    variant={isPrimary ? ButtonVariant.Primary : ButtonVariant.Float}
    size={ButtonSize.Small}
    icon={icon}
  >
    {children}
  </Button>
);

/** Bottom row for widgets that don't scroll: meta left, action right. */
const ActionRow = ({
  meta,
  children,
}: {
  meta?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <div className="mt-auto flex min-h-8 shrink-0 items-center gap-2 pt-3">
    {meta && (
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
        {meta}
      </span>
    )}
    <span className="ml-auto flex items-center gap-2">{children}</span>
  </div>
);

const Hero = ({
  value,
  tone,
  children,
}: {
  value: ReactNode;
  tone?: Tone;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col">
    <span
      className={classNames(
        'font-bold tabular-nums leading-none typo-large-title',
        tone ? toneClass[tone].text : 'text-text-primary',
      )}
    >
      {value}
    </span>
    {children && (
      <span className="mt-1 text-text-tertiary typo-footnote">{children}</span>
    )}
  </div>
);

const accent = (tone: string, percent: number): string =>
  `color-mix(in srgb, var(--theme-accent-${tone}-default) ${percent}%, transparent)`;

/*
 * Each widget's own material, set by the moment it serves, the way the
 * streak widget wears the milestone pop-up's fire. One idea per widget,
 * kept low enough that the content always leads.
 */
export type Mood =
  | 'live'
  | 'control'
  | 'terminal'
  | 'social'
  | 'inbox'
  | 'library'
  | 'dawn'
  | 'market'
  | 'brief';

const moodLayers: Record<Mood, CSSProperties> = {
  // Happening now: a newsroom on air, lit green from the live dot.
  live: {
    backgroundImage: `radial-gradient(90% 60% at 0% 0%, ${accent(
      'avocado',
      22,
    )} 0%, transparent 70%), linear-gradient(to right, ${accent(
      'avocado',
      60,
    )}, transparent 60%)`,
    backgroundSize: '100% 100%, 100% 2px',
    backgroundRepeat: 'no-repeat',
  },
  // Your agents: a control room, a calm blue on a faint instrument grid.
  control: {
    backgroundImage: `radial-gradient(120% 70% at 100% 0%, ${accent(
      'water',
      20,
    )} 0%, transparent 70%), radial-gradient(${accent(
      'water',
      18,
    )} 1px, transparent 1px)`,
    backgroundSize: '100% 100%, 14px 14px',
  },
  // Claude Code: a terminal, darker than its neighbours, with scanlines.
  terminal: {
    backgroundColor: 'var(--theme-background-default)',
    backgroundImage: `radial-gradient(80% 60% at 100% 100%, ${accent(
      'bacon',
      18,
    )} 0%, transparent 70%), repeating-linear-gradient(to bottom, transparent 0 3px, ${accent(
      'salt',
      3,
    )} 3px 4px)`,
  },
  // Notifications: people reaching out, a warm purple from the badge.
  social: {
    backgroundImage: `radial-gradient(90% 70% at 0% 0%, ${accent(
      'cabbage',
      24,
    )} 0%, transparent 70%)`,
  },
  // Messages: conversation, two soft bubbles of colour.
  inbox: {
    backgroundImage: `radial-gradient(60% 45% at 100% 100%, ${accent(
      'cabbage',
      18,
    )} 0%, transparent 70%), radial-gradient(50% 40% at 0% 100%, ${accent(
      'water',
      14,
    )} 0%, transparent 70%)`,
  },
  // Reading list: a shelf for later, warm like paper under a lamp.
  library: {
    backgroundImage: `linear-gradient(to top, ${accent(
      'bun',
      20,
    )} 0%, transparent 55%), radial-gradient(80% 50% at 100% 0%, ${accent(
      'bun',
      12,
    )} 0%, transparent 70%)`,
  },
  // Your brief: the morning, a dawn sky fading into the page.
  dawn: {
    backgroundImage: `linear-gradient(to bottom, ${accent(
      'cheese',
      16,
    )} 0%, ${accent('bacon', 10)} 22%, ${accent(
      'onion',
      8,
    )} 45%, transparent 70%)`,
  },
  // Trending: a market, green rising from the floor on a faint grid.
  market: {
    backgroundImage: `linear-gradient(to top, ${accent(
      'avocado',
      16,
    )} 0%, transparent 50%), linear-gradient(${accent(
      'salt',
      4,
    )} 1px, transparent 1px)`,
    backgroundSize: '100% 100%, 100% 2rem',
  },
  // The briefing read in place: the brief card's own pastel, as paper.
  brief: {
    backgroundImage: `linear-gradient(160deg, ${accent(
      'onion',
      16,
    )} 0%, ${accent('water', 10)} 40%, transparent 75%)`,
  },
};

const MoodLayer = ({ mood }: { mood: Mood }): ReactElement => (
  <span
    aria-hidden
    className="pointer-events-none absolute -inset-4 -z-1"
    style={moodLayers[mood]}
  />
);

export const Stack = ({
  children,
  mood,
}: {
  children: ReactNode;
  mood?: Mood;
}): ReactElement => (
  <div className="relative isolate flex h-full min-h-0 flex-col">
    {mood && <MoodLayer mood={mood} />}
    {children}
  </div>
);

/** A production card that is the whole widget: it fills the tile, no frame. */
const Fill = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-full min-h-0 flex-1 flex-col [&>*]:h-full [&>*]:max-h-none [&>*]:min-h-0 [&>*]:flex-1">
    {children}
  </div>
);

export const ago = (date: Date | string): string =>
  formatDistanceToNowStrict(new Date(date))
    .replace(/ minutes?/, 'm')
    .replace(/ hours?/, 'h')
    .replace(/ days?/, 'd')
    .replace(/ seconds?/, 's');

/* ------------------------------------------------------------------ */
/* Fixtures, shaped like production data                               */
/* ------------------------------------------------------------------ */

const briefPost: Post = {
  ...realPosts[0],
  id: 'brief-today',
  type: PostType.Brief,
  title: briefing.headline,
  readTime: 4,
  createdAt: new Date(Date.now() - 1000 * 60 * 63).toISOString(),
  flags: {
    generatedAt: new Date(Date.now() - 1000 * 60 * 60),
    posts: 41,
    sources: 18,
  },
} as Post;

const bullet = (title: string, body: string, post: Post) =>
  `<li><strong>${title}</strong>: ${body} <a href="${post.commentsPermalink}">${post.source?.name}</a></li>`;

const squad: Squad = {
  id: 'rust-builders',
  name: 'Rust Builders',
  handle: 'rustbuilders',
  permalink: 'https://app.daily.dev/squads/rustbuilders',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/5',
  headerImage: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/4',
  description:
    'Crates, compilers and the weekly roundup for people shipping Rust.',
  active: true,
  public: true,
  type: SourceType.Squad,
  membersCount: 12_400,
  memberPostingRole: SourceMemberRole.Member,
  memberInviteRole: SourceMemberRole.Member,
  members: { edges: [] },
} as unknown as Squad;

export const trending: { tag: string; change: number; posts: number }[] = [
  { tag: 'claude-code', change: 340, posts: 128 },
  { tag: 'tanstack', change: 210, posts: 64 },
  { tag: 'bun', change: 95, posts: 41 },
  { tag: 'postgres', change: 60, posts: 88 },
  { tag: 'rust', change: 42, posts: 73 },
  { tag: 'nextjs', change: 18, posts: 102 },
];

export const messages = [
  {
    from: 'Lee',
    avatar: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/1',
    text: 'Did you try the new Bun release? The test runner is wild',
    at: '2m',
    isUnread: true,
  },
  {
    from: 'Chris',
    avatar: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/2',
    text: 'Thanks for the review on the RFC!',
    at: '1h',
    isUnread: true,
  },
  {
    from: 'Ana',
    avatar: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/6',
    text: 'Joining the hackathon this weekend?',
    at: 'Mon',
    isUnread: false,
  },
  {
    from: 'Ido',
    avatar: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/4',
    text: 'Sent you the deck, the rail section is on slide 4',
    at: 'Sun',
    isUnread: false,
  },
  {
    from: 'Nimrod',
    avatar: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/5',
    text: 'Great write-up on the TanStack release',
    at: 'Sat',
    isUnread: false,
  },
];

export const continuePost = realPosts[7];
export const podcastArt =
  'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3';

/* ------------------------------------------------------------------ */
/* Which widgets are cards, production, or new                          */
/* ------------------------------------------------------------------ */

/** The production UI is itself a card: it is the whole tile, no frame. */
export const isCardWidget = (kind: WidgetKind, size: WidgetSize): boolean =>
  (size !== 's' && ['featured', 'digest', 'ad'].includes(kind)) ||
  ['promo', 'whatsnew'].includes(kind) ||
  (kind === 'briefing' && size !== 's');

const productionKinds: WidgetKind[] = [
  'featured',
  'digest',
  'ad',
  'squads',
  'briefing',
  'brieftext',
  'happening',
  'agents',
  'notifications',
  'bookmarks',
  'streak',
];

/** Rendered from the production component, not from a sketch. */
export const hasProductionUI = (kind: WidgetKind): boolean =>
  productionKinds.includes(kind);

/** Features with no production UI yet: designed here first. */
export const isNewFeature = (kind: WidgetKind): boolean =>
  [
    'podcast',
    'dms',
    'whatsnew',
    'continue',
    'promo',
    'mybrief',
    'trending',
    'codingagents',
  ].includes(kind);

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** An image-led small tile: full-bleed artwork, title on a scrim. */
const ArtworkTile = ({
  kind,
  image,
  title,
  meta,
  action,
}: {
  kind: WidgetKind;
  image?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
}): ReactElement => (
  <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
    {image && (
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-background-default via-background-default/50 to-transparent" />
    {/* The label sits on the artwork's busiest part, so it gets its own scrim. */}
    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-overlay-primary-pepper to-transparent" />
    <div className="relative flex h-full flex-col">
      <WidgetLabel kind={kind} isOnMedia />
      <div className="mt-auto flex items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="line-clamp-3 font-bold text-text-primary typo-callout">
            {title}
          </span>
          {meta && (
            <span className="mt-1 truncate text-text-secondary typo-footnote">
              {meta}
            </span>
          )}
        </div>
        {action}
      </div>
    </div>
  </div>
);

export const PlayButton = (): ReactElement => (
  <span className="flex size-10 shrink-0 items-center justify-center rounded-max bg-text-primary text-surface-invert">
    <PlayIcon size={IconSize.Small} />
  </span>
);

const Avatar = ({
  src,
  isRound,
}: {
  src?: string;
  isRound?: boolean;
}): ReactElement => (
  <img
    src={src}
    alt=""
    className={classNames(
      'size-8 shrink-0 object-cover',
      isRound ? 'rounded-max' : 'rounded-10',
    )}
  />
);

export const LiveDot = (): ReactElement => (
  <span className="relative flex size-4 shrink-0 items-center justify-center">
    <span className="absolute size-2 animate-ping rounded-max bg-accent-avocado-default opacity-50 motion-reduce:animate-none" />
    <span className="relative size-2 rounded-max bg-accent-avocado-default" />
  </span>
);

const LivePill = (): ReactElement => (
  <span className="flex shrink-0 items-center gap-1 rounded-max bg-accent-avocado-flat py-0.5 pl-1 pr-1.5 font-bold text-accent-avocado-default typo-caption2">
    <span className="relative flex size-1.5">
      <span className="absolute inset-0 animate-ping rounded-max bg-accent-avocado-default opacity-50 motion-reduce:animate-none" />
      <span className="relative size-1.5 rounded-max bg-accent-avocado-default" />
    </span>
    Live
  </span>
);

/* ------------------------------------------------------------------ */
/* The widgets                                                         */
/* ------------------------------------------------------------------ */

const TopStory = ({ size }: { size: WidgetSize }): ReactElement => {
  const [lead] = realHeroPosts;
  if (size === 's') {
    return (
      <ArtworkTile
        kind="featured"
        image={lead.image}
        title={lead.title ?? ''}
        meta={`${lead.source?.name} · ${lead.readTime}m read`}
      />
    );
  }
  if (size === 'l') {
    return (
      <Fill>
        <div className="@container/wide flex h-full [&>*]:h-full [&>*]:flex-1">
          <ArticleFeaturedWideGridCard post={lead} hero {...cardHandlers} />
        </div>
      </Fill>
    );
  }
  return (
    <Fill>
      <ArticleGrid post={lead} {...cardHandlers} />
    </Fill>
  );
};

/**
 * Every list row in every widget hovers the same way: the brand's inset
 * rounded surface, 0.5rem past the text on each side.
 */
export const rowHoverClassName =
  'cursor-pointer transition-colors duration-150 hover:bg-surface-hover motion-reduce:transition-none';

/** Lists: tight rows, bold two-line titles, a quiet meta line. */
export const MiniList = ({
  items,
  isWide,
  isFullBleed,
}: {
  items: {
    id: string;
    title: ReactNode;
    meta?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
  }[];
  /** Large: two columns, so the extra width carries more rows. */
  isWide?: boolean;
  /** Rows hover edge to edge, for lists that already run to the card edge. */
  isFullBleed?: boolean;
}): ReactElement => (
  <ul
    className={classNames(
      'gap-1',
      isWide ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
    )}
  >
    {items.map((item) => (
      <li
        key={item.id}
        className={classNames(
          rowHoverClassName,
          isFullBleed ? '-mx-4 px-4' : '-mx-2 rounded-12 px-2',
          'flex items-start gap-2.5 py-1.5',
        )}
      >
        {item.leading}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
            {item.title}
          </span>
          {item.meta && (
            <span className="truncate text-text-tertiary typo-caption1">
              {item.meta}
            </span>
          )}
        </div>
        {item.trailing}
      </li>
    ))}
  </ul>
);

const Happening = ({ size }: { size: WidgetSize }): ReactElement => {
  const label = (
    <WidgetLabel kind="happening" leading={<LiveDot />} link="Read all">
      Happening now
    </WidgetLabel>
  );
  if (size === 's') {
    return (
      <Stack mood="live">
        {label}
        <Scroll>
          <MiniList
            items={highlights.map((item) => ({
              id: item.id,
              title: item.headline,
              meta: ago(item.highlightedAt),
            }))}
          />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack mood="live">
      {label}
      {/* The production rows; their card's own title and footer are hidden
          because every widget shares the system header. */}
      <Scroll
        className={classNames(
          '[&_a]:!-mx-2 [&_a]:!w-[calc(100%+1rem)] [&_a]:!px-2 [&_a]:after:!inset-x-2 [&_a>span>span]:inline-flex [&_a>span>span]:items-center [&_a>span>span]:whitespace-nowrap [&_a>span>span]:align-baseline [&_a>span>span]:ml-1.5 [&_a>span>span>span[aria-hidden]]:hidden [&_a>span>span_button]:-my-1 [&>div>div:last-child]:hidden [&>div>header]:hidden [&_*]:!overflow-visible [&_*]:![mask-image:none]',
          size === 'l' &&
            '[&>div>div:nth-child(2)>*]:break-inside-avoid [&>div>div:nth-child(2)]:block [&>div>div:nth-child(2)]:columns-2 [&>div>div:nth-child(2)]:gap-x-6',
        )}
      >
        <div className="flex flex-col">
          <HighlightCardContent
            highlights={highlights}
            variant="grid"
            compact
          />
        </div>
      </Scroll>
    </Stack>
  );
};

/*
 * The reader's own daily.dev agents, from the agents product's own fixtures
 * and state model: each row is the agent's latest report, not a headline.
 */
const agentReports: Record<string, string> = {
  demo: 'I went through 128 posts and kept six. Zig 0.15 makes the self-hosted backend the default, so debug builds no longer need LLVM.',
  'demo-2':
    'Kept 4 of 340. Two agent harnesses shipped background tasks this week, and one benchmark finally measures fixes, not demos.',
  'demo-3': 'Scanning 92 posts from the last hour…',
  'demo-4':
    'Nothing worth your time today: 214 posts, none of them war stories from production.',
  'demo-6': 'Could not reach 2 of your sources. I will retry on the next run.',
};

const ownAgents = toMonitorItems(recentMockAgents())
  .filter((item) => item.id in agentReports)
  .map((item) => ({
    ...item,
    report: agentReports[item.id],
  }));

const OwnAgentRow = ({
  agent,
  lines,
}: {
  agent: (typeof ownAgents)[number];
  lines: string;
}): ReactElement => (
  <li
    className={classNames(
      '-mx-2 flex items-start gap-2.5 rounded-12 px-2 py-1.5',
      rowHoverClassName,
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex items-baseline gap-1.5">
        <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
          {agent.name}
        </span>
        {agent.at && (
          <span className="shrink-0 text-text-quaternary typo-caption1">
            {ago(agent.at)}
          </span>
        )}
      </span>
      <span className={classNames('text-text-secondary typo-footnote', lines)}>
        {agent.report}
      </span>
    </div>
  </li>
);

/** Your agents: what each one found since you last looked. */
const Agents = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack mood="control">
    <WidgetLabel
      kind="agents"
      afterName={
        ownAgents.some((agent) => agent.state === 'running') ? (
          <LivePill />
        ) : undefined
      }
      link="View all"
    />
    <Scroll>
      <ul
        className={classNames(
          'gap-1',
          size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
        )}
      >
        {ownAgents.map((agent) => (
          <OwnAgentRow
            key={agent.id}
            agent={agent}
            lines={size === 's' ? 'line-clamp-2' : 'line-clamp-3'}
          />
        ))}
      </ul>
    </Scroll>
  </Stack>
);

type SessionState = 'running' | 'review' | 'done';

/** A reader's Claude Code sessions, named the way developers name them. */
const sessions: {
  title: string;
  state: SessionState;
  update: string;
  at: string;
}[] = [
  {
    title: 'Fix flaky auth refresh test',
    state: 'running',
    update: 'Running the suite a third time to rule out the clock mock',
    at: 'now',
  },
  {
    title: 'Migrate payments to Stripe v2',
    state: 'review',
    update: 'PR #482 is ready: 14 files, webhooks covered by new tests',
    at: '12m',
  },
  {
    title: 'Add rate limiting to public API',
    state: 'review',
    update: 'Token bucket per key, 120 req/min. Needs a call on burst size',
    at: '40m',
  },
  {
    title: 'Upgrade Next.js to 16',
    state: 'running',
    update: 'Fixing 3 type errors left after the codemod',
    at: '1h',
  },
  {
    title: 'Profile slow feed query',
    state: 'done',
    update: 'Added a composite index; p95 went from 840ms to 95ms',
    at: '3h',
  },
  {
    title: 'Refactor onboarding steps',
    state: 'done',
    update: 'Merged. Removed 410 lines and the old step registry',
    at: 'Yesterday',
  },
];

const sessionDot: Record<SessionState, string> = {
  running: 'bg-accent-cabbage-default animate-pulse motion-reduce:animate-none',
  review: 'bg-accent-water-default',
  done: 'bg-text-quaternary',
};

const sessionLabel: Record<SessionState, string> = {
  running: 'Running',
  review: 'Waiting for review',
  done: 'Done',
};

/** The Claude Code mark stand-in: one product, so one tile in the header. */
const ClaudeCodeTile = (): ReactElement => (
  <span className="flex size-4 shrink-0 items-center justify-center rounded-4 bg-accent-bacon-default text-white">
    <TerminalIcon size={IconSize.XXSmall} />
  </span>
);

/**
 * Your coding-agent sessions, the way the Claude desktop sidebar lists
 * them: a code glyph, the session's name, and a dot for its state, with
 * the latest update under it where there is room.
 */
const CodingAgents = ({ size }: { size: WidgetSize }): ReactElement => {
  const running = sessions.filter((session) => session.state === 'running');
  return (
    <Stack mood="terminal">
      <WidgetLabel
        kind="codingagents"
        leading={<ClaudeCodeTile />}
        afterName={
          running.length ? (
            <span className="shrink-0 text-text-tertiary typo-caption1">
              {running.length} running
            </span>
          ) : undefined
        }
        link="Open"
      >
        Claude Code
      </WidgetLabel>
      <Scroll>
        <ul
          className={classNames(
            'gap-0.5',
            size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
          )}
        >
          {sessions.map((session) => (
            <li
              key={session.title}
              className={classNames(
                '-mx-2 flex items-start gap-2.5 rounded-12 px-2',
                size === 's' ? 'py-1.5' : 'py-2',
                rowHoverClassName,
              )}
            >
              <span className="mt-0.5 shrink-0 font-mono text-text-tertiary typo-caption1">
                {'</>'}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-mono font-bold text-text-primary typo-footnote">
                    {session.title}
                  </span>
                  <span
                    title={sessionLabel[session.state]}
                    aria-label={sessionLabel[session.state]}
                    className={classNames(
                      'size-2 shrink-0 rounded-max',
                      sessionDot[session.state],
                    )}
                  />
                </span>
                {size !== 's' && (
                  <span className="line-clamp-2 text-text-tertiary typo-caption1">
                    {session.state === 'review' && (
                      <span className="font-bold text-accent-water-default">
                        Review ·{' '}
                      </span>
                    )}
                    {session.update} · {session.at}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Scroll>
    </Stack>
  );
};

const Notifications = ({ size }: { size: WidgetSize }): ReactElement => {
  const withAvatar = sampleNotifications.filter(
    (notification) => notification.avatars?.[0]?.image,
  );
  const recent = size === 'l' ? withAvatar : withAvatar.slice(0, 8);
  return (
    <Stack mood="social">
      <WidgetLabel
        kind="notifications"
        badge={4}
        isSquareBadge
        link="View all"
      />
      <Scroll>
        <MiniList
          isWide={size === 'l'}
          items={recent.map((notification, index) => ({
            id: notification.referenceId ?? `${index}`,
            leading: (
              <img
                src={notification.avatars?.[0]?.image}
                alt=""
                className={classNames(
                  'mt-0.5 shrink-0 rounded-max object-cover',
                  size === 's' ? 'size-6' : 'size-8',
                )}
              />
            ),
            title: (
              <span
                className="font-normal [&_b]:font-bold"
                // Mock data shaped like the API's notification title HTML.
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: notification.title }}
              />
            ),
            meta: notification.createdAt
              ? ago(notification.createdAt)
              : undefined,
            trailing: index < 4 && (
              <span className="mt-1.5 size-2 shrink-0 rounded-max bg-accent-cabbage-default" />
            ),
          }))}
        />
      </Scroll>
    </Stack>
  );
};

/** Rows read title-first: the text leads, the thumbnail sits on the right. */
export const PostList = ({
  posts,
  isWide,
  isFullBleed,
  byline = (post) => `${post.source?.name} · ${post.readTime}m read`,
}: {
  posts: Post[];
  isWide?: boolean;
  isFullBleed?: boolean;
  byline?: (post: Post, index: number) => string;
}): ReactElement => (
  <MiniList
    isWide={isWide}
    isFullBleed={isFullBleed}
    items={posts.map((post, index) => ({
      id: post.id,
      title: post.title,
      meta: byline(post, index),
      trailing: (
        <img
          src={post.image}
          alt=""
          className="size-12 shrink-0 rounded-10 object-cover"
        />
      ),
    }))}
  />
);

export const squadPosts = realPosts.slice(20, 28);

/** Every post comes from this squad, so the byline names who posted it. */
const squadAuthors = [
  'Lee Hansel',
  'Ana Ribeiro',
  'Chris Bongers',
  'Ido Shamun',
  'Nimrod Kramer',
  'Tobias Wolf',
  'Sam Okafor',
  'Mia Chen',
];

const squadByline = (post: Post, index: number): string =>
  `${squadAuthors[index % squadAuthors.length]} · ${ago(
    post.createdAt ?? new Date(),
  )}`;

const SquadAvatar = ({ className }: { className: string }): ReactElement => (
  <img
    src={squad.image}
    alt=""
    className={classNames('shrink-0 rounded-max object-cover', className)}
  />
);

/**
 * The squad's own cover leads. The whole card scrolls as one page, cover
 * and name included; only "Open squad" stays pinned.
 */
const Squads = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel
          kind="squads"
          leading={<SquadAvatar className="size-5" />}
          link="Open squad"
        >
          {squad.name}
        </WidgetLabel>
        <Scroll>
          <PostList posts={squadPosts} byline={squadByline} />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack>
      <Scroll isUnderHeader={false} isFullBleed className="!-mt-4">
        <div className={classNames('relative', size === 'l' ? 'h-28' : 'h-24')}>
          <img
            src={squad.headerImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <SquadAvatar className="absolute -bottom-7 left-4 size-14 border-4 border-background-subtle" />
        </div>
        <span className="ml-[4.75rem] mt-1.5 block truncate pr-4 font-bold text-text-primary typo-callout">
          {squad.name}
        </span>
        <div className="mt-5 px-4">
          <PostList
            posts={squadPosts}
            byline={squadByline}
            isWide={size === 'l'}
            isFullBleed={size !== 'l'}
          />
        </div>
      </Scroll>
      <div className="absolute -right-1 -top-1">
        <Button
          tag="a"
          href="#"
          onClick={preventDefault}
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
        >
          Open squad
        </Button>
      </div>
    </Stack>
  );
};

export const savedPosts: Post[] = [3, 8, 11, 14, 16, 18].map(
  (index) => realPosts[index],
);

const Bookmarks = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack mood="library">
    <WidgetLabel
      kind="bookmarks"
      afterName={
        <span className="font-bold tabular-nums text-text-tertiary typo-caption1">
          23
        </span>
      }
      link="View all"
    />
    <Scroll>
      <PostList
        posts={size === 'l' ? realPosts.slice(3, 13) : savedPosts}
        isWide={size === 'l'}
      />
    </Scroll>
  </Stack>
);

const Briefing = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel
          kind="briefing"
          trailing={
            <span className="text-text-tertiary typo-caption1">4 min</span>
          }
        >
          Presidential briefing
        </WidgetLabel>
        <span className="mt-2 line-clamp-2 font-bold text-text-primary typo-callout">
          {briefing.headline}
        </span>
        <Scroll isUnderHeader={false}>
          <MiniList
            items={briefing.stack.slice(0, 3).map((line) => ({
              id: line.text,
              title: (
                <span className="font-normal">
                  <b className="font-bold">{line.why}</b> {line.text}
                </span>
              ),
            }))}
          />
        </Scroll>
      </Stack>
    );
  }
  const card = (
    <BriefCardReady
      post={briefPost}
      title="Presidential briefing"
      targetId={TargetId.Feed}
    />
  );
  if (size === 'm') {
    // The production card's white outline and black inner ring are dropped:
    // the widget's own corner is frame enough.
    return (
      <div className="flex h-full min-h-0 flex-1 [&>*]:h-full [&>*]:max-h-none [&>*]:flex-1 [&>*]:!border-0 [&>*>*]:!border-0">
        {card}
      </div>
    );
  }
  // Large: split in half. The production card, edge to edge, is the left
  // half; the must-know list is the right half, on the widget's surface.
  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
      <div className="flex w-1/2 shrink-0 [&>*]:h-full [&>*]:max-h-none [&>*]:flex-1 [&>*]:!rounded-none [&>*]:!border-0 [&>*>*]:!rounded-none [&>*>*]:!border-0">
        {card}
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col p-4">
        <WidgetLabel kind="briefing" link="Read the brief">
          Must know
        </WidgetLabel>
        <Scroll>
          <MiniList
            items={briefing.stack.map((line) => ({
              id: line.text,
              title: line.text,
              meta: `${line.why} · ${line.sources[0].source?.name}`,
            }))}
          />
        </Scroll>
      </div>
    </div>
  );
};

/** The brief body as the backend sends it: sections of bold-led bullets. */
const briefSection = (title: string, from: number, to?: number): string =>
  `<h2>${title}</h2><ul>${briefing.stack
    .slice(from, to)
    .map((line) => bullet(line.why, line.text, line.sources[0]))
    .join('')}</ul>`;

const briefHtml =
  briefSection('Must know', 0, 3) + briefSection('Worth a look', 3);

/** The brief itself, in the brief page's own typography, read in place. */
const BriefText = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack mood="brief">
    <WidgetLabel
      kind="briefing"
      trailing={<span className="text-text-tertiary typo-caption1">4 min</span>}
      link="Open"
    >
      Presidential briefing
    </WidgetLabel>
    <Scroll
      className={classNames(
        '[&_h2]:!mb-1 [&_h2]:!mt-0 [&_h2]:!font-bold [&_h2]:!text-text-tertiary [&_h2]:!typo-footnote [&_li]:!mb-2 [&_li]:!typo-callout [&_ul]:!mb-3',
      )}
    >
      <span className="mb-3 block font-bold text-text-primary typo-title3">
        {briefing.headline}
      </span>
      {size === 'l' ? (
        <div className="grid grid-cols-2 gap-8">
          <Markdown content={briefSection('Must know', 0, 3)} />
          <Markdown content={briefSection('Worth a look', 3)} />
        </div>
      ) : (
        <Markdown content={briefHtml} />
      )}
    </Scroll>
  </Stack>
);

const YourBriefing = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack mood="dawn">
    <WidgetLabel
      kind="mybrief"
      afterName={
        <span className="shrink-0 text-text-tertiary typo-caption1">
          Last 24h
        </span>
      }
      link="Listen"
    >
      Your brief
    </WidgetLabel>
    <Scroll>
      <span
        className={classNames(
          'mb-3 block font-bold text-text-primary',
          size === 's' && 'typo-callout',
          size !== 's' && 'typo-title3',
        )}
      >
        {briefing.headline}
      </span>
      <ul
        className={classNames(
          'gap-1',
          size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
        )}
      >
        {briefing.stack.map((line) => (
          <li
            key={line.text}
            className={classNames(
              '-mx-2 flex flex-col gap-1 rounded-12 px-2 py-1.5',
              rowHoverClassName,
            )}
          >
            <span className="text-text-quaternary typo-caption1">
              {line.why}
            </span>
            <span className="text-text-primary typo-footnote">
              {line.text} <SourceChip post={line.sources[0]} />
            </span>
          </li>
        ))}
      </ul>
    </Scroll>
  </Stack>
);

const episodes = [
  { title: 'Ep. 41: The state of Rust in 2026', meta: '44 min · Oct 7' },
  { title: 'Ep. 40: Why every team needs a platform', meta: '36 min · Sep 30' },
  { title: 'Ep. 39: Postgres is eating the stack', meta: '41 min · Sep 23' },
  { title: 'Ep. 38: Shipping a design system twice', meta: '33 min · Sep 16' },
];

/**
 * Apple Music's grammar: the artwork, blurred, becomes the card, so the
 * episode carries its own colour into the rail.
 */
const Podcast = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <ArtworkTile
        kind="podcast"
        image={podcastArt}
        title="Ep. 42: Shipping production code with agents"
        meta="38 min · out today"
        action={<PlayButton />}
      />
    );
  }
  const player = (
    <div className="mt-auto flex items-center gap-3 pt-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-1 overflow-hidden rounded-max bg-white/[0.24]">
          <div className="h-full w-1/3 rounded-max bg-white" />
        </div>
        <span className="tabular-nums text-white/[0.64] typo-caption1">
          25 min left
        </span>
      </div>
      <PlayButton />
    </div>
  );
  return (
    <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
      <img
        src={podcastArt}
        alt=""
        className="absolute inset-0 h-full w-full scale-150 object-cover blur-3xl saturate-150"
      />
      <div className="absolute inset-0 bg-overlay-tertiary-pepper" />
      <div className="relative flex h-full flex-col">
        <WidgetLabel kind="podcast" link="All episodes" isOnMedia />
        {size === 'm' ? (
          <>
            <img
              src={podcastArt}
              alt=""
              className="mx-auto mt-3 aspect-square w-4/5 rounded-12 object-cover shadow-3"
            />
            <span className="mt-4 line-clamp-2 font-bold text-white typo-callout">
              Ep. 42: Shipping production code with agents
            </span>
            <span className="mt-0.5 text-white/[0.64] typo-footnote">
              daily.dev podcast · Oct 14
            </span>
            {player}
          </>
        ) : (
          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            <div className="flex items-end gap-4">
              <img
                src={podcastArt}
                alt=""
                className="size-32 shrink-0 rounded-12 object-cover shadow-3"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-white/[0.64] typo-caption1">
                  Out today · 38 min
                </span>
                <span className="mt-1 line-clamp-2 font-bold text-white typo-title3">
                  Ep. 42: Shipping production code with agents
                </span>
                <span className="mt-1 line-clamp-2 text-white/[0.8] typo-footnote">
                  Ido and Nimrod on what changes when agents write most of the
                  diff: review, ownership and the tests nobody reads.
                </span>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/[0.16] pt-3">
              {episodes.map((episode) => (
                <li key={episode.title} className="flex min-w-0 flex-col">
                  <span className="truncate font-bold text-white typo-footnote">
                    {episode.title}
                  </span>
                  <span className="text-white/[0.64] typo-caption1">
                    {episode.meta}
                  </span>
                </li>
              ))}
            </ul>
            {player}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageRows = ({ isCompact }: { isCompact?: boolean }): ReactElement => (
  <ul className="flex flex-col gap-1">
    {messages.map((message) => (
      <li
        key={message.from}
        className={classNames(
          '-mx-2 flex items-start gap-2.5 rounded-12 px-2 py-1.5',
          rowHoverClassName,
        )}
      >
        <Avatar src={message.avatar} isRound />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline gap-2">
            <span
              className={classNames(
                'min-w-0 flex-1 truncate text-text-primary typo-footnote',
                message.isUnread && 'font-bold',
              )}
            >
              {message.from}
            </span>
            <span className="text-text-quaternary typo-caption1">
              {message.at}
            </span>
          </span>
          <span
            className={classNames(
              'typo-caption1',
              isCompact ? 'line-clamp-1' : 'line-clamp-2',
              message.isUnread ? 'text-text-primary' : 'text-text-tertiary',
            )}
          >
            {message.text}
          </span>
        </div>
      </li>
    ))}
  </ul>
);

const thread = [
  { isMine: false, text: 'Did you try the new Bun release?' },
  { isMine: false, text: 'The test runner is wild, 4x faster on our repo' },
  { isMine: true, text: 'Not yet! Does it run our jest setup as is?' },
  { isMine: false, text: 'Mostly. Snapshot paths needed one tweak' },
];

/** Large opens the newest conversation beside the inbox, like Messages. */
const Messages = ({ size }: { size: WidgetSize }): ReactElement => {
  const unread = messages.filter((message) => message.isUnread).length;
  const inbox = (
    <>
      <WidgetLabel
        kind="dms"
        badge={unread}
        isSquareBadge
        link="Open"
        isLinkPrimary
      />
      <Scroll>
        <MessageRows isCompact={size === 'l'} />
      </Scroll>
    </>
  );
  if (size !== 'l') {
    return <Stack mood="inbox">{inbox}</Stack>;
  }
  // Large: the inbox on the left half, the newest conversation open on the
  // right half, the two split by a hairline rather than boxed.
  const [latest] = messages;
  return (
    <div className="relative isolate flex h-full min-h-0">
      <MoodLayer mood="inbox" />
      <div className="relative flex min-w-0 flex-1 flex-col pr-4">{inbox}</div>
      <div className="-my-4 -mr-4 flex w-1/2 shrink-0 flex-col border-l border-border-subtlest-tertiary p-4">
        <div className="flex h-6 shrink-0 items-center gap-2">
          <img
            src={latest.avatar}
            alt=""
            className="size-5 rounded-max object-cover"
          />
          <span className="font-bold text-text-primary typo-caption1">
            {latest.from}
          </span>
          <span className="text-text-quaternary typo-caption1">
            {latest.at} ago
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-1.5">
          {thread.map((bubble) => (
            <span
              key={bubble.text}
              className={classNames(
                'max-w-[85%] rounded-12 px-3 py-2 text-text-primary typo-footnote',
                bubble.isMine
                  ? 'self-end rounded-br-4 bg-surface-float'
                  : 'self-start rounded-bl-4 border border-border-subtlest-tertiary',
              )}
            >
              {bubble.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/** A tag's posts per hour over the last day: climbs late, like a breakout. */
export const momentum = (seed: number): number[] =>
  Array.from({ length: 24 }, (_, hour) => {
    const wave = Math.sin(hour * 0.9 + seed * 2.3) * (0.06 + seed * 0.01);
    const climb = (hour / 23) ** (1.5 + seed * 0.5);
    return Math.min(0.96, Math.max(0.06, 0.12 + climb * 0.78 + wave));
  });

export const Sparkline = ({
  values,
  isArea,
  className,
}: {
  values: number[];
  isArea?: boolean;
  className?: string;
}): ReactElement => {
  const points = values.map(
    (value, index) =>
      `${(index / (values.length - 1)) * 100},${100 - value * 100}`,
  );
  const line = `M${points.join(' L')}`;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={classNames('text-accent-avocado-default', className)}
      aria-hidden
    >
      {isArea && (
        <path
          d={`${line} L100,100 L0,100 Z`}
          className="fill-current opacity-[0.16]"
        />
      )}
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={isArea ? 2 : 6}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: isArea ? 2 : 1.5 }}
      />
    </svg>
  );
};

const SelectedArrow = (): ReactElement => (
  <ArrowIcon
    size={IconSize.Size16}
    className="shrink-0 rotate-90 text-text-primary"
  />
);

const TrendRow = ({
  item,
  index,
  isSelected,
  hasSparkline,
  rowPadding,
  onSelect,
}: {
  item: (typeof trending)[number];
  index: number;
  isSelected?: boolean;
  hasSparkline?: boolean;
  rowPadding: string;
  onSelect?: () => void;
}): ReactElement => {
  const Tag = onSelect ? 'button' : 'span';
  return (
    <li>
      <Tag
        {...(onSelect
          ? {
              type: 'button' as const,
              onClick: onSelect,
              'aria-pressed': isSelected,
            }
          : {})}
        className={classNames(
          '-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-12 px-2 tabular-nums',
          rowHoverClassName,
          rowPadding,
          isSelected && '!bg-surface-float',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left font-bold text-text-primary typo-footnote">
          #{item.tag}
        </span>
        {hasSparkline && (
          <Sparkline values={momentum(index + 1)} className="h-5 w-14" />
        )}
        <span className="w-12 text-right font-bold text-accent-avocado-default typo-caption1">
          +{item.change}%
        </span>
        {onSelect && (
          <span className={classNames('flex w-4', !isSelected && 'invisible')}>
            <SelectedArrow />
          </span>
        )}
      </Tag>
    </li>
  );
};

const TrendHero = ({
  item,
  size,
  isSelected,
  onSelect,
}: {
  item: (typeof trending)[number];
  size: WidgetSize;
  isSelected?: boolean;
  /** Large: the hero is a row too, picking its own posts on the right. */
  onSelect?: () => void;
}): ReactElement => {
  const body = (
    <>
      <Sparkline
        values={momentum(trending.indexOf(item))}
        isArea
        className={classNames(
          'absolute inset-x-0 bottom-0 w-full',
          size === 's' ? 'h-14' : 'h-24',
        )}
      />
      <span className="relative flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-title2">
          #{item.tag}
        </span>
        {isSelected && <SelectedArrow />}
      </span>
      <span className="relative mt-1 flex items-baseline gap-2 tabular-nums">
        <span className="font-bold text-accent-avocado-default typo-title3">
          +{item.change}%
        </span>
        <span className="text-text-tertiary typo-caption1">
          {item.posts} posts · 24h
        </span>
      </span>
      <span className={size === 's' ? 'h-8' : 'h-16'} />
    </>
  );
  if (!onSelect) {
    return (
      <div className="relative -mx-4 mt-2 flex shrink-0 flex-col px-4">
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={classNames(
        'relative -mx-2 mt-2 flex shrink-0 flex-col overflow-hidden rounded-12 px-2 pt-1 text-left',
        rowHoverClassName,
        isSelected && '!bg-surface-float',
      )}
    >
      {body}
    </button>
  );
};

/** The posts carrying a tag's climb, a different handful per tag. */
const postsForTag = (index: number): Post[] =>
  realPosts.slice(30 + index * 2, 36 + index * 2);

/**
 * Apple Stocks' grammar: the breakout tag is the hero, drawn as its own
 * 24-hour chart; the runners-up are ticker rows. Large keeps that column
 * as is and opens the picked tag's top posts beside it, the way the
 * briefing opens its must-know list.
 */
const Trending = ({ size }: { size: WidgetSize }): ReactElement => {
  const [selected, setSelected] = useState(0);
  const [top, ...rest] = trending;
  const rowPadding = size === 's' ? 'py-2' : 'py-3';

  if (size !== 'l') {
    return (
      <Stack mood="market">
        <WidgetLabel kind="trending" link="All tags" />
        <TrendHero item={top} size={size} />
        <Scroll isUnderHeader={false} className="mt-0">
          <ol className="flex flex-col">
            {rest.map((item, index) => (
              <TrendRow
                key={item.tag}
                item={item}
                index={index + 1}
                hasSparkline={size !== 's'}
                rowPadding={rowPadding}
              />
            ))}
          </ol>
        </Scroll>
      </Stack>
    );
  }

  const picked = trending[selected];
  return (
    <div className="relative isolate flex h-full min-h-0">
      <MoodLayer mood="market" />
      <div className="relative flex w-1/2 shrink-0 flex-col pr-4">
        <WidgetLabel kind="trending" link="All tags" />
        <TrendHero
          item={top}
          size="m"
          isSelected={selected === 0}
          onSelect={() => setSelected(0)}
        />
        <Scroll isUnderHeader={false} className="mt-0">
          <ol className="flex flex-col">
            {rest.map((item, index) => (
              <TrendRow
                key={item.tag}
                item={item}
                index={index + 1}
                isSelected={selected === index + 1}
                hasSparkline
                rowPadding="py-2.5"
                onSelect={() => setSelected(index + 1)}
              />
            ))}
          </ol>
        </Scroll>
      </div>
      <div className="relative -my-4 -mr-4 flex min-w-0 flex-1 flex-col border-l border-border-subtlest-tertiary p-4">
        <header className="relative z-3 flex h-6 shrink-0 items-center gap-1 typo-caption1">
          <span className="shrink-0 text-text-tertiary">Top posts in</span>
          <span className="truncate font-bold text-text-primary">
            #{picked.tag}
          </span>
        </header>
        <Scroll key={picked.tag}>
          <PostList posts={postsForTag(selected)} />
        </Scroll>
      </div>
    </div>
  );
};

/** Where the reader stopped, and what is still ahead of them in the post. */
const readingState = {
  progress: 0.6,
  minutesLeft: 4,
  stoppedAt: 'Native AOT, now the default',
  excerpt:
    'Startup falls from 900ms to 60ms once the runtime ships compiled ahead of time, and memory drops by a fifth.',
  ahead: ['Trimming without the warnings', 'Benchmarks against .NET 10'],
};

/** The post's own artwork, blurred, as the card: the podcast's vibe. */
export const ArtworkBackdrop = ({
  image,
}: {
  image?: string;
}): ReactElement => (
  <>
    {image && (
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full scale-150 object-cover blur-3xl saturate-150"
      />
    )}
    <div className="absolute inset-0 bg-overlay-primary-pepper" />
  </>
);

export const ReadingProgress = (): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-1">
    <div className="h-1 overflow-hidden rounded-max bg-white/[0.24]">
      <div
        className="h-full rounded-max bg-white"
        style={{ width: `${readingState.progress * 100}%` }}
      />
    </div>
    <span className="tabular-nums text-white/[0.64] typo-caption1">
      {Math.round(readingState.progress * 100)}% read ·{' '}
      {readingState.minutesLeft} min left
    </span>
  </div>
);

const StoppedAt = (): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <span className="text-white/[0.64] typo-caption1">You stopped at</span>
    <span className="font-bold text-white typo-footnote">
      {readingState.stoppedAt}
    </span>
  </div>
);

const Tldr = ({ lines }: { lines: string }): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="w-fit rounded-6 bg-white/[0.16] px-1.5 font-bold text-white typo-caption2">
      TL;DR
    </span>
    <span className={classNames('text-white/[0.8] typo-footnote', lines)}>
      {continuePost.summary}
    </span>
  </div>
);

/**
 * Continue reading carries the reader back in with what the post page
 * would give them: the TL;DR so far, where they stopped, and what is left.
 * It wears the post's blurred artwork, the way the podcast wears its cover.
 */
const ContinueReading = ({ size }: { size: WidgetSize }): ReactElement => (
  <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
    <ArtworkBackdrop image={continuePost.image} />
    <div className="relative flex h-full min-h-0 flex-col">
      <WidgetLabel kind="continue" isOnMedia />
      {size === 's' && (
        <>
          <div className="mt-3 flex gap-3">
            <img
              src={continuePost.image}
              alt=""
              className="size-14 shrink-0 rounded-10 object-cover shadow-3"
            />
            <span className="line-clamp-3 min-w-0 flex-1 font-bold text-white typo-footnote">
              {continuePost.title}
            </span>
          </div>
          <div className="mt-auto flex items-end gap-3">
            <ReadingProgress />
          </div>
        </>
      )}
      {size === 'm' && (
        <>
          <img
            src={continuePost.image}
            alt=""
            className="mt-3 aspect-video w-full rounded-12 object-cover shadow-3"
          />
          <span className="mt-3 line-clamp-2 font-bold text-white typo-callout">
            {continuePost.title}
          </span>
          <div className="mt-3">
            <StoppedAt />
          </div>
          <div className="mt-3">
            <Tldr lines="line-clamp-3" />
          </div>
          <div className="mt-auto flex items-center gap-3 pt-3">
            <ReadingProgress />
            <Action>Resume</Action>
          </div>
        </>
      )}
      {size === 'l' && (
        <div className="mt-3 flex min-h-0 flex-1 gap-6">
          <div className="flex w-1/2 shrink-0 flex-col">
            <img
              src={continuePost.image}
              alt=""
              className="aspect-video w-full rounded-12 object-cover shadow-3"
            />
            <span className="mt-3 line-clamp-2 font-bold text-white typo-title3">
              {continuePost.title}
            </span>
            <span className="mt-1 text-white/[0.64] typo-caption1">
              {continuePost.source?.name} · {continuePost.readTime}m read
            </span>
            <div className="mt-auto flex items-center gap-3 pt-3">
              <ReadingProgress />
              <Action>Resume</Action>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Tldr lines="line-clamp-4" />
            <div className="flex flex-col gap-1.5 rounded-12 bg-white/[0.08] p-3">
              <StoppedAt />
              <span className="line-clamp-3 text-white/[0.8] typo-caption1">
                “{readingState.excerpt}”
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/[0.64] typo-caption1">
                Still ahead
              </span>
              {readingState.ahead.map((section) => (
                <span
                  key={section}
                  className="flex items-center gap-2 text-white typo-footnote"
                >
                  <span className="size-1.5 shrink-0 rounded-max bg-white/[0.4]" />
                  {section}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Our own space in the hero, built on the ad slot's grammar. Small is one
 * campaign as a tile, or two stacked; Tall puts them over the ad, which is
 * the ad slot itself. No Large: this space promotes, it doesn't browse.
 */
const OwnSpace = ({
  size,
  stripCount,
}: {
  size: WidgetSize;
  stripCount: 1 | 2;
}): ReactElement => {
  const strips = campaignStrips.slice(0, stripCount);
  if (size !== 's') {
    return <AdSlot strips={strips} isRich className="h-full" />;
  }
  if (stripCount === 1) {
    return <RichStrip strip={strips[0]} layout="tile" className="h-full" />;
  }
  return (
    <div className="flex h-full flex-col gap-2">
      {strips.map((strip) => (
        <RichStrip key={strip.id} strip={strip} className="flex-1" />
      ))}
    </div>
  );
};

const Digest = ({ size }: { size: WidgetSize }): ReactElement =>
  size === 'l' ? (
    <Fill>
      <div className="@container/wide flex h-full [&>*]:h-full [&>*]:flex-1">
        <ArticleFeaturedWideGridCard
          post={realPosts[5]}
          hero
          {...cardHandlers}
        />
      </div>
    </Fill>
  ) : (
    <Fill>
      <ArticleGrid post={realPosts[5]} {...cardHandlers} />
    </Fill>
  );

const Ad = (): ReactElement => (
  <Fill>
    <AdGrid ad={adWithoutCta} index={0} feedIndex={0} />
  </Fill>
);

/** Every widget's content: its own signature on the shared system. */
export const ProductionContent = ({
  kind,
  size,
}: {
  kind: WidgetKind;
  size: WidgetSize;
}): ReactElement | null => {
  switch (kind) {
    case 'featured':
      return <TopStory size={size} />;
    case 'happening':
      return <Happening size={size} />;
    case 'agents':
      return <Agents size={size} />;
    case 'codingagents':
      return <CodingAgents size={size} />;
    case 'notifications':
      return <Notifications size={size} />;
    case 'squads':
      return <Squads size={size} />;
    case 'bookmarks':
      return <Bookmarks size={size} />;
    case 'briefing':
      return <Briefing size={size} />;
    case 'brieftext':
      return <BriefText size={size} />;
    case 'mybrief':
      return <YourBriefing size={size} />;
    case 'podcast':
      return <Podcast size={size} />;
    case 'whatsnew':
      return <OwnSpace size={size} stripCount={2} />;
    case 'dms':
      return <Messages size={size} />;
    case 'trending':
      return <Trending size={size} />;
    case 'continue':
      return <ContinueReading size={size} />;
    case 'promo':
      return <OwnSpace size={size} stripCount={1} />;
    case 'digest':
      return <Digest size={size} />;
    case 'ad':
      return <Ad />;
    default:
      return null;
  }
};
