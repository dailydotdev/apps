import type { ComponentType } from 'react';
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
import { isExtension } from '../../lib/func';
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

export type FeedWidgetTip = {
  id: string;
  eyebrow: string;
  /** One line on the rail's strip. */
  title: string;
  /** The longer version, for the tips page. */
  description: string;
  href: string;
  icon: ComponentType<IconProps>;
  tone: FeedWidgetTipTone;
  /** Opens outside the app, in a new tab. */
  isExternal?: boolean;
  /** Pointless where the reader already is, such as the extension tip. */
  hideInExtension?: boolean;
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
    eyebrow: 'Your feed',
    title: 'Follow tags to shape your feed',
    description:
      'Follow the topics you care about and block the ones you don’t. Your feed adjusts with every tag.',
    href: `${webappUrl}settings/feed/tags`,
    icon: HashtagIcon,
    tone: 'cabbage',
  },
  {
    id: 'custom-feeds',
    eyebrow: 'Custom feeds',
    title: 'Build a feed for every topic',
    description:
      'Make separate feeds for work, side projects, or that new framework, each with its own tags and sources.',
    href: `${webappUrl}feeds/new`,
    icon: FilterIcon,
    tone: 'avocado',
  },
  {
    id: 'read-later',
    eyebrow: 'Bookmarks',
    title: 'Save posts to read later',
    description:
      'Bookmark a post when you don’t have time for it now. Your read-it-later list keeps it for when you do.',
    href: `${webappUrl}bookmarks/later`,
    icon: BookmarkIcon,
    tone: 'bun',
  },
  {
    id: 'squads',
    eyebrow: 'Squads',
    title: 'Find your people in Squads',
    description:
      'Squads are communities around a language, a tool, or a team. Join one to share posts and discuss them together.',
    href: `${webappUrl}squads/discover`,
    icon: SquadIcon,
    tone: 'water',
  },
  {
    id: 'briefing',
    eyebrow: 'Briefing',
    title: 'Catch up in minutes with a briefing',
    description:
      'Short on time? A briefing sums up what happened in tech, so you can catch up in a few minutes.',
    href: `${webappUrl}briefing`,
    icon: BriefIcon,
    tone: 'onion',
  },
  {
    id: 'streaks',
    eyebrow: 'Reading streak',
    title: 'Keep your reading streak going',
    description:
      'Read a post a day to grow your streak. Tune reminders and streak settings so a busy day doesn’t break it.',
    href: `${webappUrl}settings/customization/gamification`,
    icon: HotIcon,
    tone: 'bacon',
  },
  {
    id: 'search',
    eyebrow: 'Search',
    title: 'Press Cmd/Ctrl + K to search anything',
    description:
      'Jump to posts, tags, and pages from anywhere without leaving the keyboard, or open search and look around.',
    href: `${webappUrl}search`,
    icon: SearchIcon,
    tone: 'blueCheese',
  },
  {
    id: 'history',
    eyebrow: 'Reading history',
    title: 'Find that post you read last week',
    description:
      'Every post you open lands in your reading history, so the one you meant to come back to is always a search away.',
    href: `${webappUrl}history`,
    icon: EyeIcon,
    tone: 'lettuce',
  },
  {
    id: 'appearance',
    eyebrow: 'Appearance',
    title: 'Make daily.dev look your way',
    description:
      'Switch between light and dark mode, show your feed as cards or a list, and choose whether links open in a new tab.',
    href: `${webappUrl}settings/appearance`,
    icon: LayoutIcon,
    tone: 'cheese',
  },
  {
    id: 'devcard',
    eyebrow: 'DevCard',
    title: 'Show off your dev profile',
    description:
      'Your DevCard sums up what you read and your reputation. Share it on your site, your GitHub README, or anywhere else.',
    href: `${webappUrl}settings/customization/devcard`,
    icon: DevCardIcon,
    tone: 'burger',
  },
  {
    id: 'notifications',
    eyebrow: 'Notifications',
    title: 'Choose what you hear about',
    description:
      'Pick which replies, mentions, and updates reach you, in the app or by email, and mute the rest.',
    href: `${webappUrl}settings/notifications`,
    icon: BellIcon,
    tone: 'ketchup',
  },
  {
    id: 'extension',
    eyebrow: 'Browser extension',
    title: 'Get daily.dev on every new tab',
    description:
      'Add the extension and every new tab opens on your feed, the same one millions of developers start their day with.',
    href: downloadBrowserExtension,
    icon: NewTabIcon,
    tone: 'cabbage',
    isExternal: true,
    hideInExtension: true,
  },
];

/** The tips this surface shows. */
export const getFeedWidgetTips = (): FeedWidgetTip[] =>
  feedWidgetTips.filter((tip) => !isExtension || !tip.hideInExtension);

/** One tip at random, for a page view. */
export const pickFeedWidgetTip = (
  random: () => number = Math.random,
): FeedWidgetTip => {
  const tips = getFeedWidgetTips();
  return tips[Math.floor(random() * tips.length) % tips.length];
};
