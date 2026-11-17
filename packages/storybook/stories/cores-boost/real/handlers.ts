import { delay, graphql, HttpResponse } from 'msw';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import {
  ProductType,
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { awards, corePacks } from './catalog';
import { viewer } from './providers';
import {
  boostNotifications,
  homeFeedHandlers,
  notificationsHandlers,
  postPageHandlers,
} from './pages';

// The production GraphQL operations these screens run, answered by name.
// Row shapes follow production: awards pay the receiver 70% (`valueIncFees`),
// quest rewards come from the `system` user with a "Quest reward: …" note.

const NETWORK_MS = 400;

const system: UserShortProfile = {
  id: 'system',
  name: 'daily.dev',
  username: 'system',
  image: 'https://cdn.daily.dev/assets/maskable_icon.png',
  permalink: 'https://app.daily.dev/system',
} as UserShortProfile;

const me = viewer as unknown as UserShortProfile;

const person = (id: string, name: string, username: string) =>
  ({
    id,
    name,
    username,
    image: fallbackImages.avatar,
    permalink: `https://app.daily.dev/${username}`,
  }) as UserShortProfile;

const sam = person('sb-sam', 'Sam Rivera', 'samrivera');
const noa = person('sb-noa', 'Noa Levi', 'noalevi');

const awardNamed = (name: string) =>
  awards.find((product) => product.name === name);

const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const row = (
  id: string,
  days: number,
  fields: Partial<UserTransaction>,
): UserTransaction => ({
  id,
  status: UserTransactionStatus.Success,
  receiver: me,
  value: 0,
  valueIncFees: 0,
  flags: {},
  balance: { amount: 0 },
  createdAt: daysAgo(days),
  ...fields,
});

const questReward = (id: string, days: number, quest: string, value: number) =>
  row(id, days, {
    sender: system,
    value,
    valueIncFees: value,
    referenceType: `quest_reward:${id}` as UserTransactionType,
    flags: { note: `Quest reward: ${quest}` },
  });

/** A new user: Cores from quests only, never spent */
export const questOnlyHistory: UserTransaction[] = [
  questReward('q1', 0, 'Adventure time', 5),
  questReward('q2', 1, 'Friendly neighbor', 5),
  questReward('q3', 2, 'Squad Collector', 15),
  questReward('q4', 4, 'Chairman of the Guild', 5),
];

/** A creator who receives, sends and buys */
export const activeHistory: UserTransaction[] = [
  row('a1', 0, {
    sender: sam,
    product: awardNamed('Heart'),
    value: 50,
    valueIncFees: 35,
    referenceType: 'post' as UserTransactionType,
    flags: { note: 'Great write-up, thanks!' },
  }),
  questReward('a2', 0, 'Adventure time', 5),
  row('a3', 1, {
    sender: me,
    receiver: noa,
    product: awardNamed('Pizza'),
    value: 150,
    valueIncFees: 105,
    referenceType: 'comment' as UserTransactionType,
    flags: { note: 'Slice coming up!' },
  }),
  row('a4', 2, {
    sender: me,
    receiver: system,
    product: {
      id: '6f1e1a2f-3f3a-4f2f-9c1e-8b1f6ef34a02',
      type: ProductType.StreakFreeze,
      name: 'Streak freeze 3-pack',
      image:
        'https://media.daily.dev/image/upload/s--p6OHIH91--/f_auto,q_auto/v1784706019/webapp/streak-freeze-cube-square',
      value: 400,
    },
    value: 400,
    valueIncFees: 280,
    flags: { note: 'Streak freeze purchase' },
  }),
  row('a5', 3, { value: 600, valueIncFees: 600 }),
  row('a6', 5, {
    sender: noa,
    product: awardNamed('Smiley Face'),
    value: 10,
    valueIncFees: 7,
    referenceType: UserTransactionType.User,
    flags: { note: 'Thanks for the help in the squad' },
  }),
  questReward('a7', 6, 'Squad Collector', 15),
];

const summaryOf = (history: UserTransaction[]) =>
  history.reduce(
    (summary, transaction) => {
      if (!transaction.sender && !transaction.product) {
        return { ...summary, purchased: summary.purchased + transaction.value };
      }
      if (transaction.sender?.id === me.id) {
        return { ...summary, spent: summary.spent + transaction.value };
      }
      return {
        ...summary,
        received: summary.received + transaction.valueIncFees,
      };
    },
    { purchased: 0, received: 0, spent: 0 },
  );

/** Daily reach grows with the budget; production only estimates your own posts */
const reachFor = (budget: number) => ({
  min: Math.round(budget * 0.18),
  max: Math.round(budget * 0.26),
});

export interface CoresHandlersOptions {
  /** The viewer's balance before anything is spent */
  balance?: number;
  history?: UserTransaction[];
  /** Squad wallet offered in the boost modal, for paid squad seats */
  squadWallet?: { name: string; balance: number } | null;
}

const streakFreezeImage =
  'https://media.daily.dev/image/upload/s--p6OHIH91--/f_auto,q_auto/v1784706019/webapp/streak-freeze-cube-square';

export const streakFreezeProducts = [
  { id: 'sb-freeze-1', quantity: 1, value: 150 },
  { id: 'sb-freeze-3', quantity: 3, value: 400 },
].map(({ id, quantity, value }) => ({
  id,
  name: quantity === 1 ? 'Streak freeze' : `Streak freeze ${quantity}-pack`,
  value,
  image: streakFreezeImage,
  flags: { quantity },
}));

/** What restoring a lost streak costs, the day after it breaks */
export const STREAK_RECOVER_COST = 250;

export const coresHandlers = ({
  balance = 0,
  history = [],
  squadWallet = null,
}: CoresHandlersOptions = {}) => [
  graphql.query('products', () =>
    HttpResponse.json({
      data: {
        products: {
          edges: awards.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    }),
  ),
  graphql.query('PricingPreview', async () => {
    await delay(NETWORK_MS);
    return HttpResponse.json({ data: { pricingPreview: corePacks } });
  }),
  graphql.query('TransactionSummary', async () => {
    await delay(NETWORK_MS);
    return HttpResponse.json({
      data: { transactionSummary: summaryOf(history) },
    });
  }),
  graphql.query('transactions', async () => {
    await delay(NETWORK_MS);
    return HttpResponse.json({
      data: {
        transactions: {
          edges: history.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  }),
  graphql.mutation('award', async ({ variables }) => {
    await delay(NETWORK_MS);
    const product = awards.find(({ id }) => id === variables.productId);
    return HttpResponse.json({
      data: {
        award: {
          transactionId: 'sb-award',
          balance: { amount: balance - (product?.value ?? 0) },
        },
      },
    });
  }),
  graphql.query('DailyCampaignReachEstimate', async ({ variables }) => {
    await delay(NETWORK_MS);
    return HttpResponse.json({
      data: { dailyCampaignReachEstimate: reachFor(Number(variables.budget)) },
    });
  }),
  graphql.mutation('StartCampaign', async ({ variables }) => {
    await delay(NETWORK_MS);
    const spend = Number(variables.budget) * Number(variables.duration);
    return HttpResponse.json({
      data: {
        startCampaign: {
          transactionId: 'sb-boost',
          referenceId: 'sb-campaign',
          walletSourceId: null,
          balance: { amount: balance - spend },
        },
      },
    });
  }),
  graphql.query('SquadWallet', () =>
    HttpResponse.json({
      data: squadWallet
        ? {
            source: {
              id: 'sb-squad',
              name: squadWallet.name,
              currentMember: { seat: true },
            },
            squadSubscription: {
              plan: 'startups',
              coresBalance: squadWallet.balance,
            },
          }
        : {
            source: { id: 'sb-squad', name: '', currentMember: null },
            squadSubscription: { plan: null, coresBalance: 0 },
          },
    }),
  ),
  // daily.dev for Startups promos: none dismissed, the launch cashback on
  graphql.query('CompletedUserActions', () =>
    HttpResponse.json({ data: { actions: [] } }),
  ),
  graphql.mutation('CompleteAction', () =>
    HttpResponse.json({ data: { completeAction: { _: true } } }),
  ),
  graphql.query('StartupsCashbackPromo', () =>
    HttpResponse.json({
      data: { startupsCashbackPromo: { percentage: 500, months: 12 } },
    }),
  ),
  // The real pages behind the screens: the home feed and the post page
  ...homeFeedHandlers,
  ...postPageHandlers,
  ...notificationsHandlers(boostNotifications()),
];

/**
 * Streak restore and freezes, behind the wallet's streak tile. Kept apart from
 * coresHandlers so the shell's streak only shows where a story asks for it.
 */
export const streakHandlers = ({
  balance,
  brokenStreak,
}: {
  balance: number;
  /** Length of the streak that broke yesterday, while it can be restored */
  brokenStreak?: number;
}) => [
  graphql.query('UserStreak', () =>
    HttpResponse.json({
      data: {
        userStreak: {
          max: Math.max(brokenStreak ?? 0, 24),
          total: 140,
          current: brokenStreak ? 0 : 12,
          lastViewAt: new Date().toISOString(),
          weekStart: 1,
          freezesAvailable: 1,
        },
      },
    }),
  ),
  graphql.query('UserStreakRecover', () =>
    HttpResponse.json({
      data: {
        streakRecover: {
          canRecover: !!brokenStreak,
          cost: STREAK_RECOVER_COST,
          regularCost: STREAK_RECOVER_COST,
          oldStreakLength: brokenStreak ?? 0,
        },
      },
    }),
  ),
  graphql.mutation('RecoverStreak', async () => {
    await delay(NETWORK_MS);
    return HttpResponse.json({
      data: {
        recoverStreak: {
          max: 24,
          total: 140,
          current: brokenStreak ?? 0,
          lastViewAt: new Date().toISOString(),
          weekStart: 1,
          freezesAvailable: 1,
          balance: { amount: balance - STREAK_RECOVER_COST },
        },
      },
    });
  }),
  graphql.query('StreakFreezeProducts', () =>
    HttpResponse.json({
      data: { streakFreezeProducts },
    }),
  ),
  graphql.query('UserStreakFreezeDates', () =>
    HttpResponse.json({ data: { userStreakFreezeDates: [] } }),
  ),
  graphql.mutation('PurchaseStreakFreeze', async ({ variables }) => {
    await delay(NETWORK_MS);
    const product = streakFreezeProducts.find(
      ({ id }) => id === variables.productId,
    );
    return HttpResponse.json({
      data: {
        purchaseStreakFreeze: {
          freezesAvailable: 1 + (product?.flags.quantity ?? 0),
          balance: { amount: balance - (product?.value ?? 0) },
          transactionId: 'sb-freeze',
        },
      },
    });
  }),
];
