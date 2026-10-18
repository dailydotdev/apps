import { AuthTriggers } from '../../lib/auth';
import type { AuthTriggersType } from '../../lib/auth';

// One line under the sign-up title on a phone, saying what the action that
// opened it gets the member. Triggers without a line show nothing.
const lines: Partial<Record<AuthTriggersType, string>> = {
  [AuthTriggers.Follow]: 'Sign up to follow and get their posts in your feed.',
  [AuthTriggers.Author]: 'Sign up to follow and get their posts in your feed.',
  [AuthTriggers.Bookmark]: 'Sign up to save posts for later.',
  [AuthTriggers.Upvote]: 'Sign up to vote on posts and comments.',
  [AuthTriggers.Downvote]: 'Sign up to vote on posts and comments.',
  [AuthTriggers.CommentUpvote]: 'Sign up to vote on posts and comments.',
  [AuthTriggers.CommentDownvote]: 'Sign up to vote on posts and comments.',
  [AuthTriggers.Comment]: 'Sign up to join the discussion.',
  [AuthTriggers.NewComment]: 'Sign up to join the discussion.',
  [AuthTriggers.JoinSquad]: 'Sign up to join this Squad.',
  [AuthTriggers.CreateSquad]: 'Sign up to create a Squad.',
  [AuthTriggers.CreatePost]: 'Sign up to post to the community.',
  [AuthTriggers.MainButton]: 'Sign up to get a feed built for you.',
  [AuthTriggers.FromNotification]: 'Sign up to see your notifications.',
  [AuthTriggers.SourceSubscribe]: 'Sign up to get notified about new posts.',
  [AuthTriggers.CollectionSubscribe]:
    'Sign up to get notified about new posts.',
  [AuthTriggers.ReportPost]: 'Sign up to hide and report content.',
  [AuthTriggers.HidePost]: 'Sign up to hide and report content.',
  [AuthTriggers.ReportComment]: 'Sign up to hide and report content.',
  [AuthTriggers.Filter]: 'Sign up to tune your feed.',
  [AuthTriggers.CreateFeedFilters]: 'Sign up to tune your feed.',
  [AuthTriggers.Plus]: 'Sign up to get daily.dev Plus.',
  [AuthTriggers.GiveAward]: 'Sign up to give awards.',
};

export const authContextLine = (
  trigger?: AuthTriggersType,
): string | undefined => (trigger ? lines[trigger] : undefined);
