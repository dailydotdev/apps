import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Browser } from 'webextension-polyfill';
import { FC, PropsWithChildren, useState } from 'react';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { fn } from 'storybook/test';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';

declare global {
  interface Window {
    browser: Browser;
  }
}

// Call from `beforeEach` so Storybook's mock restore undoes it between
// stories; mutating during render leaks this user into every later story.
export const bootAsAnonymous = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: { id: 'anonymous-visitor' },
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });
};

export const ExtensionProviders: FC<PropsWithChildren> = ({ children }) => {
  // Per-mount: the boot query is cached under one global key, so a shared
  // client serves whichever identity booted first.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock()}
      >
        <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
          {children}
        </ActiveFeedContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

export default ExtensionProviders;
