import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PostContentShare } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const post = {
  id: 'post-1',
  title: 'The pragmatic guide to shipping fast without breaking prod',
  permalink: 'https://api.daily.dev/r/post-1',
  commentsPermalink: 'https://daily.dev/posts/post-1',
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/placeholder',
  createdAt: '2024-01-15T10:30:00.000Z',
  numUpvotes: 42,
  numComments: 12,
  type: PostType.Article,
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine',
    active: true,
  },
  userState: { vote: UserVote.Up, flags: { feedbackDismiss: false } },
} as unknown as Post;

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

    // The prompt only renders after an upvote, so seed the post-actions state.
    queryClient.setQueryData(
      generateQueryKey(RequestKey.PostActions, { id: post.id }),
      { interaction: 'upvote', previousInteraction: 'none' },
    );

    // Seed the resolved short URL so nothing hits the network.
    const { queryKey } = getShortLinkProps(
      post.commentsPermalink,
      ReferralCampaignKey.SharePost,
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
                <div className="mx-auto w-full max-w-[40rem] p-4">
                  <Story />
                </div>
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof PostContentShare> = {
  title: 'Components/Share/PostContentShare',
  component: PostContentShare,
  args: { post },
  parameters: {
    docs: {
      description: {
        component:
          'Post-upvote share prompt. Control is the plain "Should anyone else see this post?" copy-link widget; the `share_upvote_prompt` variant (also gated by the `sharing_visibility` master flag) turns it into a prominent card built on the shared `ShareActions` row.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PostContentShare>;

// Flag on — the redesigned prompt at the peak-intent moment after an upvote.
export const Redesigned: Story = {
  decorators: [withProviders(true)],
};

// Flag off — must render exactly what ships today.
export const Control: Story = {
  decorators: [withProviders(false)],
};

// Narrow viewport: the share row centres and wraps onto two rows. The native
// "Share via…" chip only appears where `navigator.share` exists.
export const RedesignedMobile: Story = {
  decorators: [withProviders(true)],
  globals: { viewport: { value: 'mobile1' } },
};

// Copying state: the copy chip flips to "Copied!" for a beat. The clipboard is
// stubbed because the Storybook iframe isn't allowed to write to the real one.
export const RedesignedCopying: Story = {
  decorators: [withProviders(true)],
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('social-share-Copy link'));
    await waitFor(() => expect(canvas.getByText('Copied!')).toBeInTheDocument());
  },
};
