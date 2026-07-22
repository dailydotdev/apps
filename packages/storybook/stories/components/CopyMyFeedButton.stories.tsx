import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CopyMyFeedButton } from '@dailydotdev/shared/src/components/feeds/CopyMyFeedButton';
import { buildFeedDigest } from '@dailydotdev/shared/src/hooks/feed/useCopyMyFeed';
import type { FeedItemData } from '@dailydotdev/shared/src/graphql/feed';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { generateQueryKey } from '@dailydotdev/shared/src/lib/query';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities';
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

const samplePosts = [
  {
    id: 'p1',
    title: 'The pragmatic guide to shipping fast without breaking prod',
    commentsPermalink: 'https://app.daily.dev/posts/p1',
  },
  {
    id: 'p2',
    title: 'Postgres indexing mistakes that cost us 400ms per query',
    commentsPermalink: 'https://app.daily.dev/posts/p2',
  },
  {
    id: 'p3',
    title: 'Why we moved our monorepo to pnpm (and what broke)',
    commentsPermalink: 'https://app.daily.dev/posts/p3',
  },
] as Post[];

const feedPage: FeedItemData = {
  page: {
    pageInfo: { hasNextPage: true, endCursor: 'cursor' },
    edges: samplePosts.map((post) => ({
      node: { itemType: 'post', post, feedMeta: null },
    })),
  },
};

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// be evaluated as `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
const withProviders =
  (enabled: boolean, seedFeed: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    if (seedFeed) {
      // The button prefix-matches `[feedName, userId, ...variables]`, exactly
      // how `MainFeedLayout` keys the feed query it renders.
      queryClient.setQueryData(
        generateQueryKey(SharedFeedPage.MyFeed, mockUser, 'popularity'),
        { pages: [feedPage], pageParams: [''] },
      );
    }

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
          <ActiveFeedNameContext.Provider
            value={{ feedName: SharedFeedPage.MyFeed }}
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
                  <div className="flex flex-col items-start gap-4 p-4">
                    <Story />
                  </div>
                </LogContext.Provider>
              </FeaturesReadyContext.Provider>
            </GrowthBookProvider>
          </ActiveFeedNameContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof CopyMyFeedButton> = {
  title: 'Components/Share/CopyMyFeedButton',
  component: CopyMyFeedButton,
  parameters: {
    docs: {
      description: {
        component:
          'Feed-nav "Copy my feed" affordance (`share_copy_my_feed`, also gated by the `sharing_visibility` master flag). Copies — or natively shares on mobile — a Slack-pasteable text digest of the top ~20 posts loaded in the active feed, one bullet per post with a tracked link.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CopyMyFeedButton>;

// Flag on, feed loaded — the enabled button next to a preview of the exact
// text it produces (untracked links; the real button appends tracking params).
export const FeedLoaded: Story = {
  decorators: [withProviders(true, true)],
  render: () => (
    <>
      <CopyMyFeedButton />
      <pre className="whitespace-pre-wrap rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
        {buildFeedDigest(samplePosts)}
      </pre>
    </>
  ),
};

// Flag on but nothing loaded in the active feed yet — the button disables
// itself so users can never copy an empty digest.
export const EmptyFeed: Story = {
  decorators: [withProviders(true, false)],
};

// Flag off — must render exactly what ships today: nothing.
export const Control: Story = {
  decorators: [withProviders(false, true)],
};

// Clicking copies the digest to the clipboard. The clipboard is stubbed
// because the Storybook iframe isn't allowed to write to the real one.
export const CopyInteraction: Story = {
  decorators: [withProviders(true, true)],
  play: async ({ canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Copy my feed'));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    await expect(writeText.mock.calls[0][0]).toContain(samplePosts[0].title);
  },
};
