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
  AnalyticsIcon,
  JobIcon,
  MagicIcon,
  AtIcon,
  AddUserIcon,
  SquadIcon,
  MegaphoneIcon,
} from '../icons';
import type { NotificationPromptSource } from '../../lib/log';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import type { NotificationPreferenceStatus } from '../../graphql/notifications';
import type {
  NotificationChannel,
  NotificationGroup,
} from '../../hooks/notifications/useNotificationSettings';
import { briefButtonBg } from '../../styles/custom';

// Compact inverting "chip": `invert` makes the contents (text, status icon)
// resolve against the chip background, which is the opposite of the page — so
// they stay readable on both a dark chip (light page) and a light chip (dark
// page). Single row, medium-weight message, theme-matching surface.
export const NotifContainer = classed(
  'div',
  'fixed left-1/2 invert flex flex-row items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 pr-2 shadow-3',
);
export const NotifMessage = classed(
  'div',
  'min-w-0 flex-1 typo-subhead font-medium text-text-primary',
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
  UserAwardThanks = 'user_award_thanks',
  BriefingReady = 'briefing_ready',
  DigestReady = 'digest_ready',
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
  InAppPurchases = 'in_app_purchases',
  PostAnalytics = 'post_analytics',
  PollResult = 'poll_result',
  PollResultAuthor = 'poll_result_author',
  NewOpportunityMatch = 'new_opportunity_match',
  WarmIntro = 'warm_intro',
  ExperienceCompanyEnriched = 'experience_company_enriched',
  LiveRoomStarted = 'live_room_started',
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
  Analytics = 'Analytics',
  Opportunity = 'Opportunity',
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
  [NotificationIconType.Analytics]: AnalyticsIcon,
  [NotificationIconType.Opportunity]: JobIcon,
};

export const notificationIconAsPrimary: NotificationIconType[] = [
  NotificationIconType.Core,
  NotificationIconType.Opportunity,
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
  [NotificationIconType.Analytics]: 'text-brand-default',
  [NotificationIconType.Opportunity]: 'text-black',
};

export const notificationIconStyle: Record<
  NotificationIconType,
  Record<string, string> | null
> = {
  [NotificationIconType.DailyDev]: null,
  [NotificationIconType.CommunityPicks]: null,
  [NotificationIconType.Comment]: null,
  [NotificationIconType.Upvote]: null,
  [NotificationIconType.Bell]: null,
  [NotificationIconType.View]: null,
  [NotificationIconType.Block]: null,
  [NotificationIconType.User]: null,
  [NotificationIconType.Star]: null,
  [NotificationIconType.DevCard]: null,
  [NotificationIconType.BookmarkReminder]: null,
  [NotificationIconType.Streak]: null,
  [NotificationIconType.TopReaderBadge]: null,
  [NotificationIconType.Timer]: null,
  [NotificationIconType.Core]: null,
  [NotificationIconType.Analytics]: null,
  [NotificationIconType.Opportunity]: { background: briefButtonBg },
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
    [NotificationType.UserAwardThanks]: 'text-brand-default',
    [NotificationType.BriefingReady]: 'text-brand-default',
    [NotificationType.DigestReady]: 'text-brand-default',
    [NotificationType.UserFollow]: 'text-brand-default',
  };

export const notificationTypeNotClickable: Partial<
  Record<NotificationType, boolean>
> = {
  [NotificationType.WarmIntro]: true,
};

export const descriptionIcon: Partial<
  Record<NotificationType, ComponentType<IconProps>>
> = {
  [NotificationType.NewOpportunityMatch]: MagicIcon,
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
  [NotificationType.SquadMemberJoined]: {
    mute: 'Mute new member notifications',
    unmute: 'Unmute new member notifications',
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
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
];

export const FOLLOWING_EMAIL_KEYS = [
  NotificationType.SourcePostAdded,
  NotificationType.UserPostAdded,
  NotificationType.CollectionUpdated,
  NotificationType.SquadPostAdded,
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
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

export const POLL_RESULT_KEYS = [
  NotificationType.PollResult,
  NotificationType.PollResultAuthor,
];

export const OPPORTUNITY_KEYS = [NotificationType.NewOpportunityMatch];

// Human-friendly buckets used to filter the notifications page. Each raw
// NotificationType maps to exactly one category; anything not listed below
// falls back to `Updates` so new backend types never disappear from the feed.
export enum NotificationFilterCategory {
  Upvotes = 'upvotes',
  Mentions = 'mentions',
  Comments = 'comments',
  Followers = 'followers',
  Squads = 'squads',
  Updates = 'updates',
}

export const notificationCategoryToTypes: Record<
  NotificationFilterCategory,
  NotificationType[]
> = {
  [NotificationFilterCategory.Upvotes]: [
    NotificationType.ArticleUpvoteMilestone,
    NotificationType.CommentUpvoteMilestone,
  ],
  [NotificationFilterCategory.Mentions]: [
    NotificationType.PostMention,
    NotificationType.CommentMention,
  ],
  [NotificationFilterCategory.Comments]: [
    NotificationType.ArticleNewComment,
    NotificationType.SquadNewComment,
    NotificationType.CommentReply,
    NotificationType.SquadReply,
  ],
  [NotificationFilterCategory.Followers]: [NotificationType.UserFollow],
  [NotificationFilterCategory.Squads]: [
    NotificationType.SquadPostAdded,
    NotificationType.SquadMemberJoined,
    NotificationType.SquadBlocked,
    NotificationType.PromotedToAdmin,
    NotificationType.PromotedToModerator,
    NotificationType.DemotedToMember,
    NotificationType.SquadPublicApproved,
    NotificationType.SquadFeatured,
    NotificationType.SquadSubscribeNotification,
    NotificationType.SourcePostSubmitted,
    NotificationType.SourcePostApproved,
    NotificationType.SourcePostRejected,
    NotificationType.ArticlePicked,
  ],
  [NotificationFilterCategory.Updates]: [
    NotificationType.System,
    NotificationType.SourcePostAdded,
    NotificationType.UserPostAdded,
    NotificationType.CollectionUpdated,
    NotificationType.PostBookmarkReminder,
    NotificationType.PollResult,
    NotificationType.PollResultAuthor,
    NotificationType.UserReceivedAward,
    NotificationType.UserAwardThanks,
    NotificationType.UserTopReaderBadge,
    NotificationType.DevCardUnlocked,
    NotificationType.ArticleReportApproved,
    NotificationType.ArticleAnalytics,
    NotificationType.PostAnalytics,
    NotificationType.SourceApproved,
    NotificationType.SourceRejected,
    NotificationType.BriefingReady,
    NotificationType.DigestReady,
    NotificationType.StreakReminder,
    NotificationType.StreakResetRestore,
    NotificationType.Marketing,
    NotificationType.Announcements,
    NotificationType.NewUserWelcome,
    NotificationType.InAppPurchases,
    NotificationType.NewOpportunityMatch,
    NotificationType.WarmIntro,
    NotificationType.ExperienceCompanyEnriched,
    NotificationType.LiveRoomStarted,
  ],
};

// Order the chips appear in the filter bar.
export const notificationFilterCategoryList: NotificationFilterCategory[] = [
  NotificationFilterCategory.Upvotes,
  NotificationFilterCategory.Mentions,
  NotificationFilterCategory.Comments,
  NotificationFilterCategory.Followers,
  NotificationFilterCategory.Squads,
  NotificationFilterCategory.Updates,
];

export const notificationFilterCategoryLabel: Record<
  NotificationFilterCategory,
  string
> = {
  [NotificationFilterCategory.Upvotes]: 'Upvotes',
  [NotificationFilterCategory.Mentions]: 'Mentions',
  [NotificationFilterCategory.Comments]: 'Comments',
  [NotificationFilterCategory.Followers]: 'Followers',
  [NotificationFilterCategory.Squads]: 'Squads',
  [NotificationFilterCategory.Updates]: 'Updates',
};

const notificationTypeToCategory = Object.entries(
  notificationCategoryToTypes,
).reduce((acc, [category, types]) => {
  types.forEach((type) => {
    acc[type] = category as NotificationFilterCategory;
  });
  return acc;
}, {} as Partial<Record<NotificationType, NotificationFilterCategory>>);

export const getNotificationCategory = (
  type: NotificationType,
): NotificationFilterCategory =>
  notificationTypeToCategory[type] ?? NotificationFilterCategory.Updates;

// Eye-catching colored type badge overlaid on the avatar (Instagram/Facebook/
// TikTok pattern): a solid accent circle + glyph that signals the notification
// type at a glance.
//
// `fg` is chosen for contrast against the badge fill, not for decoration: the
// food-palette accents split into bright (avocado green, blueCheese cyan, bun
// orange) where a white glyph washes out, and dark (cabbage/onion purples)
// where white reads. Bright fills get a dark glyph, dark fills get white — so
// the icon stays legible in both light and dark themes (the fill hue barely
// shifts between themes, so a fixed per-badge `fg` is enough).
export const notificationCategoryBadge: Record<
  NotificationFilterCategory,
  { bg: string; fg: string; Icon: ComponentType<IconProps> }
> = {
  [NotificationFilterCategory.Upvotes]: {
    bg: 'bg-accent-avocado-default',
    fg: 'text-black',
    Icon: UpvoteIcon,
  },
  [NotificationFilterCategory.Mentions]: {
    bg: 'bg-accent-cabbage-default',
    fg: 'text-white',
    Icon: AtIcon,
  },
  [NotificationFilterCategory.Comments]: {
    bg: 'bg-accent-blueCheese-default',
    fg: 'text-black',
    Icon: DiscussIcon,
  },
  [NotificationFilterCategory.Followers]: {
    bg: 'bg-accent-onion-default',
    fg: 'text-white',
    Icon: AddUserIcon,
  },
  // Squads shares the Followers purple — the cheese yellow read poorly and a
  // white glyph on yellow had almost no contrast.
  [NotificationFilterCategory.Squads]: {
    bg: 'bg-accent-onion-default',
    fg: 'text-white',
    Icon: SquadIcon,
  },
  [NotificationFilterCategory.Updates]: {
    bg: 'bg-accent-bun-default',
    fg: 'text-black',
    Icon: MegaphoneIcon,
  },
};

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
      type?: 'switch' | 'checkbox';
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
  {
    id: NotificationType.UserFollow,
    label: 'New followers',
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
    id: NotificationType.SquadPostAdded,
    label: 'Squad new post',
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
  {
    id: 'pollResult',
    label: 'Poll Results',
    group: true,
    type: 'checkbox',
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
  {
    id: NotificationType.PostAnalytics,
    label: 'Post analytics',
    description: 'Get updates about how your posts are performing.',
    group: false,
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

export const BILLING_NOTIFICATIONS: NotificationItem[] = [
  {
    id: NotificationType.InAppPurchases,
    label: 'In-app purchases',
    group: false,
  },
];
export const isMutingDigestCompletely = (
  ns: NotificationSettings,
  currentChannel: NotificationChannel,
  notificationType: NotificationType = NotificationType.BriefingReady,
) => {
  const currentChannelStatus = ns[notificationType]?.[currentChannel];
  const otherChannelStatus =
    ns[notificationType]?.[currentChannel === 'inApp' ? 'email' : 'inApp'];

  return (
    otherChannelStatus === 'muted' && currentChannelStatus === 'subscribed'
  );
};
