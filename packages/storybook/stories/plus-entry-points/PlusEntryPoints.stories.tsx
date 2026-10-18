import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { MainSection } from '@dailydotdev/shared/src/components/sidebar/sections/MainSection';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import { ProfileSettingsMenuDesktop } from '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu';
import { PlusUserBadge } from '@dailydotdev/shared/src/components/PlusUserBadge';
import { HeaderPlusButton } from '@dailydotdev/shared/src/components/plus/HeaderPlusButton';
import { BookmarkFoldersStrip } from '@dailydotdev/shared/src/components/plus/BookmarkFoldersStrip';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';

// The Plus entries that already exist (sidebar row, profile menu, settings,
// member badge) as one row style and one hover card, rendered from the real
// components. Hover a "Get Plus" row or a member's Plus badge to see the card.

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
  isPlus = false,
  seed,
  children,
}: {
  isPlus?: boolean;
  seed?: (client: QueryClient) => void;
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });
    seed?.(client);
    return client;
  }, [seed]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={
          {
            id: 'sb-user',
            name: 'Dev Dana',
            username: 'dana',
            image:
              'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1',
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
            <ActiveFeedContext.Provider value={{ items: [], queryKey: ['sb'] }}>
              {children}
            </ActiveFeedContext.Provider>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

const Sidebar = (): ReactElement => (
  <div className="w-60 rounded-16 border border-border-subtlest-tertiary bg-background-default py-2">
    <MainSection
      isItemsButton={false}
      sidebarExpanded
      shouldShowLabel
      activePage="/"
    />
  </div>
);

const Settings = (): ReactElement => (
  <div className="h-[22rem] w-64 overflow-hidden">
    <ProfileSettingsMenuDesktop />
  </div>
);

const Comment = (): ReactElement => (
  <div className="flex w-full items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <span className="font-bold typo-callout">Ido Shamun</span>
    <PlusUserBadge
      user={{ isPlus: true, plusMemberSince: new Date('2024-11-10') }}
    />
    <span className="text-text-tertiary typo-footnote">@idoshamun · 6d</span>
  </div>
);

const meta: Meta = {
  title: 'Features/Plus entry points',
  id: 'plus-entry-points',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const SidebarRow: Story = {
  name: 'Sidebar row',
  render: () => (
    <Providers>
      <Sidebar />
    </Providers>
  ),
};

export const ProfileMenuFree: Story = {
  name: 'Profile menu, free',
  render: () => (
    <Providers>
      <div
        className="relative h-[40rem] w-80"
        style={{ transform: 'translateZ(0)' }}
      >
        <ProfileMenu onClose={noop} />
      </div>
    </Providers>
  ),
};

export const ProfileMenuMember: Story = {
  name: 'Profile menu, member',
  render: () => (
    <Providers isPlus>
      <div
        className="relative h-[40rem] w-80"
        style={{ transform: 'translateZ(0)' }}
      >
        <ProfileMenu onClose={noop} />
      </div>
    </Providers>
  ),
};

export const SettingsFree: Story = {
  name: 'Settings, free',
  render: () => (
    <Providers>
      <Settings />
    </Providers>
  ),
};

export const SettingsMember: Story = {
  name: 'Settings, member',
  render: () => (
    <Providers isPlus>
      <Settings />
    </Providers>
  ),
};

export const MemberBadge: Story = {
  name: 'Member badge',
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Providers>
        <Comment />
      </Providers>
      <Providers isPlus>
        <Comment />
      </Providers>
    </div>
  ),
};

export const HeaderButton: Story = {
  name: 'Header Get Plus button',
  render: () => (
    <Providers>
      <div className="flex justify-end pb-72">
        <HeaderPlusButton />
      </div>
    </Providers>
  ),
};

const bookmarksFeedKey = ['storybook-bookmarks'];
const savedTags = [
  ['postgres', 'sql'],
  ['postgres'],
  ['react'],
  ['react', 'nextjs'],
  ['security'],
  ['security'],
  ['postgres'],
  ['docker'],
  ['docker'],
  ['react'],
];

const seedBookmarks = (client: QueryClient): void => {
  client.setQueryData(bookmarksFeedKey, {
    pages: [
      {
        page: {
          edges: savedTags.map((tags, index) => ({
            node: {
              itemType: 'post',
              feedMeta: null,
              post: { id: `saved-${index}`, tags },
            },
          })),
          pageInfo: { hasNextPage: false },
        },
      },
    ],
    pageParams: [''],
  });
  client.setQueryData(generateQueryKey(RequestKey.TagTitles), {
    postgres: 'PostgreSQL',
    react: 'React',
    security: 'Security',
    docker: 'Docker',
  });
};

export const BookmarksStrip: Story = {
  name: 'Bookmarks folders strip',
  render: () => (
    <Providers seed={seedBookmarks}>
      <div className="w-full" style={{ maxWidth: '42rem' }}>
        <BookmarkFoldersStrip feedQueryKey={bookmarksFeedKey} />
      </div>
    </Providers>
  ),
};
