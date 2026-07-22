import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LeaderboardRankCard,
  LeaderboardRankShare,
} from '@dailydotdev/shared/src/components/cards/Leaderboard/LeaderboardRankShare';
import { LeaderboardShareControl } from '@dailydotdev/shared/src/components/cards/Leaderboard/LeaderboardShareButton';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard/UserTopList';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { LeaderboardType } from '@dailydotdev/shared/src/graphql/leaderboard';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { fn } from 'storybook/test';

const mockUser = {
  id: '1',
  name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/ada',
  reputation: 420,
} as unknown as LoggedUser;

/**
 * The repo-wide GrowthBook storybook mock returns `value || 'control'`, so a
 * `false` default reads back as the truthy string 'control' and every flag
 * looks ON. These stories therefore never assert a flag: the ON states render
 * the presentational components directly, and the control state holds
 * `FeaturesReadyContext` as not-ready, which is the one reliable way to force
 * `useConditionalFeature` back to the default here. Jest owns the real
 * flag-off guarantee (`useLeaderboardShareEnabled.spec.tsx`).
 */
const withProviders =
  ({ featuresReady = true }: { featuresReady?: boolean } = {}) =>
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
              user: mockUser,
              isLoggedIn: true,
              isAuthReady: true,
              shouldShowLogin: false,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              tokenRefreshed: true,
              getRedirectUri: fn(),
              refetchBoot: fn(),
              squads: [],
            } as never
          }
        >
          <FeaturesReadyContext.Provider
            value={{
              ready: featuresReady,
              getFeatureValue: (feature) => feature.defaultValue as never,
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
              <div className="mx-auto w-full max-w-screen-tablet p-4">
                <Story />
              </div>
            </LogContext.Provider>
          </FeaturesReadyContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-tertiary typo-footnote">{children}</p>
);

const meta: Meta<typeof LeaderboardRankCard> = {
  title: 'Components/Share/LeaderboardShare',
  component: LeaderboardRankCard,
  args: { type: LeaderboardType.LongestStreak, rank: 12 },
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(LeaderboardType),
    },
    rank: { control: { type: 'number', min: 1 } },
  },
  decorators: [withProviders()],
};

export default meta;

type Story = StoryObj<typeof LeaderboardRankCard>;

// The headline affordance: the viewer's own rank, with the exact text that
// will be shared spelled out underneath it.
export const OwnRank: Story = {};

// Top three earns the medal badge and the cheekier line.
export const OwnRankTopThree: Story = {
  args: { rank: 2 },
};

// Four figures — the rank stays legible thanks to tabular numerals.
export const OwnRankDeep: Story = {
  args: { rank: 1487 },
};

export const RankShareByLeaderboard: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <LeaderboardRankCard
        {...args}
        type={LeaderboardType.LongestStreak}
        rank={3}
      />
      <LeaderboardRankCard
        {...args}
        type={LeaderboardType.HighestReputation}
        rank={58}
      />
      <LeaderboardRankCard
        {...args}
        type={LeaderboardType.MostReadingDays}
        rank={204}
      />
    </div>
  ),
};

// Unranked / still loading / control all resolve to the same thing: nothing.
// `LeaderboardRankShare` is the gated component, so with features held
// not-ready it renders the control variant.
export const NoRankOrFlagOff: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <LeaderboardRankShare type={LeaderboardType.LongestStreak} />
      <Note>
        Unranked (rank past the cap), still loading, or flag off — the rank card
        renders nothing and the page keeps its current layout.
      </Note>
    </div>
  ),
  decorators: [withProviders({ featuresReady: false })],
};

const leaderboardItems = [
  { score: 96, user: { ...mockUser, id: '1', username: 'ada' } },
  { score: 74, user: { ...mockUser, id: '2', username: 'grace' } },
  { score: 51, user: { ...mockUser, id: '3', username: 'linus' } },
];

// Directory surface: each leaderboard card on /users gets its own share
// control next to the card title.
export const DirectoryCard: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <UserTopList
        containerProps={{
          title: 'Longest streak',
          titleHref: `/users/${LeaderboardType.LongestStreak}`,
          titleAction: (
            <LeaderboardShareControl type={LeaderboardType.LongestStreak} />
          ),
        }}
        items={leaderboardItems}
        isLoading={false}
        concatScore={false}
      />
      <UserTopList
        containerProps={{
          title: 'Longest streak',
          titleHref: `/users/${LeaderboardType.LongestStreak}`,
        }}
        items={leaderboardItems}
        isLoading={false}
        concatScore={false}
      />
      <Note>
        Top: sharing on. Bottom: control — no title action is passed, so the
        heading keeps its original markup.
      </Note>
    </div>
  ),
};
