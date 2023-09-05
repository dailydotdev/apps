// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import {
  FeaturesContextProvider,
  FeaturesContextProviderProps,
} from '../../src/contexts/FeaturesContext';
import AuthContext, { AuthContextData } from '../../src/contexts/AuthContext';
import OnboardingContext from '../../src/contexts/OnboardingContext';
import { OnboardingMode } from '../../src/graphql/feed';
import { BootApp } from '../../src/lib/boot';
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

interface TestBootProviderProps {
  children: ReactNode;
  client: QueryClient;
  features?: Omit<Partial<FeaturesContextProviderProps>, 'children'>;
  settings?: Partial<SettingsContextData>;
  auth?: Partial<AuthContextData>;
  alerts?: Partial<AlertContextProviderProps>;
  notification?: Partial<NotificationsContextProviderProps>;
  gb?: GrowthBook;
}

const settingsContext: Partial<SettingsContextData> = {
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

export const TestBootProvider = ({
  client,
  children,
  features = {},
  settings = {},
  auth = {},
  alerts = {},
  notification = {},
  gb = new GrowthBook(),
}: TestBootProviderProps): ReactElement => {
  return (
    <QueryClientProvider client={client}>
      <FeaturesContextProvider
        {...features}
        flags={{ ...(features?.flags ?? {}) }}
        isFeaturesLoaded
        isFlagsFetched
      >
        <AlertContextProvider loadedAlerts {...alerts}>
          <AuthContext.Provider
            value={{
              shouldShowLogin: false,
              logout: jest.fn(),
              updateUser: jest.fn(),
              tokenRefreshed: true,
              getRedirectUri: jest.fn(),
              isFetched: true,
              ...auth,
            }}
          >
            <GrowthBookProvider growthbook={gb}>
              <SettingsContext.Provider
                value={{ ...settingsContext, ...settings }}
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
                  <NotificationsContextProvider
                    app={BootApp.Test}
                    {...notification}
                  >
                    {children}
                  </NotificationsContextProvider>
                </OnboardingContext.Provider>
              </SettingsContext.Provider>
            </GrowthBookProvider>
          </AuthContext.Provider>
        </AlertContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>
  );
};
