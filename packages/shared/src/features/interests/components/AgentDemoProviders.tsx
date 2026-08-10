import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import Toast from '../../../components/notifications/Toast';
import { LazyModalElement } from '../../../components/modals/LazyModalElement';
import { getLogContextStatic } from '../../../contexts/LogContext';
import SettingsContext from '../../../contexts/SettingsContext';

const noop = (): void => undefined;

const demoUser = {
  id: 'demo-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
};

// Static contexts so the demo renders with no boot, API or auth.
export const AgentDemoProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  // One client for the life of the tree: constructing it inline hands every
  // render a fresh cache, discarding toast and modal state mid-flight.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={demoUser as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        visit={{ visitId: 'demo', sessionId: 'demo' } as never}
        accessToken={null as never}
        refetchBoot={noop as never}
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
          <SettingsContext.Provider
            value={
              {
                insaneMode: false,
                spaciness: 'roomy',
                loadedSettings: true,
                openNewTab: false,
                flags: {},
              } as never
            }
          >
            {children}
            {/* `MainLayout` mounts both, and a dev route does not use it:
                without them toasts and lazy modals silently never appear. */}
            <Toast autoDismissNotifications />
            <LazyModalElement />
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
