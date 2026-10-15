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
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { JobIcon } from '@dailydotdev/shared/src/components/icons/Job';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { AgentIcon } from '@dailydotdev/shared/src/components/icons/Agent';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { MicrophoneIcon } from '@dailydotdev/shared/src/components/icons/Microphone';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { ArenaIcon } from '@dailydotdev/shared/src/components/icons/Arena';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import type { Tone } from '../data';
import { realAgentUpdates, realHeroPosts, realPosts } from '../realData';
import { highlights } from '../../features/feed/feedHero.mocks';
import { StreakWidget } from './streakWidget';
import { ProductionContent } from './production';

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
  | 'mybrief'
  | 'brieftext';

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
    sizes: ['l', 'm', 's'],
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
    tone: 'avocado',
    icon: (size) => <EarthIcon secondary size={size} />,
    sizes: ['m', 's', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    description:
      'What the coding agents shipped, from the agents highlights channel.',
    tone: 'water',
    icon: (size) => <AgentIcon secondary size={size} />,
    sizes: ['m', 'l', 's'],
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
    sizes: ['m'],
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
    sizes: ['m', 's', 'l'],
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
    tone: 'bun',
    icon: (size) => <BookmarkIcon secondary size={size} />,
    sizes: ['s', 'm', 'l'],
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
    sizes: ['m', 's', 'l'],
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
    sizes: ['m', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['m', 's', 'l'],
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
    sizes: ['m', 's', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    sizes: ['s', 'm', 'l'],
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
    icon: (size) => <BriefGradientIcon secondary size={size} />,
    sizes: ['l', 'm', 's'],
    items: [],
    glance: { value: '5', label: 'things since yesterday' },
  },
  brieftext: {
    kind: 'brieftext',
    name: 'Presidential briefing, inside',
    category: 'daily.dev',
    description:
      'The briefing itself in the widget: the brief page’s own text, read in place, with the full brief one tap away.',
    tone: 'onion',
    icon: (size) => <BriefGradientIcon secondary size={size} />,
    sizes: ['m', 'l'],
    items: [],
    glance: { value: '4m', label: 'read' },
  },
  events: {
    kind: 'events',
    name: 'Events',
    category: 'Community',
    description: 'Hackathons and live sessions coming up.',
    tone: 'avocado',
    isProposed: true,
    icon: (size) => <CalendarIcon secondary size={size} />,
    sizes: ['s', 'm', 'l'],
    items: [{ title: 'daily.dev Hackathon: Agents', meta: 'Starts in 3 days' }],
    glance: { value: '3d', label: 'until the hackathon' },
  },
};

export type Sponsor = { name: string; tone?: Tone };

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

export const WidgetContent = ({
  kind,
  size,
}: {
  kind: WidgetKind;
  size: WidgetSize;
  /** Kept for the parked sponsored-skin directions; widgets ignore it. */
  sponsor?: Sponsor;
}): ReactElement | null =>
  kind === 'streak' ? (
    <StreakWidget size={size} />
  ) : (
    <ProductionContent kind={kind} size={size} />
  );

/** The one surface every widget sits on, so a sponsored one cannot dress up. */
export const WidgetSurface = ({
  children,
  className,
  isFlat,
  isBare,
}: {
  children: ReactNode;
  className?: string;
  /** Production's grammar: no fill, no border, only the hover surface. */
  isFlat?: boolean;
  /** The widget is a production card with its own frame: add none. */
  isBare?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-16',
      !isBare && 'p-4',
      !isBare &&
        (isFlat
          ? 'transition-colors hover:bg-surface-hover'
          : 'border border-border-subtlest-tertiary bg-background-subtle'),
      className,
    )}
  >
    {children}
  </div>
);
