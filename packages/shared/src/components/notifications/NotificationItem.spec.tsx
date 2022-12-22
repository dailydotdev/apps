import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import NotificationItem, { NotificationItemProps } from './NotificationItem';
import {
  NotificationAvatarType,
  NotificationType,
} from '../../graphql/notifications';
import { NotificationIcon } from './utils';

const sampleNotificationTitle = 'Welcome to your new notification center!';
const sampleNotificationDescription =
  'The notification system notifies you of important events such as replies, mentions, updates etc.';
const sampleNotification: NotificationItemProps = {
  isUnread: true,
  icon: NotificationIcon.Comment,
  title: `<p>${sampleNotificationTitle}</p>`,
  description: `<p>${sampleNotificationDescription}</p>`,
  type: NotificationType.System,
  targetUrl: 'post url',
  attachments: [
    { title: 'Sample attachment', image: 'sample attachment image' },
  ],
  avatars: [
    {
      name: 'source',
      image: 'source avatar',
      referenceId: 'source',
      targetUrl: 'webapp/source',
      type: NotificationAvatarType.Source,
    },
    {
      name: 'user',
      image: 'user avatar',
      referenceId: 'user',
      targetUrl: 'webapp/user',
      type: NotificationAvatarType.User,
    },
  ],
};

const renderComponent = (component: ReactNode) => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>{component}</QueryClientProvider>,
  );
};

describe('notification attachment', () => {
  it('should display image', async () => {
    const [attachment] = sampleNotification.attachments;
    renderComponent(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(
      `Cover preview of: ${attachment.title}`,
    );
    expect(img).toHaveAttribute('src', attachment.image);
  });

  it('should have a title', async () => {
    const [attachment] = sampleNotification.attachments;
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(attachment.title);
  });
});

describe('notification avatars', () => {
  it('should display the avatar of the source', async () => {
    const [source] = sampleNotification.avatars;
    renderComponent(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(`${source.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', source.image);
  });

  it('should display the avatar of the user', async () => {
    const [, user] = sampleNotification.avatars;
    renderComponent(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(`${user.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', user.image);
  });

  it('should not display anything if the type is unknown', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notif = { ...sampleNotification } as any;
    notif.avatars[1].type = 'Test';
    const [, user] = sampleNotification.avatars;
    renderComponent(<NotificationItem {...sampleNotification} />);
    const img = screen.queryByAltText(`${user.referenceId}'s profile`);
    expect(img).not.toBeInTheDocument();
  });
});

describe('notification item', () => {
  it('should display the icon of the notification', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    const testid = `notification-${sampleNotification.icon}`;
    const img = await screen.findByTestId(testid);
    expect(img).toBeInTheDocument();
  });

  it('should display the default icon if the passed icon is unknown', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notification = { ...sampleNotification } as any; // using any to validate unknown icon
    notification.icon = 'new notif';
    renderComponent(<NotificationItem {...notification} />);
    const testid = `notification-${notification.icon}`;
    const img = await screen.findByTestId(testid);
    expect(img).toHaveAttribute('data-testvalue', NotificationIcon.DailyDev);
  });

  it('should have a title that supports html', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationTitle);
  });

  it('should have a description that supports html', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationDescription);
  });
});
