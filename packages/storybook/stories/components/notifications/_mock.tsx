import { fn } from 'storybook/test';
import type { NotificationItemProps } from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import {
  NotificationAttachmentType,
  NotificationAvatarType,
} from '@dailydotdev/shared/src/graphql/notifications';

// Shared sample data for the Notifications stories so the "Full page" and
// "Overview" surfaces stay in sync with one realistic data set instead of each
// re-inventing notifications. Mirrors the real feed: a mix of types spread
// across the same time buckets the live page groups by (Today / This week /
// This month / Earlier).

export const img = (seed: string, size = 96): string =>
  `https://picsum.photos/seed/${seed}/${size}`;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

export const userAvatar = (seed: string, name: string) => ({
  type: NotificationAvatarType.User,
  referenceId: seed,
  name,
  image: img(`user-${seed}`, 64),
  targetUrl: `/${seed}`,
});

export const sourceAvatar = (seed: string, name: string) => ({
  type: NotificationAvatarType.Source,
  referenceId: seed,
  name,
  image: img(`source-${seed}`, 64),
  targetUrl: `/sources/${seed}`,
});

export const postAttachment = (seed: string, title: string) => ({
  type: NotificationAttachmentType.Post,
  title,
  image: img(`post-${seed}`, 160),
});

// `createdAt` is deliberately chosen so the set lands across all four time
// groups, with a couple of unread (recent) rows at the top.
const defs: Array<Partial<NotificationItemProps> & { isUnread?: boolean }> = [
  // ---- Today ----
  {
    type: NotificationType.ArticleNewComment,
    icon: NotificationIconType.Comment,
    title: '<b>Nimrod Kramer</b> commented on your post',
    description: 'Great write-up — the part about caching really helped.',
    avatars: [userAvatar('nimrod', 'Nimrod')],
    attachments: [postAttachment('c1', 'Scaling our cache layer')],
    createdAt: minutesAgo(8),
    isUnread: true,
  },
  {
    type: NotificationType.CommentMention,
    icon: NotificationIconType.Comment,
    title: '<b>Tsahi Matsliah</b> mentioned you in a comment',
    description: 'Hey @you, what do you think about this approach?',
    avatars: [userAvatar('tsahi', 'Tsahi')],
    attachments: [
      postAttachment('mention2', 'The state of frontend frameworks in 2026'),
    ],
    createdAt: minutesAgo(42),
    isUnread: true,
  },
  {
    type: NotificationType.ArticleUpvoteMilestone,
    icon: NotificationIconType.Upvote,
    title: '25 upvotes! No bugs, just vibes ✨',
    description: 'Your post is on a roll today',
    numTotalAvatars: 25,
    avatars: [
      userAvatar('a1', 'One'),
      userAvatar('a2', 'Two'),
      userAvatar('a3', 'Three'),
    ],
    createdAt: hoursAgo(3),
    isUnread: true,
  },
  {
    type: NotificationType.UserFollow,
    icon: NotificationIconType.User,
    title: '<b>Tobias Wolf</b> started following you',
    avatars: [userAvatar('tobias', 'Tobias')],
    createdAt: hoursAgo(6),
  },
  // ---- This week ----
  {
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> replied to your comment',
    description:
      'This is a longer reply so we can see the snippet wrap to a maximum of three lines and then truncate with an ellipsis instead of being cut off after one line.',
    avatars: [userAvatar('ido', 'Ido')],
    createdAt: daysAgo(2),
  },
  {
    type: NotificationType.SquadPostAdded,
    icon: NotificationIconType.Bell,
    title: '<b>GeekLuffy</b> posted in <b>AI</b>',
    avatars: [sourceAvatar('ai', 'AI'), userAvatar('luffy', 'Luffy')],
    attachments: [postAttachment('sq1', 'Fine-tuning on a budget')],
    createdAt: daysAgo(3),
  },
  {
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Agentic Digest</b>',
    avatars: [sourceAvatar('agentic', 'Agentic Digest')],
    attachments: [
      postAttachment(
        'p1',
        'MAI-Code-1-Flash beats Claude Haiku 4.5 on SWE-Bench',
      ),
    ],
    createdAt: daysAgo(5),
  },
  // ---- This month ----
  {
    type: NotificationType.UserReceivedAward,
    icon: NotificationIconType.Star,
    title: '<b>keshavashiya</b> awarded you +7 Cores for being awesome!',
    avatars: [userAvatar('keshav', 'keshavashiya')],
    createdAt: daysAgo(12),
  },
  {
    type: NotificationType.UserTopReaderBadge,
    icon: NotificationIconType.TopReaderBadge,
    title: 'You earned the Top Reader badge in <b>JavaScript</b>',
    createdAt: daysAgo(16),
  },
  {
    type: NotificationType.StreakReminder,
    icon: NotificationIconType.Streak,
    title: 'Your 7-day streak is about to expire',
    description: 'Read a post today to keep it alive',
    createdAt: daysAgo(20),
  },
  {
    type: NotificationType.BriefingReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your presidential briefing is ready',
    createdAt: daysAgo(24),
  },
  // ---- Earlier ----
  {
    type: NotificationType.NewOpportunityMatch,
    icon: NotificationIconType.Opportunity,
    title: 'New match: Senior Frontend Engineer at Acme',
    description: 'Based on your profile and interests',
    createdAt: daysAgo(45),
  },
  {
    type: NotificationType.Announcements,
    icon: NotificationIconType.DailyDev,
    title: 'A big new feature just landed on daily.dev',
    createdAt: daysAgo(70),
  },
  {
    type: NotificationType.System,
    icon: NotificationIconType.DailyDev,
    title: 'We updated our terms of service',
    createdAt: daysAgo(120),
  },
];

export const sampleNotifications: Array<
  NotificationItemProps & { isUnread?: boolean }
> = defs.map((def, index) => ({
  onClick: fn(),
  targetUrl: '/post/123',
  referenceId: `mock-${index}`,
  icon: NotificationIconType.Bell,
  type: NotificationType.System,
  title: 'Notification',
  ...def,
}));

// Same coarse buckets the live page uses (see NotificationsFeed.tsx).
export const TIME_GROUPS = [
  { key: 'today', label: 'Today', maxDays: 0 },
  { key: 'week', label: 'This week', maxDays: 7 },
  { key: 'month', label: 'This month', maxDays: 30 },
  { key: 'earlier', label: 'Earlier', maxDays: Number.POSITIVE_INFINITY },
] as const;

const calendarDaysAgo = (date: Date): number => {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(new Date()) - startOf(date)) / 86_400_000);
};

export const groupByTime = (
  items: Array<NotificationItemProps & { isUnread?: boolean }>,
): Array<{
  key: string;
  label: string;
  items: Array<NotificationItemProps & { isUnread?: boolean }>;
}> => {
  const byKey = new Map<
    string,
    Array<NotificationItemProps & { isUnread?: boolean }>
  >();
  items.forEach((item) => {
    const days = item.createdAt ? calendarDaysAgo(item.createdAt) : Infinity;
    const group =
      TIME_GROUPS.find((bucket) => days <= bucket.maxDays) ??
      TIME_GROUPS[TIME_GROUPS.length - 1];
    const list = byKey.get(group.key) ?? [];
    list.push(item);
    byKey.set(group.key, list);
  });
  return TIME_GROUPS.filter((bucket) => byKey.has(bucket.key)).map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    items: byKey.get(bucket.key) as Array<
      NotificationItemProps & { isUnread?: boolean }
    >,
  }));
};
