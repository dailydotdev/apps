import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import type { LoggedUser } from '../../lib/user';
import { SubscriptionStatus } from '../../lib/plus';
import { AlertColor } from '../AlertDot';
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

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    isActionsFetched: true,
    checkHasCompleted: () => false,
    completeAction: jest.fn(),
  }),
}));

const user = {
  id: 'u1',
  name: 'Maya Chen',
  username: 'mayachen',
  image: 'https://daily.dev/maya.png',
  permalink: 'https://app.daily.dev/mayachen',
  reputation: 1234,
  balance: { amount: 320 },
  createdAt: '2026-10-01T00:00:00Z',
} as unknown as LoggedUser;

const renderPage = (pageUser: LoggedUser = user) => {
  (useRouter as jest.Mock).mockReturnValue({
    pathname: '/you',
    push: jest.fn(),
  } as unknown as NextRouter);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={
          { user: pageUser, isLoggedIn: true } as unknown as AuthContextData
        }
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
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.queryByText('Cores')).not.toBeInTheDocument();

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
      '/feeds/u1/edit',
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

  it('drops Game center for members outside it', () => {
    mockCores.has = false;
    mockSettings.optOutAchievements = true;
    mockSettings.optOutLevelSystem = true;
    mockSettings.optOutQuestSystem = true;
    renderPage();

    expect(screen.queryByText('Game center')).not.toBeInTheDocument();
  });

  it.each([
    ['shows', '2026-10-07T23:59:59Z', true],
    ['hides', '2026-10-08T00:00:00Z', false],
  ])(
    '%s the Marketplace dot for an account created at %s',
    (_, createdAt, hasDot) => {
      renderPage({ ...user, createdAt } as LoggedUser);

      const dot = screen
        .getByRole('link', { name: 'Marketplace' })
        .querySelector(`.${AlertColor.Cabbage}`);
      expect(!!dot).toBe(hasDot);
    },
  );
});
