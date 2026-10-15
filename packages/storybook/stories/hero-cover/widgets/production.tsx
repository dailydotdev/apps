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
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import { BriefCardReady } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardReady';
import { OpportunityMatchList } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityMatchList';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
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

/*
 * The widget system. One set of rules every widget follows, the way every
 * iOS widget shares margins, corners and type roles while still looking like
 * its own app:
 *  - 16px outer padding everywhere; inner platters inset 12px.
 *  - A content label top-left: a 16px glyph and a caption in the widget's
 *    accent. It names the content, never "daily.dev".
 *  - Five type roles: label (caption1), meta (footnote), body (callout),
 *    title (title3/title2), hero (large-title), the hero at most once.
 *  - Actions are h-8 capsules in one bottom row; one filled at most.
 *  - Small is one glance and one tap; bigger sizes add layers to the same
 *    idea, never a second topic.
 *  - One signature element per widget; everything else stays plain.
 */

export const WidgetLabel = ({
  kind,
  children,
  trailing,
  className,
}: {
  kind: WidgetKind;
  children?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}): ReactElement => {
  const def = widgetCatalog[kind];
  return (
    <header
      className={classNames(
        'flex h-5 min-w-0 shrink-0 items-center gap-1.5',
        className,
      )}
      style={{ paddingRight: 'var(--stack-inset, 0px)' }}
    >
      <span className={classNames('flex shrink-0', toneClass[def.tone].text)}>
        {def.icon(IconSize.Size16)}
      </span>
      <span
        className={classNames(
          'truncate font-bold typo-caption1',
          toneClass[def.tone].text,
        )}
      >
        {children ?? def.name}
      </span>
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </header>
  );
};

export const Capsule = ({
  children,
  isPrimary,
  icon,
}: {
  children: ReactNode;
  isPrimary?: boolean;
  icon?: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-max px-3 font-bold typo-footnote',
      isPrimary
        ? 'bg-text-primary text-surface-invert'
        : 'bg-surface-float text-text-primary',
    )}
  >
    {icon}
    {children}
  </span>
);

/** The bottom row every widget anchors its actions to, so they line up. */
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
  <div className="mt-3 flex flex-col">
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

/** A list area that fades its last row instead of slicing it flat. */
const Clip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]',
      className,
    )}
  >
    {children}
  </div>
);

const Stack = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-full min-h-0 flex-col">{children}</div>
);

/** A production card that is the whole widget: it fills the tile, no frame. */
const Fill = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-full min-h-0 flex-1 flex-col [&>*]:h-full [&>*]:max-h-none [&>*]:min-h-0 [&>*]:flex-1">
    {children}
  </div>
);

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
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/vercel',
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
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/supabase',
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
  (kind === 'squads' && size === 'l') ||
  (kind === 'briefing' && size === 'm');

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

const Row = ({
  leading,
  title,
  meta,
  trailing,
}: {
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
}): ReactElement => (
  <div className="flex items-start gap-3 py-2">
    {leading}
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
        {title}
      </span>
      {meta && (
        <span className="line-clamp-1 text-text-tertiary typo-caption1">
          {meta}
        </span>
      )}
    </div>
    {trailing}
  </div>
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

const PostRow = ({ post }: { post: Post }): ReactElement => (
  <Row
    leading={<Avatar src={post.source?.image} isRound />}
    title={post.title}
    meta={`${post.source?.name} · ${post.readTime}m read`}
  />
);

const LiveDot = (): ReactElement => (
  <span className="relative flex size-2">
    <span className="absolute inset-0 animate-ping rounded-max bg-accent-ketchup-default opacity-50 motion-reduce:animate-none" />
    <span className="relative size-2 rounded-max bg-accent-ketchup-default" />
  </span>
);

const Count = ({
  value,
  tone,
}: {
  value: number;
  tone: Tone;
}): ReactElement => (
  <span
    className={classNames(
      'rounded-max px-1.5 font-bold tabular-nums text-text-primary typo-caption2',
      toneClass[tone].subtle,
    )}
  >
    {value}
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

const Happening = ({ size }: { size: WidgetSize }): ReactElement => {
  const label = (
    <WidgetLabel kind="happening" trailing={<LiveDot />}>
      Happening now
    </WidgetLabel>
  );
  if (size === 's') {
    return (
      <Stack>
        {label}
        <span className="mt-3 line-clamp-4 font-bold text-text-primary typo-callout">
          {highlights[0].headline}
        </span>
        <ActionRow meta={`+${highlights.length - 1} more headlines`} />
      </Stack>
    );
  }
  return (
    <Stack>
      {label}
      {/* The production rows; their card's own title and footer are hidden
          because every widget shares the system label and action row. */}
      <Clip
        className={classNames(
          '-mx-4 mt-1 [&>div>div:last-child]:hidden [&>div>header]:hidden',
          size === 'l' &&
            '[&>div>div:nth-child(2)>*]:break-inside-avoid [&>div>div:nth-child(2)]:block [&>div>div:nth-child(2)]:columns-2 [&>div>div:nth-child(2)]:gap-0',
        )}
      >
        <div className="flex h-full flex-col">
          <HighlightCardContent
            highlights={highlights}
            variant="grid"
            compact
          />
        </div>
      </Clip>
      <ActionRow>
        <Capsule>Read all</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Agents = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    const [latest] = realAgentUpdates;
    return (
      <Stack>
        <WidgetLabel kind="agents" />
        <div className="mt-3 flex items-start gap-3">
          <Avatar src={latest.image} />
          <span className="line-clamp-4 min-w-0 flex-1 font-bold text-text-primary typo-callout">
            {latest.headline}
          </span>
        </div>
        <ActionRow meta={`${latest.agent} · today`} />
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="agents" />
      <Clip className="-mx-4 mt-1">
        <div
          className={classNames(
            size === 'l' ? 'grid grid-cols-2' : 'flex flex-col',
          )}
        >
          {agentHighlights.slice(0, size === 'l' ? 6 : 4).map((highlight) => (
            <HighlightItem key={highlight.id} highlight={highlight} />
          ))}
        </div>
      </Clip>
      <ActionRow>
        <Capsule>View all</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Notifications = ({ size }: { size: WidgetSize }): ReactElement => {
  const recent = sampleNotifications.slice(0, 4);
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="notifications" />
        <div className="mt-auto flex items-end justify-between gap-3">
          <Hero value={recent.length} tone="bacon">
            new since yesterday
          </Hero>
          <div className="flex -space-x-2">
            {recent.slice(0, 3).map((notification) => (
              <img
                key={notification.referenceId}
                src={notification.avatars?.[0]?.image}
                alt=""
                className="size-8 rounded-max border-2 border-background-subtle object-cover"
              />
            ))}
          </div>
        </div>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel
        kind="notifications"
        trailing={<Count value={recent.length} tone="bacon" />}
      />
      {/* Production rows, marked read so they drop their own fill band, and
          without the attachment thumbnail the widget is too narrow for. */}
      <Clip className="-mx-4 mt-1 [&_[aria-haspopup]]:hidden">
        <div className="flex flex-col">
          {recent.map((notification) => (
            <NotificationItem
              key={notification.referenceId}
              {...notification}
              isUnread={false}
              attachments={undefined}
            />
          ))}
        </div>
      </Clip>
      <ActionRow>
        <Capsule>All notifications</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Squads = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="squads" />
        <div className="mt-auto flex items-center gap-3">
          <img
            src={squad.image}
            alt=""
            className="size-12 shrink-0 rounded-max object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {squad.name}
            </span>
            <span className="text-text-tertiary typo-footnote">
              27 new posts
            </span>
          </div>
        </div>
      </Stack>
    );
  }
  if (size === 'm') {
    return (
      <Stack>
        <WidgetLabel
          kind="squads"
          trailing={<Count value={27} tone="avocado" />}
        />
        <div className="mt-3 flex items-center gap-3">
          <img
            src={squad.image}
            alt=""
            className="size-10 shrink-0 rounded-max object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {squad.name}
            </span>
            <span className="text-text-tertiary typo-footnote">
              12.4K members
            </span>
          </div>
        </div>
        <Clip className="mt-2">
          <div className="flex flex-col">
            {realPosts.slice(20, 25).map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        </Clip>
        <ActionRow>
          <Capsule>Open squad</Capsule>
        </ActionRow>
      </Stack>
    );
  }
  return (
    <Fill>
      <SquadGrid source={squad} border={SourceCardBorderColor.Pepper} />
    </Fill>
  );
};

const savedPosts: Post[] = [3, 8, 11, 14].map((index) => realPosts[index]);

const Bookmarks = ({ size }: { size: WidgetSize }): ReactElement => {
  const saved = savedPosts;
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="bookmarks" />
        <Hero value="23">saved posts</Hero>
        <span className="mt-auto line-clamp-2 font-bold text-text-primary typo-footnote">
          Next up: {saved[0].title}
        </span>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel
        kind="bookmarks"
        trailing={<Count value={23} tone="cabbage" />}
      />
      <Clip className="mt-1">
        <div className="flex flex-col">
          {saved.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      </Clip>
      <ActionRow>
        <Capsule>All bookmarks</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Briefing = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="briefing">Presidential briefing</WidgetLabel>
        <span className="mt-3 line-clamp-3 font-bold text-text-primary typo-callout">
          {briefing.headline}
        </span>
        <ActionRow meta="41 posts · 4 min">
          <Capsule isPrimary>Read</Capsule>
        </ActionRow>
      </Stack>
    );
  }
  return (
    <Fill>
      <BriefCardReady
        post={briefPost}
        title="Presidential briefing"
        targetId={TargetId.Feed}
      />
    </Fill>
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

/** The brief itself, in the brief page's own typography, clipped to fit. */
const BriefText = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="briefing"
      trailing={<span className="text-text-tertiary typo-caption1">4 min</span>}
    >
      Presidential briefing
    </WidgetLabel>
    <span className="mt-3 font-bold text-text-primary typo-title3">
      {briefing.headline}
    </span>
    <Clip
      className={classNames(
        'mt-3 [&_h2]:!mb-1 [&_h2]:!mt-0 [&_h2]:!font-bold [&_h2]:!text-text-tertiary [&_h2]:!typo-footnote [&_li]:!mb-2 [&_li]:!typo-callout [&_ul]:!mb-3',
        size === 'l' && 'grid grid-cols-2 gap-8',
      )}
    >
      {size === 'l' ? (
        <>
          <Markdown content={briefSection('Must know', 0, 3)} />
          <Markdown content={briefSection('Worth a look', 3)} />
        </>
      ) : (
        <Markdown content={briefHtml} />
      )}
    </Clip>
    <ActionRow meta={size === 'l' ? '41 posts · 18 sources' : '41 posts'}>
      <Capsule isPrimary>Read the brief</Capsule>
    </ActionRow>
  </Stack>
);

const YourBriefing = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="mybrief">Since yesterday</WidgetLabel>
        <span className="mt-3 line-clamp-4 font-bold text-text-primary typo-callout">
          {briefing.headline}
        </span>
        <ActionRow meta="5 things · 4 min" />
      </Stack>
    );
  }
  const lines = briefing.stack.slice(0, size === 'l' ? 4 : 3);
  return (
    <Stack>
      <WidgetLabel kind="mybrief">Your last 24 hours</WidgetLabel>
      <span
        className={classNames(
          'mt-3 font-bold text-text-primary',
          size === 'l' ? 'typo-title2' : 'typo-title3',
        )}
      >
        {briefing.headline}
      </span>
      <Clip className="mt-3">
        <ul
          className={classNames(
            'gap-3',
            size === 'l' ? 'grid grid-cols-2 gap-x-6' : 'flex flex-col',
          )}
        >
          {lines.map((line) => (
            <li key={line.text} className="flex flex-col gap-1">
              <span className="text-text-quaternary typo-caption1">
                {line.why}
              </span>
              <span className="line-clamp-3 text-text-primary typo-footnote">
                {line.text} <SourceChip post={line.sources[0]} />
              </span>
            </li>
          ))}
        </ul>
      </Clip>
      <ActionRow meta="5 things · 4 min">
        <Capsule icon={<PlayIcon size={IconSize.Size16} />}>Listen</Capsule>
      </ActionRow>
    </Stack>
  );
};

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
  return (
    <Stack>
      <WidgetLabel kind="podcast" />
      <img
        src={podcastArt}
        alt=""
        className="mt-3 aspect-square w-full rounded-12 object-cover"
      />
      <span className="mt-3 line-clamp-2 font-bold text-text-primary typo-callout">
        Ep. 42: Shipping production code with agents
      </span>
      <div className="mt-2 h-1 overflow-hidden rounded-max bg-surface-float">
        <div className="h-full w-1/3 rounded-max bg-accent-bacon-default" />
      </div>
      <ActionRow meta="25 min left">
        <PlayButton />
      </ActionRow>
    </Stack>
  );
};

const WhatsNew = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="whatsnew" />
        <span className="mt-3 line-clamp-3 font-bold text-text-primary typo-callout">
          {changelog[0].title}
        </span>
        <ActionRow meta={changelog[0].date}>
          <Capsule>See it</Capsule>
        </ActionRow>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="whatsnew" />
      <ol className="relative mt-3 flex flex-col gap-5 before:absolute before:bottom-2 before:left-[0.3125rem] before:top-2 before:w-px before:bg-border-subtlest-tertiary">
        {changelog.map((entry) => (
          <li key={entry.title} className="relative flex gap-3">
            <span
              className={classNames(
                'relative mt-1 size-2.5 shrink-0 rounded-max',
                toneClass[entry.tone].fill,
              )}
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-text-tertiary typo-caption1">
                {entry.date}
              </span>
              <span className="font-bold text-text-primary typo-footnote">
                {entry.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
      <ActionRow>
        <Capsule>Changelog</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Messages = ({ size }: { size: WidgetSize }): ReactElement => {
  const unread = messages.filter((message) => message.isUnread).length;
  if (size === 's') {
    const [latest] = messages;
    return (
      <Stack>
        <WidgetLabel
          kind="dms"
          trailing={<Count value={unread} tone="cheese" />}
        />
        <div className="mt-auto flex items-end gap-2">
          <Avatar src={latest.avatar} isRound />
          <span className="line-clamp-3 min-w-0 shrink rounded-16 rounded-bl-4 bg-surface-float px-3 py-2 text-text-primary typo-footnote">
            {latest.text}
          </span>
        </div>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel
        kind="dms"
        trailing={<Count value={unread} tone="cheese" />}
      />
      <div className="mt-2 flex flex-col">
        {messages.map((message) => (
          <Row
            key={message.from}
            leading={<Avatar src={message.avatar} isRound />}
            title={message.from}
            meta={message.text}
            trailing={
              <span className="flex flex-col items-end gap-1">
                <span className="text-text-quaternary typo-caption1">
                  {message.at}
                </span>
                {message.isUnread && (
                  <span className="size-2 rounded-max bg-accent-cheese-default" />
                )}
              </span>
            }
          />
        ))}
      </div>
      <ActionRow>
        <Capsule>Open messages</Capsule>
      </ActionRow>
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

/** The signature is the split bar: one glance says who is winning. */
const Arena = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="arena"
      trailing={
        <span className="text-text-tertiary typo-caption1">6h left</span>
      }
    />
    <span className="mt-3 font-bold text-text-primary typo-callout">
      Claude Code vs Codex
    </span>
    <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-max">
      {contenders.map((side) => (
        <span
          key={side.name}
          className={classNames('h-full', toneClass[side.tone].fill)}
          style={{ width: `${side.share}%` }}
        />
      ))}
    </div>
    {size === 's' ? (
      <div className="mt-1.5 flex justify-between tabular-nums typo-footnote">
        {contenders.map((side) => (
          <span
            key={side.name}
            className={classNames('font-bold', toneClass[side.tone].text)}
          >
            {side.share}%
          </span>
        ))}
      </div>
    ) : (
      <div className="mt-auto flex flex-col gap-4">
        {contenders.map((side) => (
          <div key={side.name} className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold text-text-primary typo-footnote">
                {side.name}
              </span>
              <span className="text-text-tertiary typo-caption1">
                {side.take}
              </span>
            </div>
            <span
              className={classNames(
                'font-bold tabular-nums leading-none typo-title1',
                toneClass[side.tone].text,
              )}
            >
              {side.share}%
            </span>
          </div>
        ))}
      </div>
    )}
    <ActionRow meta={size === 's' ? undefined : '3.1K votes'}>
      <Capsule isPrimary>Vote</Capsule>
    </ActionRow>
  </Stack>
);

const DateBlock = ({
  month,
  day,
}: {
  month: string;
  day: string;
}): ReactElement => (
  <div className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-10 bg-surface-float">
    <span className="w-full bg-accent-ketchup-default py-0.5 text-center font-bold text-white typo-caption2">
      {month}
    </span>
    <span className="py-1 font-bold tabular-nums text-text-primary typo-title2">
      {day}
    </span>
  </div>
);

/** The signature is the calendar page: the date reads before the title. */
const Events = ({ size }: { size: WidgetSize }): ReactElement => {
  const shown = size === 's' ? upcoming.slice(0, 1) : upcoming;
  return (
    <Stack>
      <WidgetLabel kind="events" />
      <div className="mt-3 flex flex-col gap-4">
        {shown.map((event) => (
          <div key={event.title} className="flex items-start gap-3">
            <DateBlock month={event.month} day={event.day} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="line-clamp-2 font-bold text-text-primary typo-callout">
                {event.title}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                {event.meta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <ActionRow>
        <Capsule>{size === 's' ? 'Join' : 'All events'}</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Trending = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    const [top] = trending;
    return (
      <Stack>
        <WidgetLabel kind="trending" />
        <span className="mt-auto truncate font-bold text-text-primary typo-title2">
          #{top.tag}
        </span>
        <span className="mt-1 flex items-center gap-2 typo-footnote">
          <span className="rounded-max bg-accent-avocado-flat px-2 font-bold text-accent-avocado-default">
            +{top.change}%
          </span>
          <span className="text-text-tertiary">{top.posts} posts today</span>
        </span>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="trending" />
      <ol className="mt-2 flex flex-col">
        {trending.map((item, index) => (
          <li
            key={item.tag}
            className="flex items-center gap-3 py-2 tabular-nums"
          >
            <span className="w-4 text-text-quaternary typo-footnote">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
              #{item.tag}
            </span>
            <span className="rounded-max bg-accent-avocado-flat px-2 font-bold text-accent-avocado-default typo-caption1">
              +{item.change}%
            </span>
          </li>
        ))}
      </ol>
      <ActionRow>
        <Capsule>All tags</Capsule>
      </ActionRow>
    </Stack>
  );
};

const Jobs = ({ size }: { size: WidgetSize }): ReactElement => {
  if (size === 's') {
    const [top] = matches;
    return (
      <Stack>
        <WidgetLabel kind="jobs" />
        <Hero value={matches.length}>new matches</Hero>
        <span className="mt-auto truncate font-bold text-text-primary typo-footnote">
          {top.opportunity?.title} · {top.opportunity?.organization?.name}
        </span>
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel kind="jobs" />
      {/* The production match list, without its own frame and title. */}
      <Clip className="-mx-2 mt-1 [&>*]:!border-0 [&>*]:!bg-transparent [&>*]:!p-0">
        <OpportunityMatchList matches={matches} title="" />
      </Clip>
      <ActionRow>
        <Capsule>All jobs</Capsule>
      </ActionRow>
    </Stack>
  );
};

const ContinueReading = ({ size }: { size: WidgetSize }): ReactElement => (
  <Stack>
    <WidgetLabel kind="continue" />
    {size !== 's' && continuePost.image && (
      <img
        src={continuePost.image}
        alt=""
        className="mt-3 aspect-video w-full rounded-12 object-cover"
      />
    )}
    <span className="mt-3 line-clamp-3 font-bold text-text-primary typo-callout">
      {continuePost.title}
    </span>
    {size !== 's' && continuePost.summary && (
      <span className="mt-2 line-clamp-4 text-text-tertiary typo-footnote">
        {continuePost.summary}
      </span>
    )}
    <div className="mt-auto flex flex-col pt-3">
      <div className="h-1 overflow-hidden rounded-max bg-surface-float">
        <div className="h-full w-3/5 rounded-max bg-accent-cabbage-default" />
      </div>
      <ActionRow meta="60% read · 4 min left">
        <Capsule>Resume</Capsule>
      </ActionRow>
    </div>
  </Stack>
);

const promoKinds: WidgetKind[] = ['briefing', 'podcast', 'squads'];

/** Doors into our own products, each with its product's glyph. */
const Promo = ({ size }: { size: WidgetSize }): ReactElement => {
  const items = widgetCatalog.promo.items.slice(0, size === 's' ? 2 : 3);
  return (
    <Stack>
      <WidgetLabel kind="promo" />
      <div className="mt-2 flex flex-col">
        {items.map((item, index) => {
          const def = widgetCatalog[promoKinds[index]];
          return (
            <Row
              key={item.title}
              leading={
                <span
                  className={classNames(
                    'flex size-8 shrink-0 items-center justify-center rounded-10',
                    toneClass[def.tone].subtle,
                  )}
                >
                  {def.icon(IconSize.Size16)}
                </span>
              }
              title={item.title}
              meta={item.meta}
            />
          );
        })}
      </div>
      {size !== 's' && (
        <ActionRow>
          <Capsule>See all</Capsule>
        </ActionRow>
      )}
    </Stack>
  );
};

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
