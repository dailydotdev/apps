import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '../../../contexts/AuthContext';
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

/**
 * The contexts the agent workspace reads, filled with static values.
 *
 * The workspace runs on mock data, but the card, post and button primitives it
 * reuses still expect a signed-in user and resolved settings. Standing those up
 * here keeps the demo renderable with no boot, no API and no auth — which is
 * what makes it reviewable locally and in Storybook alike.
 */
export const AgentDemoProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={new QueryClient()}>
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
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
