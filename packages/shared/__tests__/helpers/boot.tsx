// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { WidenPrimitives } from '@growthbook/growthbook';
import AuthContext, { AuthContextData } from '../../src/contexts/AuthContext';
import OnboardingContext from '../../src/contexts/OnboardingContext';
import { OnboardingMode } from '../../src/graphql/feed';
import {
  NotificationsContextProvider,
  NotificationsContextProviderProps,
} from '../../src/contexts/NotificationsContext';
import SettingsContext, {
  SettingsContextData,
  ThemeMode,
} from '../../src/contexts/SettingsContext';
import {
  AlertContextProvider,
  AlertContextProviderProps,
} from '../../src/contexts/AlertContext';
import { FeaturesReadyContext } from '../../src/components/GrowthBookProvider';
import { LazyModalElement } from '../../src/components/modals/LazyModalElement';
import LogContext from '../../src/contexts/LogContext';
import { LogContextData } from '../../src/hooks/log/useLogContextData';

interface TestBootProviderProps {
  children: ReactNode;
  client: QueryClient;
  settings?: Partial<SettingsContextData>;
  auth?: Partial<AuthContextData>;
  alerts?: Partial<AlertContextProviderProps>;
  notification?: Partial<NotificationsContextProviderProps>;
  log?: Partial<LogContextData>;
  gb?: GrowthBook;
}

export const settingsContext: Partial<SettingsContextData> = {
  spaciness: 'eco',
  openNewTab: true,
  setTheme: jest.fn(),
  themeMode: ThemeMode.Dark,
  setSpaciness: jest.fn(),
  toggleOpenNewTab: jest.fn(),
  insaneMode: false,
  loadedSettings: true,
  toggleInsaneMode: jest.fn(),
  showTopSites: true,
  toggleShowTopSites: jest.fn(),
};

export const defaultLogContextData: LogContextData = {
  logEvent: jest.fn(),
  logEventStart: jest.fn(),
  logEventEnd: jest.fn(),
  sendBeacon: jest.fn(),
};

export const TestBootProvider = ({
  client,
  children,
  settings = {},
  auth = {},
  alerts = {},
  notification = {},
  log = {},
  gb = new GrowthBook(),
}: TestBootProviderProps): ReactElement => {
  return (
    <QueryClientProvider client={client}>
      <AlertContextProvider loadedAlerts {...alerts}>
        <AuthContext.Provider
          value={{
            shouldShowLogin: false,
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            isFetched: true,
            isLoggedIn: true,
            ...auth,
          }}
        >
          <GrowthBookProvider growthbook={gb}>
            <FeaturesReadyContext.Provider
              value={{
                ready: true,
                getFeatureValue<T>(feature) {
                  return feature.defaultValue as WidenPrimitives<T>;
                },
              }}
            >
              <SettingsContext.Provider
                value={{ ...settingsContext, ...settings }}
              >
                <LogContext.Provider
                  value={{ ...defaultLogContextData, ...log }}
                >
                  <OnboardingContext.Provider
                    value={{
                      myFeedMode: OnboardingMode.Manual,
                      isOnboardingOpen: false,
                      onCloseOnboardingModal: jest.fn(),
                      onInitializeOnboarding: jest.fn(),
                      onShouldUpdateFilters: jest.fn(),
                    }}
                  >
                    <NotificationsContextProvider {...notification}>
                      {children}
                      <LazyModalElement />
                    </NotificationsContextProvider>
                  </OnboardingContext.Provider>
                </LogContext.Provider>
              </SettingsContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </AlertContextProvider>
    </QueryClientProvider>
  );
};
