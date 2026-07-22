import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { ProfileShareButton } from '@dailydotdev/shared/src/components/profile/ProfileShareButton';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type {
  LoggedUser,
  PublicProfile as PublicProfileType,
} from '@dailydotdev/shared/src/lib/user';

const mockUser = {
  id: 'u1',
  name: 'Ido Shamun',
  username: 'idoshamun',
  email: 'ido@daily.dev',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2020-01-01T00:00:00.000Z',
  permalink: 'https://app.daily.dev/idoshamun',
} as unknown as LoggedUser;

const profile = {
  ...mockUser,
  bio: 'Co-founder of daily.dev. Building the homepage millions of developers open every morning.',
  cover:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/cover',
  reputation: 4210,
  isPlus: true,
} as unknown as PublicProfileType;

const userStats = { upvotes: 1240, numFollowers: 8300, numFollowing: 210 };

const SHORT_LINK = 'https://dly.to/abc123';

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// be evaluated as `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
const withProviders =
  (enabled: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    const { queryKey } = getShortLinkProps(
      profile.permalink,
      ReferralCampaignKey.ShareProfile,
      mockUser,
    );
    queryClient.setQueryData(queryKey, SHORT_LINK);

    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              isLoggedIn: true,
              isAuthReady: true,
              tokenRefreshed: true,
              shouldShowLogin: false,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              getRedirectUri: fn(),
              loadingUser: false,
              loadedUserFromCache: true,
              refetchBoot: fn(),
              squads: [],
              isAndroidApp: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        >
          <GrowthBookProvider
            app={BootApp.Webapp}
            user={mockUser}
            deviceId="storybook"
          >
            <FeaturesReadyContext.Provider
              value={{
                ready: enabled,
                getFeatureValue: (feature) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  feature.defaultValue as any,
              }}
            >
              <LogContext.Provider
                value={{
                  logEvent: fn(),
                  logEventStart: fn(),
                  logEventEnd: fn(),
                  sendBeacon: () => false,
                }}
              >
                <div className="mx-auto w-full max-w-[40rem]">
                  <Story />
                </div>
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof ProfileShareButton> = {
  title: 'Components/Share/ProfileShareButton',
  component: ProfileShareButton,
  args: { user: profile },
  parameters: {
    docs: {
      description: {
        component:
          'Profile copy/share control built on the shared `ShareActions` primitive. Gated by the `share_profile` flag plus the `sharing_visibility` master flag. On the owner profile it sits next to "Edit profile"; on public profiles it fills the slot the edit button leaves empty, well away from Follow so the two intents never read as one control group.',
      },
    },
  },
  decorators: [withProviders(true)],
};

export default meta;

type Story = StoryObj<typeof ProfileShareButton>;

// Public profile: the label names whose profile is being shared.
export const OnPublicProfile: Story = {};

// Owner profile: first-person label, same control.
export const OwnProfile: Story = {
  args: { isSameUser: true },
};

// Desktop: clicking the trigger reveals the full share network list.
export const NetworkList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByLabelText("Share @idoshamun's profile"),
    );
    await waitFor(() => expect(canvas.getByText('LinkedIn')).toBeVisible());
  },
};

// Copying state: the copy chip flips to "Copied!" for a beat. The clipboard is
// stubbed because the Storybook iframe isn't allowed to write to the real one.
export const Copying: Story = {
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByLabelText("Share @idoshamun's profile"),
    );
    await userEvent.click(await canvas.findByTestId('social-share-Copy link'));
    await waitFor(() => expect(canvas.getByText('Copied!')).toBeInTheDocument());
  },
};

type HeaderStory = StoryObj<typeof ProfileHeader>;

const headerMeta = {
  render: (args: React.ComponentProps<typeof ProfileHeader>) => (
    <ProfileHeader {...args} />
  ),
};

// The control in place on a public profile header — it takes over the slot the
// (inapplicable) edit button used to reserve.
export const InPublicHeader: HeaderStory = {
  ...headerMeta,
  args: { user: profile, userStats, isSameUser: false },
  decorators: [withProviders(true)],
};

// The control in place on the owner's header, alongside "Edit profile".
export const InOwnHeader: HeaderStory = {
  ...headerMeta,
  args: { user: profile, userStats, isSameUser: true },
  decorators: [withProviders(true)],
};

// Flag off — the header must render exactly what ships today: an invisible
// edit-button placeholder on public profiles, no share control anywhere.
export const HeaderControl: HeaderStory = {
  ...headerMeta,
  args: { user: profile, userStats, isSameUser: false },
  decorators: [withProviders(false)],
};
