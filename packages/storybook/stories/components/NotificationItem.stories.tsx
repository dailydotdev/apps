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

// ---- Individual cases (one per notification shape) ------------------------

export const SourcePost: Story = {
  name: 'Source post (no badge, with thumbnail)',
  args: {
    ...base,
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Agentic Digest</b>',
    avatars: [sourceAvatar('agentic', 'Agentic Digest')],
    attachments: [
      postAttachment(
        'agentic',
        'MAI-Code-1-Flash beats Claude Haiku 4.5 on SWE-Bench, Gemini CLI quietly replaced',
      ),
    ],
    createdAt: new Date(Date.now() - 2 * 3600_000),
  },
};

export const Briefing: Story = {
  name: 'Briefing (icon only)',
  args: {
    ...base,
    type: NotificationType.BriefingReady,
    icon: NotificationIconType.DailyDev,
    title: 'Your presidential briefing is ready',
    createdAt: new Date(Date.now() - 3 * 3600_000),
  },
};

export const Award: Story = {
  name: 'Award (Cores)',
  args: {
    ...base,
    type: NotificationType.UserReceivedAward,
    icon: NotificationIconType.Star,
    title: '<b>keshavashiya</b> awarded you +7 Cores for being awesome!',
    avatars: [userAvatar('keshav', 'keshavashiya')],
    createdAt: new Date(Date.now() - 3 * 3600_000),
  },
};

export const SquadPostForReview: Story = {
  name: 'Squad post submitted (2 avatars + badge)',
  args: {
    ...base,
    type: NotificationType.SourcePostSubmitted,
    icon: NotificationIconType.Bell,
    title: '<b>Tobias Wolf</b> submitted a post in <b>DevOps</b> for review',
    avatars: [sourceAvatar('devops', 'DevOps'), userAvatar('tobias', 'Tobias')],
    createdAt: new Date(Date.now() - 16 * 3600_000),
  },
};

export const UpvoteMilestone: Story = {
  name: 'Upvote milestone (avatar group + badge)',
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

export const CommentReply: Story = {
  name: 'Comment reply (badge + comment snippet)',
  args: {
    ...base,
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title:
      '<b>Ante Barić</b> replied to your comment on <b>daily.dev Engineering</b>.',
    description: '@idoshamun this is the GIF reply preview text',
    avatars: [userAvatar('ante', 'Ante')],
    createdAt: new Date(Date.now() - 26 * 3600_000),
  },
};

export const Mention: Story = {
  args: {
    ...base,
    type: NotificationType.CommentMention,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> mentioned you in a comment',
    description: 'Hey @you, what do you think about this approach?',
    avatars: [userAvatar('ido', 'Ido')],
    createdAt: new Date(Date.now() - 5 * 3600_000),
  },
};

export const Follow: Story = {
  args: {
    ...base,
    type: NotificationType.UserFollow,
    icon: NotificationIconType.User,
    title: '<b>Nimrod Kramer</b> started following you',
    avatars: [userAvatar('nimrod', 'Nimrod')],
    createdAt: new Date(Date.now() - 8 * 3600_000),
  },
};

export const PostWithWideImage: Story = {
  name: 'New post with non-square cover',
  args: {
    ...base,
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title: 'New post in <b>Netflix TechBlog</b>',
    avatars: [sourceAvatar('netflix', 'Netflix TechBlog')],
    attachments: [postAttachment('netflix-wide', 'Cassandra Analytics at scale')],
    createdAt: new Date(Date.now() - 23 * 3600_000),
  },
};

export const LongTitle: Story = {
  args: {
    ...base,
    type: NotificationType.SourcePostAdded,
    icon: NotificationIconType.Bell,
    title:
      'New post in <b>Security Weekly</b>: Laravel-Lang supply chain attack rewrites all tags across three Composer packages to steal CI secrets',
    avatars: [sourceAvatar('sec', 'Security Weekly')],
    attachments: [postAttachment('sec', 'Laravel-Lang supply chain attack')],
    createdAt: new Date(Date.now() - 30 * 3600_000),
  },
};

export const LongComment: Story = {
  name: 'Long comment (clamps at 3 lines)',
  args: {
    ...base,
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Lee Solway</b> replied to your comment',
    description:
      'This is a much longer comment so we can verify the snippet wraps across up to three full lines and only then truncates with an ellipsis, rather than being cut off after a single line which made it impossible to read on mobile before this change.',
    avatars: [userAvatar('lee', 'Lee')],
    createdAt: new Date(Date.now() - 40 * 3600_000),
  },
};

export const Unread: Story = {
  args: {
    ...base,
    type: NotificationType.CommentReply,
    icon: NotificationIconType.Comment,
    title: '<b>Ido Shamun</b> replied to your comment',
    description: 'Looks great, shipping it!',
    avatars: [userAvatar('ido', 'Ido')],
    isUnread: true,
    createdAt: new Date(Date.now() - 1 * 3600_000),
  },
};

// ---- Gallery: the whole feed together (best for checking alignment) -------

const gallery: NotificationItemProps[] = [
  SourcePost.args,
  Briefing.args,
  Award.args,
  SquadPostForReview.args,
  UpvoteMilestone.args,
  CommentReply.args,
  PostWithWideImage.args,
  LongTitle.args,
  LongComment.args,
  Follow.args,
].map((args, index) => ({
  ...(args as NotificationItemProps),
  referenceId: `gallery-${index}`,
}));

export const Gallery: Story = {
  name: 'Gallery (full feed)',
  render: () => (
    <ExtensionProviders>
      <div className="w-full max-w-[40rem] bg-background-default">
        {gallery.map((notification) => (
          <NotificationItem key={notification.referenceId} {...notification} />
        ))}
      </div>
    </ExtensionProviders>
  ),
};
