import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { MainSection } from '@dailydotdev/shared/src/components/sidebar/sections/MainSection';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import { InnerProfileSettingsMenu } from '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu';
import { PlusUserBadge } from '@dailydotdev/shared/src/components/PlusUserBadge';
import { featurePlusEntryPoints } from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

// ---------------------------------------------------------------------------
// Experiment: `plus_entry_points`
//
// The Plus entries that already exist (sidebar row, account menu, settings,
// member badge) become one quiet row style with one hover card. Control is on
// the left, the treatment on the right. Hover a "Get Plus" row or the member
// badge to see the card.
// ---------------------------------------------------------------------------

const noop = (): void => undefined;

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

const Providers = ({
  isPlus,
  enabled,
  children,
}: {
  isPlus: boolean;
  enabled: boolean;
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
    [],
  );

  return (
    <FeatureOverrides values={{ [featurePlusEntryPoints.id]: enabled }}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider
          user={
            {
              id: 'sb-user',
              name: 'Dev Dana',
              username: 'dana',
              image: '',
              providers: ['github'],
              isPlus,
            } as never
          }
          firstLoad={false}
          isFetched
          loadingUser={false}
          tokenRefreshed
          loadedUserFromCache
          getRedirectUri={() => ''}
          updateUser={noop as never}
          refetchBoot={noop as never}
          visit={{ visitId: 'sb', sessionId: 'sb' } as never}
          accessToken={null as never}
          squads={[]}
          feeds={undefined}
          geo={{} as never}
          isAndroidApp={false}
        >
          <LogContext.Provider
            value={{
              logEvent: noop,
              logEventStart: noop,
              logEventEnd: noop,
              sendBeacon: noop,
            }}
          >
            <SettingsContext.Provider value={settings as never}>
              {children}
            </SettingsContext.Provider>
          </LogContext.Provider>
        </AuthContextProvider>
      </QueryClientProvider>
    </FeatureOverrides>
  );
};

const Arms = ({
  isPlus = false,
  children,
}: {
  isPlus?: boolean;
  children: () => ReactNode;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-10">
    {[false, true].map((enabled) => (
      <div key={String(enabled)} className="flex flex-col gap-3">
        <span className="font-bold typo-callout">
          {enabled ? 'plus_entry_points on' : 'Control'}
        </span>
        <Providers isPlus={isPlus} enabled={enabled}>
          {children()}
        </Providers>
      </div>
    ))}
  </div>
);

const Panel = ({
  width = 'w-60',
  children,
}: {
  width?: string;
  children: ReactNode;
}): ReactElement => (
  <div
    className={`${width} rounded-16 border border-border-subtlest-tertiary bg-background-default py-2`}
  >
    {children}
  </div>
);

const sidebarProps = {
  isItemsButton: false,
  sidebarExpanded: true,
  activePage: '/',
};

const meta: Meta = {
  title: 'Experiments/Plus entry points',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const Sidebar: Story = {
  name: 'Sidebar row (A1.1 + hover card)',
  render: () => (
    <Arms>
      {() => (
        <div className="flex items-start gap-4">
          <Panel>
            <MainSection {...sidebarProps} shouldShowLabel />
          </Panel>
          <Panel width="w-16">
            <MainSection {...sidebarProps} shouldShowLabel={false} />
          </Panel>
        </div>
      )}
    </Arms>
  ),
};

const AccountMenu = (): ReactElement => (
  <div
    className="relative h-[40rem] w-80"
    style={{ transform: 'translateZ(0)' }}
  >
    <ProfileMenu onClose={noop} />
  </div>
);

// The menu pins itself to the viewport's top-right, so each arm is its own
// story instead of a side-by-side pair.
const accountMenuStory = (isPlus: boolean, enabled: boolean): Story => ({
  render: () => (
    <Providers isPlus={isPlus} enabled={enabled}>
      <AccountMenu />
    </Providers>
  ),
});

export const AccountMenuControl: Story = {
  ...accountMenuStory(false, false),
  name: 'Account menu, control',
};

export const AccountMenuFree: Story = {
  ...accountMenuStory(false, true),
  name: 'Account menu, free (A4.2)',
};

export const AccountMenuMember: Story = {
  ...accountMenuStory(true, true),
  name: 'Account menu, member (A4.2)',
};

const Settings = (): ReactElement => (
  <Panel width="w-64">
    <div className="h-[24rem] overflow-hidden px-2">
      <InnerProfileSettingsMenu />
    </div>
  </Panel>
);

export const SettingsFree: Story = {
  name: 'Settings, free (A5.1)',
  render: () => <Arms>{() => <Settings />}</Arms>,
};

export const SettingsMember: Story = {
  name: 'Settings, member (A5.1)',
  render: () => <Arms isPlus>{() => <Settings />}</Arms>,
};

const Comment = (): ReactElement => (
  <div className="flex w-96 items-center gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
    <span className="font-bold typo-callout">Buk1m</span>
    <PlusUserBadge
      user={{
        isPlus: true,
        name: 'Buk1m',
        plusMemberSince: new Date('2025-03-01'),
      }}
    />
    <span className="text-text-tertiary typo-footnote">· 2h</span>
  </div>
);

export const MemberBadge: Story = {
  name: 'Member badge (A8.1)',
  render: () => (
    <div className="flex flex-col gap-8">
      <span className="text-text-tertiary typo-footnote">Free viewer</span>
      <Arms>{() => <Comment />}</Arms>
      <span className="text-text-tertiary typo-footnote">Member viewer</span>
      <Arms isPlus>{() => <Comment />}</Arms>
    </div>
  ),
};
