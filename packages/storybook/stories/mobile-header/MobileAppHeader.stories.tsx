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
import {
  featureMobileAppHeader,
  featureMobileAppHeaderDeclutter,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { MobileAppActions } from '@dailydotdev/shared/src/features/getApp/components/MobileAppActions';
import { MobileAppHeader } from '@dailydotdev/shared/src/features/getApp/components/MobileAppHeader';
import { useMobileAppHeaderDeclutter } from '@dailydotdev/shared/src/features/getApp/hooks/useMobileAppHeader';
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
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

const LogContext = getLogContextStatic();

const auth = {
  isAuthReady: true,
  isLoggedIn: false,
  isAndroidApp: false,
  showLogin: fn().mockName('showLogin'),
} as unknown as AuthContextData;

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
  experiment: boolean;
  declutter: boolean;
}

const Providers = ({
  experiment,
  declutter,
  children,
}: Args & { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthContext.Provider value={auth}>
      <LogContext.Provider
        value={{ logEvent: fn() } as unknown as LogContextData}
      >
        <SettingsContext.Provider value={settings}>
          <FeatureOverrides
            values={{
              [featureMobileAppHeader.id]: experiment,
              [featureMobileAppHeaderDeclutter.id]: declutter,
            }}
          >
            <div className="min-h-screen bg-background-default">{children}</div>
          </FeatureOverrides>
        </SettingsContext.Provider>
      </LogContext.Provider>
    </AuthContext.Provider>
  </QueryClientProvider>
);

// Mirrors the profile page: without the declutter arm the row takes the
// strip's place and the profile bar stays as it is today.
const MobileAppHeaderWithoutDeclutter = (): ReactElement | null =>
  useMobileAppHeaderDeclutter() ? null : <MobileAppHeader sticky />;

const meta: Meta<Args> = {
  title: 'Mobile Header',
  args: { experiment: true, declutter: true },
  argTypes: {
    experiment: {
      name: featureMobileAppHeader.id,
      description: 'On: Log in + Open app. Off: production today.',
    },
    declutter: {
      name: featureMobileAppHeaderDeclutter.id,
      description:
        'With the header on: no three-dots menus or profile Follow, squad tour under Join.',
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
      <Providers experiment={args.experiment} declutter={args.declutter}>
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
  render: ({ experiment, declutter }) => (
    <>
      <CustomAuthBanner />
      <GoBackHeaderMobile className="bg-background-subtle">
        <PostHeaderActions
          post={post}
          className={experiment ? undefined : 'ml-auto'}
          onReadArticle={fn()}
          buttonSize={ButtonSize.Small}
          hideOptions={experiment && declutter}
          hideSubscribeAction={experiment && declutter}
        />
      </GoBackHeaderMobile>
    </>
  ),
};

export const ProfileBar: Story = {
  name: 'Profile bar',
  render: () => (
    <>
      <CustomAuthBanner />
      <MobileAppHeaderWithoutDeclutter />
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
