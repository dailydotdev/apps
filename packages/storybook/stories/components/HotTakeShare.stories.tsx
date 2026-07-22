import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { HotTakeItem } from '@dailydotdev/shared/src/features/profile/components/hotTakes/HotTakeItem';
import { HotTakeCard } from '@dailydotdev/shared/src/components/modals/hotTakes/HotAndColdModal';
import { PopularHotTakesList } from '@dailydotdev/shared/src/components/cards/Leaderboard/PopularHotTakesList';
import type { HotTake } from '@dailydotdev/shared/src/graphql/user/userHotTake';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
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

const hotTake: HotTake = {
  id: 'take-1',
  emoji: '🔥',
  title: 'Code reviews longer than 20 minutes are a management failure',
  subtitle: 'Small PRs or bust',
  position: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  upvotes: 42,
  upvoted: false,
};

const modalTake: HotTake = {
  ...hotTake,
  id: 'take-2',
  user: {
    id: '2',
    name: 'Spicy Dev',
    username: 'spicydev',
    image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
    permalink: 'https://daily.dev/spicydev',
    bio: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    reputation: 1337,
    companies: [],
    isPlus: false,
  } as unknown as HotTake['user'],
};

const popularItems = [
  {
    score: 1,
    hotTake: {
      id: 'p-1',
      title: 'TypeScript strict mode should be the default everywhere',
      subtitle: 'by @spicydev',
      emoji: '🧨',
    },
    user: { username: 'spicydev' },
  },
  {
    score: 2,
    hotTake: {
      id: 'p-2',
      title: 'Monorepos are a people problem, not a tooling problem',
      subtitle: null,
      emoji: '🌶️',
    },
    user: { username: 'testuser' },
  },
];

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// evaluate as `false` here. Flag-off is therefore simulated by holding the
// features context "not ready" — the exact path `useConditionalFeature` takes
// to fall back to the (false) default. Jest is the real flag-off guarantee.
const withProviders =
  (enabled: boolean, user: LoggedUser | undefined = mockUser) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user,
              isLoggedIn: !!user,
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
            user={user ?? mockUser}
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
                <div className="mx-auto w-full max-w-[26rem] p-4">
                  <Story />
                </div>
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta = {
  title: 'Components/Share/HotTakeShare',
  parameters: {
    docs: {
      description: {
        component:
          'Share affordances on the hot-take surfaces (`share_hot_takes` + the `sharing_visibility` master flag): profile list item, profile section header, the Hot & Cold modal card, and the popular hot takes leaderboard. All share the one `HotTakeShareControl`, deep-linking to the hot-takes section of the owner profile.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Flag on — profile list item with the share control in the action area. All
// boolean flags read truthy under the Storybook GrowthBook mock, so the item
// wrapper resolves to the V2 engagement-bar variant here.
export const ProfileItem: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <HotTakeItem
      item={hotTake}
      isOwner={false}
      ownerUsername="spicydev"
      onUpvoteClick={fn()}
    />
  ),
};

// V1 variant of the item: the engagement-bar flag is only evaluated for
// authenticated users, so rendering without a user keeps V1 while the share
// flag (evaluated regardless) stays on.
export const ProfileItemV1: Story = {
  decorators: [withProviders(true, undefined)],
  render: () => (
    <HotTakeItem
      item={hotTake}
      isOwner={false}
      ownerUsername="spicydev"
      onUpvoteClick={fn()}
    />
  ),
};

// Flag off — must render exactly what ships today (no share control).
export const ProfileItemControl: Story = {
  decorators: [withProviders(false)],
  render: () => (
    <HotTakeItem
      item={hotTake}
      isOwner={false}
      ownerUsername="spicydev"
      onUpvoteClick={fn()}
    />
  ),
};

// The Hot & Cold modal card with the share control pinned top-right. Only the
// top card of the swipe stack gets a live control.
export const ModalCard: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <div className="relative h-[28rem] w-full">
      <HotTakeCard
        hotTake={modalTake}
        isTop
        offset={0}
        swipeDelta={0}
        skipDeltaY={0}
        isDismissAnimating={false}
        isDragging={false}
        dismissDurationMs={340}
      />
    </div>
  ),
};

// The popular hot takes leaderboard card with a header share for the board.
export const PopularList: Story = {
  decorators: [withProviders(true)],
  render: () => (
    <PopularHotTakesList
      containerProps={{ title: 'Most popular hot takes' }}
      items={popularItems}
      isLoading={false}
    />
  ),
};

// Flag off — the leaderboard card keeps its stock heading, byte-identical to
// the version without this PR.
export const PopularListControl: Story = {
  decorators: [withProviders(false)],
  render: () => (
    <PopularHotTakesList
      containerProps={{ title: 'Most popular hot takes' }}
      items={popularItems}
      isLoading={false}
    />
  ),
};
