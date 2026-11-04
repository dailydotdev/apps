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
import type {
  SquadSeatMember,
  SquadSubscription,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import {
  squadSeatMembersQueryOptions,
  squadSubscriptionBalanceQueryOptions,
  squadSubscriptionQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManagePlan } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePlan';
import { SquadPlanUpsellWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadPlanUpsellWidget';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import {
  StartupsCheckout,
  StartupsCheckoutStep,
} from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';

// daily.dev for Startups self-serve: the checkout at /squads/for-startups,
// Manage › Plan, and the upsell on the squad page. Acme is the sample company, as on the landing page. The API
// does not need to be up: the queries are seeded below, and prices fall back
// to the US list prices when the preview can't load.

const person = (
  id: string,
  name: string,
  role: SourceMemberRole,
  seat: boolean,
): SquadSeatMember => ({
  role,
  seat,
  user: {
    id,
    name,
    username: id,
    image: '',
    permalink: `https://daily.dev/${id}`,
  } as SquadSeatMember['user'],
});

const owner: SquadSeatMember = {
  role: SourceMemberRole.Admin,
  seat: true,
  user: {
    id: defaultUser.id,
    name: defaultUser.name,
    username: defaultUser.username,
    image: defaultUser.image,
    permalink: defaultUser.permalink,
  } as SquadSeatMember['user'],
};

const team = [
  owner,
  person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
  person('jonas', 'Jonas Berg', SourceMemberRole.Moderator, false),
  person('priya', 'Priya Nair', SourceMemberRole.Moderator, false),
];

const acme = {
  id: 'acme-squad',
  handle: 'acme',
  name: 'Acme',
  image: '/squad-page/acme-logo.svg',
  permalink: 'https://daily.dev/squads/acme',
  description: 'The software factory.',
  type: SourceType.Squad,
  public: true,
  active: true,
  membersCount: 214,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  createdAt: new Date('2026-10-01'),
  rules: [],
  links: [],
  features: {},
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: Object.values(SourcePermissions),
    referralToken: 'token',
    user: owner.user,
  } as unknown as SourceMember,
} as unknown as Squad;

const asModerator = (squad: Squad): Squad => ({
  ...squad,
  currentMember: {
    ...squad.currentMember,
    role: SourceMemberRole.Moderator,
    permissions: [
      SourcePermissions.View,
      SourcePermissions.Post,
      SourcePermissions.Edit,
      SourcePermissions.ModeratePost,
    ],
  } as SourceMember,
});

const noPlan: SquadSubscription = {
  plan: null,
  status: 'none',
  seatLimit: 0,
  seatsUsed: 0,
  ownerId: null,
};

const starter: SquadSubscription = {
  plan: SquadPlan.Starter,
  status: 'active',
  seatLimit: 1,
  seatsUsed: 1,
  ownerId: defaultUser.id,
};

const teamPlan: SquadSubscription = {
  plan: SquadPlan.Team,
  status: 'active',
  seatLimit: 5,
  seatsUsed: 2,
  ownerId: defaultUser.id,
};

/** Seeds the queries the section reads, so it renders without the API. */
const Seeded = ({
  squad,
  subscription,
  members = team,
  balance = 9800,
  children,
}: {
  squad: Squad;
  subscription: SquadSubscription;
  members?: SquadSeatMember[];
  balance?: number;
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
      const pin = (queryKey: readonly unknown[], data: unknown) => {
        client.setQueryData(queryKey, data);
        client.setQueryDefaults(queryKey, { staleTime: Infinity });
      };
      pin(generateQueryKey(RequestKey.Squad, who, squad.handle), squad);
      const sourceId = squad.id;
      pin(
        squadSubscriptionQueryOptions({ user: who, sourceId }).queryKey,
        subscription,
      );
      pin(
        squadSubscriptionBalanceQueryOptions({ user: who, sourceId }).queryKey,
        balance,
      );
      pin(
        squadSeatMembersQueryOptions({ user: who, sourceId }).queryKey,
        members,
      );
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

const ManagePlan = ({
  squad = acme,
  subscription,
  members,
}: {
  squad?: Squad;
  subscription: SquadSubscription;
  members?: SquadSeatMember[];
}): ReactElement => (
  <Seeded squad={squad} subscription={subscription} members={members}>
    <SquadManageLayout section={SquadManageSection.Plan}>
      <SquadManagePlan />
    </SquadManageLayout>
  </Seeded>
);

/**
 * The squad-page upsell, at the width of the page's right column. Dismissing
 * it hides it until the story reloads: the stored dismissal is reset here.
 */
const SquadPageUpsellPreview = (): ReactElement => {
  const client = useQueryClient();
  useState(() => {
    const queryKey = [`startups_upsell_dismissed_${acme.id}`, false];
    client.setQueryData(queryKey, false);
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
    return true;
  });

  return (
    <Seeded squad={acme} subscription={noPlan}>
      <div className="flex w-full flex-col p-4 laptop:w-80 laptop:p-6">
        <SquadPlanUpsellWidget />
      </div>
    </Seeded>
  );
};

const meta: Meta = {
  title: 'Features/Squads/daily.dev for Startups checkout',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <FeatureOverrides values={{ [featureStartupsCheckout.id]: true }}>
          <div className="min-h-screen bg-background-default">
            <Story />
          </div>
        </FeatureOverrides>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const phone = { viewport: { value: 'mobile2', isRotated: false } };

/** Manage › Plan without a plan: the two plans and Enterprise. */
export const ManageNoPlan: Story = {
  render: () => <ManagePlan subscription={noPlan} />,
};

export const ManageNoPlanPhone: Story = { ...ManageNoPlan, globals: phone };

/** A moderator sees the plans but only an admin can buy. */
export const ManageNoPlanModerator: Story = {
  render: () => <ManagePlan squad={asModerator(acme)} subscription={noPlan} />,
};

/** Starter, seen by the owner: billing, the wallet, and the one seat. */
export const ManageStarter: Story = {
  render: () => (
    <ManagePlan
      subscription={starter}
      members={[owner, ...team.slice(1).map((m) => ({ ...m, seat: false }))]}
    />
  ),
};

/** Team: the owner gives seats to admins and moderators. */
export const ManageTeam: Story = {
  render: () => <ManagePlan subscription={teamPlan} />,
};

export const ManageTeamPhone: Story = { ...ManageTeam, globals: phone };

/** Step 1 for a founder with no squad: create the company page. */
export const CheckoutNewCompany: Story = {
  render: () => <StartupsCheckout initialPlan={SquadPlan.Starter} />,
};

export const CheckoutNewCompanyPhone: Story = {
  ...CheckoutNewCompany,
  globals: phone,
};

/** Step 1 for an admin of squads: pick one, or create a new page. */
export const CheckoutPickSquad: Story = {
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      squads: [acme],
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    });
  },
  render: () => (
    <Seeded squad={acme} subscription={noPlan}>
      <StartupsCheckout initialSquadId={acme.id} />
    </Seeded>
  ),
};

/** Step 2: Starter or Team, with the plan from the landing page selected. */
export const CheckoutPlan: Story = {
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Plan}
      initialCompany={acme}
      initialPlan={SquadPlan.Team}
    />
  ),
};

export const CheckoutPlanPhone: Story = { ...CheckoutPlan, globals: phone };

/** Step 3: the summary beside Paddle's inline checkout (empty here). */
export const CheckoutPayment: Story = {
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Checkout}
      initialCompany={acme}
      initialPlan={SquadPlan.Starter}
    />
  ),
};

/** After payment, once the webhook switched the plan on. */
export const CheckoutDone: Story = {
  render: () => (
    <Seeded squad={acme} subscription={starter}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acme}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

/** After payment, while waiting for the webhook. */
export const CheckoutActivating: Story = {
  render: () => (
    <Seeded squad={acme} subscription={noPlan}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acme}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

/** The squad page's upsell for an admin of a Squad without a plan. */
export const SquadPageUpsell: Story = {
  render: () => <SquadPageUpsellPreview />,
};

export const SquadPageUpsellPhone: Story = {
  ...SquadPageUpsell,
  globals: phone,
};
