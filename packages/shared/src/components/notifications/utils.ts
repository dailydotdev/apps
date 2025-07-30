import type { ComponentType } from 'react';
import classed from '../../lib/classed';
import type { IconProps } from '../Icon';
import {
  BellIcon,
  CommunityPicksIcon,
  DailyIcon,
  DiscussIcon,
  EyeIcon,
  UpvoteIcon,
  BlockIcon,
  UserIcon,
  StarIcon,
  DevCardIcon,
  ReadingStreakIcon,
  TimerIcon,
  CoreIcon,
} from '../icons';
import type { NotificationPromptSource } from '../../lib/log';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';

export const NotifContainer = classed(
  'div',
  'fixed left-1/2 flex flex-col justify-center bg-text-primary p-2 rounded-14 border-border-subtlest-primary shadow-2',
);
export const NotifContent = classed(
  'div',
  'relative flex flex-row items-center ml-2',
);
export const NotifMessage = classed(
  'div',
  'flex-1 mr-2 typo-subhead text-surface-invert',
);
export const NotifProgress = classed(
  'span',
  'absolute -bottom-2 h-1 ease-in-out bg-accent-cabbage-default rounded-8',
);

export enum NotificationType {
  System = 'system',
  ArticleNewComment = 'article_new_comment',
  SquadNewComment = 'squad_new_comment',
  CommentReply = 'comment_reply',
  SquadPostAdded = 'squad_post_added',
  SquadMemberJoined = 'squad_member_joined',
  SquadReply = 'squad_reply',
  SquadBlocked = 'squad_blocked',
  PromotedToAdmin = 'promoted_to_admin',
  PromotedToModerator = 'promoted_to_moderator',
  DemotedToMember = 'demoted_to_member',
  SquadSubscribeNotification = 'squad_subscribe_to_notification',
  CollectionUpdated = 'collection_updated',
  SourcePostAdded = 'source_post_added',
  SquadPublicApproved = 'squad_public_approved',
  UserPostAdded = 'user_post_added',
  UserTopReaderBadge = 'user_given_top_reader',
  UserReceivedAward = 'user_received_award',
  BriefingReady = 'briefing_ready',
  UserFollow = 'user_follow',
  ArticleUpvoteMilestone = 'article_upvote_milestone',
  CommentUpvoteMilestone = 'comment_upvote_milestone',
  ArticleReportApproved = 'article_report_approved',
  PostBookmarkReminder = 'post_bookmark_reminder',
  StreakReminder = 'streak_reminder',
  StreakResetRestore = 'streak_reset_restore',
  SourcePostApproved = 'source_post_approved',
  DevCardUnlocked = 'dev_card_unlocked',
  PostMention = 'post_mention',
  CommentMention = 'comment_mention',
  SourceApproved = 'source_approved',
  SourceRejected = 'source_rejected',
}

export enum NotificationIconType {
  DailyDev = 'DailyDev',
  CommunityPicks = 'CommunityPicks',
  Comment = 'Comment',
  Upvote = 'Upvote',
  Bell = 'Bell',
  View = 'View',
  Block = 'Block',
  User = 'User',
  Star = 'Star',
  DevCard = 'DevCard',
  BookmarkReminder = 'BookmarkReminder',
  Streak = 'Streak',
  TopReaderBadge = 'TopReaderBadge',
  Timer = 'Timer',
  Core = 'Core',
}

export const notificationIcon: Record<
  NotificationIconType,
  ComponentType<IconProps>
> = {
  [NotificationIconType.DailyDev]: DailyIcon,
  [NotificationIconType.CommunityPicks]: CommunityPicksIcon,
  [NotificationIconType.Comment]: DiscussIcon,
  [NotificationIconType.Upvote]: UpvoteIcon,
  [NotificationIconType.Bell]: BellIcon,
  [NotificationIconType.View]: EyeIcon,
  [NotificationIconType.Block]: BlockIcon,
  [NotificationIconType.User]: UserIcon,
  [NotificationIconType.Star]: StarIcon,
  [NotificationIconType.DevCard]: DevCardIcon,
  [NotificationIconType.BookmarkReminder]: BookmarkReminderIcon,
  [NotificationIconType.Streak]: ReadingStreakIcon,
  [NotificationIconType.TopReaderBadge]: BellIcon,
  [NotificationIconType.Timer]: TimerIcon,
  [NotificationIconType.Core]: CoreIcon,
};

export const notificationIconAsPrimary: NotificationIconType[] = [
  NotificationIconType.Core,
];

export const notificationIconTypeTheme: Record<NotificationIconType, string> = {
  [NotificationIconType.DailyDev]: '',
  [NotificationIconType.CommunityPicks]: '',
  [NotificationIconType.Comment]: 'text-accent-blueCheese-default',
  [NotificationIconType.Upvote]: 'text-accent-avocado-default',
  [NotificationIconType.Bell]: '',
  [NotificationIconType.View]: 'text-accent-blueCheese-default',
  [NotificationIconType.Star]: '',
  [NotificationIconType.Block]: '',
  [NotificationIconType.User]: '',
  [NotificationIconType.DevCard]: '',
  [NotificationIconType.BookmarkReminder]: 'text-accent-bun-default',
  [NotificationIconType.Streak]: '',
  [NotificationIconType.TopReaderBadge]: 'text-brand-default',
  [NotificationIconType.Timer]: 'text-brand-default',
  [NotificationIconType.Core]: '',
};

export const notificationTypeTheme: Partial<Record<NotificationType, string>> =
  {
    [NotificationType.System]: '',
    [NotificationType.SquadPostAdded]: 'text-brand-default',
    [NotificationType.SquadMemberJoined]: 'text-brand-default',
    [NotificationType.DemotedToMember]: 'text-brand-default',
    [NotificationType.PromotedToModerator]: 'text-brand-default',
    [NotificationType.PromotedToAdmin]: 'text-brand-default',
    [NotificationType.SquadBlocked]: 'text-brand-default',
    [NotificationType.SquadSubscribeNotification]: 'text-brand-default',
    [NotificationType.CollectionUpdated]: 'text-brand-default',
    [NotificationType.SourcePostAdded]: 'text-brand-default',
    [NotificationType.SquadPublicApproved]: 'text-brand-default',
    [NotificationType.UserPostAdded]: 'text-brand-default',
    [NotificationType.UserTopReaderBadge]: 'text-brand-default',
    [NotificationType.UserReceivedAward]: 'text-brand-default',
    [NotificationType.BriefingReady]: 'text-brand-default',
    [NotificationType.UserFollow]: 'text-brand-default',
    [NotificationType.ArticleUpvoteMilestone]: 'text-brand-default',
    [NotificationType.CommentUpvoteMilestone]: 'text-brand-default',
    [NotificationType.ArticleReportApproved]: 'text-brand-default',
    [NotificationType.PostBookmarkReminder]: 'text-brand-default',
    [NotificationType.StreakReminder]: 'text-brand-default',
    [NotificationType.StreakResetRestore]: 'text-brand-default',
    [NotificationType.SourcePostApproved]: 'text-brand-default',
    [NotificationType.DevCardUnlocked]: 'text-brand-default',
    [NotificationType.PostMention]: 'text-brand-default',
    [NotificationType.CommentMention]: 'text-brand-default',
  };

export const notificationsUrl = `/notifications`;

const MAX_UNREAD_DISPLAY = 20;

export const getUnreadText = (unread: number): string =>
  unread > MAX_UNREAD_DISPLAY ? `${MAX_UNREAD_DISPLAY}+` : unread.toString();

interface ActionCopy {
  mute: string;
  unmute: string;
}

export const notificationMutingCopy: Partial<
  Record<NotificationType, ActionCopy>
> = {
  [NotificationType.ArticleNewComment]: {
    mute: 'Turn off notifications from this post',
    unmute: 'Turn on notifications from this post',
  },
  [NotificationType.SquadNewComment]: {
    mute: 'Turn off notifications from this post',
    unmute: 'Turn on notifications from this post',
  },
  [NotificationType.CommentReply]: {
    mute: 'Mute this thread',
    unmute: 'Unmute this thread',
  },
  [NotificationType.SquadReply]: {
    mute: 'Mute this thread',
    unmute: 'Unmute this thread',
  },
  [NotificationType.UserPostAdded]: {
    mute: 'Mute notifications',
    unmute: 'Unmute notifications',
  },
};

export type SubscriptionCallback = (
  isSubscribed: boolean,
  source?: NotificationPromptSource,
  existing_permission?: boolean,
) => unknown;

export const FOLLOWING_KEYS = [
  NotificationType.SourcePostAdded,
  NotificationType.SquadPostAdded,
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.PostBookmarkReminder,
];
export const ACHIEVEMENT_KEYS = [
  NotificationType.UserTopReaderBadge,
  NotificationType.DevCardUnlocked,
];
export const MENTION_KEYS = [
  NotificationType.PostMention,
  NotificationType.CommentMention,
];
export const STREAK_KEYS = [
  NotificationType.StreakReminder,
  NotificationType.StreakResetRestore,
];
export const SQUAD_ROLE_KEYS = [
  NotificationType.PromotedToAdmin,
  NotificationType.PromotedToModerator,
];

export const SOURCE_SUBMISSION_KEYS = [
  NotificationType.SourceApproved,
  NotificationType.SourceRejected,
];

export const NotificationList = classed(
  'ul',
  'flex flex-col gap-6 [&>li]:flex [&>li]:flex-row [&>li]:justify-between',
);

export const NotificationSection = classed('section', 'flex flex-col gap-6');

export interface NotificationChannelSetting {
  email: 'subscribed' | 'muted';
  inApp: 'subscribed' | 'muted';
}

export interface NotificationSettings {
  [key: string]: NotificationChannelSetting;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  article_new_comment: {
    email: 'muted',
    inApp: 'muted',
  },
  comment_reply: {
    email: 'muted',
    inApp: 'muted',
  },
  article_upvote_milestone: {
    email: 'muted',
    inApp: 'muted',
  },
  comment_upvote_milestone: {
    email: 'muted',
    inApp: 'muted',
  },
  post_mention: {
    email: 'muted',
    inApp: 'muted',
  },
  comment_mention: {
    email: 'muted', // TODO: Currently missing. Check if  should be added.
    inApp: 'muted',
  },
  cores_and_awards_received: {
    email: 'muted',
    inApp: 'muted',
  },
  article_report_approved: {
    email: 'muted',
    inApp: 'muted',
  },
  streak_reset_restore: {
    email: 'muted',
    inApp: 'muted',
  },
  streak_reminder: {
    email: 'muted',
    inApp: 'muted',
  },
  restore_broken_streak: {
    email: 'muted',
    inApp: 'muted',
  },
  user_given_top_reader: {
    email: 'muted',
    inApp: 'muted',
  },
  dev_card_unlocked: {
    email: 'muted',
    inApp: 'muted',
  },
  source_post_added: {
    email: 'muted',
    inApp: 'muted',
  },
  squad_post_added: {
    email: 'muted',
    inApp: 'muted',
  },
  user_post_added: {
    email: 'muted',
    inApp: 'muted',
  },
  collection_updated: {
    email: 'muted',
    inApp: 'muted',
  },
  post_bookmark_reminder: {
    email: 'muted',
    inApp: 'muted',
  },
  promoted_to_admin: {
    email: 'muted',
    inApp: 'muted',
  },
  promoted_to_moderator: {
    email: 'muted',
    inApp: 'muted',
  },
  source_approved: {
    email: 'muted',
    inApp: 'muted',
  },
  source_rejected: {
    email: 'muted',
    inApp: 'muted',
  },
  // TODO: Might have its own notification settings
  // read_it_later_reminder: {
  //   email: 'Muted',
  //   inApp: 'Muted',
  // },
};
