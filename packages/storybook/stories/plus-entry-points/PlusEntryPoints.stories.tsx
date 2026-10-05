import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { MainSection } from '@dailydotdev/shared/src/components/sidebar/sections/MainSection';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import { ProfileMenuHeader } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuHeader';
import { MainSection as ProfileMenuMainSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/MainSection';
import { ProfileSettingsMenuDesktop } from '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu';
import { PlusUserBadge } from '@dailydotdev/shared/src/components/PlusUserBadge';
import { PlusMenuEntry } from '@dailydotdev/shared/src/components/plus/PlusMenuEntry';
import { PlusEntryRowSize } from '@dailydotdev/shared/src/components/plus/PlusEntryRow';
import { PlusPreviewCard } from '@dailydotdev/shared/src/components/plus/PlusPreview';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
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

// The same pieces ProfileMenu renders, without its viewport-pinned popup.
const ProfileMenuPanel = (): ReactElement => (
  <div className="flex w-80 flex-col gap-3 overflow-clip rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3">
    <ProfileMenuHeader
      shouldOpenProfile
      showOpenLinkIcon={false}
      compact
      className="-mx-3 -mb-1.5 -mt-3 px-3 pb-1.5 pt-3 hover:bg-surface-float"
    />
    <PlusMenuEntry
      target={TargetId.ProfileDropdown}
      size={PlusEntryRowSize.Large}
      className="-mx-3 -my-1.5 px-3 py-1.5 hover:bg-surface-float"
    />
    <HorizontalSeparator className="-mx-3" />
    <nav className="flex flex-col gap-2">
      <ProfileMenuMainSection />
    </nav>
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

const Label = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="text-center font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const meta: Meta = {
  title: 'Plus PRs/Get Plus where it already lives',
  id: 'plus-entry-points',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const bullets = [
  'The sidebar says "Get Plus" and sits right under For You.',
  "Hover it, or any member's Plus badge, for one card that says what Plus does.",
  'The profile menu and Settings get the same row, styled like your profile above it.',
  'The line under "Get Plus" rotates through seven perks.',
  'Every entry opens the Plus page, where people see the plans and subscribe.',
];

export const Brief: Story = {
  name: 'Brief (share image)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Providers>
      <div
        className="flex h-[56.25rem] w-[100rem] gap-12 bg-background-default p-12 text-text-primary"
        style={{
          backgroundImage:
            'radial-gradient(60rem 40rem at 0% 0%, rgb(124 58 237 / 0.18), transparent 60%)',
        }}
      >
        <div className="flex w-[30rem] shrink-0 flex-col pt-4">
          <div className="flex items-center gap-3">
            <span className="rounded-8 bg-text-primary px-2.5 py-1 font-bold text-surface-invert typo-callout">
              PR
            </span>
            <span className="text-text-tertiary typo-title3">
              Plus promotion · ready for review
            </span>
          </div>
          <h1 className="mt-6 text-[3.5rem] font-bold leading-[1.05] tracking-[-0.02em]">
            Get Plus where it already lives
          </h1>
          <span className="mt-4 text-accent-blueCheese-default typo-title3">
            github.com/dailydotdev/apps/pull/6766
          </span>
          <ul className="mt-10 flex flex-col gap-5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-4 typo-title3">
                <span className="mt-3 size-2 shrink-0 rounded-[999px] bg-accent-bacon-default" />
                <span className="min-w-0 flex-1 text-text-primary">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-2">
            <span className="flex items-center gap-2 font-bold text-accent-avocado-default typo-title3">
              <span className="size-3 rounded-[999px] bg-accent-avocado-default" />
              Tests pass · ships to everyone, no flag
            </span>
            <span className="text-text-tertiary typo-callout">
              Real components from this branch.
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-32 border border-border-subtlest-tertiary bg-background-subtle p-8">
          <div className="flex items-start gap-8">
            <div className="flex flex-col gap-3">
              <Sidebar />
              <Label>Sidebar</Label>
              <div className="mt-3">
                <PlusPreviewCard />
              </div>
              <Label>Hover card, sidebar and badge</Label>
            </div>
            <div className="flex flex-col gap-3">
              <ProfileMenuPanel />
              <Label>Profile menu</Label>
              <div className="mt-3">
                <Comment />
              </div>
              <Label>Member badge</Label>
            </div>
            <div className="flex flex-col gap-3">
              <Settings />
              <Label>Settings</Label>
            </div>
          </div>
        </div>
      </div>
    </Providers>
  ),
};

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
