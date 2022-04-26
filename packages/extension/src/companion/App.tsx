import React, { ReactElement, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { Boot } from '@dailydotdev/shared/src/lib/boot';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { AnalyticsContextProvider } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Companion from './Companion';
import CustomRouter from '../lib/CustomRouter';
import { companionFetch } from './companionFetch';
import { version } from '../../package.json';

const queryClient = new QueryClient();
const router = new CustomRouter();

export type CompanionData = { url: string; deviceId: string } & Pick<
  Boot,
  'postData' | 'settings' | 'flags' | 'alerts' | 'user' | 'visit'
>;
export default function App({
  deviceId,
  url,
  postData,
  settings,
  flags,
  user,
  alerts,
  visit,
}: CompanionData): ReactElement {
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );

  if (isOptOutCompanion) {
    return <></>;
  }

  const memoizedFlags = useMemo(() => ({ flags }), [flags]);

  return (
    <div>
      <style>
        @import &quot;chrome-extension://{browser.runtime.id}
        /css/companion.css&quot;;
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
