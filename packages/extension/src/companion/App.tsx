import React, { ReactElement, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { Boot } from '@dailydotdev/shared/src/lib/boot';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useRefreshToken } from '@dailydotdev/shared/src/hooks/useRefreshToken';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { RouterContext } from 'next/dist/shared/lib/router-context';
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
  const [token, setToken] = useState(accessToken);
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );

  if (isOptOutCompanion) {
    return <></>;
  }

  const memoizedFlags = useMemo(() => ({ flags }), [flags]);
  const refetchData = () =>
    companionFetch(`${apiUrl}/v1/auth/refreshToken`, {
      headers: { requestKey: refreshTokenKey },
    });

  useRefreshToken(token, refetchData);
  useBackgroundRequest(refreshTokenKey, {
    queryClient,
    callback: ({ res }) => setToken(res),
  });

  return (
    <div>
      <style>
        @import &quot;{browser.runtime.getURL('css/companion.css')}&quot;;
      </style>
      <RouterContext.Provider value={router}>
        <QueryClientProvider client={queryClient}>
          <FeaturesContext.Provider value={memoizedFlags}>
            <AuthContextProvider
              user={user}
              visit={visit}
              tokenRefreshed
              getRedirectUri={() => '/'}
              updateUser={() => null}
            >
              <SettingsContextProvider settings={settings}>
                <AlertContextProvider alerts={alerts}>
                  <AnalyticsContextProvider
                    app="companion"
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
          </FeaturesContext.Provider>
        </QueryClientProvider>
      </RouterContext.Provider>
    </div>
  );
}
