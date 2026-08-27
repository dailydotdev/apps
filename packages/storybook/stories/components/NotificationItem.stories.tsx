import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import type { NotificationItemProps } from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import {
  NotificationAttachmentType,
  NotificationAvatarType,
} from '@dailydotdev/shared/src/graphql/notifications';
import ExtensionProviders from '../extension/_providers';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const img = (seed: string, size = 96) =>
  `https://picsum.photos/seed/${seed}/${size}`;

const userAvatar = (seed: string, name: string) => ({
  type: NotificationAvatarType.User,
  referenceId: seed,
  name,
  image: img(`user-${seed}`, 64),
  targetUrl: `/${seed}`,
});

const sourceAvatar = (seed: string, name: string) => ({
  type: NotificationAvatarType.Source,
  referenceId: seed,
  name,
  image: img(`source-${seed}`, 64),
  targetUrl: `/sources/${seed}`,
});

const postAttachment = (seed: string, title: string) => ({
  type: NotificationAttachmentType.Post,
  title,
  image: img(`post-${seed}`, 160),
});

const meta: Meta<typeof NotificationItem> = {
  title: 'Components/Notifications/List item — all types',
  component: NotificationItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NotificationItem>;

const framed = (node: React.ReactNode) => (
  <div className="w-full max-w-[40rem] bg-background-default">{node}</div>
);

// ---------------------------------------------------------------------------
// Every notification type in the product, with representative data.
// ---------------------------------------------------------------------------
const allDefs: Array<Partial<NotificationItemProps>> = [
  // Comments & replies (blue badge)
  {
    type: NotificationType.ArticleNewComment,
    icon: NotificationIconType.Comment,
    title: '<b>Nimrod Kramer</b> commented on your post',
    description: 'Great write-up — the part about caching really helped.',
    avatars: [userAvatar('nimrod', 'Nimrod')],
    attachments: [postAttachment('c1', 'Scaling our cache layer')],
    createdAt: hoursAgo(1),
  },
  {
    type: NotificationType.SquadNewComment,
    icon: NotificationIconType.Comment,
    title: '<b>Lee Solway</b> commented on your post in <b>WebDev</b>',
    description: 'Have you tried the new view transitions API?',
    avatars: [userAvatar('lee', 'Lee')],
    createdAt: hoursAgo(2),
  },
  {
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> replied to your comment',
    description: 'Looks great — shipping it!',
    avatars: [userAvatar('ido', 'Ido')],
    createdAt: hoursAgo(3),
  },
  {
    type: NotificationType.SquadReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ante Barić</b> replied to your comment in <b>AI</b>',
    description:
      'This is a longer reply so we can see the snippet wrap to a maximum of three lines and then truncate with an ellipsis instead of being cut off after one line.',
    avatars: [userAvatar('ante', 'Ante')],
    createdAt: hoursAgo(4),
  },
  // Mentions (cabbage badge)
  {
    type: NotificationType.PostMention,
    icon: NotificationIconType.Comment,
    title: '<b>Tsahi Matsliah</b> mentioned you in a post',
    avatars: [userAvatar('tsahi', 'Tsahi')],
    attachments: [postAttachment('mention1', 'How we cut build times in half')],
    createdAt: hoursAgo(5),
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
    createdAt: hoursAgo(6),
  },
  // Reactions / upvotes (green badge) — multi-avatar stacks
  {
    type: NotificationType.ArticleUpvoteMilestone,
    icon: NotificationIconType.Upvote,
    title: '3 upvotes! No bugs, just vibes ✨',
    description: '@kkurko you gonna see Patchy here and there',
    numTotalAvatars: 3,
    avatars: [
      userAvatar('a1', 'One'),
      userAvatar('a2', 'Two'),
      userAvatar('a3', 'Three'),
    ],
    createdAt: hoursAgo(7),
  },
  {
    type: NotificationType.CommentUpvoteMilestone,
    icon: NotificationIconType.Upvote,
    title: '12 upvotes on your comment!',
    numTotalAvatars: 12,
    avatars: [
      userAvatar('b1', 'One'),
      userAvatar('b2', 'Two'),
      userAvatar('b3', 'Three'),
    ],
    createdAt: hoursAgo(8),
  },
  // Followers (onion badge)
  {
    type: NotificationType.UserFollow,
    icon: NotificationIconType.User,
    title: '<b>Tobias Wolf</b> started following you',
    avatars: [userAvatar('tobias', 'Tobias')],
    createdAt: hoursAgo(9),
  },
  // Squads (cheese badge)
  {
    type: NotificationType.SquadPostAdded,
    icon: NotificationIconType.Bell,
    title: '<b>GeekLuffy</b> posted in <b>AI</b>',
    avatars: [sourceAvatar('ai', 'AI'), userAvatar('luffy', 'Luffy')],
    attachments: [postAttachment('sq1', 'Fine-tuning on a budget')],
    createdAt: hoursAgo(10),
  },
  {
    type: NotificationType.SquadMemberJoined,
    icon: NotificationIconType.User,
    title: '<b>Donald Major</b> joined <b>DevOps</b>',
    avatars: [sourceAvatar('devops', 'DevOps'), userAvatar('donald', 'Donald')],
    createdAt: hoursAgo(11),
  },
  {
    type: NotificationType.SourcePostSubmitted,
    icon: NotificationIconType.Bell,
    title: '<b>Ankur Gupta</b> submitted a post in <b>WebDev</b> for review',
    avatars: [sourceAvatar('webdev', 'WebDev'), userAvatar('ankur', 'Ankur')],
    createdAt: hoursAgo(12),
  },
  {
    type: NotificationType.SourcePostApproved,
    icon: NotificationIconType.Bell,
    title: 'Your post was approved in <b>WebDev</b>',
    avatars: [sourceAvatar('webdev', 'WebDev')],
    createdAt: hoursAgo(13),
  },
  {
    type: NotificationType.SourcePostRejected,
    icon: NotificationIconType.Block,
    title: 'Your post was declined in <b>WebDev</b>',
    avatars: [sourceAvatar('webdev', 'WebDev')],
    createdAt: hoursAgo(14),
  },
  {
    type: NotificationType.ArticlePicked,
    icon: NotificationIconType.CommunityPicks,
    title: 'Your post was picked for the community 🎉',
    attachments: [postAttachment('pick', 'Why we rewrote our scheduler')],
    createdAt: hoursAgo(15),
  },
  {
    type: NotificationType.PromotedToAdmin,
    icon: NotificationIconType.Star,
    title: 'You are now an admin in <b>DevOps</b>',
    avatars: [sourceAvatar('devops', 'DevOps')],
    createdAt: hoursAgo(16),
  },
  {
    type: NotificationType.PromotedToModerator,
    icon: NotificationIconType.Star,
    title: 'You are now a moderator in <b>AI</b>',
    avatars: [sourceAvatar('ai', 'AI')],
    createdAt: hoursAgo(17),
  },
  {
    type: NotificationType.DemotedToMember,
    icon: NotificationIconType.User,
    title: 'Your role in <b>AI</b> changed to member',
    avatars: [sourceAvatar('ai', 'AI')],
    createdAt: hoursAgo(18),
  },
  {
    type: NotificationType.SquadBlocked,
    icon: NotificationIconType.Block,
    title: 'You were removed from <b>DevOps</b>',
    avatars: [sourceAvatar('devops', 'DevOps')],
    createdAt: hoursAgo(19),
  },
  {
    type: NotificationType.SquadPublicApproved,
    icon: NotificationIconType.Star,
    title: 'Your Squad <b>AI</b> is now public',
    avatars: [sourceAvatar('ai', 'AI')],
    createdAt: hoursAgo(20),
  },
  {
    type: NotificationType.SquadFeatured,
    icon: NotificationIconType.Star,
    title: 'Your Squad <b>AI</b> is now featured',
    avatars: [sourceAvatar('ai', 'AI')],
    createdAt: hoursAgo(21),
  },
  {
    type: NotificationType.SquadSubscribeNotification,
    icon: NotificationIconType.Bell,
    title: 'Get notified about new posts in <b>WebDev</b>',
    avatars: [sourceAvatar('webdev', 'WebDev')],
    createdAt: hoursAgo(22),
  },
  // Following / content (no badge) — source/user avatar
  {
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Agentic Digest</b>',
    avatars: [sourceAvatar('agentic', 'Agentic Digest')],
    attachments: [
      postAttachment('p1', 'MAI-Code-1-Flash beats Claude Haiku 4.5 on SWE-Bench'),
    ],
    createdAt: hoursAgo(23),
  },
  {
    type: NotificationType.UserPostAdded,
    icon: NotificationIconType.Bell,
    title: '<b>Ido Shamun</b> published a new post',
    avatars: [userAvatar('ido', 'Ido')],
    attachments: [postAttachment('p3', 'Lessons from scaling daily.dev')],
    createdAt: hoursAgo(24),
  },
  {
    type: NotificationType.CollectionUpdated,
    icon: NotificationIconType.Bell,
    title: 'A collection you follow was updated',
    numTotalAvatars: 4,
    avatars: [
      sourceAvatar('s1', 'One'),
      sourceAvatar('s2', 'Two'),
      sourceAvatar('s3', 'Three'),
    ],
    attachments: [postAttachment('coll', 'The state of AI agents, 2026')],
    createdAt: hoursAgo(25),
  },
  {
    type: NotificationType.PostBookmarkReminder,
    icon: NotificationIconType.BookmarkReminder,
    title: 'Read it later: a post you saved',
    attachments: [postAttachment('bm', 'Designing resilient queues')],
    createdAt: hoursAgo(26),
  },
  // Achievements / awards (no badge)
  {
    type: NotificationType.UserReceivedAward,
    icon: NotificationIconType.Star,
    title: '<b>keshavashiya</b> awarded you +7 Cores for being awesome!',
    avatars: [userAvatar('keshav', 'keshavashiya')],
    createdAt: hoursAgo(27),
  },
  {
    type: NotificationType.UserTopReaderBadge,
    icon: NotificationIconType.TopReaderBadge,
    title: 'You earned the Top Reader badge in <b>JavaScript</b>',
    createdAt: hoursAgo(28),
  },
  {
    type: NotificationType.DevCardUnlocked,
    icon: NotificationIconType.DevCard,
    title: 'Your DevCard is ready to share',
    createdAt: hoursAgo(29),
  },
  {
    type: NotificationType.ArticleAnalytics,
    icon: NotificationIconType.Analytics,
    title: 'Your post analytics for this week are ready',
    createdAt: hoursAgo(30),
  },
  {
    type: NotificationType.PostAnalytics,
    icon: NotificationIconType.Analytics,
    title: 'Weekly performance: your posts reached 1.2k devs',
    createdAt: hoursAgo(31),
  },
  // Streaks (no badge) — icon only
  {
    type: NotificationType.StreakReminder,
    icon: NotificationIconType.Streak,
    title: 'Your 7-day streak is about to expire',
    description: 'Read a post today to keep it alive',
    createdAt: hoursAgo(32),
  },
  {
    type: NotificationType.StreakResetRestore,
    icon: NotificationIconType.Streak,
    title: 'Your streak broke — restore it now',
    createdAt: hoursAgo(33),
  },
  // Briefs / digests / system (no badge) — icon only
  {
    type: NotificationType.BriefingReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your presidential briefing is ready',
    createdAt: hoursAgo(34),
  },
  {
    type: NotificationType.DigestReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your daily digest is ready',
    createdAt: hoursAgo(35),
  },
  {
    type: NotificationType.System,
    icon: NotificationIconType.DailyDev,
    title: 'We updated our terms of service',
    createdAt: hoursAgo(36),
  },
  {
    type: NotificationType.Announcements,
    icon: NotificationIconType.DailyDev,
    title: 'A big new feature just landed on daily.dev',
    createdAt: hoursAgo(40),
  },
  {
    type: NotificationType.Marketing,
    icon: NotificationIconType.DailyDev,
    title: 'See what the community shipped this month',
    createdAt: hoursAgo(44),
  },
  {
    type: NotificationType.NewUserWelcome,
    icon: NotificationIconType.DailyDev,
    title: 'Welcome to daily.dev! Here is how to get started',
    createdAt: hoursAgo(48),
  },
  {
    type: NotificationType.InAppPurchases,
    icon: NotificationIconType.Core,
    title: 'Your Cores purchase is complete',
    createdAt: hoursAgo(52),
  },
  // Moderation / source suggestions (no badge)
  {
    type: NotificationType.SourceApproved,
    icon: NotificationIconType.Bell,
    title: 'The source you suggested was approved',
    avatars: [sourceAvatar('newsrc', 'New Source')],
    createdAt: hoursAgo(56),
  },
  {
    type: NotificationType.SourceRejected,
    icon: NotificationIconType.Block,
    title: 'The source you suggested was declined',
    createdAt: hoursAgo(60),
  },
  {
    type: NotificationType.ArticleReportApproved,
    icon: NotificationIconType.View,
    title: 'Thanks — the post you reported was reviewed',
    createdAt: hoursAgo(64),
  },
  // Polls (no badge)
  {
    type: NotificationType.PollResult,
    icon: NotificationIconType.View,
    title: 'The results of a poll you voted on are in',
    createdAt: hoursAgo(70),
  },
  {
    type: NotificationType.PollResultAuthor,
    icon: NotificationIconType.View,
    title: 'Your poll has ended — see the results',
    createdAt: hoursAgo(80),
  },
  // Opportunities / misc (no badge)
  {
    type: NotificationType.NewOpportunityMatch,
    icon: NotificationIconType.Opportunity,
    title: 'New match: Senior Frontend Engineer at Acme',
    description: 'Based on your profile and interests',
    createdAt: hoursAgo(90),
  },
  {
    type: NotificationType.WarmIntro,
    icon: NotificationIconType.Opportunity,
    title: 'You have a warm intro to Acme via 2 connections',
    numTotalAvatars: 2,
    avatars: [userAvatar('w1', 'One'), userAvatar('w2', 'Two')],
    createdAt: hoursAgo(120),
  },
  {
    type: NotificationType.ExperienceCompanyEnriched,
    icon: NotificationIconType.Bell,
    title: 'Your work experience has been linked to Acme Corp',
    createdAt: hoursAgo(200),
  },
  {
    type: NotificationType.LiveRoomStarted,
    icon: NotificationIconType.Bell,
    title: 'A live room just started in <b>AI</b>',
    avatars: [sourceAvatar('ai', 'AI')],
    createdAt: hoursAgo(400),
  },
];

const allNotifications: NotificationItemProps[] = allDefs.map((def, index) => ({
  onClick: fn(),
  targetUrl: '/post/123',
  referenceId: `all-${index}`,
  icon: NotificationIconType.Bell,
  type: NotificationType.System,
  title: 'Notification',
  ...def,
}));

const Feed = ({ withGuides = false }: { withGuides?: boolean }) => (
  <div className="relative bg-background-default">
    {withGuides && (
      <>
        <div className="pointer-events-none absolute inset-y-0 left-[76px] z-3 w-px bg-accent-cabbage-default opacity-40" />
        <div className="pointer-events-none absolute inset-y-0 right-4 z-3 w-px bg-accent-cabbage-default opacity-40" />
      </>
    )}
    {allNotifications.map((notification) => (
      <NotificationItem key={notification.referenceId} {...notification} />
    ))}
  </div>
);

// ---- Individual cases (handy for the Controls/Docs tab) --------------------

export const SingleUserAvatar: Story = {
  render: () => framed(<NotificationItem {...allNotifications[2]} />),
};

export const AvatarStack: Story = {
  // index 7 = a >3 upvote milestone, which is what triggers the grid
  render: () => framed(<NotificationItem {...allNotifications[7]} />),
};

export const IconOnly: Story = {
  render: () => framed(<NotificationItem {...allNotifications[34]} />),
};

// ---- All types, one feed (desktop, with alignment guides) ------------------

export const Showcase: Story = {
  name: 'All types (desktop)',
  parameters: { layout: 'fullscreen' },
  render: () => framed(<Feed withGuides />),
};

// ---- Desktop vs mobile (356px is the smallest supported width) -------------

export const Responsive: Story = {
  name: 'Desktop vs mobile (356px)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-row flex-wrap items-start gap-8 p-4">
      <div>
        <p className="mb-2 font-bold text-text-primary typo-body">
          Desktop (640px)
        </p>
        <div className="w-[640px] overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <Feed />
        </div>
      </div>
      <div>
        <p className="mb-2 font-bold text-text-primary typo-body">
          Mobile — min supported (356px)
        </p>
        <p className="mb-2 max-w-[356px] text-text-tertiary typo-footnote">
          Note: CSS breakpoints follow the browser viewport, not this box — so
          mobile-only styles (like the always-visible kebab) won&apos;t show
          here. Use the &quot;Mobile viewport&quot; story below.
        </p>
        <div className="w-[356px] overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <Feed />
        </div>
      </div>
    </div>
  ),
};

// ---- True mobile viewport (narrows the canvas so mobile breakpoints apply,
// e.g. the mute kebab shows by default instead of on hover) ------------------

export const MobileViewport: Story = {
  name: 'Mobile viewport (kebab visible by default)',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile2' },
  },
  render: () => framed(<Feed />),
};
