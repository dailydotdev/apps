import {
  BootDataProvider,
  getLocalBootData,
} from '@dailydotdev/shared/src/contexts/BootProvider';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { BootApp, BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import { Browser } from 'webextension-polyfill';
import type { FC, PropsWithChildren } from 'react';
import { generateTestSquad } from '@dailydotdev/shared/__tests__/fixture/squads';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';

const app = BootApp.Extension;
const queryClient = new QueryClient();

declare global {
  interface Window {
    browser: Browser;
  }
}

export const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};

export const ExtensionProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider>
      <BootDataProvider
        app={app}
        getRedirectUri={() => `https://daily.dev`}
        version="pwa"
        deviceId="123"
        getPage={() => '/'}
        localBootData={{
          ...(getLocalBootData() as BootCacheData),
          user: loggedUser,
          squads: [generateTestSquad()],
        }}
      >
        <LogContext.Provider
          value={{
            logEvent: console.log,
            logEventStart: console.log,
            logEventEnd: console.log,
            sendBeacon: console.log,
          }}
        >
          {children}
        </LogContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

export default ExtensionProviders;
