import { delay, graphql, HttpResponse } from 'msw';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import {
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { awards } from '../../real/catalog';
import { activeHistory, coresHandlers } from '../../real/handlers';
import { productionFlags, viewer } from '../../real/providers';
import {
  bunPost,
  notificationsHandlers,
  questHandlers,
} from '../../real/pages';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import type { Notification } from '@dailydotdev/shared/src/graphql/notifications';
import { NotificationAvatarType } from '@dailydotdev/shared/src/graphql/notifications';

// People, posts and transactions for the Cores flows. Shapes follow
// production, as in real/handlers.ts.

const me = viewer as unknown as UserShortProfile;

const system = {
  id: 'system',
  name: 'daily.dev',
  username: 'system',
  image: 'https://cdn.daily.dev/assets/maskable_icon.png',
  permalink: 'https://app.daily.dev/system',
} as UserShortProfile;

export const ido = {
  id: 'sb-ido',
  name: 'Ido Kaplan',
  username: 'idokaplan',
  image: fallbackImages.avatar,
  permalink: 'https://app.daily.dev/idokaplan',
} as UserShortProfile;

export const coffee = awards.find(({ name }) => name === 'Coffee Mug');

export const ownPost = {
  id: 'sb-bun-post',
  title: 'Why we moved to Bun',
  image: cloudinaryPostImageCoverPlaceholder,
};

/** The smallest award and the smallest boost (one day at the daily minimum) */
export const minAward = Math.min(...awards.map(({ value }) => value));
export const minBoost = (productionFlags.boost_settings as { min: number }).min;

const minutesAgo = (minutes: number): Date =>
  new Date(Date.now() - minutes * 60 * 1000);

const row = (
  id: string,
  createdAt: Date,
  fields: Partial<UserTransaction>,
): UserTransaction => ({
  id,
  status: UserTransactionStatus.Success,
  receiver: me,
  value: 0,
  valueIncFees: 0,
  flags: {},
  balance: { amount: 0 },
  createdAt,
  ...fields,
});

export const firstQuestReward = row('fc-quest', minutesAgo(1), {
  sender: system,
  value: 20,
  valueIncFees: 20,
  referenceType: 'quest_reward:fc-quest' as UserTransactionType,
  flags: { note: 'Quest reward: Read 3 posts' },
});

export const idoAward = row('rcv-ido', minutesAgo(2), {
  sender: ido,
  product: coffee,
  value: 50,
  valueIncFees: 35,
  referenceType: 'post' as UserTransactionType,
  referenceId: ownPost.id,
  flags: { note: 'Great write-up!' },
});

export const receiveHistory: UserTransaction[] = [idoAward, firstQuestReward];

export const pendingPurchase = row('buy-pending', minutesAgo(1), {
  status: UserTransactionStatus.Processing,
  value: 300,
  valueIncFees: 300,
});

export const stuckPurchase = row('buy-stuck', minutesAgo(14), {
  status: UserTransactionStatus.Processing,
  value: 300,
  valueIncFees: 300,
});

export const landedPurchase = row('buy-landed', minutesAgo(0), {
  value: 300,
  valueIncFees: 300,
});

export const walletHistory: UserTransaction[] = [
  pendingPurchase,
  idoAward,
  ...activeHistory,
];

export const afterPurchaseHistory: UserTransaction[] = [
  landedPurchase,
  idoAward,
  ...activeHistory,
];

/** Fees count what daily.dev kept from the awards you received */
export const summaryWithFees = (history: UserTransaction[]) =>
  history.reduce(
    (summary, transaction) => {
      if (transaction.status !== UserTransactionStatus.Success) {
        return summary;
      }
      if (!transaction.sender && !transaction.product) {
        return { ...summary, purchased: summary.purchased + transaction.value };
      }
      if (transaction.sender?.id === me.id) {
        return { ...summary, spent: summary.spent + transaction.value };
      }
      return {
        ...summary,
        received: summary.received + transaction.valueIncFees,
        fees: summary.fees + transaction.value - transaction.valueIncFees,
      };
    },
    { purchased: 0, received: 0, spent: 0, fees: 0 },
  );

type History = UserTransaction[] | (() => UserTransaction[]);

const read = (history: History): UserTransaction[] =>
  typeof history === 'function' ? history() : history;

/**
 * The production handlers, with a summary that also returns fees. Pass a
 * function to change the history while the story runs (after a purchase).
 */
export const walletHandlers = (balance: number, history: History) => [
  graphql.query('TransactionSummary', async () => {
    await delay(400);
    return HttpResponse.json({
      data: { transactionSummary: summaryWithFees(read(history)) },
    });
  }),
  graphql.query('transactions', async () => {
    await delay(400);
    return HttpResponse.json({
      data: {
        transactions: {
          edges: read(history).map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  }),
  graphql.mutation('SayThanksForAward', async () => {
    await delay(400);
    return HttpResponse.json({ data: { sayThanksForAward: { _: true } } });
  }),
  ...questHandlers(readQuest),
  ...notificationsHandlers(awardNotifications()),
  ...coresHandlers({ balance }),
];

export const readQuest: UserQuest = {
  userQuestId: 'sb-user-quest',
  rotationId: 'sb-rotation',
  progress: 3,
  status: QuestStatus.Completed,
  locked: false,
  claimable: true,
  quest: {
    id: 'sb-quest',
    name: 'Read 3 posts',
    description: 'Open three posts from your feed today',
    type: QuestType.Daily,
    eventType: 'post_read',
    targetCount: 3,
  },
  rewards: [
    { type: QuestRewardType.Xp, amount: 30 },
    { type: QuestRewardType.Cores, amount: 20 },
  ],
};

const avatarOf = (person: UserShortProfile) => ({
  type: NotificationAvatarType.User,
  image: person.image,
  name: person.name,
  targetUrl: person.permalink,
  referenceId: person.id,
});

/**
 * The notifications page around the award: the award first, then the reader's
 * other recent notifications on the same post. The award row is the
 * production row; the flow stories draw their own over it.
 */
export const awardNotifications = (): Notification[] =>
  [
    {
      id: 'sb-award-notification',
      type: NotificationType.UserReceivedAward,
      icon: NotificationIconType.Core,
      title: `<p><b>${ido.name}</b> gave you ${coffee?.name} (+35 Cores)</p>`,
      description: '“Great write-up!”',
      avatars: [avatarOf(ido)],
      attachments: [],
      referenceId: 'sb-award-ido',
      targetUrl: '/wallet',
      createdAt: minutesAgo(2),
    },
    {
      id: 'sb-upvote-milestone',
      type: NotificationType.ArticleUpvoteMilestone,
      icon: NotificationIconType.Upvote,
      title: `<p>Your post <b>${bunPost.title}</b> reached 50 upvotes</p>`,
      avatars: [],
      attachments: [
        { type: 'post', image: bunPost.image, title: bunPost.title },
      ],
      referenceId: bunPost.id,
      targetUrl: bunPost.commentsPermalink,
      createdAt: minutesAgo(48),
    },
    {
      id: 'sb-new-comment',
      type: NotificationType.ArticleNewComment,
      icon: NotificationIconType.Comment,
      title: `<p><b>Noa Levi</b> commented on <b>${bunPost.title}</b></p>`,
      description:
        'Did you hit any issues with native addons? We had to keep two services on Node because of sharp.',
      avatars: [avatarOf({ ...ido, id: 'sb-noa', name: 'Noa Levi' })],
      attachments: [],
      referenceId: bunPost.id,
      targetUrl: bunPost.commentsPermalink,
      createdAt: minutesAgo(95),
    },
  ] as unknown as Notification[];
