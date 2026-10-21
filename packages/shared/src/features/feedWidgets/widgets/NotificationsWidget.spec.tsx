import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import type { Notification } from '../../../graphql/notifications';
import { NOTIFICATIONS_QUERY } from '../../../graphql/notifications';
import {
  NotificationIconType,
  NotificationType,
} from '../../../components/notifications/utils';
import { LogEvent, Origin } from '../../../lib/log';
import { NotificationsWidget } from './NotificationsWidget';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { availableFeedWidgets } from '../components';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const titles = ['First reply', 'Second upvote', 'Third mention'];
const notifications: Notification[] = titles.map((title, index) => ({
  id: `notification-${index}`,
  referenceId: `reference-${index}`,
  userId: loggedUser.id,
  createdAt: new Date(),
  readAt: index === 0 ? undefined : new Date(),
  icon: NotificationIconType.Comment,
  title: `<p>${title}</p>`,
  type: NotificationType.CommentReply,
  targetUrl: `/posts/post-${index}`,
}));

const mockNotifications = (nodes: Notification[] = notifications) =>
  mockGraphQL({
    request: {
      query: NOTIFICATIONS_QUERY,
      variables: { first: 8 },
    },
    result: {
      data: {
        notifications: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: nodes.map((node) => ({ node })),
        },
      },
    },
  });

const logEvent = jest.fn();

const renderWidget = (size: FeedWidgetSize, unreadCount = 1) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      notification={{ unreadCount }}
      log={{ logEvent }}
    >
      <NotificationsWidget
        widget={{
          id: 'notifications',
          kind: FeedWidgetKind.Notifications,
          size,
        }}
        size={size}
        isEditing={false}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
});

describe('NotificationsWidget', () => {
  it('lists the latest notifications with the unread count', async () => {
    mockNotifications();
    renderWidget(FeedWidgetSize.Tall, 3);

    await waitFor(() =>
      expect(screen.getByText('Third mention')).toBeInTheDocument(),
    );
    expect(screen.getByText('First reply')).toBeInTheDocument();
    expect(screen.getByLabelText('3 unread')).toHaveTextContent('3');
    expect(
      screen.getByRole('link', { name: /See all notifications/ }),
    ).toHaveAttribute('href', expect.stringContaining('notifications'));

    fireEvent.click(screen.getAllByTestId('openNotification')[0]);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ClickNotification,
      target_id: 'notification-0',
      extra: JSON.stringify({
        origin: Origin.FeedWidgets,
        type: NotificationType.CommentReply,
      }),
    });
  });

  it('shows only the latest one at Small', async () => {
    mockNotifications();
    renderWidget(FeedWidgetSize.Small);

    await waitFor(() =>
      expect(screen.getByText('First reply')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Second upvote')).not.toBeInTheDocument();
  });

  it('says so when there are none, with no unread count', async () => {
    mockNotifications([]);
    renderWidget(FeedWidgetSize.Tall, 0);

    await waitFor(() =>
      expect(screen.getByText('No notifications yet.')).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument();
  });

  it('is offered to logged-in readers only', () => {
    const kinds = (isLoggedIn: boolean) =>
      availableFeedWidgets({ isLoggedIn }).map(({ kind }) => kind);

    expect(kinds(true)).toContain(FeedWidgetKind.Notifications);
    expect(kinds(false)).not.toContain(FeedWidgetKind.Notifications);
  });
});
