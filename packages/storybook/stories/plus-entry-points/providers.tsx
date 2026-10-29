import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';

// A free (or Plus) logged-in user with no network, enough for the shared Plus
// components to render in Storybook.

export const noop = (): void => undefined;

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

export const Providers = ({
  isPlus = false,
  seed,
  children,
}: {
  isPlus?: boolean;
  seed?: (client: QueryClient) => void;
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });
    seed?.(client);
    return client;
  }, [seed]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={
          {
            id: 'sb-user',
            name: 'Dev Dana',
            username: 'dana',
            image:
              'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1',
            providers: ['github'],
            isPlus,
          } as never
        }
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
          <SettingsContext.Provider value={settings as never}>
            <ActiveFeedContext.Provider value={{ items: [], queryKey: ['sb'] }}>
              {children}
            </ActiveFeedContext.Provider>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
