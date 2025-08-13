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
import type { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationGroup } from '../../hooks/notifications/useNotificationSettings';

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
  SourcePostRejected = 'source_post_rejected',
  ArticlePicked = 'article_picked',
  ArticleAnalytics = 'article_analytics',
  SourcePostSubmitted = 'source_post_submitted',
  SquadFeatured = 'squad_featured',
  Marketing = 'marketing',
  Announcements = 'announcements',
  NewUserWelcome = 'new_user_welcome',
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
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.PostBookmarkReminder,
];
export const ACHIEVEMENT_KEYS = [
  NotificationType.UserTopReaderBadge,
  NotificationType.DevCardUnlocked,
  NotificationType.ArticleAnalytics,
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
  NotificationType.SquadBlocked,
  NotificationType.DemotedToMember,
];

export const SOURCE_SUBMISSION_KEYS = [
  NotificationType.SourceApproved,
  NotificationType.SourceRejected,
];

export const SQUAD_MODERATION_KEYS = [
  NotificationType.SourcePostSubmitted,
  NotificationType.SquadMemberJoined,
  NotificationType.SquadFeatured,
];

export const SQUAD_POST_REVIEW_KEYS = [
  NotificationType.SourcePostApproved,
  NotificationType.SourcePostRejected,
  NotificationType.ArticlePicked,
];

export const SQUAD_KEYS = [
  NotificationType.SquadPostAdded,
  NotificationType.SquadMemberJoined,
  NotificationType.SourcePostSubmitted,
];

export const COMMENT_KEYS = [
  NotificationType.ArticleNewComment,
  NotificationType.SquadNewComment,
  NotificationType.SquadReply,
];

export const CREATOR_UPDATES_EMAIL_KEYS = [
  NotificationType.SourcePostApproved,
  NotificationType.ArticlePicked,
];

export const FOLLOWING_EMAIL_KEYS = [
  NotificationType.SourcePostAdded,
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.SquadPostAdded,
];

export const NotificationContainer = classed('div', 'flex flex-col gap-6');

export const NotificationSection = classed(
  'section',
  'flex flex-col gap-6 px-4',
);

export interface NotificationChannelSetting {
  email: NotificationPreferenceStatus;
  inApp: NotificationPreferenceStatus;
}

export interface NotificationSettings {
  [key: string]: NotificationChannelSetting;
}

type NotificationItem =
  | {
      id: NotificationGroup;
      label: string;
      description?: string;
      group: true;
    }
  | {
      id: string;
      label: string;
      description?: string;
      group: false;
    };

export const ACTIVITY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'comments',
    label: 'Comments on your posts',
    group: true,
  },
  {
    id: NotificationType.CommentReply,
    label: 'Replies to your comment',
    group: false,
  },
  {
    id: NotificationType.ArticleUpvoteMilestone,
    label: 'Upvotes on your post',
    group: false,
  },
  {
    id: NotificationType.CommentUpvoteMilestone,
    label: 'Upvotes on your comment',
    group: false,
  },
  {
    id: 'mentions',
    label: 'Mentions of your username',
    group: true,
  },
  {
    id: NotificationType.UserReceivedAward,
    label: 'Cores & Awards you receive',
    group: false,
  },
  {
    id: NotificationType.ArticleReportApproved,
    label: 'Report updates',
    group: false,
  },
];

export const FOLLOWING_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'following',
    label: 'Following',
    description:
      'Get notified when sources, users, collections, or threads you follow are updated. You can manage each below.',
    group: true,
  },
  {
    id: NotificationType.SourcePostAdded,
    label: 'Source new post',
    group: false,
  },
  {
    id: NotificationType.UserPostAdded,
    label: 'User new posts',
    group: false,
  },
  {
    id: NotificationType.CollectionUpdated,
    label: 'Collections you follow',
    group: false,
  },
  {
    id: NotificationType.PostBookmarkReminder,
    label: 'Read it later',
    group: false,
  },
];

export const STREAK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'streaks',
    label: 'Streaks',
    description:
      'Stay on track and never miss a reading day. Get reminders to protect your streak or bring it back when it breaks.',
    group: true,
  },
  {
    id: NotificationType.StreakReminder,
    label: 'Notify me before my streak expires',
    group: false,
  },
  {
    id: NotificationType.StreakResetRestore,
    label: 'Restore broken streak',
    group: false,
  },
];

export const CREATORS_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'sourceSubmission',
    label: 'Source suggestions',
    description:
      'Get notified on suggested sources, including review progress and outcomes.',
    group: true,
  },
  {
    id: 'squadPostReview',
    label: 'Submitted post review',
    description:
      'Get notified when your submitted post has been reviewed by a Squad moderator.',
    group: true,
  },
  {
    id: 'squadRoles',
    label: 'Squad roles',
    description:
      'Get notified when your squad role changes, like becoming a moderator or admin.',
    group: true,
  },
];

export const DAILY_DEV_NOTIFICATIONS: NotificationItem[] = [
  {
    id: NotificationType.NewUserWelcome,
    label: 'New user welcome',
    description:
      'Get helpful tips and guidance as you get started with daily.dev.',
    group: false,
  },
  {
    id: NotificationType.Announcements,
    label: 'Major announcements',
    description:
      'Get notified about big product changes, launches, and important company news from daily.dev.',
    group: false,
  },
  {
    id: NotificationType.Marketing,
    label: 'Community & Marketing',
    description:
      'Get emails about product news, events, giveaways, and highlights from the daily.dev community.',
    group: false,
  },
];
