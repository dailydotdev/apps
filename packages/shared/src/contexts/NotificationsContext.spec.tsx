import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  NotificationsContextProvider,
  useNotificationContext,
} from './NotificationsContext';

interface NotificationsMockProps {
  incrementBy?: number;
}

const NotificationsMock = ({ incrementBy = 1 }: NotificationsMockProps) => {
  const { unreadCount, clearUnreadCount, incrementUnreadCount } =
    useNotificationContext();

  return (
    <>
      <span data-test-value={unreadCount}>Unread count</span>
      <button onClick={clearUnreadCount} type="button">
        Clear
      </button>
      <button onClick={() => incrementUnreadCount(incrementBy)} type="button">
        Increment
      </button>
    </>
  );
};

it('should clear unread count and notify persistence callback', () => {
  const onUpdateUnreadCount = jest.fn();

  render(
    <NotificationsContextProvider
      unreadCount={3}
      onUpdateUnreadCount={onUpdateUnreadCount}
    >
      <NotificationsMock />
    </NotificationsContextProvider>,
  );

  fireEvent.click(screen.getByText('Clear'));

  expect(screen.getByText('Unread count')).toHaveAttribute(
    'data-test-value',
    '0',
  );
  expect(onUpdateUnreadCount).toHaveBeenCalledWith(0);
});

it('should increment unread count and notify persistence callback', () => {
  const onUpdateUnreadCount = jest.fn();

  render(
    <NotificationsContextProvider
      unreadCount={1}
      onUpdateUnreadCount={onUpdateUnreadCount}
    >
      <NotificationsMock incrementBy={2} />
    </NotificationsContextProvider>,
  );

  fireEvent.click(screen.getByText('Increment'));
  fireEvent.click(screen.getByText('Increment'));

  expect(screen.getByText('Unread count')).toHaveAttribute(
    'data-test-value',
    '5',
  );
  expect(onUpdateUnreadCount).toHaveBeenNthCalledWith(1, 3);
  expect(onUpdateUnreadCount).toHaveBeenNthCalledWith(2, 5);
});

it('should update unread count without a persistence callback', () => {
  render(
    <NotificationsContextProvider unreadCount={2}>
      <NotificationsMock />
    </NotificationsContextProvider>,
  );

  fireEvent.click(screen.getByText('Clear'));
  expect(screen.getByText('Unread count')).toHaveAttribute(
    'data-test-value',
    '0',
  );

  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Unread count')).toHaveAttribute(
    'data-test-value',
    '1',
  );
});
