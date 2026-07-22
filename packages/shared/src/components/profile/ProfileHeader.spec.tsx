import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import ProfileHeader from './ProfileHeader';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import { getLogContextStatic } from '../../contexts/LogContext';
import type { PublicProfile } from '../../lib/user';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';

jest.mock('../../hooks/useConditionalFeature');
jest.mock('./ProfileActions', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-actions" />,
}));

const mockUseConditionalFeature = jest.mocked(useConditionalFeature);

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
            logEvent: jest.fn(),
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

  describe('when the flag is off', () => {
    beforeEach(() => {
      mockUseConditionalFeature.mockReturnValue({
        value: false,
        isLoading: false,
      });
    });

    it('should not render a share control on a public profile', () => {
      renderHeader(false);

      expect(screen.queryByLabelText(/Share/)).not.toBeInTheDocument();
    });

    it('should keep the invisible edit placeholder on a public profile', () => {
      renderHeader(false);

      expect(screen.getByLabelText('Edit profile')).toHaveClass('invisible');
    });

    it('should keep the edit button on the owner profile', () => {
      renderHeader(true);

      expect(screen.getByLabelText('Edit profile')).not.toHaveClass(
        'invisible',
      );
      expect(screen.queryByLabelText(/Share/)).not.toBeInTheDocument();
    });
  });

  describe('when the flag is on', () => {
    beforeEach(() => {
      mockUseConditionalFeature.mockReturnValue({
        value: true,
        isLoading: false,
      });
    });

    it('should fill the edit slot with the share control on a public profile', () => {
      renderHeader(false);

      expect(
        screen.getByLabelText("Share @idoshamun's profile"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Edit profile')).not.toBeInTheDocument();
    });

    it('should sit next to the edit button on the owner profile', () => {
      renderHeader(true);

      expect(screen.getByLabelText('Share your profile')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit profile')).toBeInTheDocument();
    });
  });
});
