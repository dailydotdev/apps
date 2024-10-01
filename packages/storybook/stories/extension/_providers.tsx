import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { Browser } from 'webextension-polyfill';
import type { FC, PropsWithChildren } from 'react';

const app = 'extension';
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
