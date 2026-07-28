import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileHeader from './ProfileHeader';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import { getLogContextStatic } from '../../contexts/LogContext';
import type { PublicProfile } from '../../lib/user';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

jest.mock('./ProfileActions', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-actions" />,
}));

const user = {
  id: 'u1',
  name: 'Ido Shamun',
  username: 'idoshamun',
  permalink: 'https://app.daily.dev/idoshamun',
  reputation: 10,
  createdAt: '2020-01-01T00:00:00.000Z',
  bio: 'Building daily.dev',
  image: 'https://daily.dev/image.jpg',
  cover: 'https://daily.dev/cover.jpg',
} as PublicProfile;

const userStats = { upvotes: 1, numFollowers: 2, numFollowing: 3 };

const logEvent = jest.fn();

const renderHeader = (isSameUser: boolean) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const LogContext = getLogContextStatic();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={
          {
            user: null,
            isAuthReady: true,
            tokenRefreshed: true,
            squads: [],
          } as unknown as AuthContextData
        }
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: () => false,
          }}
        >
          <ProfileHeader
            user={user}
            userStats={userStats}
            isSameUser={isSameUser}
          />
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('ProfileHeader share control', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fill the edit slot with the share control on a public profile', () => {
    renderHeader(false);

    expect(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    ).toBeInTheDocument();
    // The invisible edit placeholder that used to hold the row height is gone.
    expect(screen.queryByLabelText('Edit profile')).not.toBeInTheDocument();
  });

  it('should sit next to the edit button on the owner profile', () => {
    renderHeader(true);

    expect(
      screen.getByLabelText('Copy link to your profile'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Edit profile')).toBeInTheDocument();
  });

  it('should log share profile from the header control', async () => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    renderHeader(false);

    await userEvent.click(
      screen.getByLabelText("Copy link to @idoshamun's profile"),
    );

    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ShareProfile,
        target_id: 'u1',
        target_type: TargetType.ProfilePage,
        extra: JSON.stringify({
          provider: ShareProvider.CopyLink,
          origin: Origin.Profile,
        }),
      }),
    );
  });

  it('should render both controls at the same size and variant', () => {
    renderHeader(true);

    [
      screen.getByLabelText('Copy link to your profile'),
      screen.getByLabelText('Edit profile'),
    ].forEach((control) => {
      expect(control).toHaveClass('btn-subtle');
      expect(control).toHaveClass('h-8');
    });
  });
});
