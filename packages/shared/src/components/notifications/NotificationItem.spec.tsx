import React, { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import NotificationItem, { NotificationItemProps } from './NotificationItem';
import {
  NotificationAttachmentType,
  NotificationAvatarType,
} from '../../graphql/notifications';
import { NotificationType, NotificationIconType } from './utils';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

const sampleNotificationTitle = 'Welcome to your new notification center!';
const sampleNotificationDescription =
  'The notification system notifies you of important events such as replies, mentions, updates etc.';
const sampleNotification: NotificationItemProps = {
  isUnread: true,
  icon: NotificationIconType.Comment,
  title: `<p>${sampleNotificationTitle}</p>`,
  description: `<p>${sampleNotificationDescription}</p>`,
  type: NotificationType.System,
  targetUrl: 'post url',
  attachments: [
    {
      title: 'Sample attachment',
      image: 'sample attachment image',
      type: NotificationAttachmentType.Post,
    },
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

const mockReact = React;

jest.mock(
  'next/link',
  () =>
    ({ children, ...rest }: { children: ReactElement }) =>
      mockReact.cloneElement(children, { ...rest }),
);

const renderComponent = (component: ReactNode) => {
  const client = new QueryClient();
  render(<TestBootProvider client={client}>{component}</TestBootProvider>);
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
    expect(img).toHaveAttribute(
      'data-testvalue',
      NotificationIconType.DailyDev,
    );
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

describe('notification click if onClick prop is provided', () => {
  it('should call provided onClick', async () => {
    const mockOnClick = jest.fn();
    renderComponent(
      <NotificationItem {...sampleNotification} onClick={mockOnClick} />,
    );

    const notificationLink = await screen.findByTestId('openNotification');
    expect(notificationLink).toBeInTheDocument();
    expect(notificationLink).toHaveAttribute('href', 'post url');

    fireEvent.click(notificationLink);
    await waitFor(() => expect(mockOnClick).toBeCalledTimes(1));
  });
});
describe('notification click if onClick prop is NOT provided', () => {
  it('should not render link', async () => {
    renderComponent(<NotificationItem {...sampleNotification} />);

    expect(screen.queryByTestId('openNotification')).not.toBeInTheDocument();
  });
});
