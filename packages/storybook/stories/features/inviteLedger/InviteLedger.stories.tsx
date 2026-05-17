import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { LogContextProvider } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext, { ThemeMode } from '@dailydotdev/shared/src/contexts/SettingsContext';
import AlertContext from '@dailydotdev/shared/src/contexts/AlertContext';
import { LedgerPage } from '@dailydotdev/shared/src/features/inviteLedger/components/LedgerPage';
import { InviteMilestoneTimeline } from '@dailydotdev/shared/src/features/inviteLedger/components/InviteMilestoneTimeline';
import { InviteLedgerCounter } from '@dailydotdev/shared/src/features/inviteLedger/components/InviteLedgerCounter';
import { InviteLedgerStrip } from '@dailydotdev/shared/src/features/inviteLedger/components/InviteLedgerStrip';
import InviteLedgerPromoModal from '@dailydotdev/shared/src/features/inviteLedger/components/InviteLedgerPromoModal';
import { setInviteLedgerDebugEnabled, setInviteLedgerDemoMode } from '@dailydotdev/shared/src/features/inviteLedger/debug';
import React, { useLayoutEffect, useMemo } from 'react';
// @ts-expect-error - react-modal types may not be exposed in storybook tsconfig
import ReactModal from 'react-modal';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { fn } from 'storybook/test';
import type { InviteLedgerDemoMode } from '@dailydotdev/shared/src/features/inviteLedger/debug';

const meta: Meta = {
  title: 'Features/InviteLedger',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

const SetupDemo = ({
  mode,
  children,
}: {
  mode: InviteLedgerDemoMode;
  children: React.ReactNode;
}): React.ReactElement => {
  // Synchronously set up the modal root + react-modal app element
  // BEFORE the modal can mount.
  if (typeof document !== 'undefined' && !document.getElementById('__next')) {
    const next = document.createElement('div');
    next.id = '__next';
    document.body.appendChild(next);
    try {
      ReactModal.setAppElement('#__next');
    } catch {
      /* ignore */
    }
  }

  useLayoutEffect(() => {
    setInviteLedgerDebugEnabled(true);
    setInviteLedgerDemoMode(mode);
  }, [mode]);

  const mockUser = useMemo(
    () => ({
      id: 'storybook-user',
      name: 'Ron',
      username: 'ron',
      premium: false,
      reputation: 100,
      image: 'https://daily-now-res.cloudinary.com/image/upload/v1716308220/avatars/avatar_KZjvAQUf2cs0gPHFQGn8R.jpg',
      bio: 'storybook',
      createdAt: '2023-01-01T00:00:00Z',
      providers: [],
      balance: { amount: 0 },
      coresRole: 1,
    }),
    [],
  );

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
        },
      }),
    [],
  );

  const settings = useMemo(
    () =>
      ({
        themeMode: ThemeMode.Dark,
        setTheme: fn(),
        toggleOpenNewTab: fn(),
        setSpaciness: fn(),
        toggleInsaneMode: fn(),
        toggleShowTopSites: fn(),
        toggleSidebarExpanded: fn(),
        toggleSortingEnabled: fn(),
        toggleOptOutReadingStreak: fn(),
        toggleOptOutLevelSystem: fn(),
        toggleOptOutQuestSystem: fn(),
        toggleOptOutCompanion: fn(),
        toggleAutoDismissNotifications: fn(),
        toggleShowFeedbackButton: fn(),
        loadedSettings: true,
        updateCustomLinks: fn(),
        updateSortCommentsBy: fn(),
        updateFlag: fn(),
        updateFlagRemote: fn(),
        updatePromptFlag: fn(),
        syncSettings: fn(),
        onToggleHeaderPlacement: fn(),
        setSettings: fn(),
        applyThemeMode: fn(),
      } as unknown as React.ContextType<typeof SettingsContext>),
    [],
  );

  const alerts = useMemo(
    () =>
      ({
        alerts: {},
        loadedAlerts: true,
        updateLastBootPopup: fn(),
        updateLastReferralReminder: fn(),
        updateAlerts: fn(),
        isAlertsFetched: true,
      } as unknown as React.ContextType<typeof AlertContext>),
    [],
  );

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
        <SettingsContext.Provider value={settings}>
          <AlertContext.Provider value={alerts}>
            <LogContextProvider app={BootApp.Webapp} version="storybook" getPage={() => '/storybook'}>
              {children}
            </LogContextProvider>
          </AlertContext.Provider>
        </SettingsContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const PageFrame = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <div className="min-h-screen bg-background-default">
    <div className="mx-auto max-w-[640px] px-4 py-8">{children}</div>
  </div>
);

export const PageFull: Story = {
  render: () => (
    <SetupDemo mode="full">
      <PageFrame>
        <LedgerPage />
      </PageFrame>
    </SetupDemo>
  ),
};

export const PageSingle: Story = {
  render: () => (
    <SetupDemo mode="single">
      <PageFrame>
        <LedgerPage />
      </PageFrame>
    </SetupDemo>
  ),
};

export const PageEmpty: Story = {
  render: () => (
    <SetupDemo mode="empty">
      <PageFrame>
        <LedgerPage />
      </PageFrame>
    </SetupDemo>
  ),
};

export const TimelineEmpty: Story = {
  render: () => (
    <SetupDemo mode="empty">
      <PageFrame>
        <InviteMilestoneTimeline invitesAccepted={0} showBlurb />
      </PageFrame>
    </SetupDemo>
  ),
};

export const TimelineMid: Story = {
  render: () => (
    <SetupDemo mode="full">
      <PageFrame>
        <InviteMilestoneTimeline invitesAccepted={6} showBlurb />
      </PageFrame>
    </SetupDemo>
  ),
};

export const ProfileCounter: Story = {
  render: () => (
    <SetupDemo mode="full">
      <div className="flex min-h-screen items-center justify-center bg-background-default p-6">
        <InviteLedgerCounter />
      </div>
    </SetupDemo>
  ),
};

export const StripInline: Story = {
  render: () => (
    <SetupDemo mode="full">
      <div className="min-h-screen bg-background-default py-4">
        <InviteLedgerStrip />
      </div>
    </SetupDemo>
  ),
};

export const PromoModal: Story = {
  render: () => (
    <SetupDemo mode="single">
      <div className="min-h-screen bg-background-default">
        <InviteLedgerPromoModal isOpen onRequestClose={fn()} parentSelector={() => document.body} />
      </div>
    </SetupDemo>
  ),
};

export const PromoModalNew: Story = {
  render: () => (
    <SetupDemo mode="empty">
      <div className="min-h-screen bg-background-default">
        <InviteLedgerPromoModal isOpen onRequestClose={fn()} parentSelector={() => document.body} />
      </div>
    </SetupDemo>
  ),
};
