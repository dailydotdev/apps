import React, { FC } from 'react';
import {
  BootDataProvider,
} from '@dailydotdev/shared/src/contexts/BootProvider';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Boot, BootApp, BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import { Browser } from 'webextension-polyfill';

const app = BootApp.Extension;
const queryClient = new QueryClient();

declare global {
  interface Window {
    browser: Browser;
  }
}

export const ExtensionProviders: FC = ({ children }) => {
  return <QueryClientProvider client={queryClient}>
    <BootDataProvider
      app={app}
      getRedirectUri={() => `https://daily.dev`}
      version='pwa'
      deviceId='123'
      getPage={() => '/'}
    >
      <LogContext.Provider
        value={{
          logEvent: () => {
          },
          logEventStart: console.log,
          logEventEnd: console.log,
          sendBeacon: console.log,
        }}
      >
        {children}
      </LogContext.Provider>
    </BootDataProvider>
  </QueryClientProvider>;
};

export default ExtensionProviders;
