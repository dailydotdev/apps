import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Browser } from 'webextension-polyfill';
import { FC, PropsWithChildren } from 'react';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { fn } from 'storybook/test';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';

const queryClient = new QueryClient();

declare global {
  interface Window {
    browser: Browser;
  }
}

const anonymousBootData = {
  ...defaultBootData,
  user: { id: 'anonymous-visitor' },
};

export const ExtensionProviders: FC<
  PropsWithChildren<{
    /** Boot as a logged-out visitor instead of the default logged-in user. */
    anonymous?: boolean;
  }>
> = ({ anonymous = false, children }) => {
  if (anonymous) {
    // The provider's remote boot query goes through the same mock; without
    // this it would overwrite the anonymous local boot with the logged user.
    getBootMock.mockImplementation((bootMock = anonymousBootData) => ({
      ...bootMock,
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    }));
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock(anonymous ? anonymousBootData : undefined)}
      >
        <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
          {children}
        </ActiveFeedContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

export default ExtensionProviders;
