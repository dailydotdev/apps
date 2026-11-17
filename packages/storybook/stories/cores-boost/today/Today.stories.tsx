import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RequestHandler } from 'msw';
import WalletPage from '../../../../webapp/pages/wallet';
import CoresPage from '../../../../webapp/pages/cores/index';
import { BoostNewPostStrip } from '@dailydotdev/shared/src/features/boost/BoostNewPostStrip';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { CoresProviders } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import {
  DailyQuestsPage,
  HomeFeedPage,
  NotificationsPage,
  PostPage,
  bunPost,
  ownArticle,
  questHandlers,
} from '../real/pages';
import { boostablePost } from '../real/screens';
import { Processing, routeTo } from './production';
import {
  firstQuestReward,
  landedPurchase,
  readQuest,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';

// Today, 100% production: the screen production shows at each step of the
// first Cores and wallet flows, for the Today column of "Redesign/0. Today vs
// redesign". Only production components and pages; where the redesign adds a
// screen, the story shows what production shows at that moment instead.

/** Dana's own post as production shows it, with the new-post strip */
const OwnPost = ({
  post = boostablePost,
  isNew = true,
  children,
}: {
  post?: Post;
  isNew?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <PostPage
    post={ownArticle(post, isNew)}
    banner={isNew && <BoostNewPostStrip />}
  >
    {children}
  </PostPage>
);

const meta: Meta = {
  title: 'Cores & Boost/Today (production)',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => routeTo('/'),
};

export default meta;

type Story = StoryObj;

const screen = ({
  balance,
  handlers,
  activePage = '/',
  render,
}: {
  balance: number;
  handlers?: RequestHandler[];
  activePage?: string;
  render: () => ReactElement;
}): Omit<Story, 'name'> => ({
  parameters: {
    msw: { handlers: handlers ?? coresHandlers({ balance }) },
  },
  render: () => (
    <CoresProviders balance={balance} activePage={activePage}>
      {render()}
    </CoresProviders>
  ),
});

// 1. First Cores

export const FirstCoresQuestReward: Story = {
  name: '1 · Quest reward',
  ...screen({
    balance: 0,
    activePage: '/daily-quests',
    handlers: [...questHandlers(readQuest), ...walletHandlers(0, [])],
    render: () => <DailyQuestsPage />,
  }),
};

export const FirstCoresAfterClaim: Story = {
  name: '1 · After the claim',
  ...screen({
    balance: 20,
    activePage: '/daily-quests',
    handlers: [
      ...questHandlers(readQuest, true),
      ...walletHandlers(20, [firstQuestReward]),
    ],
    render: () => <DailyQuestsPage />,
  }),
};

export const FirstCoresWallet: Story = {
  name: '1 · Wallet',
  ...screen({
    balance: 20,
    activePage: '/wallet',
    handlers: walletHandlers(20, [firstQuestReward]),
    render: () => <WalletPage />,
  }),
  beforeEach: () => routeTo('/wallet'),
};

export const FirstCoresOwnPost: Story = {
  name: '1 · Own post',
  ...screen({
    balance: 5400,
    activePage: `/posts/${bunPost.id}`,
    render: () => <OwnPost post={bunPost} />,
  }),
};

// 2. Wallet and buying

const WALLET_BALANCE = 1275;

export const WalletWaysIn: Story = {
  name: '2 · Ways in',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/notifications',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <NotificationsPage />,
  }),
  beforeEach: () => routeTo('/notifications'),
};

export const Wallet: Story = {
  name: '2 · Wallet',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/wallet',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <WalletPage />,
  }),
  beforeEach: () => routeTo('/wallet'),
};

export const Cores: Story = {
  name: '2 · /cores',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/cores',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <CoresPage />,
  }),
  beforeEach: () => routeTo('/cores', { origin: Origin.WalletPageCTA }),
};

export const CoresPurchased: Story = {
  name: '2 · You got your Cores!',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    activePage: '/cores',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => (
      <>
        <CoresPage />
        <Processing
          step="COMPLETED"
          origin={Origin.WalletPageCTA}
          cores={landedPurchase.value}
        />
      </>
    ),
  }),
  beforeEach: () => routeTo('/cores', { origin: Origin.WalletPageCTA }),
};

export const CoresGotItHome: Story = {
  name: '2 · Got it: the homepage',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    handlers: walletHandlers(
      WALLET_BALANCE + landedPurchase.value,
      walletHistory,
    ),
    render: () => <HomeFeedPage />,
  }),
};
