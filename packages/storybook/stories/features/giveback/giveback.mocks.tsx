import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';
import type {
  ContributionAction,
  ContributionActionCategory,
  ContributionCause,
  ContributionRewardTier,
  ContributionSponsor,
  ContributionStatus,
} from '@dailydotdev/shared/src/features/giveback/types';
import {
  ContributionRewardType,
  ContributionSponsorTier,
  ContributionSubmissionStatus,
} from '@dailydotdev/shared/src/features/giveback/types';

// A single signed-in user so every giveback query key resolves to the same id.
export const MOCK_USER = {
  id: 'sb-user',
  name: 'Dev Dana',
  username: 'devdana',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  permalink: 'https://app.daily.dev/devdana',
  bio: null,
  createdAt: '2021-01-01T00:00:00.000Z',
  reputation: 42,
  providers: ['github'],
} as const;

const noop = (): void => undefined;

// ---------------------------------------------------------------------------
// Mock data builders. Every builder takes overrides so a story can tweak one
// field (e.g. userPoints) without restating the whole object.
// ---------------------------------------------------------------------------

export const mockStatus = (
  overrides: Partial<ContributionStatus> = {},
): ContributionStatus => ({
  enabled: true,
  eligible: true,
  currentCyclePoints: 8200,
  currentCycleTargetPoints: 12000,
  lifetimePoints: 41000,
  lifetimeAmountCents: 4100000,
  contributorsCount: 1840,
  userPoints: 320,
  ...overrides,
});

export const mockSponsors = (): ContributionSponsor[] => [
  {
    id: 's-vercel',
    name: 'Vercel',
    amountCents: 500000,
    url: 'https://vercel.com',
    logoUrl: 'https://svgl.app/library/vercel_wordmark.svg',
    tier: ContributionSponsorTier.Gold,
  },
  {
    id: 's-stripe',
    name: 'Stripe',
    amountCents: 400000,
    url: 'https://stripe.com',
    logoUrl: 'https://svgl.app/library/stripe_wordmark.svg',
    tier: ContributionSponsorTier.Gold,
  },
  {
    id: 's-sentry',
    name: 'Sentry',
    amountCents: 250000,
    url: 'https://sentry.io',
    logoUrl: 'https://svgl.app/library/sentry.svg',
    tier: ContributionSponsorTier.Silver,
  },
  {
    id: 's-prisma',
    name: 'Prisma',
    amountCents: 120000,
    url: 'https://prisma.io',
    logoUrl: 'https://svgl.app/library/prisma.svg',
    tier: ContributionSponsorTier.Bronze,
  },
  {
    // Logo-less sponsor: exercises the name-fallback path.
    id: 's-dana',
    name: 'Dana K.',
    amountCents: 5000,
    url: null,
    logoUrl: null,
    tier: ContributionSponsorTier.Bronze,
  },
];

export const mockCauses = (): ContributionCause[] => [
  {
    id: 'c-oss',
    title: 'Open-source maintainers',
    description: 'Fund the maintainers behind the tools we use every day.',
    url: null,
    category: 'Open source',
    logoUrl: null,
  },
  {
    id: 'c-scholarships',
    title: 'Dev scholarships',
    description: 'Help students from underrepresented groups learn to code.',
    url: null,
    category: 'Education',
    logoUrl: null,
  },
  {
    id: 'c-access',
    title: 'Access to tech',
    description: 'Get hardware and connectivity to devs who lack it.',
    url: null,
    category: 'Accessibility',
    logoUrl: null,
  },
  {
    id: 'c-climate',
    title: 'Climate tech',
    description: 'Back open tools fighting the climate crisis.',
    url: null,
    category: 'Climate',
    logoUrl: null,
  },
  {
    id: 'c-mentorship',
    title: 'Mentorship programs',
    description: 'Pair early-career devs with experienced mentors.',
    url: null,
    category: 'Education',
    logoUrl: null,
  },
  {
    id: 'c-docs',
    title: 'Better docs',
    description: 'Pay technical writers to improve open-source docs.',
    url: null,
    category: 'Open source',
    logoUrl: null,
  },
];

export const mockCategories = (): ContributionActionCategory[] => [
  { id: 'cat-events', title: 'Events' },
  { id: 'cat-content', title: 'Content' },
];

const action = (overrides: Partial<ContributionAction>): ContributionAction => ({
  id: 'a-default',
  categoryId: 'cat-content',
  title: 'Action',
  description: null,
  points: 100,
  evidence: { url: { required: true }, screenshot: {}, note: {} },
  metadata: {
    platform: null,
    instructions: null,
    externalUrl: null,
    isLoveAction: false,
  },
  cooldownSeconds: null,
  maxPerUser: null,
  userCooldownEndsAt: null,
  userCompletions: 0,
  latestUserSubmission: null,
  ...overrides,
});

export const mockActions = (): ContributionAction[] => [
  action({
    id: 'a-meetup',
    categoryId: 'cat-events',
    title: 'Host a daily.dev meetup',
    description: 'Organize a local dev meetup that features daily.dev.',
    points: 250,
    metadata: {
      platform: 'Events',
      instructions: 'Share photos and the event link.',
      externalUrl: null,
      isLoveAction: false,
    },
  }),
  action({
    id: 'a-speak',
    categoryId: 'cat-events',
    title: 'Speak about daily.dev at an event',
    description: 'Give a talk that features daily.dev in your slides or demo.',
    points: 200,
  }),
  action({
    id: 'a-video',
    categoryId: 'cat-content',
    title: 'Make a video about daily.dev',
    description: 'Create a video or short featuring daily.dev and post it.',
    points: 150,
    metadata: {
      platform: 'YouTube',
      instructions: null,
      externalUrl: null,
      isLoveAction: false,
    },
  }),
  action({
    id: 'a-write',
    categoryId: 'cat-content',
    title: 'Write about daily.dev',
    description: 'Publish an article or blog post featuring daily.dev.',
    points: 120,
    metadata: {
      platform: 'Blog',
      instructions: null,
      externalUrl: null,
      isLoveAction: false,
    },
    // An in-review submission so the catalog shows the "in review" state.
    userCompletions: 1,
    latestUserSubmission: {
      id: 'sub-1',
      actionId: 'a-write',
      status: ContributionSubmissionStatus.Flagged,
      awardedPoints: 0,
      createdAt: '2026-06-20T10:00:00.000Z',
      reviewedAt: null,
    },
  }),
  action({
    id: 'a-podcast',
    categoryId: 'cat-content',
    title: 'Talk about daily.dev on a podcast',
    description: 'Host or guest on a podcast and mention daily.dev.',
    points: 150,
    // Approved: shows the "done" state.
    userCompletions: 1,
    latestUserSubmission: {
      id: 'sub-2',
      actionId: 'a-podcast',
      status: ContributionSubmissionStatus.Approved,
      awardedPoints: 150,
      createdAt: '2026-06-18T10:00:00.000Z',
      reviewedAt: '2026-06-19T10:00:00.000Z',
    },
  }),
  action({
    id: 'a-love',
    categoryId: null,
    title: 'Leave us a kind word',
    description: 'A voluntary thank-you. No reward attached.',
    points: 0,
    evidence: { note: { required: true } },
    metadata: {
      platform: null,
      instructions: null,
      externalUrl: null,
      isLoveAction: true,
    },
  }),
];

export const mockRewardTiers = (): ContributionRewardTier[] => [
  {
    id: 't-cores',
    title: '500 Cores',
    description: 'Spend them on the daily.dev store.',
    thresholdPoints: 100,
    rewardType: ContributionRewardType.Cores,
  },
  {
    id: 't-plus',
    title: '1 month of Plus',
    description: 'Unlock the full daily.dev experience.',
    thresholdPoints: 250,
    rewardType: ContributionRewardType.PlusDays,
  },
  {
    id: 't-call',
    title: 'A call with the team',
    description: 'Shape the product with a 1:1.',
    thresholdPoints: 500,
    rewardType: ContributionRewardType.Call,
  },
  {
    id: 't-privilege',
    title: 'Founding contributor badge',
    description: 'A permanent mark on your profile.',
    thresholdPoints: 1000,
    rewardType: ContributionRewardType.Privilege,
  },
  {
    id: 't-custom',
    title: 'Limited-edition swag',
    description: 'The drop only contributors get.',
    thresholdPoints: 2000,
    rewardType: ContributionRewardType.Custom,
  },
];

// ---------------------------------------------------------------------------
// Providers + query-cache seeding. Pass `null` for a slice to leave it unseeded
// (e.g. status: null + goal 0 drives skeletons). Everything is seeded fresh so
// no real network request is ever made.
// ---------------------------------------------------------------------------

export interface GivebackMockOptions {
  status?: ContributionStatus | null;
  sponsors?: ContributionSponsor[];
  causes?: ContributionCause[];
  selectedCauseIds?: string[];
  actions?: ContributionAction[];
  categories?: ContributionActionCategory[];
  rewardTiers?: ContributionRewardTier[];
  claimedRewardIds?: string[];
}

const GivebackProviders = ({
  children,
  status = mockStatus(),
  sponsors = mockSponsors(),
  causes = mockCauses(),
  selectedCauseIds = [],
  actions = mockActions(),
  categories = mockCategories(),
  rewardTiers = mockRewardTiers(),
  claimedRewardIds = [],
}: GivebackMockOptions & { children: ReactNode }): ReactElement => {
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          staleTime: Infinity,
          gcTime: Infinity,
        },
      },
    });

    client.setQueryData(
      generateQueryKey(RequestKey.ContributionOverview, MOCK_USER),
      {
        contributionStatus: status ?? mockStatus({ currentCycleTargetPoints: 0 }),
        contributionSponsors: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: sponsors.map((node) => ({ node })),
        },
      },
    );

    client.setQueryData(
      generateQueryKey(RequestKey.ContributionCausePicker, MOCK_USER),
      { causes, selectedCauseIds },
    );

    client.setQueryData(
      generateQueryKey(RequestKey.ContributionActions, MOCK_USER),
      { actions, categories, rewardTiers, claimedRewardIds },
    );

    return client;
    // Rebuild only when the story's mock inputs change.
  }, [
    status,
    sponsors,
    causes,
    selectedCauseIds,
    actions,
    categories,
    rewardTiers,
    claimedRewardIds,
  ]);

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={MOCK_USER as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <div className="bg-background-default p-6 text-text-primary">
            {children}
          </div>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

// A decorator factory: `decorators: [withGiveback({ status: ... })]`.
export const withGiveback =
  (options: GivebackMockOptions = {}): Decorator =>
  (Story) =>
    (
      <GivebackProviders {...options}>
        <Story />
      </GivebackProviders>
    );
