import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { BoostSquadModal } from '@dailydotdev/shared/src/features/boost/BoostSquadModal';
import { AdsDashboardModal } from '@dailydotdev/shared/src/features/boost/AdsDashboardModal';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import {
  StartupsBuyCoresPromo,
  StartupsWalletPromo,
} from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import { PlusCoresGivebackWidget } from '@dailydotdev/shared/src/components/cores/PlusCoresGivebackWidget';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManagePlan } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePlan';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { featureStartupsCheckout } from '@dailydotdev/shared/src/lib/featureManagement';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { coresPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';

// Mockups of the daily.dev for Startups promotions outside the squad page:
// boosting, buying Cores for a boost, the wallet, the ads dashboard and the
// Manage menu. The viewer runs Acme, a squad with no plan, and the launch
// promo (500% for a year) is on.

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
  flags: { totalPosts: 12, totalViews: 4800, totalUpvotes: 310 },
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: Object.values(SourcePermissions),
    referralToken: 'token',
    user: defaultUser,
  } as unknown as SourceMember,
} as unknown as Squad;

const acmePost = {
  id: 'acme-post',
  title: 'How we cut our build times by 70% with remote caching',
  createdAt: '2026-11-01T10:00:00.000Z',
  type: PostType.Article,
  tags: ['devops', 'ci'],
  source: acme,
  author: defaultUser,
  permalink: 'https://daily.dev/posts/acme-post',
  commentsPermalink: 'https://daily.dev/posts/acme-post',
} as unknown as Post;

const personalPost = {
  ...acmePost,
  id: 'personal-post',
  title: 'I built an open-source feature flag service in Rust',
  source: {
    id: defaultUser.id,
    name: defaultUser.name,
    handle: defaultUser.username,
    image: defaultUser.image,
    type: SourceType.User,
  },
} as unknown as Post;

const handlers = [
  graphql.query('CompletedUserActions', () =>
    HttpResponse.json({ data: { actions: [] } }),
  ),
  graphql.mutation('CompleteAction', () =>
    HttpResponse.json({ data: { completeAction: { _: true } } }),
  ),
  graphql.query('SquadSubscription', () =>
    HttpResponse.json({
      data: {
        squadSubscription: {
          plan: null,
          status: 'none',
          seatLimit: 0,
          seatsUsed: 0,
          ownerId: null,
          cashbackPercentage: 0,
          cashbackPromoEndsAt: null,
        },
      },
    }),
  ),
  graphql.query('SquadSubscriptionBalance', () =>
    HttpResponse.json({
      data: { squadSubscription: { coresBalance: 0 } },
    }),
  ),
  graphql.query('SquadSeatMembers', () =>
    HttpResponse.json({ data: { squadSeatMembers: [] } }),
  ),
  graphql.query('StartupsCashbackPromo', () =>
    HttpResponse.json({
      data: { startupsCashbackPromo: { percentage: 500, months: 12 } },
    }),
  ),
  graphql.query('SquadWallet', () =>
    HttpResponse.json({ data: { squadWallet: null } }),
  ),
  graphql.query('DailyCampaignReachEstimate', () =>
    HttpResponse.json({
      data: { dailyCampaignReachEstimate: { min: 1800, max: 4200 } },
    }),
  ),
  graphql.query('UserCampaignStats', () =>
    HttpResponse.json({
      data: {
        userCampaignStats: {
          spend: 63000,
          users: 18400,
          clicks: 920,
          impressions: 41200,
          newMembers: 37,
        },
      },
    }),
  ),
  graphql.query('CampaignsList', () =>
    HttpResponse.json({
      data: {
        campaignsList: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    }),
  ),
];

const withSquads =
  (squads: Squad[], balance = 2000) =>
  () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: { ...defaultUser, balance: { amount: balance } },
      squads,
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  };

// The modals read the user on first render, so wait for the boot
const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/daily.dev for Startups promotions',
  parameters: { layout: 'fullscreen', msw: { handlers } },
  beforeEach: withSquads([acme]),
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <FeatureOverrides values={{ [featureStartupsCheckout.id]: true }}>
          <div id="__next" className="min-h-screen bg-background-default">
            <WhenUser>
              <Story />
            </WhenUser>
          </div>
        </FeatureOverrides>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const noop = () => undefined;

/** 1. Boosting a post of a squad you run that has no plan */
export const BoostSquadPost: Story = {
  render: () => <BoostPostModal isOpen post={acmePost} onRequestClose={noop} />,
};

/** 1. Boosting a personal post, with no squad to upgrade */
export const BoostPersonalPost: Story = {
  beforeEach: withSquads([]),
  render: () => (
    <BoostPostModal isOpen post={personalPost} onRequestClose={noop} />
  ),
};

/** 1. Boosting the squad itself */
export const BoostSquad: Story = {
  render: () => <BoostSquadModal isOpen squad={acme} onRequestClose={noop} />,
};

// The Cores packs, as Paddle would preview them in the US
const corePacks = [
  [600, '$5.99'],
  [1200, '$11.99'],
  [3000, '$29.99'],
  [6000, '$59.99'],
  [12000, '$119.99'],
  [30000, '$299.99'],
  [60000, '$599.99'],
].map(([cores, formatted]) => ({
  priceId: `pri_cores_${cores}`,
  metadata: {
    title: `${cores.toLocaleString('en-US')} Cores`,
    coresValue: cores,
  },
  price: { formatted, amount: 0 },
}));

const SeedCorePacks = ({ children }: { children: ReactElement }) => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { queryKey } = coresPricesQueryOptions({ user, isLoggedIn: true });
  client.setQueryData(queryKey, corePacks);
  client.setQueryDefaults(queryKey, { staleTime: Infinity });

  return children;
};

/** 2. Not enough Cores for a boost: Buy Cores, with the plan as the other way */
export const BuyCoresFromBoost: Story = {
  render: () => (
    <SeedCorePacks>
      <BuyCoresModal
        isOpen
        product={null}
        minCoresToBuy={33000}
        onRequestClose={noop}
        amountNeededCopy={
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            You need <strong>33,000 more Cores</strong> to boost the post.
          </Typography>
        }
        promo={<StartupsBuyCoresPromo sourceId={acme.id} />}
        origin={Origin.BoostPost}
      />
    </SeedCorePacks>
  ),
};

/** 3. The wallet page's widget column */
export const Wallet: Story = {
  render: () => (
    <div className="flex justify-center p-6">
      <div className="flex w-[22rem] flex-col gap-4">
        <StartupsWalletPromo />
        <PlusCoresGivebackWidget />
      </div>
    </div>
  ),
};

/** 4. The ads dashboard, for someone who has boosted before */
export const AdsDashboard: Story = {
  render: () => <AdsDashboardModal isOpen onRequestClose={noop} />,
};

/** 5. Manage: plan sections show locked, and open Subscription */
export const ManageLocked: Story = {
  render: () => (
    <SquadPageContextProvider squad={acme} isViewerReady>
      <SquadManageLayout section={SquadManageSection.Plan}>
        <SquadManagePlan />
      </SquadManageLayout>
    </SquadPageContextProvider>
  ),
};
