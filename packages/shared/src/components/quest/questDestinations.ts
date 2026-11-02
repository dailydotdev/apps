import type { UserQuest } from '../../graphql/quests';
import { agentsHighlightsPath } from '../../lib/links';
import { downloadBrowserExtension, webappUrl } from '../../lib/constants';
import { BrowserName } from '../../lib/func';
import type { QuestDestination } from './QuestCard';

/**
 * A destination as a URL. In-app destinations are stored as absolute paths but
 * have to be resolved against `webappUrl`, which already ends in a slash — hence
 * dropping the path's leading one.
 */
export const getQuestDestinationUrl = (
  destination: QuestDestination,
): string => {
  // Narrowing on the typeof, not on `in`: both members declare the other's key
  // as an optional `never`, so `'href' in destination` leaves it `string |
  // undefined` and the union stays unresolved.
  if (typeof destination.href === 'string') {
    return destination.href;
  }

  return `${webappUrl}${destination.path.replace(/^\//, '')}`;
};

export const getQuestDestination = (
  quest: UserQuest['quest'],
): QuestDestination | null => {
  if (quest.eventType === 'post_share') {
    if (quest.description === 'Create a shared link post') {
      return { label: 'Create post', path: '/squads/create' };
    }

    return { label: 'Feed', path: '/' };
  }

  switch (quest.eventType) {
    case 'read_post':
    case 'post_upvote':
    case 'award_given':
    case 'share_post_click':
    case 'comment_upvote':
    case 'comment_create':
    case 'bookmark_post':
      return { label: 'Feed', path: '/' };
    case 'brief_read':
      return { label: 'Briefs', path: '/briefing' };
    case 'user_follow':
      return { label: 'Leaderboards', path: '/users' };
    case 'view_user_profile':
      return { label: 'Profiles', path: '/users' };
    case 'visit_arena':
      return { label: 'Happening Now', path: agentsHighlightsPath };
    case 'visit_explore_page':
      return { label: 'Explore', path: '/posts' };
    case 'visit_read_it_later_page':
      return { label: 'Later', path: '/bookmarks/later' };
    case 'visit_marketplace':
      return { label: 'Marketplace', path: '/marketplace' };
    case 'plugin_submit':
      return { label: 'Submit plugin', path: '/marketplace/submit' };
    case 'feedback_submit':
      return { label: 'Feedback', path: '/settings/feedback' };
    case 'squad_join':
      return { label: 'Squads', path: '/squads/discover' };
    case 'api_token_create':
    case 'api_profile_fetch':
    case 'api_feed_fetch':
    case 'api_bookmark':
    case 'api_search':
      return { label: 'API settings', path: '/settings/api' };
    default:
      return null;
  }
};

const introDestinationByEventType: Record<string, QuestDestination> = {
  notifications_enable: {
    label: 'Notifications',
    path: '/settings/notifications',
  },
  brief_generate: {
    label: 'Briefing',
    path: '/briefing/generate',
  },
  profile_complete: {
    label: 'Profile',
    path: '/settings/profile',
  },
  api_token_create: {
    label: 'API settings',
    path: '/settings/api',
  },
  api_profile_fetch: {
    label: 'API settings',
    path: '/settings/api',
  },
};

const getExtensionIntroDestination = (
  browserName: BrowserName,
): QuestDestination | null => {
  switch (browserName) {
    case BrowserName.Edge:
      return {
        label: 'Edge Add-ons',
        href: downloadBrowserExtension,
        openInNewTab: true,
      };
    case BrowserName.Chrome:
    case BrowserName.Brave:
      return {
        label: 'Chrome Web Store',
        href: downloadBrowserExtension,
        openInNewTab: true,
      };
    default:
      return null;
  }
};

export const getIntroQuestDestination = (
  eventType: string,
  browserName: BrowserName,
): QuestDestination | null =>
  eventType === 'extension_install'
    ? getExtensionIntroDestination(browserName)
    : introDestinationByEventType[eventType] ?? null;
