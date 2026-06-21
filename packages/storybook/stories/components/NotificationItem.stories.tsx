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
  title: 'Components/NotificationItem',
  component: NotificationItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="w-full max-w-[40rem] bg-background-default">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NotificationItem>;

const base: Partial<NotificationItemProps> = {
  onClick: fn(),
  targetUrl: '/post/123',
};

// ---- Individual cases ------------------------------------------------------

export const SingleUserAvatar: Story = {
  args: {
    ...base,
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> replied to your comment',
    description: 'Looks great — shipping it!',
    avatars: [userAvatar('ido', 'Ido')],
    createdAt: new Date(Date.now() - 2 * 3600_000),
  },
};

export const SourcePost: Story = {
  args: {
    ...base,
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Agentic Digest</b>',
    avatars: [sourceAvatar('agentic', 'Agentic Digest')],
    attachments: [postAttachment('agentic', 'MAI-Code-1-Flash beats Claude Haiku')],
    createdAt: new Date(Date.now() - 2 * 3600_000),
  },
};

export const IconOnly: Story = {
  args: {
    ...base,
    type: NotificationType.BriefingReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your presidential briefing is ready',
    createdAt: new Date(Date.now() - 3 * 3600_000),
  },
};

export const AvatarStackThree: Story = {
  name: 'Avatar stack (3 upvoters)',
  args: {
    ...base,
    type: NotificationType.ArticleUpvoteMilestone,
    icon: NotificationIconType.Upvote,
    title: '3 upvotes! No bugs, just vibes ✨',
    description: '@kkurko you gonna see Patchy here and there',
    numTotalAvatars: 3,
    avatars: [
      userAvatar('u1', 'One'),
      userAvatar('u2', 'Two'),
      userAvatar('u3', 'Three'),
    ],
    createdAt: new Date(Date.now() - 16 * 3600_000),
  },
};

export const AvatarStackOverflow: Story = {
  name: 'Avatar stack (12 upvoters → +10)',
  args: {
    ...base,
    type: NotificationType.ArticleUpvoteMilestone,
    icon: NotificationIconType.Upvote,
    title: '12 upvotes! You are on fire 🔥',
    numTotalAvatars: 12,
    avatars: [
      userAvatar('o1', 'One'),
      userAvatar('o2', 'Two'),
      userAvatar('o3', 'Three'),
    ],
    createdAt: new Date(Date.now() - 18 * 3600_000),
  },
};

export const Unread: Story = {
  args: {
    ...base,
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ante Barić</b> replied to your comment',
    description: 'Nice catch, fixing now.',
    avatars: [userAvatar('ante', 'Ante')],
    isUnread: true,
    createdAt: new Date(Date.now() - 1 * 3600_000),
  },
};

// ---- Showcase: every shape in one continuous feed --------------------------

const showcaseDefs: Array<Partial<NotificationItemProps>> = [
  // Comments (blue badge) — single user avatar
  {
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> replied to your comment',
    description: 'Looks great — shipping it!',
    avatars: [userAvatar('ido', 'Ido')],
    createdAt: new Date(Date.now() - 1 * 3600_000),
  },
  {
    type: NotificationType.ArticleNewComment,
    icon: NotificationIconType.Comment,
    title: '<b>Nimrod Kramer</b> commented on your post',
    description:
      'This is a much longer comment so we can confirm the snippet wraps to a maximum of three lines and then truncates with an ellipsis instead of being cut off after one line.',
    avatars: [userAvatar('nimrod', 'Nimrod')],
    attachments: [postAttachment('c1', 'The post being commented on')],
    createdAt: new Date(Date.now() - 2 * 3600_000),
  },
  // Mentions (cabbage badge)
  {
    type: NotificationType.CommentMention,
    icon: NotificationIconType.Comment,
    title: '<b>Lee Solway</b> mentioned you in a comment',
    description: 'Hey @you, what do you think about this approach?',
    avatars: [userAvatar('lee', 'Lee')],
    createdAt: new Date(Date.now() - 4 * 3600_000),
  },
  // Followers (onion badge) + follow button
  {
    type: NotificationType.UserFollow,
    icon: NotificationIconType.User,
    title: '<b>Tobias Wolf</b> started following you',
    avatars: [userAvatar('tobias', 'Tobias')],
    createdAt: new Date(Date.now() - 6 * 3600_000),
  },
  // Upvotes (green badge) — stack of 3
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
    createdAt: new Date(Date.now() - 16 * 3600_000),
  },
  // Upvotes — overflow +N
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
    createdAt: new Date(Date.now() - 17 * 3600_000),
  },
  // Squads (cheese badge) — 2-avatar stack
  {
    type: NotificationType.SourcePostSubmitted,
    icon: NotificationIconType.Bell,
    title: '<b>Ankur Gupta</b> submitted a post in <b>WebDev</b> for review',
    avatars: [sourceAvatar('webdev', 'WebDev'), userAvatar('ankur', 'Ankur')],
    createdAt: new Date(Date.now() - 18 * 3600_000),
  },
  {
    type: NotificationType.SquadMemberJoined,
    icon: NotificationIconType.User,
    title: '<b>GeekLuffy</b> joined <b>AI</b>',
    avatars: [sourceAvatar('ai', 'AI'), userAvatar('luffy', 'Luffy')],
    createdAt: new Date(Date.now() - 20 * 3600_000),
  },
  {
    type: NotificationType.PromotedToAdmin,
    icon: NotificationIconType.Star,
    title: 'You were promoted to admin in <b>DevOps</b>',
    avatars: [sourceAvatar('devops', 'DevOps')],
    createdAt: new Date(Date.now() - 22 * 3600_000),
  },
  // Source posts (no badge) — single source avatar, with/without thumbnail
  {
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Agentic Digest</b>',
    avatars: [sourceAvatar('agentic', 'Agentic Digest')],
    attachments: [
      postAttachment('p1', 'MAI-Code-1-Flash beats Claude Haiku 4.5 on SWE-Bench'),
    ],
    createdAt: new Date(Date.now() - 23 * 3600_000),
  },
  {
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title:
      'New post in <b>Security Weekly</b>: Laravel-Lang supply chain attack rewrites all tags across three Composer packages to steal CI secrets',
    avatars: [sourceAvatar('sec', 'Security Weekly')],
    attachments: [postAttachment('p2', 'Laravel-Lang supply chain attack')],
    createdAt: new Date(Date.now() - 25 * 3600_000),
  },
  {
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Netflix TechBlog</b> (no cover image)',
    avatars: [sourceAvatar('netflix', 'Netflix TechBlog')],
    createdAt: new Date(Date.now() - 26 * 3600_000),
  },
  // Updates (no badge) — icon only, various icons
  {
    type: NotificationType.BriefingReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your presidential briefing is ready',
    createdAt: new Date(Date.now() - 27 * 3600_000),
  },
  {
    type: NotificationType.StreakReminder,
    icon: NotificationIconType.Streak,
    title: 'Your 7-day streak is about to expire',
    description: 'Read a post today to keep it alive',
    createdAt: new Date(Date.now() - 28 * 3600_000),
  },
  {
    type: NotificationType.UserReceivedAward,
    icon: NotificationIconType.Star,
    title: '<b>keshavashiya</b> awarded you +7 Cores for being awesome!',
    avatars: [userAvatar('keshav', 'keshavashiya')],
    createdAt: new Date(Date.now() - 30 * 3600_000),
  },
  {
    type: NotificationType.Announcements,
    icon: NotificationIconType.DailyDev,
    title: 'A big new feature just landed on daily.dev',
    createdAt: new Date(Date.now() - 2 * 86_400_000),
  },
];

const showcase: NotificationItemProps[] = showcaseDefs.map((def, index) => ({
  onClick: fn(),
  targetUrl: '/post/123',
  referenceId: `showcase-${index}`,
  ...def,
})) as NotificationItemProps[];

export const Showcase: Story = {
  name: 'Showcase (all types — alignment check)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ExtensionProviders>
      <div className="relative w-full max-w-[40rem] bg-background-default">
        {/* Alignment guides: titles should start on the left line, dates
            should end on the right line, across every row. */}
        <div className="pointer-events-none absolute inset-y-0 left-[76px] z-3 w-px bg-accent-cabbage-default opacity-40" />
        <div className="pointer-events-none absolute inset-y-0 right-4 z-3 w-px bg-accent-cabbage-default opacity-40" />
        {showcase.map((notification) => (
          <NotificationItem key={notification.referenceId} {...notification} />
        ))}
      </div>
    </ExtensionProviders>
  ),
};
