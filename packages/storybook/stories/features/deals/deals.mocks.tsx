import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';

export {
  mockDeals,
  mockClaims,
  MOCK_NOW_MS,
  getDealsByState,
  getDealsByType,
  getDealBySlug,
} from '@dailydotdev/shared/src/features/deals/mockDeals';

// A single signed-in user so every deals surface resolves to the same identity.
export const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  bio: null,
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

const noop = (): void => undefined;

export interface DealsMockOptions {
  isLoggedOut?: boolean;
}

const DealsProviders = ({
  children,
  isLoggedOut = false,
}: DealsMockOptions & { children: ReactNode }): ReactElement => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            gcTime: Infinity,
          },
        },
      }),
    [],
  );

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={(isLoggedOut ? null : MOCK_USER) as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <div className="bg-background-default p-6 text-text-primary">
            {children}
          </div>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

// A decorator factory: `decorators: [withDeals({ isLoggedOut: true })]`.
export const withDeals =
  (options: DealsMockOptions = {}): Decorator =>
  (Story) =>
    (
      <DealsProviders {...options}>
        <Story />
      </DealsProviders>
    );
