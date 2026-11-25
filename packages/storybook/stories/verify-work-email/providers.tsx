import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';

const noop = (): void => undefined;

export const member = {
  id: 'sb-maya',
  name: 'Maya',
  username: 'maya',
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1',
  bio: 'Senior Engineer at Acme',
  cover: null,
  createdAt: '2024-02-01T00:00:00Z',
  permalink: 'https://app.daily.dev/maya',
  reputation: 240,
  isPlus: false,
  providers: ['github'],
  socialLinks: [],
};

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

/**
 * A signed-in fictional member, with the production toast host so the
 * shared components' toasts show.
 */
export const Providers = ({
  seed,
  children,
}: {
  /** Query data the page reads, so it renders without the API. */
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
    // The settings form loads the full profile; seed it so it needs no API.
    client.setQueryData(
      generateQueryKey(RequestKey.Profile, member as never, { id: member.id }),
      member,
    );
    // The viewer hasn't verified a company, and has no completed actions.
    client.setQueryData(
      generateQueryKey(RequestKey.UserCompanies, member as never),
      [],
    );
    client.setQueryData(generateQueryKey(RequestKey.Actions, member as never), {
      actions: [],
      serverLoaded: true,
    });
    seed?.(client);
    return client;
  }, [seed]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={member as never}
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
            {children}
            <Toast autoDismissNotifications />
            <LazyModalElement />
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
