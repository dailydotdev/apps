import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import type { LoggedUser } from '../../lib/user';
import { SubscriptionStatus } from '../../lib/plus';
import { YouPage } from './YouPage';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockPlus = { isPlus: false, status: 'active' };
jest.mock('../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: () => mockPlus,
}));

const mockCores = { has: true };
jest.mock('../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: () => mockCores.has,
}));

const mockSettings = {
  optOutAchievements: false,
  optOutLevelSystem: false,
  optOutQuestSystem: false,
};
jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: () => mockSettings,
}));

jest.mock('../../hooks/profile/useUserFollowStats', () => ({
  useUserFollowStats: () => ({
    data: { numFollowers: 42, numFollowing: 3 },
  }),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: () => ({ isCustomDefaultFeed: false, defaultFeedId: undefined }),
}));

const mockPhone = { browser: true };
jest.mock('../../features/getApp/hooks/usePhoneBrowser', () => ({
  usePhoneBrowser: () => mockPhone.browser,
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: jest.fn() }),
}));

const user = {
  id: 'u1',
  name: 'Maya Chen',
  username: 'mayachen',
  image: 'https://daily.dev/maya.png',
  permalink: 'https://app.daily.dev/mayachen',
  reputation: 1234,
  balance: { amount: 320 },
} as unknown as LoggedUser;

const renderPage = () => {
  (useRouter as jest.Mock).mockReturnValue({
    pathname: '/you',
    push: jest.fn(),
  } as unknown as NextRouter);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={{ user, isLoggedIn: true } as unknown as AuthContextData}
      >
        <YouPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

const rowLabels = () =>
  screen
    .getAllByRole('link')
    .concat(screen.getAllByRole('button'))
    .map((row) => row.textContent?.trim())
    .filter(Boolean);

describe('YouPage', () => {
  beforeEach(() => {
    mockPlus.isPlus = false;
    mockPlus.status = SubscriptionStatus.Active;
    mockCores.has = true;
    mockPhone.browser = true;
    mockSettings.optOutAchievements = false;
    mockSettings.optOutLevelSystem = false;
    mockSettings.optOutQuestSystem = false;
  });

  it('shows the member, the counts and one list ending in Settings', () => {
    renderPage();

    expect(screen.getByText('Maya Chen')).toBeInTheDocument();
    expect(screen.getByText('@mayachen')).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument();
    expect(screen.getByText('Reputation')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('Cores')).toBeInTheDocument();

    const labels = rowLabels();
    [
      'Profile',
      'daily.dev PlusUpgrade',
      'Feed settings',
      'Bookmarks',
      'History',
      'Analytics',
      'Game center',
      'DevCard',
      'Settings',
    ].forEach((label) => expect(labels).toContain(label));
    expect(labels.indexOf('Settings')).toBeGreaterThan(
      labels.indexOf('DevCard'),
    );
    expect(screen.queryByText('Invite friends')).not.toBeInTheDocument();
  });

  it('links the places the tabs do not reach', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/analytics',
    );
    expect(screen.getByRole('link', { name: 'Feed settings' })).toHaveAttribute(
      'href',
      '/feeds/u1/edit?dview=tags',
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/mayachen',
    );
  });

  it('reads Renew on a cancelled Plus and Manage on a live one', () => {
    mockPlus.isPlus = true;
    mockPlus.status = SubscriptionStatus.Cancelled;
    const { unmount } = renderPage();
    expect(screen.getByText('Renew')).toBeInTheDocument();
    unmount();

    mockPlus.status = SubscriptionStatus.Active;
    renderPage();
    expect(screen.getByText('Manage')).toBeInTheDocument();
  });

  it('drops Cores and Game center for members outside them', () => {
    mockCores.has = false;
    mockSettings.optOutAchievements = true;
    mockSettings.optOutLevelSystem = true;
    mockSettings.optOutQuestSystem = true;
    renderPage();

    expect(screen.queryByText('Cores')).not.toBeInTheDocument();
    expect(screen.queryByText('Game center')).not.toBeInTheDocument();
  });
});
