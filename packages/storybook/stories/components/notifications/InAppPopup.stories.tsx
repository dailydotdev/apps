import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { InAppNotificationItem } from '@dailydotdev/shared/src/components/notifications/InAppNotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders from '../../extension/_providers';
import { userAvatar, sourceAvatar } from './_mock';

// The real-time, in-app toast that bounces in (top-center on mobile, bottom-
// right on desktop) when a new notification arrives. Live shell:
// InAppNotification.tsx wraps InAppNotificationItem in a pepper-subtler card
// with a close button. Reproduced statically here so its 3-line clamp and
// icon+avatar lockup can be reviewed.

const meta: Meta<typeof InAppNotificationItem> = {
  title: 'Components/Notifications/In-app popup',
  component: InAppNotificationItem,
  parameters: {
    docs: {
      description: {
        component:
          'Real-time push-style popup. Title is sanitized HTML and clamps to 3 lines. Review: title contrast on the pepper-subtler card, icon/avatar lockup, and how long titles truncate.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InAppNotificationItem>;

// Mirror of the live Container in InAppNotification.tsx (size + surface), minus
// the fixed positioning so it sits inline in the canvas.
const PopupShell = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="relative h-22 w-[22.5rem] rounded-16 border border-theme-active bg-accent-pepper-subtler">
    <ModalClose size={ButtonSize.XSmall} top="3" right="3" onClick={fn()} />
    {children}
  </div>
);

export const CommentReply: Story = {
  render: () => (
    <div className="p-8">
      <PopupShell>
        <InAppNotificationItem
          id="1"
          icon={NotificationIconType.Comment}
          type={NotificationType.CommentReply}
          createdAt={new Date()}
          targetUrl="/post/1"
          title="<b>Ido Shamun</b> replied to your comment"
          avatars={[userAvatar('ido', 'Ido')]}
          onClick={fn()}
        />
      </PopupShell>
    </div>
  ),
};

export const NewPost: Story = {
  render: () => (
    <div className="p-8">
      <PopupShell>
        <InAppNotificationItem
          id="2"
          icon={NotificationIconType.Bell}
          type={NotificationType.SourcePostAdded}
          createdAt={new Date()}
          targetUrl="/post/2"
          title="New post in <b>Agentic Digest</b> you might like"
          avatars={[sourceAvatar('agentic', 'Agentic Digest')]}
          onClick={fn()}
        />
      </PopupShell>
    </div>
  ),
};

export const LongTitleClamp: Story = {
  name: 'Long title (3-line clamp)',
  render: () => (
    <div className="p-8">
      <PopupShell>
        <InAppNotificationItem
          id="3"
          icon={NotificationIconType.Upvote}
          type={NotificationType.ArticleUpvoteMilestone}
          createdAt={new Date()}
          targetUrl="/post/3"
          title="<b>Nimrod Kramer</b> and 24 others upvoted your post about scaling the cache layer to handle millions of requests per day"
          avatars={[userAvatar('nimrod', 'Nimrod')]}
          onClick={fn()}
        />
      </PopupShell>
    </div>
  ),
};

export const SystemNoAvatar: Story = {
  name: 'System (icon only)',
  render: () => (
    <div className="p-8">
      <PopupShell>
        <InAppNotificationItem
          id="4"
          icon={NotificationIconType.DailyDev}
          type={NotificationType.DigestReady}
          createdAt={new Date()}
          targetUrl="/notifications"
          title="Your daily digest is ready"
          onClick={fn()}
        />
      </PopupShell>
    </div>
  ),
};
