import type { NextRouter } from 'next/router';
import {
  AnalyticsIcon,
  BellIcon,
  BookmarkIcon,
  BriefIcon,
  CoreFlatIcon,
  DevCardIcon,
  DevPlusIcon,
  EyeIcon,
  HashtagIcon,
  HomeIcon,
  HotIcon,
  JobIcon,
  JoystickIcon,
  ReadingStreakIcon,
  ReputationIcon,
  SettingsIcon,
  SourceIcon,
  SquadIcon,
  TimerIcon,
  UpvoteIcon,
  UserIcon,
} from '../../icons';
import type { LoggedUser } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface NavigateContext {
  router: Pick<NextRouter, 'push'>;
  user?: Pick<LoggedUser, 'username'> | null;
}

/**
 * Navigation commands. Use `${webappUrl}<path>` so the same code works in
 * webapp (router.push reaches the page) and in the browser extension
 * (router.push opens the webapp page rather than an internal popup route).
 */
export const getNavigateCommands = ({
  router,
  user,
}: NavigateContext): SpotlightCommand[] => {
  const go = (path: string) => () => {
    router.push(`${webappUrl}${path}`);
  };

  const commands: SpotlightCommand[] = [
    {
      id: 'nav.for-you',
      title: 'Go to For you',
      subtitle: 'Your personalized feed',
      icon: HomeIcon,
      keywords: ['home', 'feed', 'main'],
      group: SpotlightGroup.Navigate,
      perform: go(''),
    },
    {
      id: 'nav.my-feed',
      title: 'Go to My feed',
      icon: HomeIcon,
      keywords: ['personal'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('my-feed'),
    },
    {
      id: 'nav.following',
      title: 'Go to Following',
      icon: UserIcon,
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('following'),
    },
    {
      id: 'nav.popular',
      title: 'Go to Popular',
      icon: HotIcon,
      keywords: ['explore', 'trending'],
      group: SpotlightGroup.Navigate,
      perform: go('posts'),
    },
    {
      id: 'nav.latest',
      title: 'Go to Latest',
      icon: TimerIcon,
      keywords: ['recent', 'new'],
      group: SpotlightGroup.Navigate,
      perform: go('posts/latest'),
    },
    {
      id: 'nav.most-upvoted',
      title: 'Go to Most upvoted',
      icon: UpvoteIcon,
      group: SpotlightGroup.Navigate,
      perform: go('posts/upvoted'),
    },
    {
      id: 'nav.discussed',
      title: 'Go to Discussions',
      icon: HotIcon,
      keywords: ['discussions', 'comments'],
      group: SpotlightGroup.Navigate,
      perform: go('discussed'),
    },
    {
      id: 'nav.bookmarks',
      title: 'Go to Bookmarks',
      icon: BookmarkIcon,
      keywords: ['saved'],
      quickKey: 'gb',
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('bookmarks'),
    },
    {
      id: 'nav.read-later',
      title: 'Go to Read later',
      icon: BookmarkIcon,
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('bookmarks/later'),
    },
    {
      id: 'nav.history',
      title: 'Go to History',
      icon: EyeIcon,
      keywords: ['reading history', 'visited'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('history'),
    },
    {
      id: 'nav.notifications',
      title: 'Go to Notifications',
      icon: BellIcon,
      keywords: ['activity', 'inbox'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('notifications'),
    },
    {
      id: 'nav.highlights',
      title: 'Go to Highlights',
      icon: HotIcon,
      keywords: ['headlines', 'happening now'],
      group: SpotlightGroup.Navigate,
      perform: go('highlights'),
    },
    {
      id: 'nav.tags',
      title: 'Go to Tags',
      icon: HashtagIcon,
      keywords: ['topics'],
      group: SpotlightGroup.Navigate,
      perform: go('tags'),
    },
    {
      id: 'nav.sources',
      title: 'Go to Sources',
      icon: SourceIcon,
      keywords: ['publishers'],
      group: SpotlightGroup.Navigate,
      perform: go('sources'),
    },
    {
      id: 'nav.squads',
      title: 'Go to Squads',
      icon: SquadIcon,
      keywords: ['communities'],
      group: SpotlightGroup.Navigate,
      perform: go('squads'),
    },
    {
      id: 'nav.leaderboard',
      title: 'Go to Leaderboard',
      icon: ReputationIcon,
      keywords: ['users', 'top developers'],
      group: SpotlightGroup.Navigate,
      perform: go('users'),
    },
    {
      id: 'nav.briefing',
      title: 'Go to Presidential briefing',
      icon: BriefIcon,
      keywords: ['daily brief'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('briefing'),
    },
    {
      id: 'nav.standups',
      title: 'Go to Standups',
      icon: ReadingStreakIcon,
      keywords: ['live rooms'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('standups'),
    },
    {
      id: 'nav.game-center',
      title: 'Go to Game center',
      icon: JoystickIcon,
      keywords: ['quests', 'achievements', 'gamification'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('game-center'),
    },
    {
      id: 'nav.analytics',
      title: 'Go to Analytics',
      icon: AnalyticsIcon,
      keywords: ['stats', 'reading'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('analytics'),
    },
    {
      id: 'nav.devcard',
      title: 'Go to DevCard',
      icon: DevCardIcon,
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('settings/customization/devcard'),
    },
    {
      id: 'nav.plus',
      title: 'Go to Plus',
      subtitle: 'Manage or upgrade your subscription',
      icon: DevPlusIcon,
      quickKey: 'gp',
      keywords: ['subscription', 'upgrade', 'membership'],
      group: SpotlightGroup.Navigate,
      perform: go('plus'),
    },
    {
      id: 'nav.wallet',
      title: 'Go to Wallet',
      icon: CoreFlatIcon,
      keywords: ['cores', 'balance'],
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('wallet'),
    },
    {
      id: 'nav.jobs',
      title: 'Go to Jobs',
      icon: JobIcon,
      keywords: ['career', 'opportunities'],
      group: SpotlightGroup.Navigate,
      perform: go('jobs'),
    },
    {
      id: 'nav.settings',
      title: 'Go to Settings',
      icon: SettingsIcon,
      keywords: ['preferences', 'account'],
      quickKey: 'gs',
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go('settings/profile'),
    },
  ];

  if (user?.username) {
    commands.push({
      id: 'nav.profile',
      title: 'Go to your profile',
      icon: UserIcon,
      keywords: ['me', 'account'],
      quickKey: 'me',
      group: SpotlightGroup.Navigate,
      requiresAuth: true,
      perform: go(user.username),
    });
  }

  return commands;
};
