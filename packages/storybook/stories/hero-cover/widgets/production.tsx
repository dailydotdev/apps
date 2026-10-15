import type { ReactElement, ReactNode } from 'react';
import React from 'react';
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
import { HighlightItem } from '@dailydotdev/shared/src/components/highlights/HighlightItem';
import { BriefCardReady } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardReady';
import { OpportunityMatchList } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityMatchList';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
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
import type { PostHighlightFeed } from '@dailydotdev/shared/src/graphql/highlights';
import type { OpportunityMatch } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
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
import { campaignStrips, StripButton } from './adSlot';

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
  badge,
  isSquareBadge,
  leading,
  afterName,
  className,
}: {
  kind: WidgetKind;
  children?: ReactNode;
  trailing?: ReactNode;
  /** The way out, top-right: "View all" and friends. */
  link?: string;
  /** A count that replaces the glyph, the way an app badge does. */
  badge?: number;
  /** Messages: a rounded square, so it doesn't read as an alert. */
  isSquareBadge?: boolean;
  /** Replaces the glyph, e.g. a live dot. */
  leading?: ReactNode;
  afterName?: ReactNode;
  className?: string;
}): ReactElement => {
  const def = widgetCatalog[kind];
  return (
    <header
      className={classNames(
        'flex h-6 min-w-0 shrink-0 items-center gap-1.5',
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
        <span className={classNames('flex shrink-0', toneClass[def.tone].text)}>
          {def.icon(IconSize.Size16)}
        </span>
      )}
      <span
        className={classNames(
          'truncate font-bold typo-caption1',
          'text-text-primary',
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
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              className="-mr-2"
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

/** An action that floats over the scroll fade instead of taking a row. */
const Floating = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="pointer-events-none absolute bottom-0 right-0 flex items-center gap-2 [&>*]:pointer-events-auto">
    {children}
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

/**
 * The content area: runs to the widget's bottom edge, scrolls inside, and
 * fades out where the card ends, so the edge reads as "more below".
 */
const Scroll = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'no-scrollbar relative -mb-4 mt-2 min-h-0 flex-1 overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]',
      className,
    )}
  >
    {children}
  </div>
);

const Stack = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative flex h-full min-h-0 flex-col">{children}</div>
);

/** A production card that is the whole widget: it fills the tile, no frame. */
const Fill = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-full min-h-0 flex-1 flex-col [&>*]:h-full [&>*]:max-h-none [&>*]:min-h-0 [&>*]:flex-1">
    {children}
  </div>
);

const ago = (date: Date | string): string =>
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

const agentHighlights: PostHighlightFeed[] = realAgentUpdates.map((update) => ({
  id: update.id,
  channel: 'vibes',
  headline: update.headline ?? update.change,
  highlightedAt: update.at,
  post: {
    id: update.id,
    type: PostType.Article,
    commentsPermalink: 'https://app.daily.dev/highlights/vibes',
    summary: update.change,
    source: { name: update.agent, image: update.image ?? '' },
  },
}));

const matches: OpportunityMatch[] = [
  {
    opportunityId: 'op-1',
    status: OpportunityMatchStatus.Pending,
    createdAt: new Date(),
    opportunity: {
      id: 'op-1',
      title: 'Senior Frontend Engineer',
      organization: {
        name: 'Vercel',
        image: realPosts[1].source?.image,
      },
    },
  },
  {
    opportunityId: 'op-2',
    status: OpportunityMatchStatus.CandidateAccepted,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    opportunity: {
      id: 'op-2',
      title: 'Staff Engineer, Platform',
      organization: {
        name: 'Supabase',
        image: realPosts[2].source?.image,
      },
    },
  },
  {
    opportunityId: 'op-3',
    status: OpportunityMatchStatus.Pending,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    opportunity: {
      id: 'op-3',
      title: 'Developer Advocate',
      organization: {
        name: 'Neon',
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/neon',
      },
    },
  },
] as unknown as OpportunityMatch[];

const trending: { tag: string; change: number; posts: number }[] = [
  { tag: 'claude-code', change: 340, posts: 128 },
  { tag: 'tanstack', change: 210, posts: 64 },
  { tag: 'bun', change: 95, posts: 41 },
  { tag: 'postgres', change: 60, posts: 88 },
  { tag: 'rust', change: 42, posts: 73 },
  { tag: 'nextjs', change: 18, posts: 102 },
];

const changelog: { date: string; title: string; tone: Tone }[] = [
  { date: 'Oct 14', title: 'Agent updates in your feed', tone: 'avocado' },
  { date: 'Oct 9', title: 'Share any post as an image', tone: 'cabbage' },
  { date: 'Oct 2', title: 'Search got twice as fast', tone: 'water' },
  {
    date: 'Sep 25',
    title: 'Presidential briefing for everyone',
    tone: 'onion',
  },
];

const messages = [
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

const upcoming: { month: string; day: string; title: string; meta: string }[] =
  [
    {
      month: 'OCT',
      day: '18',
      title: 'daily.dev Hackathon: Agents',
      meta: 'Starts in 3 days · 1,240 going',
    },
    {
      month: 'OCT',
      day: '22',
      title: 'Live: Ido and Nimrod on the new feed',
      meta: 'YouTube · 6pm CET',
    },
    {
      month: 'OCT',
      day: '29',
      title: 'AMA: the Bun team',
      meta: 'Live in the Bun squad · 890 going',
    },
    {
      month: 'NOV',
      day: '12',
      title: 'Agents Arena finals',
      meta: 'Vote live · 2,100 going',
    },
    {
      month: 'NOV',
      day: '3',
      title: 'Rust Builders meetup',
      meta: 'Online · 312 going',
    },
  ];

const continuePost = realPosts[7];
const podcastArt =
  'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3';

/* ------------------------------------------------------------------ */
/* Which widgets are cards, production, or new                          */
/* ------------------------------------------------------------------ */

/** The production UI is itself a card: it is the whole tile, no frame. */
export const isCardWidget = (kind: WidgetKind, size: WidgetSize): boolean =>
  (size !== 's' && ['featured', 'digest', 'ad'].includes(kind)) ||
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
  'jobs',
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
    'arena',
    'events',
    'continue',
    'promo',
    'mybrief',
    'trending',
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
    <div className="relative flex h-full flex-col">
      <WidgetLabel kind={kind} />
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

const PlayButton = (): ReactElement => (
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

const LiveDot = (): ReactElement => (
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
        <div className="@container/wide">
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

/** Lists: tight rows, bold two-line titles, a quiet meta line. */
const MiniList = ({
  items,
  isWide,
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
}): ReactElement => (
  <ul
    className={classNames(
      'gap-3',
      isWide ? 'grid grid-cols-2 gap-x-8' : 'flex flex-col',
    )}
  >
    {items.map((item) => (
      <li key={item.id} className="flex items-start gap-2.5">
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
      <Stack>
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
    <Stack>
      {label}
      {/* The production rows; their card's own title and footer are hidden
          because every widget shares the system header. */}
      <Scroll
        className={classNames(
          '-mx-4 [&_a>span>span]:inline-flex [&_a>span>span]:items-center [&_a>span>span]:whitespace-nowrap [&_a>span>span]:align-baseline [&_a>span>span]:ml-1.5 [&_a>span>span>span[aria-hidden]]:hidden [&_a>span>span_button]:-my-1 [&>div>div:last-child]:hidden [&>div>header]:hidden [&_*]:!overflow-visible [&_*]:![mask-image:none]',
          size === 'l' &&
            '[&>div>div:nth-child(2)>*]:break-inside-avoid [&>div>div:nth-child(2)]:block [&>div>div:nth-child(2)]:columns-2 [&>div>div:nth-child(2)]:gap-0',
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

const Agents = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="agents" afterName={<LivePill />} link="View all" />
        <Scroll>
          <MiniList
            items={realAgentUpdates.map((update) => ({
              id: update.id,
              leading: (
                <img
                  src={update.image}
                  alt=""
                  className="mt-0.5 size-6 shrink-0 rounded-8 object-cover"
                />
              ),
              title: update.headline,
              meta: update.agent,
            }))}
          />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="agents" afterName={<LivePill />} link="View all" />
      <Scroll className="-mx-4">
        <div
          className={classNames(
            size === 'l' ? 'grid grid-cols-2' : 'flex flex-col',
          )}
        >
          {agentHighlights.map((highlight) => (
            <HighlightItem key={highlight.id} highlight={highlight} />
          ))}
        </div>
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
    <Stack>
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

const PostList = ({
  posts,
  isWide,
}: {
  posts: Post[];
  isWide?: boolean;
}): ReactElement => (
  <MiniList
    isWide={isWide}
    items={posts.map((post) => ({
      id: post.id,
      leading: (
        <img
          src={post.image}
          alt=""
          className="size-10 shrink-0 rounded-10 object-cover"
        />
      ),
      title: post.title,
      meta: `${post.source?.name} · ${post.readTime}m read`,
    }))}
  />
);

const squadPosts = realPosts.slice(20, 26);

/** The squad's own cover leads; its name sits on the avatar, not in a label. */
const Squads = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="squads" link="Open squad">
          {squad.name}
        </WidgetLabel>
        <Scroll>
          <PostList posts={squadPosts} />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack>
      <div
        className={classNames(
          'relative -mx-4 -mt-4 shrink-0',
          size === 'l' ? 'h-28' : 'h-24',
        )}
      >
        <img
          src={squad.headerImage}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute right-3 top-3">
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
        <img
          src={squad.image}
          alt=""
          className="absolute -bottom-7 left-4 size-14 rounded-max border-4 border-background-subtle object-cover"
        />
      </div>
      <div className="ml-[4.25rem] mt-1.5 flex min-w-0 flex-col">
        <span className="truncate font-bold text-text-primary typo-callout">
          {squad.name}
        </span>
        <span className="truncate text-text-tertiary typo-caption1">
          27 new posts · 12.4K members
        </span>
      </div>
      <Scroll className="mt-4">
        <PostList posts={squadPosts} isWide={size === 'l'} />
      </Scroll>
    </Stack>
  );
};

const savedPosts: Post[] = [3, 8, 11, 14, 16, 18].map(
  (index) => realPosts[index],
);

const Bookmarks = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
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
        <Scroll>
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
    return <Fill>{card}</Fill>;
  }
  // Large: the production entry card, with the brief's first page beside it.
  return (
    <div className="flex h-full min-h-0 gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-2 pr-4">
      <div className="flex w-[calc(50%-1.5rem)] shrink-0 [&>*]:h-full [&>*]:max-h-none [&>*]:flex-1 [&>*]:!rounded-12 [&>*]:!border-0 [&_*]:!rounded-12">
        {card}
      </div>
      <div className="flex min-w-0 flex-1 flex-col pt-2">
        <WidgetLabel kind="briefing" link="Read the brief">
          Must know
        </WidgetLabel>
        <Scroll className="[&_h2]:!mb-1 [&_h2]:!mt-0 [&_h2]:!font-bold [&_h2]:!text-text-tertiary [&_h2]:!typo-footnote [&_li]:!mb-2 [&_li]:!typo-callout [&_ul]:!mb-3">
          <Markdown
            content={briefSection('Worth a look', 0, 3).replace(
              '<h2>Worth a look</h2>',
              '',
            )}
          />
          <Markdown content={briefSection('Worth a look', 3)} />
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
  <Stack>
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
  <Stack>
    <WidgetLabel
      kind="mybrief"
      trailing={
        <span className="text-text-tertiary typo-caption1">5 things</span>
      }
    >
      {size === 's' ? 'Since yesterday' : 'Your last 24 hours'}
    </WidgetLabel>
    <Scroll>
      <span
        className={classNames(
          'mb-3 block font-bold text-text-primary',
          size === 's' && 'typo-callout',
          size === 'm' && 'typo-title3',
          size === 'l' && 'typo-title2',
        )}
      >
        {briefing.headline}
      </span>
      <ul
        className={classNames(
          'gap-3',
          size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
        )}
      >
        {briefing.stack.map((line) => (
          <li key={line.text} className="flex flex-col gap-1">
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
    {size !== 's' && (
      <Floating>
        <Action icon={<PlayIcon />}>Listen</Action>
      </Floating>
    )}
  </Stack>
);

const episodes = [
  { title: 'Ep. 41: The state of Rust in 2026', meta: '44 min · Oct 7' },
  { title: 'Ep. 40: Why every team needs a platform', meta: '36 min · Sep 30' },
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
        <WidgetLabel kind="podcast" link="All episodes" />
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
          <div className="mt-3 flex min-h-0 flex-1 gap-6">
            <img
              src={podcastArt}
              alt=""
              className="aspect-square h-full shrink-0 rounded-12 object-cover shadow-3"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-white/[0.64] typo-caption1">
                Out today · 38 min
              </span>
              <span className="mt-1 font-bold text-white typo-title3">
                Ep. 42: Shipping production code with agents
              </span>
              <span className="mt-2 line-clamp-3 text-white/[0.8] typo-footnote">
                Ido and Nimrod on what changes when agents write most of the
                diff: review, ownership and the tests nobody reads.
              </span>
              <ul className="mt-4 flex flex-col gap-2 border-t border-white/[0.16] pt-3">
                {episodes.map((episode) => (
                  <li key={episode.title} className="flex flex-col">
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
          </div>
        )}
      </div>
    </div>
  );
};

const Timeline = (): ReactElement => (
  <ol className="relative flex flex-col gap-3 before:absolute before:bottom-2 before:left-[0.3125rem] before:top-2 before:w-px before:bg-border-subtlest-tertiary">
    {changelog.map((entry) => (
      <li key={entry.title} className="relative flex gap-3">
        <span
          className={classNames(
            'relative mt-1 size-2.5 shrink-0 rounded-max',
            toneClass[entry.tone].fill,
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-tertiary typo-caption1">{entry.date}</span>
          <span className="font-bold text-text-primary typo-footnote">
            {entry.title}
          </span>
        </div>
      </li>
    ))}
  </ol>
);

/** Our own doors (the strips from the ad slot) beside the changelog. */
const WhatsNew = ({ size }: { size: WidgetSize }): ReactElement => {
  const strips = (
    <div className="flex shrink-0 flex-col gap-2">
      {campaignStrips
        .slice(0, { s: 1, m: 2, l: 3, w: 2 }[size])
        .map((strip) => (
          <StripButton key={strip.id} strip={strip} />
        ))}
    </div>
  );
  if (size === 'l') {
    return (
      <Stack>
        <WidgetLabel kind="whatsnew" link="Changelog" />
        <div className="mt-3 flex min-h-0 flex-1 gap-6">
          <div className="flex w-1/2 flex-col">{strips}</div>
          <Scroll className="!mt-0">
            <Timeline />
          </Scroll>
        </div>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="whatsnew" link="Changelog" />
      <div className="mt-3">{strips}</div>
      <Scroll className="mt-4">
        <Timeline />
      </Scroll>
    </Stack>
  );
};

const MessageRows = ({ isCompact }: { isCompact?: boolean }): ReactElement => (
  <ul className="flex flex-col gap-3">
    {messages.map((message) => (
      <li key={message.from} className="flex items-start gap-2.5">
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
  const label = (
    <WidgetLabel kind="dms" badge={unread} isSquareBadge link="Open" />
  );
  if (size !== 'l') {
    return (
      <Stack>
        {label}
        <Scroll>
          <MessageRows />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack>
      {label}
      <div className="mt-3 flex min-h-0 flex-1 gap-6">
        <Scroll className="!mt-0">
          <MessageRows isCompact />
        </Scroll>
        <div className="flex w-1/2 shrink-0 flex-col justify-end gap-1.5 rounded-12 bg-surface-float p-3">
          <span className="mb-auto text-center text-text-quaternary typo-caption1">
            Lee · 2m ago
          </span>
          {thread.map((bubble) => (
            <span
              key={bubble.text}
              className={classNames(
                'max-w-[85%] rounded-16 px-3 py-1.5 typo-footnote',
                bubble.isMine
                  ? 'self-end rounded-br-4 bg-accent-cabbage-default text-white'
                  : 'self-start rounded-bl-4 bg-background-default text-text-primary',
              )}
            >
              {bubble.text}
            </span>
          ))}
        </div>
      </div>
    </Stack>
  );
};

const contenders = [
  {
    name: 'Claude Code',
    share: 58,
    tone: 'bacon' as Tone,
    take: 'Better at long refactors',
  },
  {
    name: 'Codex',
    share: 42,
    tone: 'water' as Tone,
    take: 'Faster on small fixes',
  },
];

const arenaTakes = [
  {
    name: 'Lee',
    avatar: messages[0].avatar,
    pick: 'Claude Code',
    tone: 'bacon' as Tone,
    text: 'It refactored a 4k-line module without breaking a test.',
  },
  {
    name: 'Ana',
    avatar: messages[2].avatar,
    pick: 'Codex',
    tone: 'water' as Tone,
    text: 'Quicker on the small stuff, and that is most of my day.',
  },
];

/** The signature is the split bar: one glance says who is winning. */
const Arena = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="arena"
      trailing={
        <span className="text-text-tertiary typo-caption1">6h left</span>
      }
    />
    <span className="mt-2 font-bold text-text-primary typo-callout">
      Which agent ships better code?
    </span>
    <div
      className={classNames(
        'flex flex-col gap-3',
        size === 's' ? 'mt-auto' : 'mt-6',
      )}
    >
      <div className="flex items-end justify-between gap-3">
        {contenders.map((side, index) => (
          <div
            key={side.name}
            className={classNames(
              'flex min-w-0 flex-col',
              index === 1 && 'items-end text-right',
            )}
          >
            <span
              className={classNames(
                'font-bold tabular-nums leading-none',
                {
                  s: 'typo-title1',
                  m: 'typo-large-title',
                  l: 'typo-mega2',
                  w: 'typo-large-title',
                }[size],
                toneClass[side.tone].text,
              )}
            >
              {side.share}%
            </span>
            <span className="mt-1 truncate font-bold text-text-primary typo-footnote">
              {side.name}
            </span>
            {size !== 's' && (
              <span className="text-text-tertiary typo-caption1">
                {side.take}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-max">
        {contenders.map((side) => (
          <span
            key={side.name}
            className={classNames('h-full', toneClass[side.tone].fill)}
            style={{ width: `${side.share}%` }}
          />
        ))}
      </div>
    </div>
    {size !== 's' && (
      <ul
        className={classNames(
          'mt-6 gap-3',
          size === 'l' ? 'grid grid-cols-2 gap-x-8' : 'flex flex-col',
        )}
      >
        {arenaTakes.map((take) => (
          <li key={take.name} className="flex items-start gap-2.5">
            <Avatar src={take.avatar} isRound />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-text-tertiary typo-caption1">
                {take.name} voted{' '}
                <span
                  className={classNames('font-bold', toneClass[take.tone].text)}
                >
                  {take.pick}
                </span>
              </span>
              <span className="line-clamp-2 text-text-primary typo-footnote">
                {take.text}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
    {size !== 's' && (
      <ActionRow meta="3.1K votes">
        <Action>Vote</Action>
      </ActionRow>
    )}
  </Stack>
);

const DateBlock = ({
  month,
  day,
}: {
  month: string;
  day: string;
}): ReactElement => (
  <div className="flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-10 bg-surface-float">
    <span className="w-full bg-accent-ketchup-default py-0.5 text-center font-bold text-white typo-caption2">
      {month}
    </span>
    <span className="py-0.5 font-bold tabular-nums text-text-primary typo-title3">
      {day}
    </span>
  </div>
);

/** The signature is the calendar page: the date reads before the title. */
const Events = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel kind="events" link="All events" />
    <Scroll>
      <ul
        className={classNames(
          'gap-3',
          size === 'l' ? 'grid grid-cols-2 gap-x-8 gap-y-4' : 'flex flex-col',
        )}
      >
        {upcoming.map((event) => (
          <li key={event.title} className="flex items-start gap-3">
            <DateBlock month={event.month} day={event.day} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
                {event.title}
              </span>
              <span className="truncate text-text-tertiary typo-caption1">
                {event.meta}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Scroll>
  </Stack>
);

/** A tag's posts per hour over the last day: climbs late, like a breakout. */
const momentum = (seed: number): number[] =>
  Array.from({ length: 24 }, (_, hour) => {
    const wave = Math.sin(hour * 0.9 + seed * 2.3) * (0.06 + seed * 0.01);
    const climb = (hour / 23) ** (1.5 + seed * 0.5);
    return Math.min(0.96, Math.max(0.06, 0.12 + climb * 0.78 + wave));
  });

const Sparkline = ({
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

/**
 * Apple Stocks' grammar: the breakout tag is the hero, drawn as its own
 * 24-hour chart; the runners-up are ticker rows with a sparkline each.
 */
const Trending = ({ size }: { size: WidgetSize }): ReactElement => {
  const [top, ...rest] = trending;
  const rowPadding = size === 's' ? 'py-2' : 'py-3';
  const hero = (
    <div className="relative -mx-4 mt-2 flex shrink-0 flex-col px-4">
      <Sparkline
        values={momentum(0)}
        isArea
        className={classNames(
          'absolute inset-x-0 bottom-0 w-full',
          size === 's' ? 'h-14' : 'h-24',
        )}
      />
      <span className="relative truncate font-bold text-text-primary typo-title2">
        #{top.tag}
      </span>
      <span className="relative mt-1 flex items-baseline gap-2 tabular-nums">
        <span className="font-bold text-accent-avocado-default typo-title3">
          +{top.change}%
        </span>
        <span className="text-text-tertiary typo-caption1">
          {top.posts} posts · 24h
        </span>
      </span>
      <span className={size === 's' ? 'h-8' : 'h-16'} />
    </div>
  );
  if (size === 'l') {
    return (
      <Stack>
        <WidgetLabel kind="trending" link="All tags" />
        <div className="flex min-h-0 flex-1 gap-6">
          <div className="relative flex w-1/2 shrink-0 flex-col">
            <span className="mt-3 truncate font-bold text-text-primary typo-title1">
              #{top.tag}
            </span>
            <span className="mt-1 flex items-baseline gap-2 tabular-nums">
              <span className="font-bold text-accent-avocado-default typo-title2">
                +{top.change}%
              </span>
              <span className="text-text-tertiary typo-caption1">
                {top.posts} posts · 24h
              </span>
            </span>
            <Sparkline
              values={momentum(0)}
              isArea
              className="-mx-4 -mb-4 mt-auto h-40 w-[calc(100%+1rem)]"
            />
          </div>
          <Scroll>
            <ol className="flex flex-col">
              {rest.map((item, index) => (
                <li
                  key={item.tag}
                  className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 tabular-nums first:border-t-0"
                >
                  <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
                    #{item.tag}
                  </span>
                  <Sparkline
                    values={momentum(index + 1)}
                    className="h-5 w-14"
                  />
                  <span className="w-12 text-right font-bold text-accent-avocado-default typo-caption1">
                    +{item.change}%
                  </span>
                </li>
              ))}
            </ol>
          </Scroll>
        </div>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="trending" link="All tags" />
      {hero}
      <Scroll className="mt-0">
        <ol className="flex flex-col">
          {rest.map((item, index) => (
            <li
              key={item.tag}
              className={classNames(
                'flex items-center gap-3 border-t border-border-subtlest-tertiary tabular-nums',
                rowPadding,
              )}
            >
              <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
                #{item.tag}
              </span>
              {size !== 's' && (
                <Sparkline values={momentum(index + 1)} className="h-5 w-14" />
              )}
              <span className="w-12 text-right font-bold text-accent-avocado-default typo-caption1">
                +{item.change}%
              </span>
            </li>
          ))}
        </ol>
      </Scroll>
    </Stack>
  );
};

const Jobs = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel
          kind="jobs"
          link="All jobs"
          trailing={
            <span className="text-text-tertiary typo-caption1">
              {matches.length} new
            </span>
          }
        />
        <Scroll>
          <MiniList
            items={matches.map((match) => ({
              id: match.opportunityId,
              leading: (
                <img
                  src={match.opportunity?.organization?.image}
                  alt=""
                  className="mt-0.5 size-8 shrink-0 rounded-10 object-cover"
                />
              ),
              title: match.opportunity?.title,
              meta: match.opportunity?.organization?.name,
            }))}
          />
        </Scroll>
      </Stack>
    );
  }
  if (size === 'l') {
    return (
      <Stack>
        <WidgetLabel kind="jobs" link="All jobs" />
        <Scroll>
          <MiniList
            isWide
            items={matches.map((match) => ({
              id: match.opportunityId,
              leading: (
                <img
                  src={match.opportunity?.organization?.image}
                  alt=""
                  className="size-10 shrink-0 rounded-10 object-cover"
                />
              ),
              title: match.opportunity?.title,
              meta: `${match.opportunity?.organization?.name} · ${
                match.status === OpportunityMatchStatus.Pending
                  ? 'New match'
                  : 'Waiting for the recruiter'
              }`,
            }))}
          />
        </Scroll>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="jobs" link="All jobs" />
      {/* The production match list, without its own frame and title. */}
      <Scroll className="-mx-2 [&>*]:!border-0 [&>*]:!bg-transparent [&>*]:!p-0">
        <OpportunityMatchList matches={matches} title="" />
      </Scroll>
    </Stack>
  );
};

const ContinueReading = ({ size }: { size: WidgetSize }): ReactElement => {
  const progress = (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-max bg-surface-float">
        <div className="h-full w-3/5 rounded-max bg-accent-cabbage-default" />
      </div>
      <span className="tabular-nums text-text-tertiary typo-caption1">
        4 min left
      </span>
    </div>
  );
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="continue" />
        <div className="mt-3 flex gap-3">
          {continuePost.image && (
            <img
              src={continuePost.image}
              alt=""
              className="size-16 shrink-0 rounded-12 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-3 font-bold text-text-primary typo-footnote">
              {continuePost.title}
            </span>
            <span className="mt-1 truncate text-text-tertiary typo-caption1">
              {continuePost.source?.name}
            </span>
          </div>
        </div>
        <div className="mt-auto">{progress}</div>
      </Stack>
    );
  }
  if (size === 'l') {
    return (
      <Stack>
        <WidgetLabel kind="continue" />
        <div className="mt-3 flex min-h-0 flex-1 gap-6">
          {continuePost.image && (
            <img
              src={continuePost.image}
              alt=""
              className="aspect-video w-1/2 shrink-0 self-start rounded-12 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-text-tertiary typo-caption1">
              {continuePost.source?.name} · {continuePost.readTime}m read
            </span>
            <span className="mt-1 font-bold text-text-primary typo-title3">
              {continuePost.title}
            </span>
            {continuePost.summary && (
              <span className="mt-2 line-clamp-6 text-text-tertiary typo-footnote">
                {continuePost.summary}
              </span>
            )}
            <div className="mt-auto flex items-center gap-3 pt-3">
              <div className="min-w-0 flex-1">{progress}</div>
              <Action>Resume</Action>
            </div>
          </div>
        </div>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="continue" />
      {continuePost.image && (
        <img
          src={continuePost.image}
          alt=""
          className="mt-3 aspect-video w-full rounded-12 object-cover"
        />
      )}
      <span className="mt-3 line-clamp-3 font-bold text-text-primary typo-callout">
        {continuePost.title}
      </span>
      {continuePost.summary && (
        <span className="mt-2 line-clamp-4 text-text-tertiary typo-footnote">
          {continuePost.summary}
        </span>
      )}
      <div className="mt-auto flex items-center gap-3 pt-3">
        <div className="min-w-0 flex-1">{progress}</div>
        <Action>Resume</Action>
      </div>
    </Stack>
  );
};

const promoKinds: WidgetKind[] = ['briefing', 'podcast', 'squads'];

/** Doors into our own products, each with its product's glyph. */
const Promo = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel kind="promo" />
    <Scroll>
      <MiniList
        isWide={size === 'l'}
        items={widgetCatalog.promo.items.map((item, index) => {
          const def = widgetCatalog[promoKinds[index]];
          return {
            id: item.title,
            leading: (
              <span
                className={classNames(
                  'flex shrink-0 items-center justify-center rounded-10',
                  size === 's' ? 'size-8' : 'size-10',
                  toneClass[def.tone].subtle,
                )}
              >
                {def.icon(IconSize.Size16)}
              </span>
            ),
            title: item.title,
            meta: item.meta,
          };
        })}
      />
    </Scroll>
  </Stack>
);

const Digest = ({ size }: { size: WidgetSize }): ReactElement =>
  size === 'l' ? (
    <Fill>
      <div className="@container/wide">
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
      return <WhatsNew size={size} />;
    case 'dms':
      return <Messages size={size} />;
    case 'arena':
      return <Arena size={size} />;
    case 'events':
      return <Events size={size} />;
    case 'trending':
      return <Trending size={size} />;
    case 'jobs':
      return <Jobs size={size} />;
    case 'continue':
      return <ContinueReading size={size} />;
    case 'promo':
      return <Promo size={size} />;
    case 'digest':
      return <Digest size={size} />;
    case 'ad':
      return <Ad />;
    default:
      return null;
  }
};
