import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { JobIcon } from '@dailydotdev/shared/src/components/icons/Job';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { MicrophoneIcon } from '@dailydotdev/shared/src/components/icons/Microphone';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { ArenaIcon } from '@dailydotdev/shared/src/components/icons/Arena';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import type { Tone } from '../data';
import { toneClass } from '../data';
import { realAgentUpdates, realHeroPosts, realPosts } from '../realData';
import { highlights } from '../../features/feed/feedHero.mocks';
import { StreakWidget } from './streakWidget';
import { BriefWidgetContent } from './briefing';

/**
 * The hero's grid unit is one feed column by half the hero's height, so every
 * widget edge lands on a feed column edge. Four sizes, named after iOS:
 * small (1×½), tall (1×1), wide (2×½), large (2×1).
 */
export type WidgetSize = 's' | 'm' | 'w' | 'l';

export const sizeLabel: Record<WidgetSize, string> = {
  s: 'Small',
  m: 'Tall',
  w: 'Wide',
  l: 'Large',
};

export const sizeSpan: Record<WidgetSize, { cols: 1 | 2; rows: 1 | 2 }> = {
  s: { cols: 1, rows: 1 },
  m: { cols: 1, rows: 2 },
  w: { cols: 2, rows: 1 },
  l: { cols: 2, rows: 2 },
};

export const sizeArea = (size: WidgetSize): number =>
  sizeSpan[size].cols * sizeSpan[size].rows;

export const spanClass: Record<WidgetSize, string> = {
  s: 'col-span-1 row-span-1',
  m: 'col-span-1 row-span-2',
  w: 'col-span-2 row-span-1',
  l: 'col-span-2 row-span-2',
};

export type WidgetCategory =
  | 'News'
  | 'You'
  | 'Community'
  | 'daily.dev'
  | 'Sponsored';

type Item = { title: string; meta?: string; image?: string; avatar?: string };

export type WidgetKind =
  | 'featured'
  | 'happening'
  | 'notifications'
  | 'agents'
  | 'ad'
  | 'promo'
  | 'bookmarks'
  | 'squads'
  | 'digest'
  | 'whatsnew'
  | 'dms'
  | 'podcast'
  | 'briefing'
  | 'streak'
  | 'trending'
  | 'jobs'
  | 'arena'
  | 'continue'
  | 'events'
  | 'mybrief';

export type WidgetDef = {
  kind: WidgetKind;
  name: string;
  category: WidgetCategory;
  description: string;
  tone: Tone;
  icon: (size: IconSize) => ReactElement;
  sizes: WidgetSize[];
  /** Not on the list we started from: an idea this exploration adds. */
  isProposed?: boolean;
  items: Item[];
  /** The one-glance answer a small widget gives. */
  glance: { value: string; label: string };
  cta?: string;
};

const post = (index: number): Item => ({
  title: realPosts[index].title ?? '',
  meta: realPosts[index].source?.name,
  image: realPosts[index].image,
  avatar: realPosts[index].source?.image,
});

export const widgetCatalog: Record<WidgetKind, WidgetDef> = {
  featured: {
    kind: 'featured',
    name: 'Top story',
    category: 'News',
    description:
      'The editorial carousel we ship today, now one widget among many.',
    tone: 'cabbage',
    icon: (size) => <HotIcon secondary size={size} />,
    sizes: ['l', 'w', 'm'],
    items: realHeroPosts.map((item) => ({
      title: item.title ?? '',
      meta: item.source?.name,
      image: item.image,
      avatar: item.source?.image,
    })),
    glance: { value: '4', label: 'top stories' },
  },
  happening: {
    kind: 'happening',
    name: 'Happening Now',
    category: 'News',
    description: 'The major headlines, as the feed card shows them.',
    tone: 'cheese',
    icon: (size) => <TrendingIcon secondary size={size} />,
    sizes: ['m', 'w', 's', 'l'],
    items: highlights.map((item) => ({
      title: item.headline,
      meta: 'just now',
    })),
    glance: { value: '5', label: 'new headlines' },
    cta: 'Read all',
  },
  notifications: {
    kind: 'notifications',
    name: 'Notifications',
    category: 'You',
    description: 'Replies, upvotes and mentions, without opening the bell.',
    tone: 'bacon',
    icon: (size) => <BellIcon secondary size={size} />,
    sizes: ['s', 'm', 'w'],
    items: [
      {
        title: 'Ido replied to your comment on "TanStack Charts 1.0"',
        meta: '4m',
      },
      { title: '12 developers upvoted your post', meta: '1h' },
      { title: 'Nimrod mentioned you in Frontend Avengers', meta: '3h' },
      { title: 'Your post reached 1K views', meta: '5h' },
    ],
    glance: { value: '4', label: 'unread' },
  },
  agents: {
    kind: 'agents',
    name: 'Agent updates',
    category: 'News',
    description: 'What the coding agents shipped, as a live chat thread.',
    tone: 'avocado',
    icon: (size) => <TerminalIcon secondary size={size} />,
    sizes: ['m', 'l', 'w', 's'],
    items: realAgentUpdates.map((item) => ({
      title: item.headline ?? item.change,
      meta: item.agent,
      avatar: item.image,
    })),
    glance: { value: '7', label: 'releases today' },
    cta: 'View all',
  },
  ad: {
    kind: 'ad',
    name: 'Sponsored',
    category: 'Sponsored',
    description: 'The ad slot, as a widget with the same chrome as the rest.',
    tone: 'water',
    icon: (size) => <MegaphoneIcon secondary size={size} />,
    sizes: ['m', 's', 'w', 'l'],
    items: [
      {
        title: "A Calendar That's Yours. Not Google's.",
        meta: 'Fastmail',
        image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/2',
      },
    ],
    glance: { value: 'Ad', label: 'Fastmail' },
    cta: 'Learn more',
  },
  promo: {
    kind: 'promo',
    name: 'From daily.dev',
    category: 'daily.dev',
    description:
      'Buttons into our own products: briefing, podcast, a promoted squad.',
    tone: 'onion',
    icon: (size) => <SparkleIcon secondary size={size} />,
    sizes: ['m', 'w', 's'],
    items: [
      { title: 'Your morning brief is ready', meta: 'Presidential briefing' },
      {
        title: 'Ep. 42: Shipping production code with agents',
        meta: 'Podcast',
      },
      { title: 'Rust Builders · 12.4K members', meta: 'Promoted squad' },
    ],
    glance: { value: '3', label: 'new for you' },
  },
  bookmarks: {
    kind: 'bookmarks',
    name: 'Reading list',
    category: 'You',
    description: 'Bookmarks waiting for you, oldest first so nothing rots.',
    tone: 'cabbage',
    icon: (size) => <BookmarkIcon secondary size={size} />,
    sizes: ['s', 'm', 'w'],
    items: [post(3), post(5), post(8), post(11)],
    glance: { value: '23', label: 'saved posts' },
  },
  squads: {
    kind: 'squads',
    name: 'Squad updates',
    category: 'Community',
    description: 'New posts and threads in the squads you joined.',
    tone: 'avocado',
    icon: (size) => <SquadIcon secondary size={size} />,
    sizes: ['m', 'w', 's'],
    items: [
      {
        title: 'Frontend Avengers: "Is the React compiler ready for prod?"',
        meta: '18 replies',
      },
      { title: 'Rust Builders: weekly crate roundup', meta: '6 new' },
      { title: 'DevOps Nation: incident review template', meta: '3 new' },
    ],
    glance: { value: '27', label: 'new in your squads' },
  },
  digest: {
    kind: 'digest',
    name: 'Topical digest',
    category: 'News',
    description: 'One topic, the week in five stories.',
    tone: 'water',
    icon: (size) => <HashtagIcon secondary size={size} />,
    sizes: ['m', 'w', 'l'],
    items: [post(1), post(2), post(4), post(6), post(9)],
    glance: { value: '#ai', label: '5 stories this week' },
  },
  whatsnew: {
    kind: 'whatsnew',
    name: "What's new",
    category: 'daily.dev',
    description: 'Product changes, so a new feature has a door.',
    tone: 'onion',
    icon: (size) => <SparkleIcon secondary size={size} />,
    sizes: ['s', 'w', 'm'],
    items: [
      { title: 'Agent updates now live in your feed', meta: 'New' },
      { title: 'Share any post as an image', meta: 'Improved' },
      { title: 'Faster search, everywhere', meta: 'Improved' },
    ],
    glance: { value: '3', label: 'new this week' },
  },
  dms: {
    kind: 'dms',
    name: 'Messages',
    category: 'Community',
    description: 'Direct messages, with the unread count up front.',
    tone: 'cheese',
    icon: (size) => <MailIcon secondary size={size} />,
    sizes: ['s', 'm', 'w'],
    items: [
      { title: 'Lee: did you try the new Bun release?', meta: '2m' },
      { title: 'Chris: thanks for the review!', meta: '1h' },
      { title: 'Ana: joining the hackathon?', meta: 'yesterday' },
    ],
    glance: { value: '2', label: 'unread' },
  },
  podcast: {
    kind: 'podcast',
    name: 'Podcast',
    category: 'daily.dev',
    description: 'The latest episode, playable in place.',
    tone: 'bacon',
    icon: (size) => <MicrophoneIcon secondary size={size} />,
    sizes: ['s', 'w', 'm'],
    items: [
      {
        title: 'Ep. 42: Shipping production code with agents',
        meta: '38 min · out today',
        image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3',
      },
    ],
    glance: { value: '38m', label: 'new episode' },
    cta: 'Play',
  },
  briefing: {
    kind: 'briefing',
    name: 'Briefing',
    category: 'daily.dev',
    description: 'Your presidential briefing, ready each morning.',
    tone: 'onion',
    icon: (size) => <BriefGradientIcon secondary size={size} />,
    sizes: ['s', 'w', 'm'],
    items: [
      { title: 'Your morning brief is ready', meta: '7 stories · 2 min read' },
    ],
    glance: { value: '2m', label: 'morning brief' },
    cta: 'Read brief',
  },
  streak: {
    kind: 'streak',
    name: 'Streak',
    category: 'You',
    description:
      'The whole streak panel: the count, the 30-day calendar, today’s goal and quests.',
    tone: 'bacon',
    icon: (size) => <ReadingStreakIcon secondary size={size} />,
    sizes: ['m', 's', 'w', 'l'],
    items: [{ title: '2 of 3 posts read today', meta: 'Keep it going' }],
    glance: { value: '849', label: 'day streak' },
  },
  trending: {
    kind: 'trending',
    name: 'Trending tags',
    category: 'News',
    description: 'Topics climbing in the last hours.',
    tone: 'cheese',
    isProposed: true,
    icon: (size) => <TrendingIcon secondary size={size} />,
    sizes: ['s', 'm', 'w'],
    items: [
      { title: '#claude-code', meta: '+340%' },
      { title: '#tanstack', meta: '+210%' },
      { title: '#bun', meta: '+95%' },
      { title: '#postgres', meta: '+60%' },
    ],
    glance: { value: '#claude-code', label: '+340% today' },
  },
  jobs: {
    kind: 'jobs',
    name: 'Jobs for you',
    category: 'You',
    description: 'Matched roles from daily.dev Recruiter.',
    tone: 'water',
    isProposed: true,
    icon: (size) => <JobIcon secondary size={size} />,
    sizes: ['s', 'm'],
    items: [
      {
        title: 'Senior Frontend Engineer · Vercel',
        meta: 'Remote · 96% match',
      },
      { title: 'Staff Engineer · Supabase', meta: 'Remote · 91% match' },
    ],
    glance: { value: '2', label: 'new matches' },
  },
  arena: {
    kind: 'arena',
    name: 'Agents Arena',
    category: 'Community',
    description: 'Today’s matchup, votable in place.',
    tone: 'cheese',
    isProposed: true,
    icon: (size) => <ArenaIcon secondary size={size} />,
    sizes: ['s', 'w'],
    items: [
      { title: 'Claude Code vs Codex', meta: '3.1K votes · closes in 6h' },
    ],
    glance: { value: '58%', label: 'Claude Code leads' },
    cta: 'Vote',
  },
  continue: {
    kind: 'continue',
    name: 'Continue reading',
    category: 'You',
    description: 'Pick up the post you left halfway.',
    tone: 'cabbage',
    isProposed: true,
    icon: (size) => <PlayIcon secondary size={size} />,
    sizes: ['w', 's'],
    items: [post(7)],
    glance: { value: '60%', label: 'read' },
  },
  mybrief: {
    kind: 'mybrief',
    name: 'Your briefing',
    category: 'News',
    description:
      'Your last 24 hours, summarized from your own feed: your stack, your people, one thing worth your time.',
    tone: 'onion',
    isProposed: true,
    icon: (size) => <BriefGradientIcon secondary size={size} />,
    sizes: ['l', 'm', 'w', 's'],
    items: [],
    glance: { value: '5', label: 'things since yesterday' },
  },
  events: {
    kind: 'events',
    name: 'Events',
    category: 'Community',
    description: 'Hackathons and live sessions coming up.',
    tone: 'avocado',
    isProposed: true,
    icon: (size) => <CalendarIcon secondary size={size} />,
    sizes: ['s', 'w'],
    items: [{ title: 'daily.dev Hackathon: Agents', meta: 'Starts in 3 days' }],
    glance: { value: '3d', label: 'until the hackathon' },
  },
};

export type Sponsor = { name: string; tone?: Tone };

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const WidgetHeader = ({
  def,
  sponsor,
  compact,
}: {
  def: WidgetDef;
  sponsor?: Sponsor;
  compact?: boolean;
}): ReactElement => (
  <header className="flex min-w-0 items-center gap-2">
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center rounded-8',
        compact ? 'size-6' : 'size-7',
        toneClass[def.tone].subtle,
      )}
    >
      {def.icon(IconSize.Size16)}
    </span>
    <span className="truncate font-bold text-text-primary typo-footnote">
      {def.name}
    </span>
    {sponsor && (
      <span className="ml-auto shrink-0 rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption2">
        Sponsored
      </span>
    )}
  </header>
);

const ItemRow = ({
  item,
  dense,
}: {
  item: Item;
  dense?: boolean;
}): ReactElement => (
  <span className="flex min-w-0 items-start gap-2">
    {item.avatar && (
      <img
        src={item.avatar}
        alt=""
        className="mt-0.5 size-5 shrink-0 rounded-6 object-cover"
      />
    )}
    <span className="flex min-w-0 flex-1 flex-col">
      <span
        className={classNames(
          'font-bold text-text-primary typo-footnote',
          dense ? 'line-clamp-1' : 'line-clamp-2',
        )}
      >
        {item.title}
      </span>
      {item.meta && (
        <span className="truncate text-text-tertiary typo-caption1">
          {item.meta}
        </span>
      )}
    </span>
  </span>
);

const SponsorFooter = ({ sponsor }: { sponsor: Sponsor }): ReactElement => (
  <span className="mt-auto truncate pt-2 text-text-quaternary typo-caption1">
    Presented by{' '}
    <span className="font-bold text-text-tertiary">{sponsor.name}</span>
  </span>
);

const ImageWidget = ({
  def,
  size,
  sponsor,
}: {
  def: WidgetDef;
  size: WidgetSize;
  sponsor?: Sponsor;
}): ReactElement => {
  const [lead] = def.items;
  const isWide = size === 'w' || size === 'l';

  return (
    <div
      className={classNames(
        'flex h-full min-h-0 gap-3',
        isWide ? 'flex-row' : 'flex-col',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <WidgetHeader def={def} sponsor={sponsor} />
        <span
          className={classNames(
            'break-words font-bold text-text-primary',
            size === 'l'
              ? 'line-clamp-4 typo-title2'
              : 'line-clamp-3 typo-callout',
          )}
        >
          {lead.title}
        </span>
        {lead.meta && (
          <span className="truncate text-text-tertiary typo-caption1">
            {lead.meta}
          </span>
        )}
        {def.cta && size !== 's' && (
          <span className="mt-auto inline-flex h-7 items-center self-start rounded-10 border border-border-subtlest-secondary px-3 font-bold text-text-primary typo-footnote">
            {def.cta}
          </span>
        )}
      </div>
      {lead.image && size !== 's' && (
        <img
          src={lead.image}
          alt=""
          className={classNames(
            'min-h-0 rounded-12 object-cover',
            isWide ? 'h-full w-1/2' : 'w-full flex-1',
          )}
        />
      )}
    </div>
  );
};

const GlanceWidget = ({
  def,
  sponsor,
}: {
  def: WidgetDef;
  sponsor?: Sponsor;
}): ReactElement => (
  <div className="flex h-full min-h-0 flex-col">
    <WidgetHeader def={def} sponsor={sponsor} compact />
    <span className="mt-auto truncate font-bold tabular-nums text-text-primary typo-title1">
      {def.glance.value}
    </span>
    <span className="truncate text-text-tertiary typo-caption1">
      {sponsor ? `Presented by ${sponsor.name}` : def.glance.label}
    </span>
  </div>
);

const ListWidget = ({
  def,
  size,
  sponsor,
}: {
  def: WidgetDef;
  size: WidgetSize;
  sponsor?: Sponsor;
}): ReactElement => {
  const count = { s: 1, m: 4, w: 2, l: 5 }[size];
  const items = def.items.slice(0, count);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <WidgetHeader def={def} sponsor={sponsor} />
      <div
        className={classNames(
          'min-h-0 gap-3 overflow-hidden',
          size === 'w' ? 'grid grid-cols-2' : 'flex flex-col',
        )}
      >
        {items.map((item) => (
          <ItemRow key={item.title} item={item} dense={size === 'w'} />
        ))}
      </div>
      {sponsor ? (
        <SponsorFooter sponsor={sponsor} />
      ) : (
        def.cta && (
          <span className="mt-auto font-bold text-text-tertiary typo-caption1">
            {def.cta} →
          </span>
        )
      )}
    </div>
  );
};

const imageKinds: WidgetKind[] = [
  'featured',
  'ad',
  'podcast',
  'continue',
  'briefing',
  'arena',
  'events',
];

export const WidgetContent = ({
  kind,
  size,
  sponsor,
}: {
  kind: WidgetKind;
  size: WidgetSize;
  sponsor?: Sponsor;
}): ReactElement => {
  const def = widgetCatalog[kind];

  if (kind === 'streak') {
    return <StreakWidget size={size} />;
  }

  if (kind === 'mybrief') {
    return <BriefWidgetContent size={size} />;
  }

  if (size === 's' && kind !== 'featured' && kind !== 'ad') {
    return <GlanceWidget def={def} sponsor={sponsor} />;
  }

  if (imageKinds.includes(kind)) {
    return <ImageWidget def={def} size={size} sponsor={sponsor} />;
  }

  return <ListWidget def={def} size={size} sponsor={sponsor} />;
};

/** The one surface every widget sits on, so a sponsored one cannot dress up. */
export const WidgetSurface = ({
  children,
  className,
  isFlat,
}: {
  children: ReactNode;
  className?: string;
  /** Production's grammar: no fill, no border, only the hover surface. */
  isFlat?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-16 p-4',
      isFlat
        ? 'transition-colors hover:bg-surface-hover'
        : 'border border-border-subtlest-tertiary bg-background-subtle',
      className,
    )}
  >
    {children}
  </div>
);
