import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Browser } from 'webextension-polyfill';
import { FC, PropsWithChildren } from 'react';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { fn } from '@storybook/test';

const queryClient = new QueryClient();

declare global {
  interface Window {
    browser: Browser;
  }
}

export const ExtensionProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
      >
        {children}
      </BootDataProvider>
    </QueryClientProvider>
  );
};

export default ExtensionProviders;
