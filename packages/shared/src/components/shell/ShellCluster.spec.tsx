import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import type { LoggedUser } from '../../lib/user';
import { ShellCluster } from './ShellCluster';

const mockLogEvent = jest.fn();
const mockOpenModal = jest.fn();
const mockShowLogin = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/NotificationsContext', () => ({
  useNotificationContext: jest.fn(),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const user = { id: 'u1', username: 'ido' } as LoggedUser;

const renderCluster = (
  pathname = '/',
  loggedUser: LoggedUser | null = user,
) => {
  jest.mocked(useRouter).mockReturnValue({
    pathname,
    asPath: pathname,
    query: {},
  } as unknown as NextRouter);

  return render(
    <AuthContext.Provider
      value={
        {
          user: loggedUser,
          squads: [],
          showLogin: mockShowLogin,
        } as unknown as AuthContextData
      }
    >
      <ShellCluster />
    </AuthContext.Provider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNotificationContext).mockReturnValue({
    unreadCount: 3,
  } as unknown as ReturnType<typeof useNotificationContext>);
});

describe('ShellCluster', () => {
  it('lights the root that owns the page', () => {
    renderCluster('/squads/[handle]');

    expect(screen.getByLabelText('Squads')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByLabelText('Home')).not.toHaveAttribute('aria-current');
  });

  it('lights Home on a post', () => {
    renderCluster('/posts/[id]');

    expect(screen.getByLabelText('Home')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows the unread count on Activity only', () => {
    renderCluster('/');

    expect(screen.getByLabelText('Activity')).toHaveTextContent('3');
    expect(screen.getByLabelText('Home')).not.toHaveTextContent('3');
  });

  it('logs a click per tab with the footer as the target', () => {
    renderCluster('/');

    fireEvent.click(screen.getByLabelText('Explore'));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_id: 'mobile footer',
      extra: JSON.stringify({ tab: 'explore' }),
    });
  });

  it('logs the notification icon click from the footer', () => {
    renderCluster('/');

    fireEvent.click(screen.getByLabelText('Activity'));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click notification icon',
      target_id: 'footer',
      extra: JSON.stringify({ notifications_number: 3 }),
    });
  });

  it('opens the composer from the Create square', () => {
    renderCluster('/');

    fireEvent.click(screen.getByLabelText('Create post'));

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'smartComposer' }),
    );
  });

  it('sends a visitor to sign up from Home, Activity and Create', () => {
    renderCluster('/posts', null);

    fireEvent.click(screen.getByLabelText('Home'));
    fireEvent.click(screen.getByLabelText('Activity'));
    fireEvent.click(screen.getByLabelText('Create post'));

    expect(mockShowLogin).toHaveBeenCalledTimes(3);
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
