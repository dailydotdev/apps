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
import {
  squadAnalyticsHistoryQueryOptions,
  squadAnalyticsQueryOptions,
  squadMembersPreviewQueryOptions,
} from '@dailydotdev/shared/src/graphql/squads';
import type {
  SquadAudience,
  SquadWelcome,
} from '@dailydotdev/shared/src/graphql/squadWelcomeAudience';
import {
  emptySquadWelcome,
  squadAudienceQueryOptions,
  squadWelcomeQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadWelcomeAudience';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageWelcome } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageWelcome';
import { SquadManageAnalytics } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageAnalytics';
import { SquadWelcomeCard } from '@dailydotdev/shared/src/features/squads/components/welcome/SquadWelcomeCard';
import { getSquadWelcomeView } from '@dailydotdev/shared/src/features/squads/lib/welcome';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import ExtensionProviders from '../../extension/_providers';
import { squad as data, team } from '../../squad-page/data';

// PR 2 of Verified Company Squads, on the production components: the
// welcome pop-up a company sets for people who just joined, Manage ›
// Welcome pop-up, and the Audience section of Manage › Analytics. The
// queries are seeded below, so it renders without the API.

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
  rules: [
    { title: 'Stay on topic' },
    { title: 'Search before you ask' },
    { title: 'Show your work, not your product' },
    { title: 'Be useful' },
  ],
  privilegedMembers: [member(0, SourceMemberRole.Admin)],
  flags: {
    featured: false,
    totalPosts: data.totalPosts,
    totalViews: data.totalViews,
    totalUpvotes: data.totalUpvotes,
    totalAwards: 0,
  },
  features: { verified: true },
  currentMember: {
    ...member(0, SourceMemberRole.Admin),
    permissions: Object.values(SourcePermissions),
  } as SourceMember,
} as unknown as Squad;

const welcome: SquadWelcome = {
  ...emptySquadWelcome,
  enabled: true,
  text: 'Launches and answers from the team now show in your feed. A few house rules:',
  showRules: true,
  ctaLabel: 'Introduce yourself',
};

const eventWelcome: SquadWelcome = {
  ...emptySquadWelcome,
  enabled: true,
  headline: 'Join us live: AI review in practice',
  text: 'Thursday, Oct 16 · 17:00 CET, online. 45 minutes with the team, then your questions.',
  ctaLabel: 'Save my spot',
  ctaUrl: 'https://www.coderabbit.ai/events',
};

const audience: SquadAudience = {
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

/** Seeds the queries the pages read, so they render without the API. */
const Seeded = ({
  saved = welcome,
  insights = audience,
  children,
}: {
  saved?: SquadWelcome;
  insights?: SquadAudience;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const set = (queryKey: readonly unknown[], value: unknown) => {
    client.setQueryData(queryKey, value);
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
  };
  const seed = () => {
    const squad = verifiedSquad;
    set(squadMembersPreviewQueryOptions({ squad }).queryKey, []);
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
    [undefined, user].forEach((who) =>
      set(generateQueryKey(RequestKey.Squad, who, squad.handle), squad),
    );
  };
  useState(() => {
    seed();
    return true;
  });
  // The signed-in user arrives after the first render; seed their keys too
  useEffect(seed, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SpotlightProvider>
      <SquadPageContextProvider squad={verifiedSquad} isViewerReady>
        {children}
      </SquadPageContextProvider>
    </SpotlightProvider>
  );
};

/** The pop-up as it opens right after Join (the card inside the modal). */
const Popup = ({ saved }: { saved: SquadWelcome }): ReactElement => (
  <div className="flex min-h-screen items-center justify-center bg-overlay-quaternary-onion p-4">
    <div className="w-full max-w-[26.25rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default">
      <SquadWelcomeCard view={getSquadWelcomeView(saved, verifiedSquad)} />
    </div>
  </div>
);

const meta: Meta = {
  title: 'Features/Squads/Verified squad, join moment and audience',
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

/** The default: the squad's cover and logo, house rules, one button. */
export const WelcomePopup: Story = {
  render: () => <Popup saved={welcome} />,
};

/** The same template, filled in as an event with a link. */
export const WelcomePopupEvent: Story = {
  render: () => <Popup saved={eventWelcome} />,
};

export const WelcomePopupPhone: Story = { ...WelcomePopup, globals: phone };

/** Manage › Welcome pop-up: the fields, the examples and a live preview. */
export const ManageWelcome: Story = {
  render: () => (
    <Seeded>
      <SquadManageLayout section={SquadManageSection.Welcome}>
        <SquadManageWelcome />
      </SquadManageLayout>
    </Seeded>
  ),
};

export const ManageWelcomePhone: Story = { ...ManageWelcome, globals: phone };

/** Manage › Analytics with the Audience section, below Engagement. */
export const AnalyticsAudience: Story = {
  render: () => (
    <Seeded>
      <SquadManageLayout section={SquadManageSection.Analytics}>
        <SquadManageAnalytics />
      </SquadManageLayout>
    </Seeded>
  ),
};

/** Below 100 members the breakdowns stay hidden. */
export const AnalyticsAudienceSmallSquad: Story = {
  render: () => (
    <Seeded
      insights={{
        members: 64,
        newMembers: 12,
        isEnough: false,
        seniority: [],
        stack: [],
        companies: [],
      }}
    >
      <SquadManageLayout section={SquadManageSection.Analytics}>
        <SquadManageAnalytics />
      </SquadManageLayout>
    </Seeded>
  ),
};
