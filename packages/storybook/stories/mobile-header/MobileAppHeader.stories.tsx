import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Mock } from 'storybook/test';
import { fn } from 'storybook/test';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { MobileAppActions } from '@dailydotdev/shared/src/features/getApp/components/MobileAppActions';
import { MobileAppHeader } from '@dailydotdev/shared/src/features/getApp/components/MobileAppHeader';
import { useMobileAppHeaderIconOnlyRead } from '@dailydotdev/shared/src/features/getApp/hooks/useMobileAppHeader';
import { MobileFeedActions } from '@dailydotdev/shared/src/components/feeds/MobileFeedActions';
import { GoBackHeaderMobile } from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { PostHeaderActions } from '@dailydotdev/shared/src/components/post/PostHeaderActions';
import { Header as ProfileHeader } from '@dailydotdev/shared/src/components/profile/Header';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';

const LogContext = getLogContextStatic();

const showLogin = fn().mockName('showLogin');

const settings = {
  loadedSettings: true,
  openNewTab: false,
} as unknown as SettingsContextData;

const post = {
  id: 'sb-post',
  title: 'The hidden cost of feature flags',
  type: PostType.Article,
  permalink: 'https://api.daily.dev/r/sb-post',
  commentsPermalink: 'https://app.daily.dev/posts/sb-post',
  source: { id: 'sb-source', handle: 'dev', name: 'DEV' },
} as unknown as Post;

const profile: PublicProfile = {
  id: 'sb-user',
  name: 'Maya Chen',
  username: 'mayachen',
  createdAt: '2023-01-01T00:00:00.000Z',
  premium: false,
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/1',
  reputation: 1840,
  permalink: 'https://app.daily.dev/mayachen',
};

const squad = {
  id: 'sb-squad',
  handle: 'react-israel',
  name: 'React Israel',
  public: true,
  permalink: 'https://app.daily.dev/squads/react-israel',
  description: 'The biggest React community in Israel.',
  membersCount: 1240,
  flags: { totalPosts: 312, totalViews: 48200, totalUpvotes: 5100 },
} as unknown as Squad;

interface Args {
  loggedIn: boolean;
  postType?: PostType;
}

const Providers = ({
  loggedIn,
  children,
}: Args & { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthContext.Provider
      value={
        {
          isAuthReady: true,
          isLoggedIn: loggedIn,
          isAndroidApp: false,
          showLogin,
        } as unknown as AuthContextData
      }
    >
      <LogContext.Provider
        value={{ logEvent: fn() } as unknown as LogContextData}
      >
        <SettingsContext.Provider value={settings}>
          <div className="min-h-screen bg-background-default">{children}</div>
        </SettingsContext.Provider>
      </LogContext.Provider>
    </AuthContext.Provider>
  </QueryClientProvider>
);

const meta: Meta<Args> = {
  title: 'Mobile Header',
  args: { loggedIn: false },
  argTypes: {
    loggedIn: {
      description:
        'Logged out: Log in + Open app. Logged in: the header members keep.',
    },
  },
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  beforeEach: () => {
    (useRouter as unknown as Mock).mockReturnValue({
      isReady: true,
      pathname: '/',
      asPath: '/',
      query: {},
      push: fn(),
      replace: fn(),
      back: fn(),
    });
  },
  decorators: [
    (Story, { args }) => (
      <Providers loggedIn={args.loggedIn}>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj<Args>;

export const Actions: Story = {
  name: 'Log in + Open app',
  render: () => (
    <div className="p-4">
      <MobileAppActions />
    </div>
  ),
};

export const BrandRow: Story = {
  name: 'Brand row: Explore, search, source, tag, highlights, best of',
  render: () => (
    <>
      <CustomAuthBanner />
      <MobileAppHeader />
    </>
  ),
};

export const LogoRow: Story = {
  name: 'Logo row: discussions, tags, sources, leaderboard',
  render: () => <MobileFeedActions />,
};

export const BackBar: Story = {
  name: 'Back bar: squad page, profile tabs',
  render: () => <GoBackHeaderMobile />,
};

export const PostBar: Story = {
  name: 'Post bar: post, share and reader pages',
  args: { postType: PostType.Article },
  argTypes: {
    postType: {
      control: 'select',
      options: ['Article', 'Video', 'Collection'],
      mapping: {
        Article: PostType.Article,
        Video: PostType.VideoYouTube,
        Collection: PostType.Collection,
      },
      description: 'Video posts read "Watch video"; collections add Subscribe.',
    },
  },
  render: function Render({ loggedIn, postType }) {
    const isIconOnlyRead = useMobileAppHeaderIconOnlyRead();

    return (
      <>
        <CustomAuthBanner />
        <GoBackHeaderMobile className="bg-background-subtle">
          <PostHeaderActions
            post={{ ...post, type: postType ?? PostType.Article }}
            className={loggedIn ? 'ml-auto' : undefined}
            onReadArticle={fn()}
            buttonSize={ButtonSize.Small}
            hideOptions={!loggedIn}
            hideSubscribeAction={!loggedIn}
            inlineActions={isIconOnlyRead}
          />
        </GoBackHeaderMobile>
      </>
    );
  },
};

export const ProfileBar: Story = {
  name: 'Profile bar',
  render: () => (
    <>
      <CustomAuthBanner />
      <ProfileHeader user={profile} isSameUser={false} />
    </>
  ),
};

export const SquadsDirectory: Story = {
  name: 'Squads directory',
  render: () => <SquadDirectoryLayout />,
};

export const SquadPage: Story = {
  name: 'Squad page: back bar and squad card',
  render: () => (
    <SpotlightProvider>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <GoBackHeaderMobile />
        <SquadProfileHeader />
      </SquadPageContextProvider>
    </SpotlightProvider>
  ),
};
