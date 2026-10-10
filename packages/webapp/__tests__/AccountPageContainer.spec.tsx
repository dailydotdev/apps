import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { AccountPageContainer } from '../components/layouts/SettingsLayout/AccountPageContainer';
import { navigationKey } from '../components/layouts/SettingsLayout';

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

jest.mock('@dailydotdev/shared/src/hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: () => ({ isV2: false }),
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
