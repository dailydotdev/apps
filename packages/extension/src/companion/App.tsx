import React, { ReactElement, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { Boot, BootApp } from '@dailydotdev/shared/src/lib/boot';
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
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import { GrowthBookProvider } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import Companion from './Companion';
import CustomRouter from '../lib/CustomRouter';
import { companionFetch } from './companionFetch';
import { version } from '../../package.json';
import { getCompanionWrapper } from './common';

const queryClient = new QueryClient(defaultQueryClientConfig);
const router = new CustomRouter();

export type CompanionData = { url: string; deviceId: string } & Pick<
  Boot,
  | 'postData'
  | 'settings'
  | 'alerts'
  | 'user'
  | 'visit'
  | 'accessToken'
  | 'squads'
  | 'exp'
>;

const app = BootApp.Companion;

export default function App({
  deviceId,
  url,
  postData,
  settings,
  user,
  alerts,
  visit,
  accessToken,
  squads,
  exp,
}: CompanionData): ReactElement {
  useError();
  const [token, setToken] = useState(accessToken);
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );

  if (isOptOutCompanion) {
    return <></>;
  }
  const refetchData = async () =>
    browser.runtime.sendMessage({ type: ExtensionMessageType.ContentLoaded });

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useRefreshToken(token, refetchData);

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
          <GrowthBookProvider
            app={app}
            user={user}
            deviceId={deviceId}
            experimentation={exp}
          >
            <AuthContextProvider
              user={user}
              visit={visit}
              tokenRefreshed
              getRedirectUri={() => browser.runtime.getURL('index.html')}
              updateUser={() => null}
              squads={squads}
            >
              <SettingsContextProvider settings={settings}>
                <AlertContextProvider alerts={alerts}>
                  <AnalyticsContextProvider
                    app={app}
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
                      onUpdateToken={setToken}
                    />
                    <PromptElement parentSelector={getCompanionWrapper} />
                    <Toast
                      autoDismissNotifications={
                        settings?.autoDismissNotifications
                      }
                    />
                  </AnalyticsContextProvider>
                </AlertContextProvider>
              </SettingsContextProvider>
            </AuthContextProvider>
          </GrowthBookProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </RouterContext.Provider>
    </div>
  );
}
