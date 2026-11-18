import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import { graphql, HttpResponse } from 'msw';
import { subDays } from 'date-fns';
import { fn } from 'storybook/test';
import { useRouter } from 'next/router';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadHome } from '@dailydotdev/shared/src/features/squads/components/SquadHome';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../../../extension/_providers';
import { squad as data, team } from '../data';
import type { Scenario, ScenarioName } from './scenarios';
import { scenarioPosts, scenarios, sumStats } from './scenarios';

// The company page as it ships, on the production components: the real
// SquadHome (header, composer, feed and right column) inside the app's
// layout, with the API answered per scenario. The free boost card and the
// value panel sit at the top of the feed column for the page's admins.
// squadFreeBoost does not exist in the API yet: its answers here are the
// proposed shape (graphql/squadFreeBoost.ts).

const planFeatures: Record<SquadPlan, Squad['features']> = {
  [SquadPlan.Starter]: {
    indexing: true,
    apiPosting: true,
    links: true,
    products: true,
    agentAnalytics: true,
  } as Squad['features'],
  [SquadPlan.Team]: {
    indexing: true,
    apiPosting: true,
    links: true,
    products: true,
    agentAnalytics: true,
    cta: true,
  } as Squad['features'],
};

const founder = team[0];

const member = (role: SourceMemberRole, user = founder): SourceMember =>
  ({
    role,
    referralToken: 'token',
    permissions:
      role === SourceMemberRole.Admin
        ? Object.values(SourcePermissions)
        : [SourcePermissions.View],
    user: {
      id: role === SourceMemberRole.Admin ? defaultUser.id : user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      permalink: `https://app.daily.dev/${user.username}`,
      reputation: user.reputation,
    },
  }) as unknown as SourceMember;

const toSquad = (scenario: Scenario): Squad => {
  const totals = sumStats(scenario);
  const admin = member(SourceMemberRole.Admin);

  return {
    id: 'coderabbit',
    handle: data.handle,
    name: data.name,
    image: data.image,
    headerImage: data.headerImage,
    permalink: data.permalink,
    description: data.description,
    type: SourceType.Squad,
    public: true,
    active: true,
    // The founder, then everyone the posts brought in
    membersCount: 1 + totals.squadJoins,
    memberPostingRole: SourceMemberRole.Moderator,
    memberInviteRole: SourceMemberRole.Member,
    moderationRequired: false,
    moderationPostCount: 0,
    createdAt: subDays(new Date(), scenario.pageAgeDays),
    category: { id: 'devtools', title: 'Developer tools', slug: 'devtools' },
    website: 'https://www.coderabbit.ai',
    // Extra links are a plan feature
    links: scenario.plan
      ? ['https://github.com/coderabbitai', 'https://x.com/coderabbitai']
      : [],
    rules: [],
    privilegedMembers: [admin],
    currentMember: {
      admin,
      member: member(SourceMemberRole.Member, team[3]),
      visitor: undefined,
    }[scenario.viewer],
    flags: {
      featured: false,
      company: true,
      totalPosts: scenario.posts.length,
      totalViews: totals.impressions,
      totalUpvotes: totals.upvotes,
      totalAwards: 0,
    },
    features: scenario.plan ? planFeatures[scenario.plan] : {},
  } as unknown as Squad;
};

const handlers = (scenario: Scenario) => {
  const squad = toSquad(scenario);
  const posts = scenarioPosts(scenario, squad);
  const totals = sumStats(scenario);

  return [
    graphql.query('SourceFeed', () =>
      HttpResponse.json({
        data: {
          page: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: posts.map((node) => ({ node })),
          },
        },
      }),
    ),
    graphql.query('SquadFreeBoost', () =>
      HttpResponse.json({ data: { squadFreeBoost: scenario.freeBoost } }),
    ),
    graphql.query('PostAnalytics', ({ variables }) => {
      const index = posts.findIndex((post) => post.id === variables.id);
      const stats = scenario.posts[index]?.stats;

      return HttpResponse.json({
        data: {
          postAnalytics: {
            id: variables.id,
            impressions: stats?.impressions ?? 0,
            reach: stats?.reach ?? 0,
            bookmarks: stats?.bookmarks ?? 0,
            clicks: stats?.clicks ?? 0,
            squadJoins: stats?.squadJoins ?? 0,
            upvotes: stats?.upvotes ?? 0,
            comments: stats?.comments ?? 0,
            impressionsAds: 0,
            reachAds: 0,
          },
        },
      });
    }),
    graphql.query('SquadAnalytics', () =>
      HttpResponse.json({
        data: {
          squadAnalytics: {
            id: squad.id,
            impressions: totals.impressions,
            reach: totals.reach,
            upvotes: totals.upvotes,
            downvotes: 0,
            comments: totals.comments,
            bookmarks: totals.bookmarks,
            awards: 0,
            shares: 0,
            clicks: totals.clicks,
            upvotesRatio: totals.upvotes ? 100 : 0,
            agentViews: scenario.plan ? 212 : null,
            agentViewsBot: scenario.plan ? 1340 : null,
          },
        },
      }),
    ),
    graphql.query('SquadAnalyticsHistory', () =>
      HttpResponse.json({ data: { squadAnalyticsHistory: [] } }),
    ),
    graphql.query('SquadSubscription', () =>
      HttpResponse.json({
        data: {
          squadSubscription: {
            plan: scenario.plan,
            status: scenario.plan ? 'active' : 'none',
            seatLimit: 1,
            seatsUsed: 1,
            ownerId: defaultUser.id,
            cashbackPercentage: scenario.plan ? 500 : 0,
            cashbackPromoEndsAt: null,
            renewsAt: null,
            scheduledPlan: null,
            downgradeAvailableAt: null,
          },
        },
      }),
    ),
    graphql.query('StartupsCashbackPromo', () =>
      HttpResponse.json({
        data: { startupsCashbackPromo: { percentage: 500, months: 12 } },
      }),
    ),
    graphql.query('DeveloperTrends', () =>
      HttpResponse.json({
        data: {
          developerTrends: {
            weekStart: '2026-11-09',
            weekEnd: '2026-11-15',
            risingTopics: [
              { tag: 'tailscale', multiple: 4.2, broad: false },
              { tag: 'rust', multiple: 2.0, broad: true },
              { tag: 'ollama', multiple: 1.9, broad: false },
              { tag: 'ai-agents', multiple: 1.6, broad: true },
            ],
            formats: [{ format: 'First-person build titles', comments: 2.9 }],
          },
        },
      }),
    ),
  ];
};

/** Seeds what the squad route would have loaded before the page renders. */
const Seeded = ({
  squad,
  children,
}: {
  squad: Squad;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const seed = () => {
    client.setQueryData(
      squadMembersPreviewQueryOptions({ squad }).queryKey,
      [],
    );
    [undefined, user].forEach((who) => {
      const squadKey = generateQueryKey(RequestKey.Squad, who, squad.handle);
      client.setQueryData(squadKey, squad);
      client.setQueryDefaults(squadKey, { staleTime: Infinity });
      const brandingKey = squadBrandingQueryOptions({
        squad,
        user: who,
      }).queryKey;
      client.setQueryData(brandingKey, { color: null, button: null });
      client.setQueryDefaults(brandingKey, { staleTime: Infinity });
      const productsKey = squadProductsQueryOptions({
        squad,
        user: who,
      }).queryKey;
      client.setQueryData(productsKey, []);
      client.setQueryDefaults(productsKey, { staleTime: Infinity });
    });
  };
  useState(() => {
    seed();
    return true;
  });
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SquadPageContextProvider squad={squad} isViewerReady>
      {children}
    </SquadPageContextProvider>
  );
};

const Page = ({ name }: { name: ScenarioName }): ReactElement => {
  const squad = toSquad(scenarios[name]);

  return (
    <MainLayout canGoBack="/squads">
      <Seeded squad={squad}>
        <SquadHome searchQuery="" onClearSearch={() => undefined} />
      </Seeded>
    </MainLayout>
  );
};

const meta: Meta = {
  title: 'Features/Squads/Company page (free tier)',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    // The squad page's own route, which the layout and the page read
    (useRouter as unknown as ReturnType<typeof fn>).mockReturnValue({
      replace: fn(),
      push: fn(),
      route: '/squads/[handle]',
      pathname: '/squads/[handle]',
      asPath: `/squads/${data.handle}`,
      query: { handle: data.handle },
      isReady: true,
      events: { on: fn(), off: fn() },
    });
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const story = (name: ScenarioName): Story => ({
  render: () => <Page name={name} />,
  parameters: { msw: { handlers: handlers(scenarios[name]) } },
});

/** 1. Before the first post: the card offers the free $100 boost. */
export const BeforeFirstPost = story('noPostYet');
/** 2. Boosting: from the first post until the day-long boost ends. */
export const Boosting = story('boostLive');
/** 3. Free page after the boost: the value panel with the one upgrade offer. */
export const FreeAfterBoost = story('afterBoost');
/** 4. Paid page: the value panel, no offer. */
export const PaidPage = story('paidPage');
