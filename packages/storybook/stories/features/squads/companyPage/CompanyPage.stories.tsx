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
    links: [],
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

const phone = (base: Story): Story => ({
  ...base,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
});

/** 1. Day 0: the page exists, nothing posted yet. */
export const NoPostYet = story('noPostYet');
/** 2. The first post is live; the boost starts once its checks pass. */
export const CheckingPost = story('checkingPost');
/** 3. The first post was held back for limited reach: the next post gets the boost. */
export const PostHeldBack = story('postHeldBack');
/** 4. The boost started minutes ago, before the first numbers. */
export const BoostStarting = story('boostStarting');
/** 5. Mid-day: impressions lead, the money spent below. */
export const BoostLive = story('boostLive');
/** 6. The last hour of the boost. */
export const BoostEnding = story('boostEnding');
/** 7. Day 2, the upgrade moment: the results and the one offer on the page. */
export const BoostEnded = story('boostEnded');
/** 8. Day 2, a post with few clicks and no Bookmarks or followers: those tiles hide. */
export const BoostEndedWeak = story('boostEndedWeak');
/** 9. Day 10: the boost card is gone, the value panel takes over. */
export const OrganicOnly = story('organicOnly');
/** 10. Over 30 days old and never boosted: no card, the panel's offer only. */
export const OfferExpired = story('offerExpired');
/** 11. On Starter: no free boost, no offer. */
export const PaidPage = story('paidPage');
/** 12. A member during the boost: nothing admin-only shows. */
export const MemberDuringBoost = story('memberDuringBoost');
/** 13. A visitor during the boost. */
export const VisitorDuringBoost = story('visitorDuringBoost');

export const NoPostYetPhone = phone(NoPostYet);
export const CheckingPostPhone = phone(CheckingPost);
export const PostHeldBackPhone = phone(PostHeldBack);
export const BoostLivePhone = phone(BoostLive);
export const BoostEndedPhone = phone(BoostEnded);
export const OrganicOnlyPhone = phone(OrganicOnly);
