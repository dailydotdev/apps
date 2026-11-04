import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { graphql, HttpResponse } from 'msw';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignType } from '@dailydotdev/shared/src/graphql/campaigns';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import { UserTransactionType } from '@dailydotdev/shared/src/graphql/njord';

// A logged-in squad admin with a paid seat, Cores in the bank and a few boosts
// behind them, enough for the Cores and boost surfaces to render offline.

export const noop = (): void => undefined;

// react-modal hides the app root while a modal is open and looks it up by id.
if (typeof document !== 'undefined' && !document.getElementById('__next')) {
  const root = document.createElement('div');
  root.id = '__next';
  document.body.appendChild(root);
}

const day = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * day);
const daysFromNow = (days: number) => new Date(Date.now() + days * day);

const img = (name: string) => `https://media.daily.dev/sb/${name}`;

export const user = {
  id: 'sb-user',
  name: 'Dana Levi',
  username: 'dana',
  image: img('avatar-dana'),
  permalink: 'https://app.daily.dev/dana',
  providers: ['github'],
  isPlus: false,
  reputation: 1820,
  balance: { amount: 2400 },
};

export const squad = {
  id: 'acme',
  name: 'Acme',
  handle: 'acme',
  permalink: 'https://app.daily.dev/squads/acme',
  image: img('squad-acme'),
  headerImage: img('squad-acme-cover'),
  description: 'Build, ship and observe APIs faster.',
  type: SourceType.Squad,
  public: true,
  active: true,
  membersCount: 6100,
  flags: { totalPosts: 184, totalViews: 418000, totalUpvotes: 12000 },
  currentMember: {
    role: SourceMemberRole.Admin,
    permissions: [
      SourcePermissions.BoostSquad,
      SourcePermissions.Post,
      SourcePermissions.ModeratePost,
    ],
  },
} as unknown as Squad;

export const post = {
  id: 'p1',
  title: 'We cut our API cold start from 900ms to 120ms. Here is how.',
  image: img('post-cold-start'),
  createdAt: daysAgo(2).toISOString(),
  permalink: 'https://app.daily.dev/posts/p1',
  commentsPermalink: 'https://app.daily.dev/posts/p1',
  tags: ['node', 'performance'],
  source: squad,
  flags: {},
} as unknown as Post;

const secondPost = {
  ...post,
  id: 'p2',
  title: 'Postmortem: the 14 minutes our webhooks went quiet',
  image: img('post-webhooks'),
} as unknown as Post;

export const activeCampaign = {
  id: 'c1',
  referenceId: post.id,
  state: 'ACTIVE',
  type: CampaignType.Post,
  createdAt: daysAgo(3),
  endedAt: daysFromNow(4),
  flags: {
    budget: 35000,
    spend: 14200,
    users: 3120,
    clicks: 410,
    impressions: 9800,
    newMembers: 0,
  },
  post,
  user,
} as unknown as Campaign;

export const squadCampaign = {
  id: 'c2',
  referenceId: squad.id,
  state: 'COMPLETED',
  type: CampaignType.Squad,
  createdAt: daysAgo(30),
  endedAt: daysAgo(23),
  flags: {
    budget: 21000,
    spend: 21000,
    users: 5400,
    clicks: 380,
    impressions: 15100,
    newMembers: 212,
  },
  source: squad,
  user,
} as unknown as Campaign;

export const stoppedCampaign = {
  id: 'c3',
  referenceId: secondPost.id,
  state: 'CANCELLED',
  type: CampaignType.Post,
  createdAt: daysAgo(12),
  endedAt: daysAgo(10),
  flags: {
    budget: 10000,
    spend: 6000,
    users: 1300,
    clicks: 90,
    impressions: 3900,
    newMembers: 0,
  },
  post: secondPost,
  user,
} as unknown as Campaign;

export const campaigns = [activeCampaign, squadCampaign, stoppedCampaign];

const corePacks = [
  [100, '$1.99'],
  [300, '$4.99'],
  [600, '$9.99'],
  [1200, '$19.99'],
  [3000, '$49.99'],
  [6000, '$99.99'],
  [15000, '$249.99'],
  [30000, '$499.99'],
  [60000, '$999.99'],
] as const;

export const corePrices = corePacks.map(([cores, formatted], index) => ({
  priceId: `pri_${cores}`,
  price: { amount: index + 1, formatted },
  currency: { code: 'USD', symbol: '$' },
  duration: 'one_time',
  metadata: {
    appsId: `cores_${cores}`,
    title: cores.toLocaleString('en-US'),
    idMap: { paddle: `pri_${cores}`, ios: `ios_${cores}` },
    coresValue: cores,
  },
}));

export const awards = [
  ['Cookie', 0],
  ['Coffee', 10],
  ['Rubber duck', 50],
  ['Bug squasher', 100],
  ['Rocket', 300],
  ['Lighthouse', 600],
  ['Unicorn', 1000],
  ['Golden keyboard', 3000],
].map(([name, value]) => ({
  id: `award-${name}`,
  type: 'award',
  name,
  value,
  image: img(`award-${name}`),
  flags: { description: name },
}));

const profile = (id: string, name: string) => ({
  id,
  name,
  username: id,
  image: img(`avatar-${id}`),
  permalink: `https://app.daily.dev/${id}`,
});

export const transactions = [
  {
    id: 't1',
    value: 14200,
    valueIncFees: 14200,
    status: 0,
    receiver: profile('daily', 'daily.dev'),
    sender: user,
    flags: { note: 'Boosted a post' },
    createdAt: daysAgo(0.2),
    referenceType: UserTransactionType.PostBoost,
    product: null,
  },
  {
    id: 't2',
    value: 3000,
    valueIncFees: 3000,
    status: 0,
    receiver: user,
    sender: null,
    flags: {},
    createdAt: daysAgo(1),
    product: null,
  },
  {
    id: 't3',
    value: 300,
    valueIncFees: 300,
    status: 0,
    receiver: profile('nimrod', 'Nimrod Kramer'),
    sender: user,
    flags: { note: 'This saved my weekend, thank you!' },
    createdAt: daysAgo(3),
    product: awards[4],
  },
  {
    id: 't4',
    value: 100,
    valueIncFees: 100,
    status: 0,
    receiver: user,
    sender: profile('chris', 'Chris Bongers'),
    flags: {},
    createdAt: daysAgo(5),
    product: awards[3],
  },
  {
    id: 't5',
    value: 1200,
    valueIncFees: 1200,
    status: 0,
    receiver: user,
    sender: null,
    flags: {},
    createdAt: daysAgo(9),
    referenceType: UserTransactionType.PlusCoresGiveback,
    product: null,
  },
] as unknown as UserTransaction[];

const connection = <T,>(nodes: T[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { endCursor: null, hasNextPage: false },
});

interface HandlerOptions {
  /** Cores in the squad wallet, `null` for no paid seat. */
  squadBalance?: number | null;
  campaignList?: Campaign[];
}

export const coresHandlers = ({
  squadBalance = 48000,
  campaignList = campaigns,
}: HandlerOptions = {}) => [
  graphql.query('DailyCampaignReachEstimate', ({ variables }) =>
    HttpResponse.json({
      data: {
        dailyCampaignReachEstimate: {
          min: Math.round(variables.budget / 4),
          max: Math.round(variables.budget * 0.96),
        },
      },
    }),
  ),
  graphql.query('SquadWallet', () =>
    HttpResponse.json({
      data: {
        source: {
          id: squad.id,
          name: squad.name,
          currentMember: { seat: squadBalance !== null },
        },
        squadSubscription: {
          plan: squadBalance === null ? null : 'team',
          coresBalance: squadBalance ?? 0,
        },
      },
    }),
  ),
  graphql.query('CampaignsList', () =>
    HttpResponse.json({ data: { campaignsList: connection(campaignList) } }),
  ),
  graphql.query('CampaignById', ({ variables }) =>
    HttpResponse.json({
      data: {
        campaignById:
          campaignList.find(({ id }) => id === variables.id) ?? null,
      },
    }),
  ),
  graphql.query('UserCampaignStats', () =>
    HttpResponse.json({
      data: {
        userCampaignStats: {
          spend: 41200,
          users: 9820,
          clicks: 880,
          impressions: 28800,
          newMembers: 212,
        },
      },
    }),
  ),
  graphql.query('PricingPreview', () =>
    HttpResponse.json({ data: { pricingPreview: corePrices } }),
  ),
  graphql.query('products', () =>
    HttpResponse.json({ data: { products: connection(awards) } }),
  ),
  graphql.query('TransactionSummary', () =>
    HttpResponse.json({
      data: {
        transactionSummary: { purchased: 4200, received: 1300, spent: 14500 },
      },
    }),
  ),
  graphql.query('transactions', () =>
    HttpResponse.json({ data: { transactions: connection(transactions) } }),
  ),
  graphql.query('checkCoresRole', () =>
    HttpResponse.json({ data: { checkCoresRole: { coresRole: 3 } } }),
  ),
];

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
};

export const CoresProviders = ({
  balance = user.balance.amount,
  children,
}: {
  balance?: number;
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={{ ...user, balance: { amount: balance }, coresRole: 3 } as never}
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
        squads={[squad]}
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
          <SettingsContext.Provider value={settings as never}>
            {children}
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};
