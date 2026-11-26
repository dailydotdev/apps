import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import { graphql, HttpResponse } from 'msw';
import { addDays, subDays } from 'date-fns';
import { fn, within } from 'storybook/test';
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
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../../../extension/_providers';
import { defaultBootData, getBootMock } from '../../../../mock/boot';
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

const toSquad = (scenario: Scenario, isFinished = false): Squad => {
  const totals = sumStats(scenario);
  const admin = member(SourceMemberRole.Admin);
  const page =
    isFinished || !scenario.page
      ? { logo: true, website: true, cover: true }
      : scenario.page;

  return {
    id: 'coderabbit',
    handle: data.handle,
    name: data.name,
    image: page.logo ? data.image : '/squad-page/squad_placeholder.svg',
    headerImage: page.cover ? data.headerImage : undefined,
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
    website: page.website ? 'https://www.coderabbit.ai' : undefined,
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

// The numbers the API keeps with an intel, in the shape it stores them
const intelData = {
  totals: { posts: 4812, readers: 38_420 },
  topics: [
    {
      tag: 'ai-agents',
      share: 41.2,
      change: 12,
      competition: 'crowded',
      reads: 118,
      bookmarks: 126,
      topTenthShare: 81,
    },
    {
      tag: 'code-review',
      share: 18.6,
      change: 27,
      competition: 'open',
      reads: 164,
      bookmarks: 197,
      topTenthShare: 74,
    },
    {
      tag: 'github',
      share: 14.1,
      change: -8,
      competition: 'moderate',
      reads: 97,
      bookmarks: 92,
      topTenthShare: 78,
    },
    {
      tag: 'testing',
      share: 11.3,
      change: null,
      competition: 'open',
      reads: 121,
      bookmarks: 140,
      topTenthShare: null,
    },
    {
      tag: 'devops',
      share: 8.9,
      change: -15,
      competition: 'crowded',
      reads: 74,
      bookmarks: 66,
      topTenthShare: 85,
    },
    {
      tag: 'security',
      share: 5.9,
      change: 0,
      competition: null,
      reads: 102,
      bookmarks: null,
      topTenthShare: null,
    },
  ],
  adjacentTags: [
    { tag: 'cursor', reach: 14, lift: 2.6, change: 22 },
    { tag: 'llm', reach: 19, lift: 2.2, change: 9 },
    { tag: 'mcp', reach: 8, lift: 2.1, change: null },
    { tag: 'developer-experience', reach: 11, lift: 1.7, change: 31 },
    { tag: 'typescript', reach: 21, lift: 1.4, change: -6 },
  ],
  topPosts: [
    {
      title:
        'We let an agent review 2,000 pull requests. Here is what it missed',
      source: 'Engineering blog',
      readsVsAverage: 38.4,
      upvotes: 412,
      comments: 57,
      url: '#post-1',
      image: '/squad-page/coderabbit-banner.jpg',
    },
    {
      title:
        'Code review checklists are dead. Long live code review checklists',
      source: 'Personal blog',
      readsVsAverage: 21.7,
      upvotes: 233,
      comments: 41,
      url: '#post-2',
      image: null,
    },
    {
      title: 'How we cut our PR review time from 2 days to 3 hours',
      source: 'Engineering blog',
      readsVsAverage: 17.2,
      upvotes: 198,
      comments: 22,
      url: '#post-3',
    },
  ],
  risingTags: [
    { tag: 'mcp', change: 64 },
    { tag: 'code-review', change: 27 },
    { tag: 'cursor', change: 22 },
  ],
  newTags: ['agent-evals', 'pr-bots'],
  fewPostsManyReaders: [
    { tag: 'flaky-tests', reads: 310, posts: 6 },
    { tag: 'merge-queues', reads: 240, posts: 9 },
  ],
  mostBookmarked: [
    {
      title: 'A field guide to reviewing AI-written pull requests',
      source: 'Personal blog',
      url: '#bookmarked-1',
      bookmarkRateVsAverage: 4.2,
    },
    {
      title: 'The test pyramid we actually use, with numbers',
      source: 'Engineering blog',
      url: '#bookmarked-2',
      bookmarkRateVsAverage: 3.1,
    },
  ],
  discussions: [
    {
      title: 'Should agents be allowed to approve pull requests?',
      source: 'Engineering blog',
      url: '#discussed-1',
      comment:
        'We tried it for a month. The agent approved everything that passed CI, which is exactly the review we did not need.',
    },
    {
      title: 'Our code review rules, two years later',
      source: 'Personal blog',
      url: '#discussed-2',
      comment:
        'The rule that stuck was the smallest one: every PR says what you did not test.',
    },
  ],
  formats: [
    {
      label: 'First-person build story',
      posts: 84,
      reads: 231,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Benchmark or numbers',
      posts: 41,
      reads: 178,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'How-to or tutorial',
      posts: 212,
      reads: 126,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Comparison',
      posts: 37,
      reads: 119,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Opinion',
      posts: 96,
      reads: 88,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Release announcement',
      posts: 143,
      reads: 52,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Listicle',
      posts: 58,
      reads: 47,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  titleTypes: [
    {
      label: 'Has a number',
      posts: 318,
      reads: 164,
      upvotes: null,
      comments: null,
      bookmarks: null,
      example: 'How we cut PR review time from 2 days to 3 hours',
    },
    {
      label: 'First person',
      posts: 205,
      reads: 152,
      upvotes: null,
      comments: null,
      bookmarks: null,
      example: 'I let an agent review my code for a week',
    },
    {
      label: 'Question',
      posts: 121,
      reads: 81,
      upvotes: null,
      comments: null,
      bookmarks: null,
      example: 'Is code review still worth it?',
    },
    {
      label: 'Product name first',
      posts: 167,
      reads: 58,
      upvotes: null,
      comments: null,
      bookmarks: null,
      example: 'Acme 2.4: faster reviews',
    },
  ],
  titleLengths: [
    {
      label: 'Under 40 characters',
      posts: 402,
      reads: 91,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: '40 to 70 characters',
      posts: 1288,
      reads: 118,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Over 70 characters',
      posts: 531,
      reads: 84,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  properties: [
    {
      label: 'Shows real code or data',
      posts: 611,
      reads: 172,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Tells what went wrong',
      posts: 147,
      reads: 158,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Teaches one thing',
      posts: 930,
      reads: 121,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Mostly about the company',
      posts: 288,
      reads: 43,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  publishing: [
    {
      label: 'Written on daily.dev',
      posts: 96,
      reads: 142,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Linked from a blog',
      posts: 3911,
      reads: 97,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'With a cover image',
      posts: 3104,
      reads: 108,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Without a cover image',
      posts: 903,
      reads: 71,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  tagPairs: {
    above: [
      {
        label: '#code-review + #testing',
        posts: 38,
        reads: 188,
        upvotes: null,
        comments: null,
        bookmarks: null,
      },
      {
        label: '#ai-agents + #security',
        posts: 27,
        reads: 161,
        upvotes: null,
        comments: null,
        bookmarks: null,
      },
    ],
    below: [
      {
        label: '#ai-agents + #devops',
        posts: 44,
        reads: 69,
        upvotes: null,
        comments: null,
        bookmarks: null,
      },
    ],
  },
  nativePosts: [
    {
      label: 'With code blocks',
      posts: 31,
      reads: 167,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'With images',
      posts: 48,
      reads: 139,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Text only',
      posts: 17,
      reads: 72,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  readTime: [
    {
      label: 'Under 3 minutes',
      posts: 1104,
      reads: 82,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: '3 to 7 minutes',
      posts: 2207,
      reads: 121,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
    {
      label: 'Over 7 minutes',
      posts: 698,
      reads: 109,
      upvotes: null,
      comments: null,
      bookmarks: null,
    },
  ],
  decay: [
    { tag: 'ai-agents', day1: 52, days2to3: 26, days4to7: 15, days8to14: 7 },
    { tag: 'code-review', day1: 38, days2to3: 27, days4to7: 21, days8to14: 14 },
    { tag: 'testing', day1: 34, days2to3: 25, days4to7: 23, days8to14: 18 },
  ],
  readingDays: [17, 19, 18, 16, 13, 8, 9].map((share, index) => ({
    label: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ][index],
    share,
  })),
  publishDays: [
    { label: 'Monday', index: 104 },
    { label: 'Tuesday', index: 131 },
    { label: 'Wednesday', index: 112 },
    { label: 'Thursday', index: 98 },
    { label: 'Friday', index: 86 },
    { label: 'Saturday', index: 61 },
    { label: 'Sunday', index: 72 },
  ],
  publishHours: [
    { label: '09:00-12:00', index: 108 },
    { label: '12:00-15:00', index: 117 },
    { label: '15:00-18:00', index: 126 },
    { label: '18:00-21:00', index: 94 },
  ],
};

const developerTrends = {
  weekStart: '2026-11-16T00:00:00.000Z',
  weekEnd: '2026-11-23T00:00:00.000Z',
  summary:
    '#mcp more than doubled as new servers kept shipping, and #rust kept climbing. Readers wanted proof over promises: build stories and benchmarks beat every other format. Front-end frameworks cooled.',
  risingTopics: [
    {
      tag: 'mcp',
      multiple: 2.4,
      broad: true,
      note: 'new servers for databases and browsers, and guides to writing your own',
    },
    {
      tag: 'rust',
      multiple: 1.7,
      broad: true,
      note: 'rewrites of command line tools and a faster package manager',
    },
    {
      tag: 'webassembly',
      multiple: 1.3,
      broad: true,
      note: 'running plugins safely inside other apps',
    },
    { tag: 'postgres', multiple: 2.9, broad: false, note: 'single story' },
  ],
  coolingTopics: [
    { tag: 'angular', multiple: 0.52, broad: null, note: null },
    { tag: 'blockchain', multiple: 0.6, broad: null, note: null },
    { tag: 'css', multiple: 0.71, broad: null, note: null },
  ],
  underserved: [
    { tag: 'self-hosting', multiple: 3.2 },
    { tag: 'observability', multiple: 2.4 },
    { tag: 'sqlite', multiple: 1.8 },
  ],
  crowded: [
    { tag: 'llm', multiple: 0.24 },
    { tag: 'python', multiple: 0.31 },
  ],
  formats: [
    {
      format: 'first-person build ("I built", "we built")',
      reads: 2.0,
      bookmarks: 2.4,
      upvotes: 2.2,
      comments: 2.1,
    },
    {
      format: 'benchmark or numbers',
      reads: 1.6,
      bookmarks: 2.2,
      upvotes: 1.8,
      comments: 1.4,
    },
    {
      format: 'how-to / explainer',
      reads: 1.2,
      bookmarks: 2.0,
      upvotes: 1.5,
      comments: 0.8,
    },
    {
      format: 'question title',
      reads: 0.8,
      bookmarks: 0.5,
      upvotes: 0.6,
      comments: 1.1,
    },
  ],
  examples: [
    {
      pattern:
        'a small open-source tool that replaced a paid one, titled by what it does',
      counterExample: false,
      upvotes: 71,
      comments: 6,
      note: 'it listed what it leaves out, which answered the obvious questions up front',
      url: '#example-1',
    },
    {
      pattern: 'a postmortem of a slow database migration, with the numbers',
      counterExample: false,
      upvotes: 54,
      comments: 9,
      note: 'a failure many teams have hit, explained step by step',
      url: '#example-2',
    },
    {
      pattern: 'a release link titled only by its version number',
      counterExample: true,
      upvotes: 8,
      comments: 1,
      note: 'shown widely, rarely opened: the version number gave no reason to click',
      url: '#example-3',
    },
  ],
};

const handlers = (scenario: Scenario) => {
  const squad = toSquad(scenario);
  const posts = scenarioPosts(scenario, squad);
  const totals = sumStats(scenario);

  return [
    graphql.query('CompletedUserActions', () =>
      HttpResponse.json({ data: { actions: [] } }),
    ),
    graphql.mutation('CompleteAction', () =>
      HttpResponse.json({ data: { completeAction: { _: true } } }),
    ),
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
    graphql.query('SquadIntelHighlights', () =>
      HttpResponse.json({
        data: {
          squadIntel: scenario.trialEnded
            ? null
            : {
                weekStart: '2026-11-16T00:00:00.000Z',
                weekEnd: '2026-11-23T00:00:00.000Z',
                trial: scenario.plan
                  ? null
                  : {
                      endsAt: addDays(new Date(), 6).toISOString(),
                      pickedFrom: 'coderabbit.ai',
                    },
                data: intelData,
              },
        },
      }),
    ),
    graphql.query('DeveloperTrends', () =>
      HttpResponse.json({ data: { developerTrends: developerTrends } }),
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
  const scenario: Scenario = scenarios[name];
  const [isFinished, setFinished] = useState(false);
  const squad = toSquad(scenario, isFinished);

  useEffect(() => {
    if (!scenario.finishSetupAfterMs) {
      return undefined;
    }

    const timer = setTimeout(
      () => setFinished(true),
      scenario.finishSetupAfterMs,
    );

    return () => clearTimeout(timer);
  }, [scenario.finishSetupAfterMs]);

  return (
    <MainLayout canGoBack="/squads">
      <Seeded squad={squad}>
        <SquadHome searchQuery="" onClearSearch={() => undefined} />
      </Seeded>
      <LazyModalElement />
    </MainLayout>
  );
};

const meta: Meta = {
  title: 'Features/Squads/Company page first post',
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
        {/* react-modal mounts the composer next to the app root */}
        <div id="__next">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const profileCompletion = (scenario: Scenario) => {
  const profile = {
    photo: true,
    headline: true,
    job: true,
    ...scenario.profile,
  };

  return {
    percentage: 60,
    hasProfileImage: profile.photo,
    hasHeadline: profile.headline,
    hasExperienceLevel: true,
    hasWork: profile.job,
    hasEducation: false,
  };
};

const story = (name: ScenarioName): Story => ({
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: {
        ...defaultBootData.user,
        profileCompletion: profileCompletion(scenarios[name]),
      },
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  },
  render: () => <Page name={name} />,
  parameters: { msw: { handlers: handlers(scenarios[name]) } },
});

/** 1. Minutes after sign-up: no logo or website yet, nothing posted. */
export const NewPage = story('newPage');
/** 2. The page is ready for its boost, nothing posted yet. */
export const ReadyNoPost = story('readyNoPost');
/** 2b. "Create something new" open: the intel that helps pick a topic. */
export const CreateSomethingNew: Story = {
  ...story('readyNoPost'),
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByText(
      'Find a topic',
      {},
      { timeout: 60_000 },
    );
    button.click();
  },
};
/** 2c. A free page after its one trial intel: the general trends. */
export const TrendsAfterTrial: Story = {
  ...story('trialEnded'),
  play: CreateSomethingNew.play,
};
/** 3. The admin finishes the last setup rows while the page is open. */
export const SetupDone = story('setupDone');
/** 4. Boosting: from the first post until the day-long boost ends. */
export const Boosting = story('boostLive');
/** 5. Free page after the boost: the value panel with the one upgrade offer. */
export const FreeAfterBoost = story('afterBoost');
/** 6. Paid page: the value panel, no offer. */
export const PaidPage = story('paidPage');
