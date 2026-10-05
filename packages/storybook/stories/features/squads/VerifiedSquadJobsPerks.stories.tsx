import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import type {
  SquadJob,
  SquadPerk,
} from '@dailydotdev/shared/src/graphql/squadJobsPerks';
import {
  SquadJobEmploymentType,
  SquadJobWorkplace,
  SquadPerkCodeKind,
  squadJobQueryOptions,
  squadJobsPerksFeaturesQueryOptions,
  squadJobsQueryOptions,
  squadPerkQueryOptions,
  squadPerksQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadJobsPerks';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadPageLayout } from '@dailydotdev/shared/src/features/squads/components/SquadPageLayout';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { SquadJobPage } from '@dailydotdev/shared/src/features/squads/components/jobs/SquadJobs';
import { SquadPerkPage } from '@dailydotdev/shared/src/features/squads/components/perks/SquadPerks';
import { useSquadPageTabs } from '@dailydotdev/shared/src/features/squads/hooks/useSquadPageTabs';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import {
  SquadManageJobForm,
  SquadManageJobs,
  SquadManagePerkForm,
  SquadManagePerks,
} from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageJobsPerks';
import {
  SquadManageSection,
  SquadPageTab,
} from '@dailydotdev/shared/src/features/squads/lib/routes';
import ExtensionProviders from '../../extension/_providers';
import { squad as data, team } from '../../squad-page/data';

// PR 3 of Verified Company Squads, on the production components: the
// Jobs and Perks tabs, a page for every role and perk, and Manage › Jobs
// and Manage › Member perks, built like Manage › Products. The queries are
// seeded below, so it renders without the API.

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

const verifiedSquad = {
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
  rules: [],
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
  features: { verified: true },
} as unknown as Squad;

const asMember = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...member(4, SourceMemberRole.Member),
    permissions: [SourcePermissions.View, SourcePermissions.Post],
  } as SourceMember,
});

const asAdmin = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...member(0, SourceMemberRole.Admin),
    permissions: Object.values(SourcePermissions),
  } as SourceMember,
});

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const jobs: SquadJob[] = [
  {
    id: 'job-agents',
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
  },
  {
    id: 'job-devrel',
    title: 'Developer Advocate',
    team: 'DevRel',
    location: 'Remote (US)',
    workplace: SquadJobWorkplace.Remote,
    employmentType: SquadJobEmploymentType.FullTime,
    salary: '$150K–$180K',
    about: 'Be the voice of CodeRabbit with developers.',
    bullets: [],
    applyUrl: 'https://www.coderabbit.ai/careers/devrel',
    createdAt: daysAgo(5),
  },
  {
    id: 'job-graph',
    title: 'Staff Engineer, Code Graph',
    team: 'Engineering',
    location: 'London',
    workplace: SquadJobWorkplace.Hybrid,
    employmentType: SquadJobEmploymentType.FullTime,
    salary: null,
    about: null,
    bullets: [],
    applyUrl: 'https://www.coderabbit.ai/careers/graph',
    createdAt: daysAgo(9),
  },
];

const perk = (extra: Partial<SquadPerk>): SquadPerk => ({
  id: 'perk-pro',
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
  endsAt: new Date(new Date().getFullYear(), 11, 31, 23, 59).toISOString(),
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

const perksFor = (isMember: boolean): SquadPerk[] => [
  perk({ code: isMember ? 'DAILYDEV-PRO-3M' : null }),
  perk({
    id: 'perk-agents',
    title: 'Agents beta, skip the waitlist',
    value: 'Early access',
    summary: 'Try CodeRabbit Agents before everyone else.',
    codeKind: SquadPerkCodeKind.Unique,
    endsAt: null,
    claimed: 486,
    steps: ['Get your code', 'Run coderabbit beta join and paste it'],
    terms: ['Spots are first come, first served'],
  }),
];

/** Seeds the queries the pages read, so they render without the API. */
const Seeded = ({
  squad,
  isMember,
  children,
}: {
  squad: Squad;
  isMember: boolean;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const perks = perksFor(isMember);
  const set = (queryKey: readonly unknown[], value: unknown) => {
    client.setQueryData(queryKey, value);
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
  };
  const seed = () => {
    set(squadMembersPreviewQueryOptions({ squad }).queryKey, []);
    set(squadJobsPerksFeaturesQueryOptions({ squad }).queryKey, {
      jobs: true,
      perks: true,
    });
    const withFeatures = {
      ...squad,
      features: { ...squad.features, jobs: true, perks: true },
    } as Squad;
    set(squadJobsQueryOptions({ squad: withFeatures }).queryKey, jobs);
    jobs.forEach((job) => set(squadJobQueryOptions(job.id).queryKey, job));
    [undefined, user].forEach((who) => {
      set(generateQueryKey(RequestKey.Squad, who, squad.handle), squad);
      set(
        squadProductsQueryOptions({ squad: withFeatures, user: who }).queryKey,
        [],
      );
      set(
        squadPerksQueryOptions({ squad: withFeatures, user: who }).queryKey,
        perks,
      );
      perks.forEach((item) =>
        set(squadPerkQueryOptions({ id: item.id, user: who }).queryKey, item),
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

const TabbedPage = ({ tab }: { tab: SquadPageTab }): ReactElement => {
  const { tabs } = useSquadPageTabs();

  return (
    <SquadPageLayout
      header={<SquadProfileHeader />}
      hasAboutTab
      tabs={tabs}
      initialTab={tab}
    >
      <p className="p-6 text-text-tertiary typo-callout">
        The squad feed, as today.
      </p>
    </SquadPageLayout>
  );
};

const Page = ({
  squad,
  isMember = false,
  children,
}: {
  squad: Squad;
  isMember?: boolean;
  children: ReactNode;
}): ReactElement => (
  <Seeded squad={squad} isMember={isMember}>
    {children}
  </Seeded>
);

const meta: Meta = {
  title: 'Features/Squads/Verified squad, jobs and perks',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="min-h-screen bg-background-default">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const phone = { viewport: { value: 'mobile2', isRotated: false } };

/** The public jobs board: Posts · Jobs · Perks over the feed. */
export const JobsTab: Story = {
  render: () => (
    <Page squad={verifiedSquad}>
      <TabbedPage tab={SquadPageTab.Jobs} />
    </Page>
  ),
};

export const JobsTabPhone: Story = { ...JobsTab, globals: phone };

/** A role's own page: a squad sub-page, Apply goes to the company's site. */
export const RolePage: Story = {
  render: () => (
    <Page squad={verifiedSquad}>
      <SquadJobPage jobId="job-agents" />
    </Page>
  ),
};

export const RolePagePhone: Story = { ...RolePage, globals: phone };

/** Perks, locked for visitors. */
export const PerksTab: Story = {
  render: () => (
    <Page squad={verifiedSquad}>
      <TabbedPage tab={SquadPageTab.Perks} />
    </Page>
  ),
};

/** Perks for a member: unlocked. */
export const PerksTabMember: Story = {
  render: () => (
    <Page squad={asMember(verifiedSquad)} isMember>
      <TabbedPage tab={SquadPageTab.Perks} />
    </Page>
  ),
};

/** A visitor on a perk: Join to unlock. */
export const PerkPageVisitor: Story = {
  render: () => (
    <Page squad={verifiedSquad}>
      <SquadPerkPage perkId="perk-pro" />
    </Page>
  ),
};

/** A member on a shared-code perk: the code, Copy, Redeem. */
export const PerkPageMember: Story = {
  render: () => (
    <Page squad={asMember(verifiedSquad)} isMember>
      <SquadPerkPage perkId="perk-pro" />
    </Page>
  ),
};

export const PerkPageMemberPhone: Story = { ...PerkPageMember, globals: phone };

/** A member on a unique-code perk: Get your code. */
export const PerkPageUniqueCode: Story = {
  render: () => (
    <Page squad={asMember(verifiedSquad)} isMember>
      <SquadPerkPage perkId="perk-agents" />
    </Page>
  ),
};

const Manage = ({
  section,
  children,
}: {
  section: SquadManageSection;
  children: ReactNode;
}): ReactElement => (
  <Page squad={asAdmin(verifiedSquad)} isMember>
    <SquadManageLayout section={section}>{children}</SquadManageLayout>
  </Page>
);

/** Manage › Jobs, like Manage › Products. */
export const ManageJobs: Story = {
  render: () => (
    <Manage section={SquadManageSection.Jobs}>
      <SquadManageJobs />
    </Manage>
  ),
};

export const ManageEditRole: Story = {
  render: () => (
    <Manage section={SquadManageSection.Jobs}>
      <SquadManageJobForm jobId="job-agents" />
    </Manage>
  ),
};

export const ManageAddRole: Story = {
  render: () => (
    <Manage section={SquadManageSection.Jobs}>
      <SquadManageJobForm />
    </Manage>
  ),
};

/** Manage › Member perks. */
export const ManagePerks: Story = {
  render: () => (
    <Manage section={SquadManageSection.Perks}>
      <SquadManagePerks />
    </Manage>
  ),
};

export const ManageEditPerk: Story = {
  render: () => (
    <Manage section={SquadManageSection.Perks}>
      <SquadManagePerkForm perkId="perk-pro" />
    </Manage>
  ),
};

export const ManageEditPerkPhone: Story = { ...ManageEditPerk, globals: phone };
