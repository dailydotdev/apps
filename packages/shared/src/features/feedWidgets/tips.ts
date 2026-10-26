import type { ComponentType } from 'react';
import { useMemo } from 'react';
import type { IconProps } from '../../components/Icon';
import { HashtagIcon } from '../../components/icons/Hashtag';
import { FilterIcon } from '../../components/icons/Filter';
import { BookmarkIcon } from '../../components/icons/Bookmark';
import { SquadIcon } from '../../components/icons/Squad';
import { BriefIcon } from '../../components/icons/Brief';
import { HotIcon } from '../../components/icons/Hot';
import { SearchIcon } from '../../components/icons/Search';
import { EyeIcon } from '../../components/icons/Eye';
import { LayoutIcon } from '../../components/icons/Layout';
import { DevCardIcon } from '../../components/icons/DevCard';
import { BellIcon } from '../../components/icons/Bell';
import { NewTabIcon } from '../../components/icons/NewTab';
import { downloadBrowserExtension, webappUrl } from '../../lib/constants';
import {
  BrowserName,
  getCurrentBrowserName,
  isExtension,
  isExtensionCapableBrowser,
  isIOSNative,
} from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsHydrated } from '../../hooks/useIsHydrated';
import type { LogEvent, Origin } from '../../lib/log';
import { TargetType } from '../../lib/log';

/** The accent a tip is drawn in: a `--theme-accent-*` name. */
export type FeedWidgetTipTone =
  | 'avocado'
  | 'bacon'
  | 'blueCheese'
  | 'bun'
  | 'burger'
  | 'cabbage'
  | 'cheese'
  | 'ketchup'
  | 'lettuce'
  | 'onion'
  | 'water';

/** The tips page's sections, in the order they show. */
export const feedWidgetTipGroups = [
  'Your feed',
  'Read and save',
  'Community',
  'Habits',
] as const;

export type FeedWidgetTipGroup = (typeof feedWidgetTipGroups)[number];

export type FeedWidgetTip = {
  id: string;
  /** The rail's title: a few words, on one line. */
  headline: string;
  /** The rail's one line of what to do. */
  blurb: string;
  /** The rail's button, naming what the reader does next. */
  cta: string;
  /** The tips page's title. */
  title: string;
  /** The longer version, for the tips page. */
  description: string;
  href: string;
  icon: ComponentType<IconProps>;
  tone: FeedWidgetTipTone;
  group: FeedWidgetTipGroup;
  /** Opens outside the app, in a new tab. */
  isExternal?: boolean;
  /**
   * Only for a browser we ship the extension for: pointless inside it, and
   * out of reach in the native apps and in other browsers.
   */
  isBrowserOnly?: boolean;
};

export const tipsPageUrl = `${webappUrl}tips`;

/**
 * A tip event, from the rail or the tips page. Tips have their own target
 * type: some tip ids, such as `briefing`, are also widget kinds.
 */
export const feedWidgetTipLogEvent = (
  eventName: LogEvent,
  origin: Origin,
  tip?: Pick<FeedWidgetTip, 'id'>,
) => ({
  event_name: eventName,
  target_type: TargetType.FeedWidgetTip,
  target_id: tip?.id,
  extra: JSON.stringify({ origin }),
});

export const feedWidgetTips: FeedWidgetTip[] = [
  {
    id: 'feed-tags',
    headline: 'Shape your feed',
    blurb: 'Follow tags you like, block the rest',
    cta: 'Pick tags',
    title: 'Follow tags to shape your feed',
    description:
      'Follow the topics you care about and block the ones you don’t. Your feed adjusts with every tag.',
    href: `${webappUrl}settings/feed/tags`,
    icon: HashtagIcon,
    tone: 'cabbage',
    group: 'Your feed',
  },
  {
    id: 'custom-feeds',
    headline: 'Custom feeds',
    blurb: 'One feed per topic, project or team',
    cta: 'Create',
    title: 'Build a feed for every topic',
    description:
      'Make separate feeds for work, side projects, or that new framework, each with its own tags and sources.',
    href: `${webappUrl}feeds/new`,
    icon: FilterIcon,
    tone: 'avocado',
    group: 'Your feed',
  },
  {
    id: 'read-later',
    headline: 'Read it later',
    blurb: 'Bookmark now, read when you’re free',
    cta: 'Open list',
    title: 'Save posts to read later',
    description:
      'Bookmark a post when you don’t have time for it now. Your read-it-later list keeps it for when you do.',
    href: `${webappUrl}bookmarks/later`,
    icon: BookmarkIcon,
    tone: 'bun',
    group: 'Read and save',
  },
  {
    id: 'squads',
    headline: 'Join a Squad',
    blurb: 'Talk tech with devs who share your stack',
    cta: 'Explore',
    title: 'Find your people in Squads',
    description:
      'Squads are communities around a language, a tool, or a team. Join one to share posts and discuss them together.',
    href: `${webappUrl}squads/discover`,
    icon: SquadIcon,
    tone: 'water',
    group: 'Community',
  },
  {
    id: 'briefing',
    headline: 'Catch up fast',
    blurb: 'Today in tech, summed up in minutes',
    cta: 'Get briefing',
    title: 'Catch up in minutes with a briefing',
    description:
      'Short on time? A briefing sums up what happened in tech, so you can catch up in a few minutes.',
    href: `${webappUrl}briefing`,
    icon: BriefIcon,
    tone: 'onion',
    group: 'Read and save',
  },
  {
    id: 'streaks',
    headline: 'Keep your streak',
    blurb: 'One post a day keeps it alive',
    cta: 'Set reminder',
    title: 'Keep your reading streak going',
    description:
      'Read a post a day to grow your streak. Tune reminders and streak settings so a busy day doesn’t break it.',
    href: `${webappUrl}settings/customization/gamification`,
    icon: HotIcon,
    tone: 'bacon',
    group: 'Habits',
  },
  {
    id: 'search',
    headline: 'Search anything',
    blurb: 'Press Cmd/Ctrl + K to jump anywhere',
    cta: 'Try it',
    title: 'Press Cmd/Ctrl + K to search anything',
    description:
      'Jump to posts, tags, and pages from anywhere without leaving the keyboard, or open search and look around.',
    href: `${webappUrl}search`,
    icon: SearchIcon,
    tone: 'blueCheese',
    group: 'Read and save',
  },
  {
    id: 'history',
    headline: 'Find it again',
    blurb: 'Every post you read is saved',
    cta: 'Open history',
    title: 'Find that post you read last week',
    description:
      'Every post you open lands in your reading history, so the one you meant to come back to is always a search away.',
    href: `${webappUrl}history`,
    icon: EyeIcon,
    tone: 'lettuce',
    group: 'Read and save',
  },
  {
    id: 'appearance',
    headline: 'Make it yours',
    blurb: 'Theme, layout and how links open',
    cta: 'Customize',
    title: 'Make daily.dev look your way',
    description:
      'Switch between light and dark mode, show your feed as cards or a list, and choose whether links open in a new tab.',
    href: `${webappUrl}settings/appearance`,
    icon: LayoutIcon,
    tone: 'cheese',
    group: 'Your feed',
  },
  {
    id: 'devcard',
    headline: 'Your DevCard',
    blurb: 'Show your dev profile anywhere',
    cta: 'Get yours',
    title: 'Show off your dev profile',
    description:
      'Your DevCard sums up what you read and your reputation. Share it on your site, your GitHub README, or anywhere else.',
    href: `${webappUrl}settings/customization/devcard`,
    icon: DevCardIcon,
    tone: 'burger',
    group: 'Community',
  },
  {
    id: 'notifications',
    headline: 'Only what matters',
    blurb: 'Choose what you get notified about',
    cta: 'Choose',
    title: 'Choose what you hear about',
    description:
      'Pick which replies, mentions, and updates reach you, in the app or by email, and mute the rest.',
    href: `${webappUrl}settings/notifications`,
    icon: BellIcon,
    tone: 'ketchup',
    group: 'Habits',
  },
  {
    id: 'extension',
    headline: 'Every new tab',
    blurb: 'Your feed on every new tab',
    cta: 'Add to Chrome',
    title: 'Get daily.dev on every new tab',
    description:
      'Add the extension and every new tab opens on your feed, the same one millions of developers start their day with.',
    href: downloadBrowserExtension,
    icon: NewTabIcon,
    tone: 'cabbage',
    group: 'Habits',
    isExternal: true,
    isBrowserOnly: true,
  },
];

/** The tips this surface shows. */
export const getFeedWidgetTips = ({
  canAddExtension = true,
  isEdge = false,
}: { canAddExtension?: boolean; isEdge?: boolean } = {}): FeedWidgetTip[] =>
  feedWidgetTips
    .filter((tip) => !tip.isBrowserOnly || (!isExtension && canAddExtension))
    .map((tip) =>
      tip.isBrowserOnly && isEdge ? { ...tip, cta: 'Add to Edge' } : tip,
    );

/**
 * The tips this reader can act on. The native apps and the browser are only
 * known on the client, so the server and the hydration render list every tip.
 */
export const useFeedWidgetTips = (): FeedWidgetTip[] => {
  const { isAndroidApp } = useAuthContext();
  const isHydrated = useIsHydrated();
  const canAddExtension =
    !isHydrated ||
    (!isAndroidApp && !isIOSNative() && isExtensionCapableBrowser());
  const isEdge = isHydrated && getCurrentBrowserName() === BrowserName.Edge;

  return useMemo(
    () => getFeedWidgetTips({ canAddExtension, isEdge }),
    [canAddExtension, isEdge],
  );
};

/** One of the tips for a draw in [0, 1), for a page view. */
export const pickFeedWidgetTip = (
  tips: FeedWidgetTip[],
  draw: number,
): FeedWidgetTip => tips[Math.floor(draw * tips.length) % tips.length];
