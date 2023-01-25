import React, { ReactElement, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { Boot, BootApp } from '@dailydotdev/shared/src/lib/boot';
import { FeaturesContextProvider } from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useRefreshToken } from '@dailydotdev/shared/src/hooks/useRefreshToken';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import useWindowEvents from '@dailydotdev/shared/src/hooks/useWindowEvents';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import Companion from './Companion';
import CustomRouter from '../lib/CustomRouter';
import { companionFetch } from './companionFetch';
import { version } from '../../package.json';
import { useBackgroundRequest } from './useBackgroundRequest';

const queryClient = new QueryClient();
const router = new CustomRouter();

export type CompanionData = { url: string; deviceId: string } & Pick<
  Boot,
  | 'postData'
  | 'settings'
  | 'flags'
  | 'alerts'
  | 'user'
  | 'visit'
  | 'accessToken'
>;

const refreshTokenKey = 'refresh_token';

export default function App({
  deviceId,
  url,
  postData,
  settings,
  flags,
  user,
  alerts,
  visit,
  accessToken,
}: CompanionData): ReactElement {
  useError();
  const [token, setToken] = useState(accessToken);
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );

  if (isOptOutCompanion) {
    return <></>;
  }

  const memoizedFlags = useMemo(() => flags, [flags]);
  const refetchData = async () =>
    browser.runtime.sendMessage({ type: 'CONTENT_LOADED' });

  useRefreshToken(token, refetchData);
  useBackgroundRequest(refreshTokenKey, {
    queryClient,
    callback: ({ res }) => setToken(res.accessToken),
  });

  useWindowEvents('message', AuthEvent.Login, async (e) => {
    if (e.data?.eventKey === AuthEvent.Login) {
      await refetchData();
    }
  });

  return (
    <div>
      <style>
        @import &quot;{browser.runtime.getURL('css/companion.css')}&quot;;
      </style>
      <RouterContext.Provider value={router}>
        <QueryClientProvider client={queryClient}>
          <FeaturesContextProvider flags={memoizedFlags}>
            <AuthContextProvider
              user={user}
              visit={visit}
              tokenRefreshed
              getRedirectUri={() => browser.runtime.getURL('index.html')}
              updateUser={() => null}
            >
              <SettingsContextProvider settings={settings}>
                <AlertContextProvider alerts={alerts}>
                  <AnalyticsContextProvider
                    app={BootApp.Companion}
                    version={version}
                    fetchMethod={companionFetch}
                    backgroundMethod={(msg) => browser.runtime.sendMessage(msg)}
                    deviceId={deviceId}
                    getPage={() => url}
                  >
                    <Companion
                      postData={postData}
                      companionHelper={alerts?.companionHelper}
                      companionExpanded={settings?.companionExpanded}
                      onOptOut={() => setIsOptOutCompanion(true)}
                    />
                    <Toast
                      autoDismissNotifications={
                        settings?.autoDismissNotifications
                      }
                    />
                  </AnalyticsContextProvider>
                </AlertContextProvider>
              </SettingsContextProvider>
            </AuthContextProvider>
          </FeaturesContextProvider>
        </QueryClientProvider>
      </RouterContext.Provider>
    </div>
  );
}
