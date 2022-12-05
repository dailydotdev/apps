import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationItem, { NotificationItemProps } from './NotificationItem';
import {
  NotificationAvatarType,
  NotificationType,
} from '../../graphql/notifications';

const sampleNotificationTitle = 'Welcome to your new notification center!';
const sampleNotificationDescription =
  'The notification system notifies you of important events such as replies, mentions, updates etc.';
const sampleNotification: NotificationItemProps = {
  isUnread: true,
  icon: 'icon link',
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

describe('notification attachment', () => {
  it('should display image', async () => {
    const [attachment] = sampleNotification.attachments;
    render(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(
      `Preview cover of the article: ${attachment.title}`,
    );
    expect(img).toHaveAttribute('src', attachment.image);
  });

  it('should have a title', async () => {
    const [attachment] = sampleNotification.attachments;
    render(<NotificationItem {...sampleNotification} />);
    await screen.findByText(attachment.title);
  });
});

describe('notification avatars', () => {
  it('should display the avatar of the source', async () => {
    const [source] = sampleNotification.avatars;
    render(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(`${source.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', source.image);
  });

  it('should display the avatar of the user', async () => {
    const [, user] = sampleNotification.avatars;
    render(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(`${user.referenceId}'s profile`);
    expect(img).toHaveAttribute('src', user.image);
  });
});

describe('notification item', () => {
  it('should display the icon of the notification', async () => {
    render(<NotificationItem {...sampleNotification} />);
    const img = await screen.findByAltText(`${sampleNotification.type}'s icon`);
    expect(img).toHaveAttribute('src', sampleNotification.icon);
  });

  it('should have a title that supports html', async () => {
    render(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationTitle);
  });

  it('should have a description that supports html', async () => {
    render(<NotificationItem {...sampleNotification} />);
    await screen.findByText(sampleNotificationDescription);
  });
});
