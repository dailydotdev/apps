import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Decorator } from '@storybook/react-vite';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  squadAnalyticsHistoryQueryOptions,
  squadAnalyticsQueryOptions,
  squadMembersPreviewQueryOptions,
} from '@dailydotdev/shared/src/graphql/squads';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import type { SquadJob, SquadPerk } from './app/graphql/squadJobsPerks';
import {
  SquadJobEmploymentType,
  SquadJobWorkplace,
  SquadPerkCodeKind,
  squadJobQueryOptions,
  squadJobsPerksFeaturesQueryOptions,
  squadJobsQueryOptions,
  squadPerkQueryOptions,
  squadPerksQueryOptions,
} from './app/graphql/squadJobsPerks';
import type {
  SquadAudience,
  SquadWelcome,
} from './app/graphql/squadWelcomeAudience';
import {
  emptySquadWelcome,
  squadAudienceQueryOptions,
  squadWelcomeQueryOptions,
} from './app/graphql/squadWelcomeAudience';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { hasSquadFeature } from './app/features/squads/lib/features';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import ExtensionProviders from '../../../extension/_providers';
import { squad as data, team } from '../../../squad-page/data';

// One CodeRabbit squad with every parked feature switched on, seen as a
// visitor, a member or an admin. Every query the pages read is seeded, so
// the stories render the production components without the API.

/* ------------------------------------------------------------ viewers */

const member = (index: number, role: SourceMemberRole): SourceMember =>
  ({
    role,
    referralToken: 'token',
    user: {
      id: team[index].id,
      name: team[index].name,
      username: team[index].username,
      image: team[index].image,
      permalink: `https://app.daily.dev/${team[index].username}`,
      reputation: team[index].reputation,
    },
  } as unknown as SourceMember);

export const rules = [
  { title: 'Stay on topic' },
  { title: 'Search before you ask' },
  { title: 'Show your work, not your product' },
  { title: 'Be useful' },
];

/** A verified squad, as a visitor sees it. */
export const visitorSquad = {
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
  membersCount: data.membersCount,
  memberPostingRole: SourceMemberRole.Member,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date(data.createdAt),
  rules,
  privilegedMembers: [
    member(0, SourceMemberRole.Admin),
    member(1, SourceMemberRole.Moderator),
  ],
  flags: {
    featured: false,
    totalPosts: data.totalPosts,
    totalViews: data.totalViews,
    totalUpvotes: data.totalUpvotes,
    totalAwards: 0,
  },
  // Paid squads are ad-free, which also leaves out Similar squads
  features: { verified: true, adFree: true, jobs: true, perks: true },
} as unknown as Squad;

export const memberSquad = {
  ...visitorSquad,
  currentMember: {
    ...member(4, SourceMemberRole.Member),
    permissions: [SourcePermissions.View, SourcePermissions.Post],
  } as SourceMember,
} as Squad;

export const adminSquad = {
  ...visitorSquad,
  currentMember: {
    ...member(0, SourceMemberRole.Admin),
    permissions: Object.values(SourcePermissions),
  } as SourceMember,
} as Squad;

export enum Viewer {
  Visitor = 'visitor',
  Member = 'member',
  Admin = 'admin',
}

export const squadFor: Record<Viewer, Squad> = {
  [Viewer.Visitor]: visitorSquad,
  [Viewer.Member]: memberSquad,
  [Viewer.Admin]: adminSquad,
};

/* --------------------------------------------------------------- jobs */

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const job = (extra: Partial<SquadJob> & Pick<SquadJob, 'id'>): SquadJob => ({
  sourceId: 'coderabbit',
  title: 'Senior Software Engineer, Agents',
  team: 'Engineering',
  location: 'San Francisco',
  workplace: SquadJobWorkplace.OnSite,
  employmentType: SquadJobEmploymentType.FullTime,
  salary: '$190K–$240K',
  about:
    'Build the agents that review millions of pull requests a week. You will own how they read a codebase, decide what matters and explain it to the people who wrote it.',
  bullets: [
    'Design and ship agent workflows end to end',
    'Measure review quality on real pull requests',
    'Work with the code graph and model teams',
  ],
  applyUrl: 'https://www.coderabbit.ai/careers/agents',
  createdAt: daysAgo(2),
  ...extra,
});

export const jobs: SquadJob[] = [
  job({ id: 'job-agents' }),
  job({
    id: 'job-devrel',
    title: 'Developer Advocate',
    team: 'DevRel',
    location: 'Remote (US)',
    workplace: SquadJobWorkplace.Remote,
    salary: '$150K–$180K',
    about: 'Be the voice of CodeRabbit with developers.',
    bullets: [],
    applyUrl: 'https://www.coderabbit.ai/careers/devrel',
    createdAt: daysAgo(5),
  }),
  job({
    id: 'job-graph',
    title: 'Staff Engineer, Code Graph',
    location: 'London',
    workplace: SquadJobWorkplace.Hybrid,
    salary: null,
    about: null,
    bullets: [],
    applyUrl: 'https://www.coderabbit.ai/careers/graph',
    createdAt: daysAgo(9),
  }),
  job({
    id: 'job-intern',
    title: 'Software Engineering Intern, Summer 2027',
    team: 'Engineering',
    location: 'Remote (EU)',
    workplace: SquadJobWorkplace.Remote,
    employmentType: SquadJobEmploymentType.Internship,
    salary: null,
    about: 'Twelve weeks on a real team, shipping to production from week two.',
    bullets: ['Pair with a mentor every day', 'Ship one feature end to end'],
    applyUrl: 'https://www.coderabbit.ai/careers/intern',
    createdAt: daysAgo(14),
  }),
  job({
    id: 'job-contract',
    title: 'Technical Writer',
    team: 'Docs',
    location: 'Remote',
    workplace: SquadJobWorkplace.Remote,
    employmentType: SquadJobEmploymentType.Contract,
    salary: '$90/hour',
    about: null,
    bullets: [],
    applyUrl: 'https://www.coderabbit.ai/careers/writer',
    createdAt: daysAgo(21),
  }),
];

/** Only what the form requires: title, location and the apply link. */
export const minimalJob = job({
  id: 'job-minimal',
  title: 'Solutions Engineer',
  team: null,
  location: 'New York',
  salary: null,
  about: null,
  bullets: [],
  applyUrl: 'https://jobs.ashbyhq.com/coderabbit/solutions',
  createdAt: daysAgo(1),
});

/** The longest title and lines the form allows, to check wrapping. */
export const longJob = job({
  id: 'job-long',
  title:
    'Principal Software Engineer, Developer Experience and Platform Reliability for Enterprise',
  team: 'Platform Engineering',
  location: 'Remote (Americas, EMEA or APAC time zones)',
  workplace: SquadJobWorkplace.Hybrid,
  salary: '$250K–$320K + equity',
  bullets: [
    'Own the reliability of the review pipeline across every region and every customer tier we serve today',
    'Set the bar for developer experience across the company, from local setup to production debugging',
    'Mentor senior engineers and grow the platform team from five to twelve people over the next year',
    'Partner with security on SOC 2, ISO 27001 and the enterprise controls our largest customers ask for',
    'Write the design docs others build from',
  ],
  createdAt: daysAgo(0),
});

/** A full board: the 20 roles Manage allows. */
export const fullBoard: SquadJob[] = Array.from({ length: 20 }, (_, i) =>
  job({
    id: `job-${i}`,
    title: jobs[i % jobs.length].title,
    location: jobs[i % jobs.length].location,
    workplace: jobs[i % jobs.length].workplace,
    createdAt: daysAgo(i),
  }),
);

/* -------------------------------------------------------------- perks */

const perk = (
  extra: Partial<SquadPerk> & Pick<SquadPerk, 'id'>,
): SquadPerk => ({
  sourceId: 'coderabbit',
  title: '3 months of CodeRabbit Pro',
  value: '3 months free',
  summary:
    'Pro reviews on every pull request in your first organisation, free for three months.',
  toolId: null,
  toolTitle: 'CodeRabbit',
  image: data.image,
  codeKind: SquadPerkCodeKind.Shared,
  code: null,
  redeemUrl: 'https://www.coderabbit.ai/redeem',
  endsAt: daysFromNow(80),
  claimLimit: null,
  steps: [
    'Copy your code',
    'Open coderabbit.ai and sign in with GitHub or GitLab',
    'Billing › Redeem code, then paste it',
  ],
  terms: ['One code per member', 'New organisations only'],
  claimed: 1240,
  claimedByMe: false,
  isClaimable: true,
  codesLeft: null,
  createdAt: daysAgo(3),
  ...extra,
});

/** A shared code: one code for every member. */
export const sharedPerk = perk({ id: 'perk-pro' });

/** A unique code: one code per member, from a list the company uploads. */
export const uniquePerk = perk({
  id: 'perk-agents',
  title: 'Agents beta, skip the waitlist',
  value: 'Early access',
  summary: 'Try CodeRabbit Agents before everyone else.',
  codeKind: SquadPerkCodeKind.Unique,
  endsAt: null,
  claimed: 486,
  claimLimit: 1000,
  steps: ['Get your code', 'Run coderabbit beta join and paste it'],
  terms: ['Spots are first come, first served'],
  createdAt: daysAgo(6),
});

/** Bare minimum: no summary, steps, terms, end date or redeem link. */
export const minimalPerk = perk({
  id: 'perk-minimal',
  title: '20% off the team plan',
  value: '20% off',
  summary: null,
  toolTitle: null,
  image: null,
  redeemUrl: null,
  endsAt: null,
  steps: [],
  terms: [],
  claimed: 12,
  createdAt: daysAgo(1),
});

/** Every code taken. */
export const soldOutPerk = perk({
  id: 'perk-sold-out',
  title: 'A seat at the AI review workshop',
  value: 'Free seat',
  summary: 'A two-hour hands-on workshop with the team, online.',
  codeKind: SquadPerkCodeKind.Unique,
  claimLimit: 200,
  claimed: 200,
  isClaimable: false,
  codesLeft: 0,
  steps: ['Get your code', 'Book your seat with it on the event page'],
  terms: ['One seat per member'],
});

/** Past its end date: editors still see it, members do not. */
export const endedPerk = perk({
  id: 'perk-ended',
  title: 'Launch week: 6 months of Pro',
  value: '6 months free',
  endsAt: daysAgo(4),
  claimed: 3120,
  isClaimable: false,
});

/** The perks as each viewer gets them: only members see a code. */
export const perksFor = (viewer: Viewer): SquadPerk[] => {
  const isMember = viewer !== Viewer.Visitor;
  const list = [
    { ...sharedPerk, code: isMember ? 'DAILYDEV-PRO-3M' : null },
    uniquePerk,
    minimalPerk,
    soldOutPerk,
  ];

  return viewer === Viewer.Admin
    ? [...list, endedPerk].map((item) =>
        item.codeKind === SquadPerkCodeKind.Unique
          ? { ...item, codesLeft: item.codesLeft ?? 514 }
          : item,
      )
    : list;
};

/** A unique-code perk the member already took: their own code. */
export const claimedUniquePerk: SquadPerk = {
  ...uniquePerk,
  claimedByMe: true,
  code: 'CR-AGENTS-7Q2X-91LM',
  claimed: 487,
};

/* ------------------------------------------------------------ welcome */

export const welcome: SquadWelcome = {
  ...emptySquadWelcome,
  enabled: true,
  text: 'Launches and answers from the team now show in your feed. A few house rules:',
  showRules: true,
  ctaLabel: 'Introduce yourself',
};

/* ----------------------------------------------------------- audience */

export const audience: SquadAudience = {
  members: 6120,
  newMembers: 1310,
  isEnough: true,
  seniority: [
    { label: 'MORE_THAN_4_YEARS', share: 31 },
    { label: 'MORE_THAN_6_YEARS', share: 24 },
    { label: 'MORE_THAN_2_YEARS', share: 18 },
    { label: 'MORE_THAN_10_YEARS', share: 11 },
  ],
  stack: [
    { label: 'TypeScript', share: 46 },
    { label: 'Go', share: 22 },
    { label: 'Kubernetes', share: 19 },
    { label: 'Python', share: 17 },
  ],
  companies: [
    { label: 'Shopify', share: 6 },
    { label: 'Microsoft', share: 5 },
    { label: 'Atlassian', share: 4 },
    { label: 'Stripe', share: 3 },
  ],
};

const history = Array.from({ length: 45 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (44 - i));
  return {
    date,
    impressions: Math.round(6000 + 3200 * Math.sin(i / 4) + i * 70),
    impressionsAds: 0,
  };
});

/* ------------------------------------------------------------ seeding */

export interface SeedProps {
  viewer?: Viewer;
  /** Changes to the squad, like no rules or no cover. */
  squadPatch?: Partial<Squad>;
  jobs?: SquadJob[];
  perks?: SquadPerk[];
  /** Extra roles or perks only their own page reads, by id. */
  extraJobs?: SquadJob[];
  extraPerks?: SquadPerk[];
  welcome?: SquadWelcome;
  audience?: SquadAudience;
  /** Ids whose page should fail: gone (404) or a blip (Try again). */
  failing?: { id: string; kind: 'job' | 'perk'; isGone: boolean }[];
}

const apiError = (code: ApiError) => ({
  response: { errors: [{ message: code, extensions: { code } }] },
});

/** Puts a query in its failed state without a request. */
const seedError = (
  client: QueryClient,
  queryKey: readonly unknown[],
  error: unknown,
) => {
  client.setQueryDefaults(queryKey, {
    retry: false,
    retryOnMount: false,
    staleTime: Infinity,
  });
  client
    .getQueryCache()
    .build(client, { queryKey })
    .setState({
      status: 'error',
      fetchStatus: 'idle',
      error: error as Error,
      errorUpdatedAt: Date.now(),
      data: undefined,
    });
};

const Seeded = ({
  viewer = Viewer.Visitor,
  squadPatch,
  jobs: board = jobs,
  perks: shelf,
  extraJobs = [],
  extraPerks = [],
  welcome: saved = welcome,
  audience: insights = audience,
  failing = [],
  children,
}: SeedProps & { children: ReactNode }): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const squad = { ...squadFor[viewer], ...squadPatch } as Squad;
  const perks = shelf ?? perksFor(viewer);
  const set = (queryKey: readonly unknown[], value: unknown) => {
    client.setQueryData(queryKey, value);
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
  };
  const seed = () => {
    set(squadMembersPreviewQueryOptions({ squad }).queryKey, []);
    set(squadJobsPerksFeaturesQueryOptions({ squad }).queryKey, {
      jobs: hasSquadFeature(squad, 'jobs'),
      perks: hasSquadFeature(squad, 'perks'),
    });
    set(squadJobsQueryOptions({ squad }).queryKey, board);
    [...board, ...extraJobs].forEach((item) =>
      set(squadJobQueryOptions(item.id).queryKey, item),
    );
    set(squadWelcomeQueryOptions({ squad }).queryKey, saved);
    set(squadAudienceQueryOptions({ squad }).queryKey, insights);
    set(squadAnalyticsQueryOptions({ sourceId: squad.id }).queryKey, {
      id: squad.id,
      impressions: 418230,
      reach: 96400,
      upvotes: 12340,
      downvotes: 410,
      comments: 2180,
      bookmarks: 3920,
      awards: 3,
      shares: 640,
      clicks: 28100,
      upvotesRatio: 97,
    });
    set(
      squadAnalyticsHistoryQueryOptions({ sourceId: squad.id }).queryKey,
      history,
    );
    [undefined, user].forEach((who) => {
      set(generateQueryKey(RequestKey.Squad, who, squad.handle), squad);
      set(squadProductsQueryOptions({ squad, user: who }).queryKey, []);
      set(squadPerksQueryOptions({ squad, user: who }).queryKey, perks);
      [...perks, ...extraPerks].forEach((item) =>
        set(squadPerkQueryOptions({ id: item.id, user: who }).queryKey, item),
      );
    });
    failing.forEach(({ id, kind, isGone }) => {
      const error = apiError(isGone ? ApiError.NotFound : ApiError.Unexpected);
      if (kind === 'job') {
        seedError(client, squadJobQueryOptions(id).queryKey, error);
        return;
      }
      [undefined, user].forEach((who) =>
        seedError(
          client,
          squadPerkQueryOptions({ id, user: who }).queryKey,
          error,
        ),
      );
    });
  };
  useState(() => {
    seed();
    return true;
  });
  // The signed-in user arrives after the first render; seed their keys too
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SpotlightProvider>
      <SquadPageContextProvider squad={squad} isViewerReady>
        {children}
      </SquadPageContextProvider>
    </SpotlightProvider>
  );
};

/** Seeds the squad and its queries, inside the app providers. */
export const withSeed =
  (seed: SeedProps = {}): Decorator =>
  // eslint-disable-next-line react/display-name
  (Story) =>
    (
      <Seeded {...seed}>
        <Story />
      </Seeded>
    );

/** The app providers only, for pages that read nothing from the squad. */
export const withApp: Decorator = (Story) => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default">
      <Story />
    </div>
  </ExtensionProviders>
);
