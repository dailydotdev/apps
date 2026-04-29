import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomizeNewTabSidebar } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabSidebar';
import { CustomizeNewTabProvider } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { LogContextProvider } from '@dailydotdev/shared/src/contexts/LogContext';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ThemeMode } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { fn } from 'storybook/test';

const noopAsync = async () => undefined;

const mockUser: LoggedUser = {
  id: 'user-123',
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  image: 'https://via.placeholder.com/40',
  createdAt: '2024-09-01T00:00:00Z',
  permalink: 'https://app.daily.dev/janedoe',
} as LoggedUser;

const settings: Partial<SettingsContextData> = {
  themeMode: ThemeMode.Dark,
  insaneMode: false,
  spaciness: 'eco',
  showTopSites: true,
  optOutCompanion: false,
  optOutReadingStreak: false,
  optOutLevelSystem: false,
  optOutQuestSystem: false,
  showFeedbackButton: true,
  autoDismissNotifications: true,
  flags: {
    sidebarSquadExpanded: true,
    sidebarCustomFeedsExpanded: true,
    sidebarOtherExpanded: true,
    sidebarResourcesExpanded: true,
    sidebarBookmarksExpanded: true,
    clickbaitShieldEnabled: true,
    newTabMode: 'discover',
  },
  setTheme: noopAsync,
  toggleInsaneMode: noopAsync,
  toggleShowTopSites: noopAsync,
  toggleOptOutCompanion: noopAsync,
  toggleOptOutReadingStreak: noopAsync,
  toggleOptOutLevelSystem: noopAsync,
  toggleAutoDismissNotifications: noopAsync,
  toggleShowFeedbackButton: noopAsync,
  updateFlag: noopAsync,
  updateFlagRemote: noopAsync,
};

const Decorator = (Story: () => JSX.Element): JSX.Element => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={mockUser}
        updateUser={fn()}
        tokenRefreshed
        getRedirectUri={fn()}
        loadingUser={false}
        loadedUserFromCache
        refetchBoot={fn()}
        squads={[]}
        isAndroidApp={false}
      >
        <LogContextProvider
          app={BootApp.Test}
          version="1.0"
          getPage={() => 'storybook'}
        >
          <SettingsContext.Provider
            value={settings as unknown as SettingsContextData}
          >
            <CustomizeNewTabProvider>
              <div className="relative min-h-[640px] w-full bg-background-default">
                <Story />
              </div>
            </CustomizeNewTabProvider>
          </SettingsContext.Provider>
        </LogContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof CustomizeNewTabSidebar> = {
  title: 'Features/CustomizeNewTab/Sidebar',
  component: CustomizeNewTabSidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [Decorator],
};

export default meta;

type Story = StoryObj<typeof CustomizeNewTabSidebar>;

export const Collapsed: Story = {
  name: 'Collapsed (floating pill)',
};

export const Discover: Story = {
  name: 'Discover mode',
};

export const Focus: Story = {
  name: 'Focus mode',
  decorators: [
    (Story) => {
      const focusSettings = {
        ...settings,
        flags: { ...settings.flags, newTabMode: 'focus' as const },
      } as unknown as SettingsContextData;
      return (
        <SettingsContext.Provider value={focusSettings}>
          <Story />
        </SettingsContext.Provider>
      );
    },
  ],
};
