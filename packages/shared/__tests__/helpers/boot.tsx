// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import type { WidenPrimitives } from '@growthbook/growthbook';
import type { AuthContextData } from '../../src/contexts/AuthContext';
import AuthContext from '../../src/contexts/AuthContext';
import type { NotificationsContextProviderProps } from '../../src/contexts/NotificationsContext';
import { NotificationsContextProvider } from '../../src/contexts/NotificationsContext';
import type { SettingsContextData } from '../../src/contexts/SettingsContext';
import SettingsContext, { ThemeMode } from '../../src/contexts/SettingsContext';
import type { AlertContextProviderProps } from '../../src/contexts/AlertContext';
import { AlertContextProvider } from '../../src/contexts/AlertContext';
import { FeaturesReadyContext } from '../../src/components/GrowthBookProvider';
import { LazyModalElement } from '../../src/components/modals/LazyModalElement';
import LogContext from '../../src/contexts/LogContext';
import type { LogContextData } from '../../src/hooks/log/useLogContextData';
import { ChecklistViewState } from '../../src/lib/checklist';

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

export const settingsContext: SettingsContextData = {
  autoDismissNotifications: true,
  companionExpanded: true,
  insaneMode: false,
  loadedSettings: true,
  onToggleHeaderPlacement: jest.fn(),
  onboardingChecklistView: ChecklistViewState.Hidden,
  openNewTab: true,
  optOutCompanion: false,
  optOutReadingStreak: true,
  setOnboardingChecklistView: jest.fn(),
  setSettings: jest.fn(),
  setSpaciness: jest.fn(),
  setTheme: jest.fn(),
  showTopSites: true,
  sidebarExpanded: true,
  sortingEnabled: false,
  spaciness: 'eco',
  syncSettings: jest.fn(),
  themeMode: ThemeMode.Dark,
  toggleAutoDismissNotifications: jest.fn(),
  toggleInsaneMode: jest.fn(),
  toggleOpenNewTab: jest.fn(),
  toggleOptOutCompanion: jest.fn(),
  toggleOptOutReadingStreak: jest.fn(),
  toggleShowTopSites: jest.fn(),
  toggleSidebarExpanded: jest.fn(),
  toggleSortingEnabled: jest.fn(),
  updateCustomLinks: jest.fn(),
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
            isAuthReady: true,
            isLoggedIn: true,
            showLogin: jest.fn(),
            closeLogin: jest.fn(),
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
                value={{
                  ...settingsContext,
                  ...settings,
                }}
              >
                <LogContext.Provider
                  value={{ ...defaultLogContextData, ...log }}
                >
                  <NotificationsContextProvider {...notification}>
                    {children}
                    <LazyModalElement />
                  </NotificationsContextProvider>
                </LogContext.Provider>
              </SettingsContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </AlertContextProvider>
    </QueryClientProvider>
  );
};
