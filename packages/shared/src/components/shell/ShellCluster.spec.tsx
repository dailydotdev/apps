import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
const mockPush = jest.fn();
let queryClient: QueryClient;

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

// jsdom has no PointerEvent; a MouseEvent with the pointer fields set is
// what React's pointer handlers read.
const firePointer = (
  type: string,
  element: Element,
  clientX: number,
  pointerType = 'touch',
) => {
  const event = new MouseEvent(type, { bubbles: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(element, event);
};

const mockTrackRect = () =>
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    width: 320,
    top: 0,
    height: 48,
    right: 320,
    bottom: 48,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

const renderCluster = (
  pathname = '/',
  loggedUser: LoggedUser | null = user,
) => {
  jest.mocked(useRouter).mockReturnValue({
    pathname,
    asPath: pathname,
    query: {},
    push: mockPush,
  } as unknown as NextRouter);

  queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
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
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNotificationContext).mockReturnValue({
    unreadCount: 3,
  } as unknown as ReturnType<typeof useNotificationContext>);
});

describe('ShellCluster', () => {
  it('draws the indicator behind the lit tab', () => {
    renderCluster('/squads/[handle]');

    expect(screen.getByTestId('shell-cluster-indicator')).toHaveStyle({
      transform: 'translateX(200%)',
    });
  });

  it('follows a held finger along the bar and selects the tab under it', () => {
    const rect = mockTrackRect();
    renderCluster('/');
    const home = screen.getByLabelText('Home');
    const track = home.parentElement as HTMLElement;

    firePointer('pointerdown', track, 40);
    firePointer('pointermove', track, 60);
    firePointer('pointermove', track, 200);
    // The lens is driven frame by frame on the element; the lit glyph is
    // the React side of the same drag.
    expect(
      screen.getByLabelText('Squads').querySelector('span > span'),
    ).not.toHaveClass('opacity-[0.72]');

    firePointer('pointerup', track, 200);
    expect(mockPush).toHaveBeenCalledWith('/squads/discover');
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extra: JSON.stringify({ tab: 'squads', logged_in: true }),
      }),
    );
    rect.mockRestore();
  });

  it('lifts the bar while a finger is on it', () => {
    renderCluster('/');
    const track = screen.getByLabelText('Home').parentElement as HTMLElement;
    const bar = screen.getByRole('navigation', { name: 'Main' });

    firePointer('pointerdown', track, 40);
    expect(bar).toHaveAttribute('data-pressed', 'true');
    expect(bar).toHaveStyle({ transform: 'translateX(0px) scale(1.04)' });

    firePointer('pointerup', track, 40);
    expect(bar).not.toHaveAttribute('data-pressed');
    expect(bar).toHaveStyle({ transform: 'scale(1)' });
  });

  it('resolves a touch tap on release and swallows the click after it', () => {
    const rect = mockTrackRect();
    renderCluster('/');
    const track = screen.getByLabelText('Home').parentElement as HTMLElement;

    firePointer('pointerdown', track, 120);
    firePointer('pointerup', track, 122);
    fireEvent.click(screen.getByLabelText('Explore'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/posts');
    rect.mockRestore();
  });

  it('leaves a mouse tap to the link', () => {
    const rect = mockTrackRect();
    renderCluster('/');
    const track = screen.getByLabelText('Home').parentElement as HTMLElement;

    firePointer('pointerdown', track, 120, 'mouse');
    firePointer('pointerup', track, 122, 'mouse');

    expect(mockPush).not.toHaveBeenCalled();
    rect.mockRestore();
  });

  it('returns to the root when the lit tab is tapped on a leaf', () => {
    renderCluster('/posts/[id]');

    fireEvent.click(screen.getByLabelText('Home'));

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('scrolls a scrolled root to the top on the lit tab', () => {
    renderCluster('/');
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation();
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 300,
    });

    fireEvent.click(screen.getByLabelText('Home'));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(mockPush).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it('refreshes a root that is already at the top on the lit tab', () => {
    renderCluster('/');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(screen.getByLabelText('Home'));

    expect(invalidate).toHaveBeenCalledWith(
      { type: 'active' },
      { throwOnError: false },
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('stays away from settings and forms', () => {
    renderCluster('/settings/profile');

    expect(
      screen.queryByRole('navigation', { name: 'Main' }),
    ).not.toBeInTheDocument();
    expect(
      document.documentElement.style.getPropertyValue('--shell-bottom'),
    ).toBe('');
  });

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
      target_id: 'mobile footer nav',
      extra: JSON.stringify({ tab: 'explore', logged_in: true }),
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
