import type { UserQuest } from '../../graphql/quests';
import { agentsHighlightsPath } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import type { QuestDestination } from './QuestCard';

const HOT_TAKES_MODAL_PATH = '/?openModal=hottakes';

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
    case 'hot_take_vote':
    case 'hot_take_create':
      return { label: 'Hot takes', path: HOT_TAKES_MODAL_PATH };
    case 'user_follow':
      return { label: 'Leaderboards', path: '/users' };
    case 'view_user_profile':
      return { label: 'Profiles', path: '/users' };
    case 'visit_arena':
      return { label: 'Happening Now', path: agentsHighlightsPath };
    case 'visit_explore_page':
      return { label: 'Explore', path: '/posts' };
    case 'visit_discussions_page':
      return { label: 'Discuss', path: '/discussed' };
    case 'visit_read_it_later_page':
      return { label: 'Later', path: '/bookmarks/later' };
    case 'feedback_submit':
      return { label: 'Feedback', path: '/settings/feedback' };
    case 'squad_join':
      return { label: 'Squads', path: '/squads/discover' };
    default:
      return null;
  }
};
