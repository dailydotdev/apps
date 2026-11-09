import type { ReactElement, ReactNode } from 'react';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
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
  startupsCashbackPromoQueryOptions,
  squadSubscriptionQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import type { SquadIntelSettings } from '@dailydotdev/shared/src/graphql/squadIntel';
import {
  squadIntelQueryOptions,
  squadIntelSettingsQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadIntel';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManagePlan } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePlan';
import {
  StartupsSetup,
  StartupsSetupPath,
} from '@dailydotdev/shared/src/features/squads/components/setup/StartupsSetup';
import type { SquadProduct } from '@dailydotdev/shared/src/graphql/squadProducts';
import {
  SquadProductPricing,
  squadProductsQueryOptions,
} from '@dailydotdev/shared/src/graphql/squadProducts';
import type { SquadBranding } from '@dailydotdev/shared/src/graphql/squadBranding';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import { Origin } from '@dailydotdev/shared/src/lib/log';
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
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';

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

type SeededSquad = Squad & { id: string };

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
    // The buyer holds a seat from the moment the plan is on
    seat: true,
  } as unknown as SourceMember,
} as unknown as SeededSquad;

// Acme once the Team plan switched its features on, with the description and
// website filled in and no product or header CTA yet.
const acmeTeam = {
  ...acme,
  website: 'https://acme.dev',
  features: { links: true, products: true, cta: true, apiPosting: true },
} as unknown as SeededSquad;

// A company page as it is right after paying: nothing on it yet.
const acmeNew = {
  ...acme,
  description: '',
  membersCount: 1,
  createdAt: new Date('2026-11-04'),
} as unknown as SeededSquad;

const acmeTeamNew = acmeNew;

const COVER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="168"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1B5E"/><stop offset=".55" stop-color="#5B2FB0"/><stop offset="1" stop-color="#14B8C4"/></linearGradient></defs><rect width="720" height="168" fill="url(#g)"/></svg>',
)}`;

// The page with its description, cover and website filled in.
const acmeHalfDone = {
  ...acmeTeamNew,
  description: 'The software factory for developer teams.',
  headerImage: COVER,
  website: 'https://acme.dev',
} as unknown as SeededSquad;

const sampleProduct = {
  id: 'acme-cloud',
  title: 'Acme Cloud',
  slug: 'acme-cloud',
  url: 'https://acme.dev/cloud',
  faviconUrl: COVER,
  category: 'Developer tools',
  tagline: 'Ship faster, with the tools your team knows.',
  description: 'One command for a live preview of any branch.',
  pricingModel: SquadProductPricing.Paid,
} as unknown as SquadProduct;

const headerCta = {
  color: null,
  button: {
    enabled: true,
    label: 'Start building for free',
    url: 'https://acme.dev',
  },
} as unknown as SquadBranding;

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
  cashbackPercentage: 0,
  cashbackPromoEndsAt: null,
};

const starter: SquadSubscription = {
  plan: SquadPlan.Starter,
  status: 'active',
  seatLimit: 1,
  seatsUsed: 1,
  ownerId: defaultUser.id,
  cashbackPercentage: 100,
  cashbackPromoEndsAt: null,
};

// Started during the launch promo
const starterPromo: SquadSubscription = {
  ...starter,
  cashbackPercentage: 500,
  cashbackPromoEndsAt: '2027-11-08T10:00:00.000Z',
};

const teamPlan: SquadSubscription = {
  plan: SquadPlan.Team,
  status: 'active',
  seatLimit: 5,
  seatsUsed: 2,
  ownerId: defaultUser.id,
  cashbackPercentage: 200,
  cashbackPromoEndsAt: null,
};

// Topics picked for the weekly intel, so the checklist can finish.
const intelPicked = (isTeamPlan: boolean): SquadIntelSettings => ({
  selection: {
    tags: ['observability', 'opentelemetry', 'grafana'],
    seniority: null,
    regions: null,
  },
  limits: { tags: isTeamPlan ? 20 : 5, seniority: isTeamPlan, regions: false },
  nextIntelAt: '2026-11-09T00:00:00.000Z',
});

// Only the buyer holds a seat so far.
const teamPlanNew: SquadSubscription = { ...teamPlan, seatsUsed: 1 };

/** Seeds the queries the section reads, so it renders without the API. */
const Seeded = ({
  squad,
  subscription,
  members = team,
  balance = 9800,
  products = [],
  branding = { color: null, button: null } as unknown as SquadBranding,
  intelSettings,
  children,
}: {
  squad: Squad;
  /** Null: still on its way. Undefined: left to the API, which isn't up here. */
  subscription?: SquadSubscription | null;
  members?: SquadSeatMember[] | null;
  balance?: number;
  /** Null: still on its way, and it stays that way. */
  products?: SquadProduct[] | null;
  branding?: SquadBranding;
  /** No topics yet, with the plan's limits, unless a story sets them. */
  intelSettings?: SquadIntelSettings;
  children: ReactNode;
}): ReactElement => {
  const client = useQueryClient();
  const isTeamPlan = subscription?.plan === SquadPlan.Team;
  const intel = intelSettings ?? {
    selection: null,
    limits: {
      tags: isTeamPlan ? 20 : 5,
      seniority: isTeamPlan,
      regions: false,
    },
    nextIntelAt: '2026-11-09T00:00:00.000Z',
  };
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
      const pending = (queryKey: readonly unknown[]) =>
        client.prefetchQuery({
          queryKey,
          queryFn: () => new Promise(() => undefined),
        });
      const subscriptionKey = squadSubscriptionQueryOptions({
        user: who,
        sourceId,
      }).queryKey;
      if (subscription) {
        pin(subscriptionKey, subscription);
      } else if (subscription === null) {
        pending(subscriptionKey);
      }
      pin(
        squadSubscriptionBalanceQueryOptions({ user: who, sourceId }).queryKey,
        balance,
      );
      const membersKey = squadSeatMembersQueryOptions({
        user: who,
        sourceId,
      }).queryKey;
      if (members) {
        pin(membersKey, members);
      } else {
        pending(membersKey);
      }
      const productsKey = squadProductsQueryOptions({
        squad,
        user: who,
      }).queryKey;
      if (products) {
        pin(productsKey, products);
      } else {
        pending(productsKey);
      }
      pin(squadBrandingQueryOptions({ squad, user: who }).queryKey, branding);
      pin(
        squadIntelSettingsQueryOptions({ user: who, sourceId }).queryKey,
        intel,
      );
      pin(squadIntelQueryOptions({ user: who, sourceId }).queryKey, null);
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

/** The launch promo, on for new subscriptions. */
const PromoOn = ({ children }: { children: ReactNode }): ReactElement => {
  const client = useQueryClient();
  useState(() => {
    const { queryKey } = startupsCashbackPromoQueryOptions();
    client.setQueryData(queryKey, { percentage: 500, months: 12 });
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
    return true;
  });

  return <>{children}</>;
};

const ManagePlan = ({
  squad = acmeNew,
  subscription,
  members,
}: {
  squad?: Squad;
  subscription?: SquadSubscription | null;
  members?: SquadSeatMember[] | null;
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
      <div className="flex min-h-screen w-full justify-center bg-background-default p-6">
        <div className="w-full" style={{ maxWidth: 340 }}>
          <SquadPlanUpsellWidget />
        </div>
      </div>
    </Seeded>
  );
};

/** The setup panel on its own, half done, on the path a story pins. */
const SetupPreview = ({
  path,
  isAllDone,
}: {
  path: StartupsSetupPath;
  isAllDone?: boolean;
}): ReactElement => {
  const squad = isAllDone ? acmeHalfDone : acmeTeam;

  return (
    <Seeded
      squad={squad}
      subscription={isAllDone ? teamPlan : teamPlanNew}
      products={isAllDone ? [sampleProduct] : []}
      branding={isAllDone ? headerCta : undefined}
      intelSettings={isAllDone ? intelPicked(true) : undefined}
    >
      <div className="mx-auto flex max-w-[40rem] flex-col p-4 tablet:p-6">
        <StartupsSetup
          squad={squad}
          plan={SquadPlan.Team}
          origin={Origin.StartupsCheckout}
          initialPath={path}
        />
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
  render: () => (
    <ManagePlan squad={asModerator(acmeNew)} subscription={noPlan} />
  ),
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

/** Enterprise, set by ops for a contract: no price, billing or cashback. */
export const ManageEnterprise: Story = {
  render: () => (
    <ManagePlan
      subscription={
        {
          ...teamPlan,
          plan: 'enterprise',
          seatLimit: 100,
          seatsUsed: 2,
        } as unknown as SquadSubscription
      }
    />
  ),
};

/** Team: the owner gives seats to admins and moderators. */
export const ManageTeam: Story = {
  render: () => <ManagePlan subscription={teamPlan} />,
};

export const ManageTeamPhone: Story = { ...ManageTeam, globals: phone };

export const ManageLoading: Story = {
  render: () => <ManagePlan subscription={null} />,
};

export const ManageLookupFailed: Story = {
  render: () => <ManagePlan />,
};

export const ManageSeatsLoading: Story = {
  render: () => <ManagePlan subscription={teamPlan} members={null} />,
};

const paidByMaya = { ownerId: 'maya' };

/** Another admin sees who pays, and no billing. */
export const ManageStarterAdmin: Story = {
  render: () => (
    <ManagePlan
      subscription={{ ...starter, ...paidByMaya }}
      members={[
        person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
        { ...owner, seat: false },
      ]}
    />
  ),
};

/**
 * Another admin of an Enterprise squad whose seat was taken back: no invite
 * banner, since only seat holders bring teammates in.
 */
export const ManageEnterpriseAdminNoSeat: Story = {
  render: () => (
    <ManagePlan
      squad={
        {
          ...acmeNew,
          currentMember: { ...acmeNew.currentMember, seat: false },
        } as Squad
      }
      subscription={
        {
          ...teamPlan,
          ...paidByMaya,
          plan: 'enterprise',
          seatLimit: 100,
          seatsUsed: 1,
        } as unknown as SquadSubscription
      }
      members={[person('maya', 'Maya Levi', SourceMemberRole.Admin, true)]}
    />
  ),
};

export const ManageTeamModerator: Story = {
  render: () => (
    <ManagePlan
      squad={asModerator(acmeNew)}
      subscription={{ ...teamPlan, ...paidByMaya }}
    />
  ),
};

/** Every seat taken, one of them by someone who has left. */
export const ManageTeamFull: Story = {
  render: () => (
    <ManagePlan
      subscription={{ ...teamPlan, seatsUsed: 5 }}
      members={[
        owner,
        person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
        person('jonas', 'Jonas Berg', SourceMemberRole.Moderator, true),
        person('priya', 'Priya Nair', SourceMemberRole.Moderator, true),
        person('sam', 'Sam Ortiz', SourceMemberRole.Member, true),
        person('lee', 'Lee Park', SourceMemberRole.Moderator, false),
      ]}
    />
  ),
};

/** Team with nobody to give a seat to yet. */
export const ManageTeamAlone: Story = {
  render: () => (
    <ManagePlan subscription={teamPlanNew} members={[owner]} squad={acmeNew} />
  ),
};

/** Team with the description, website and a teammate's seat done. */
export const ManageHalfSetUp: Story = {
  render: () => <ManagePlan squad={acmeHalfDone} subscription={teamPlan} />,
};

/** Team with the page fully set up: the checklist folds away. */
export const ManageSetupComplete: Story = {
  render: () => (
    <Seeded
      squad={acmeHalfDone}
      subscription={teamPlan}
      products={[sampleProduct]}
      branding={headerCta}
      intelSettings={intelPicked(true)}
    >
      <SquadManageLayout section={SquadManageSection.Plan}>
        <SquadManagePlan />
      </SquadManageLayout>
    </Seeded>
  ),
};

/** Step 1 for a founder with no squad: create the company page. */
/**
 * Signed out, from the landing page: sign up on the page (GitHub, Google or
 * email with a code), then step 1 right away.
 */
export const CheckoutSignUp: Story = {
  beforeEach: bootAsAnonymous,
  render: () => (
    <StartupsCheckout
      initialPlan={SquadPlan.Team}
      initialStep={StartupsCheckoutStep.Account}
    />
  ),
};

/** Email, name and password, with the username generated behind them. */
export const CheckoutSignUpEmail: Story = {
  beforeEach: bootAsAnonymous,
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Account}
      initialAuthDisplay={AuthDisplay.Registration}
      initialAuthEmail="founder@acme.dev"
    />
  ),
};

export const CheckoutSignUpEmailPhone: Story = {
  ...CheckoutSignUpEmail,
  globals: phone,
};

export const CheckoutEmailCode: Story = {
  beforeEach: bootAsAnonymous,
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Account}
      initialAuthDisplay={AuthDisplay.EmailVerification}
      initialAuthEmail="founder@acme.dev"
    />
  ),
};

export const CheckoutEmailCodePhone: Story = {
  ...CheckoutEmailCode,
  globals: phone,
};

export const CheckoutResetPassword: Story = {
  beforeEach: bootAsAnonymous,
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Account}
      initialAuthDisplay={AuthDisplay.ForgotPassword}
      initialAuthEmail="founder@acme.dev"
    />
  ),
};

export const CheckoutSignUpPhone: Story = {
  ...CheckoutSignUp,
  globals: phone,
};

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
      squads: [
        acme,
        {
          ...acme,
          id: 'acme-labs',
          name: 'Acme Labs',
          handle: 'acme_labs',
          image: '/startups-onboarding/acme-labs-logo.svg',
        },
      ],
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
    />
  ),
};

export const CheckoutPlanPhone: Story = { ...CheckoutPlan, globals: phone };

export const CheckoutPlanLongName: Story = {
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Plan}
      initialCompany={{
        ...acme,
        name: 'Acme Developer Infrastructure Platform International',
      }}
    />
  ),
};

/** Step 2, coming from the Team card on the landing page. */
export const CheckoutPlanTeam: Story = {
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Plan}
      initialCompany={acme}
      initialPlan={SquadPlan.Team}
    />
  ),
};

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
    <Seeded squad={acmeNew} subscription={starter}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeNew}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

/** The plan is on, and the page itself hasn't arrived yet. */
export const CheckoutDonePageLoading: Story = {
  render: () => (
    <Seeded squad={acmeNew} subscription={starter}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={{ ...acmeNew, handle: 'acme-still-loading' }}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

/** The words are known, but not yet which rows are done. */
export const CheckoutDoneChecking: Story = {
  render: () => (
    <Seeded squad={acmeTeamNew} subscription={teamPlanNew} products={null}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeTeamNew}
        initialPlan={SquadPlan.Team}
      />
    </Seeded>
  ),
};

/** Team, half done: the description, cover and website are in. */
export const CheckoutDoneTeamHalf: Story = {
  render: () => (
    <Seeded squad={acmeHalfDone} subscription={teamPlanNew}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeHalfDone}
        initialPlan={SquadPlan.Team}
      />
    </Seeded>
  ),
};

/** Everything on the checklist is done: the page is filled in. */
export const CheckoutDoneFinished: Story = {
  render: () => (
    <Seeded
      squad={acmeHalfDone}
      subscription={starter}
      products={[sampleProduct]}
      intelSettings={intelPicked(false)}
    >
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeHalfDone}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

/** Team, finished: the CTA and the seats show on the page too. */
export const CheckoutDoneTeamFinished: Story = {
  render: () => (
    <Seeded
      squad={acmeHalfDone}
      subscription={teamPlan}
      products={[sampleProduct]}
      branding={headerCta}
      intelSettings={intelPicked(true)}
    >
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeHalfDone}
        initialPlan={SquadPlan.Team}
      />
    </Seeded>
  ),
};

/** After payment on Team: the agent path, with the Team steps in its prompt. */
export const CheckoutDoneTeam: Story = {
  render: () => (
    <Seeded squad={acmeTeamNew} subscription={teamPlanNew}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acmeTeamNew}
        initialPlan={SquadPlan.Team}
      />
    </Seeded>
  ),
};

export const CheckoutDoneTeamPhone: Story = {
  ...CheckoutDoneTeam,
  globals: phone,
};

/** The setup's other path: the checklist, ticked from the page's own data. */
export const SetupDoItYourself: Story = {
  render: () => <SetupPreview path={StartupsSetupPath.Manual} />,
};

export const SetupDoItYourselfPhone: Story = {
  ...SetupDoItYourself,
  globals: phone,
};

/** The checklist with every row done, as Manage's Review shows it. */
export const SetupAllDone: Story = {
  render: () => <SetupPreview path={StartupsSetupPath.Manual} isAllDone />,
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

/** The launch promo is on: plans show 500% for the first year. */
export const PromoManageNoPlan: Story = {
  render: () => (
    <PromoOn>
      <ManagePlan subscription={noPlan} />
    </PromoOn>
  ),
};

/** Starter bought during the launch promo. */
export const PromoManageStarter: Story = {
  render: () => (
    <PromoOn>
      <ManagePlan
        subscription={starterPromo}
        members={[owner, ...team.slice(1).map((m) => ({ ...m, seat: false }))]}
      />
    </PromoOn>
  ),
};

export const PromoCheckoutPlan: Story = {
  render: () => (
    <PromoOn>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Plan}
        initialCompany={acme}
      />
    </PromoOn>
  ),
};

export const PromoCheckoutPlanPhone: Story = {
  ...PromoCheckoutPlan,
  globals: phone,
};

export const PromoCheckoutPayment: Story = {
  render: () => (
    <PromoOn>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Checkout}
        initialCompany={acme}
        initialPlan={SquadPlan.Starter}
      />
    </PromoOn>
  ),
};

export const PromoSquadPageUpsell: Story = {
  render: () => (
    <PromoOn>
      <SquadPageUpsellPreview />
    </PromoOn>
  ),
};
