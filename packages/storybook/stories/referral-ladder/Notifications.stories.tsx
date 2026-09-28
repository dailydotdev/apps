import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import type { NotificationItemProps } from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import { InAppNotificationItem } from '@dailydotdev/shared/src/components/notifications/InAppNotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { NotificationAvatarType } from '@dailydotdev/shared/src/graphql/notifications';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders from '../extension/_providers';
import { friends } from './_mock';

// Every notification the referral ladder sends, in the order a user gets
// them. No referral notification type exists yet, so these borrow the plain
// system type, which has no category badge or extra buttons.

const meta: Meta = {
  title: 'Experiments/Referral Ladder Notifications',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const [maya, sam, ravi] = friends;

const friendAvatar = (friend: (typeof friends)[number]) => ({
  type: NotificationAvatarType.User,
  referenceId: friend.username,
  name: friend.name,
  image: friend.image,
  targetUrl: `/${friend.username}`,
});

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

interface LadderNotification {
  moment: string;
  item: Partial<NotificationItemProps> &
    Pick<NotificationItemProps, 'title' | 'type' | 'icon'>;
}

const notifications: LadderNotification[] = [
  {
    moment: 'A friend signs up with your link',
    item: {
      type: NotificationType.System,
      icon: NotificationIconType.User,
      title: '<b>Maya Levi</b> joined daily.dev with your invite',
      description:
        'Once they stay active for 3 days, you get 1 month of Plus.',
      avatars: [friendAvatar(maya)],
      createdAt: hoursAgo(1),
    },
  },
  {
    moment: 'Step 1 unlocked',
    item: {
      type: NotificationType.System,
      icon: NotificationIconType.Star,
      title: '<b>Maya Levi</b> joined, you got 1 month of Plus',
      description: 'Invite 1 more friend to get 3 months of Plus.',
      avatars: [friendAvatar(maya)],
      createdAt: hoursAgo(2),
    },
  },
  {
    moment: 'Step 1 unlocked, already on Plus',
    item: {
      type: NotificationType.System,
      icon: NotificationIconType.Star,
      title: '<b>Maya Levi</b> joined, you got 1 month of Plus',
      description:
        'Added to the end of your current Plus. It now runs until 14 Dec 2026.',
      avatars: [friendAvatar(maya)],
      createdAt: hoursAgo(2),
    },
  },
  {
    moment: 'Step 2 unlocked',
    item: {
      type: NotificationType.System,
      icon: NotificationIconType.Star,
      title: '<b>Sam Porter</b> joined, you got 3 months of Plus',
      description: 'Invite 1 more friend to get 1 year of Plus.',
      avatars: [friendAvatar(sam)],
      createdAt: hoursAgo(26),
    },
  },
  {
    moment: 'Step 3 unlocked, ladder complete',
    item: {
      type: NotificationType.System,
      icon: NotificationIconType.Star,
      title: '<b>Ravi Patel</b> joined, you got 1 year of Plus',
      description:
        'You climbed the whole ladder. Thanks for bringing your friends to daily.dev.',
      avatars: [friendAvatar(ravi)],
      createdAt: hoursAgo(50),
    },
  },
];

// Mirror of the live InAppNotification container, minus the fixed position.
const PopupShell = ({ children }: { children: ReactElement }): ReactElement => (
  <div className="relative h-22 w-[22.5rem] rounded-16 border border-theme-active bg-accent-pepper-subtler">
    <ModalClose size={ButtonSize.XSmall} top="3" right="3" onClick={fn()} />
    {children}
  </div>
);

const AllNotifications = (): ReactElement => (
  <div className="mx-auto flex max-w-[56rem] flex-col gap-6 p-6">
    <div>
      <h1 className="font-bold text-text-primary typo-title2">
        Referral ladder notifications
      </h1>
      <p className="mt-2 text-text-secondary typo-callout">
        Each moment on the ladder, as a row in the notifications feed and as
        the in-app popup that bounces in when it arrives.
      </p>
    </div>

    {notifications.map(({ moment, item }, index) => (
      <section
        key={moment}
        className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
      >
        <h2 className="font-bold text-text-tertiary typo-callout">{moment}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start">
          <div className="flex-1 overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <NotificationItem
              {...item}
              isUnread
              referenceId={`ladder-${index}`}
              targetUrl="/settings/invite"
              onClick={fn()}
            />
          </div>
          <PopupShell>
            <InAppNotificationItem
              id={`ladder-popup-${index}`}
              icon={item.icon}
              type={item.type}
              createdAt={new Date()}
              targetUrl="/settings/invite"
              title={item.title}
              avatars={item.avatars}
              onClick={fn()}
            />
          </PopupShell>
        </div>
      </section>
    ))}
  </div>
);

export const AllStates: Story = {
  name: 'All notifications',
  render: () => <AllNotifications />,
};
