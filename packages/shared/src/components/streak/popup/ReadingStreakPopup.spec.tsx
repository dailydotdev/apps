import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { ReadingStreakPopup } from './ReadingStreakPopup';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { UserStreak } from '../../../graphql/users';
import { DayOfWeek } from '../../../lib/date';
import type { LoggedUser } from '../../../lib/user';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), isReady: true, query: {} }),
}));

jest.mock('../../../graphql/users', () => ({
  ...jest.requireActual('../../../graphql/users'),
  getReadingStreak30Days: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../hooks/useActions', () => ({
  useActions: () => ({
    completeAction: jest.fn(),
    checkHasCompleted: () => false,
    isActionsFetched: true,
  }),
}));

const user = {
  id: '1',
  name: 'Ido',
  username: 'idoshamun',
  permalink: 'https://app.daily.dev/idoshamun',
  timezone: 'Etc/UTC',
} as unknown as LoggedUser;

const streak: UserStreak = {
  current: 12,
  max: 40,
  total: 120,
  weekStart: DayOfWeek.Monday,
  lastViewAt: new Date(),
};

const renderPopup = ({
  enabled = false,
  overrides = {},
}: {
  enabled?: boolean;
  overrides?: Partial<UserStreak>;
} = {}): RenderResult => {
  const gb = new GrowthBook();
  gb.setFeatures({
    sharing_visibility: { defaultValue: enabled },
    share_streak: { defaultValue: enabled },
  });

  return render(
    <TestBootProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      auth={{ user }}
      gb={gb}
    >
      <ReadingStreakPopup streak={{ ...streak, ...overrides }} />
    </TestBootProvider>,
  );
};

const getSettingsLink = (): HTMLElement =>
  document.querySelector<HTMLElement>(
    'a[href*="account/customization/streaks"]',
  )!;

describe('ReadingStreakPopup share action', () => {
  it('keeps the current UI untouched when the flag is off', async () => {
    renderPopup();

    expect(await screen.findByText('Current streak')).toBeInTheDocument();
    expect(screen.queryByLabelText('Share streak')).not.toBeInTheDocument();
    // No wrapper is injected: settings stays a direct child of the action row.
    expect(getSettingsLink().parentElement?.className).toContain('mt-4');
  });

  it('renders the share action in the existing row when enabled', async () => {
    renderPopup({ enabled: true });

    await waitFor(() =>
      expect(screen.getByLabelText('Share streak')).toBeInTheDocument(),
    );
    // Share and settings share one row wrapper, so the popup height is stable.
    const shareButton = screen.getByLabelText('Share streak');
    expect(shareButton.parentElement).toContainElement(getSettingsLink());
  });

  it('hides the share action with nothing to share yet', () => {
    renderPopup({ enabled: true, overrides: { current: 0 } });

    expect(screen.queryByLabelText('Share streak')).not.toBeInTheDocument();
  });
});
