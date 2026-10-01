import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import MobileFooterNavbar from '../components/footer/MobileFooterNavbar';

const mockLogEvent = jest.fn();

jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('@dailydotdev/shared/src/contexts/NotificationsContext', () => ({
  useNotificationContext: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const user = { id: 'u1', username: 'ido' } as LoggedUser;

const renderNavbar = () =>
  render(
    <AuthContext.Provider
      value={{ user, squads: [] } as unknown as AuthContextData}
    >
      <MobileFooterNavbar />
    </AuthContext.Provider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({
    pathname: '/',
    asPath: '/',
    query: {},
  } as unknown as NextRouter);
  jest.mocked(useNotificationContext).mockReturnValue({
    unreadCount: 3,
  } as unknown as ReturnType<typeof useNotificationContext>);
});

describe('MobileFooterNavbar', () => {
  it('logs a click per tab with the footer as the target', () => {
    renderNavbar();

    fireEvent.click(screen.getByText('Explore'));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_id: 'mobile footer nav',
      extra: JSON.stringify({ tab: 'explore', logged_in: true }),
    });
  });

  it('logs the notification icon click from the footer with the unread count', () => {
    renderNavbar();

    fireEvent.click(screen.getByText('Activity'));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click notification icon',
      target_id: 'footer',
      extra: JSON.stringify({ notifications_number: 3 }),
    });
  });
});
