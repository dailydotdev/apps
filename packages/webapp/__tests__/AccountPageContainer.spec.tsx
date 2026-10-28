import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { AccountPageContainer } from '../components/layouts/SettingsLayout/AccountPageContainer';
import {
  navigationKey,
  SETTINGS_PAGE_HEADER_PORTAL_ID,
} from '../components/layouts/SettingsLayout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/streaks', () => ({
  useReadingStreak: () => ({
    streak: undefined,
    isLoading: false,
    isStreaksEnabled: false,
  }),
}));

jest.mock(
  '@dailydotdev/shared/src/features/getApp/hooks/useMobileAppHeader',
  () => ({
    useMobileAppHeader: () => false,
  }),
);

jest.mock('@dailydotdev/shared/src/hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: jest.fn(() => false),
}));

const renderPage = (client: QueryClient, onBack?: () => void) => {
  jest.mocked(useRouter).mockReturnValue({
    pathname: '/settings/security',
    asPath: '/settings/security',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  } as unknown as NextRouter);

  render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{ user: { id: 'u1' }, isLoggedIn: true } as AuthContextData}
      >
        <ShellPageProvider>
          <ShellBlock />
          <AccountPageContainer title="Change email" onBack={onBack}>
            form
          </AccountPageContainer>
        </ShellPageProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should run the page onBack from the phone shell back button', () => {
  const client = new QueryClient();
  const onBack = jest.fn();
  renderPage(client, onBack);

  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

  expect(onBack).toHaveBeenCalledTimes(1);
  expect(client.getQueryData(navigationKey)).toBeFalsy();
});

it('should open the settings menu from the phone shell back button when the page has no onBack', () => {
  const client = new QueryClient();
  renderPage(client);

  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

  expect(client.getQueryData(navigationKey)).toBe(true);
});

it('portals the page header into the settings strip on laptop', () => {
  jest.mocked(useLaptopLayout).mockReturnValue(true);
  const strip = document.createElement('div');
  strip.id = SETTINGS_PAGE_HEADER_PORTAL_ID;
  document.body.appendChild(strip);

  try {
    renderPage(new QueryClient());

    expect(within(strip).getByText('Change email')).toBeInTheDocument();
  } finally {
    strip.remove();
    jest.mocked(useLaptopLayout).mockReturnValue(false);
  }
});
