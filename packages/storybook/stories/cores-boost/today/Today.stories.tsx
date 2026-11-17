import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RequestHandler } from 'msw';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import WalletPage from '../../../../webapp/pages/wallet';
import CoresPage from '../../../../webapp/pages/cores/index';
import { CoresProviders } from '../real/providers';
import {
  DailyQuestsPage,
  HomeFeedPage,
  NotificationsPage,
  questHandlers,
} from '../real/pages';
import { Processing } from './production';
import {
  afterPurchaseHistory,
  firstQuestReward,
  landedPurchase,
  readQuest,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';

// Today, 100% production: the screen production shows at each step of the
// first Cores and wallet flows, for the Today column of "Redesign/0. Today vs
// redesign". Only production components and pages.

const meta: Meta = {
  title: 'Cores & Boost/Today (production)',
  parameters: { layout: 'fullscreen' },
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
  handlers: RequestHandler[];
  activePage?: string;
  render: () => ReactElement;
}): Omit<Story, 'name'> => ({
  parameters: {
    msw: { handlers },
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
};

// 4. Wallet and buying

const WALLET_BALANCE = 1275;

export const WalletWaysIn: Story = {
  name: '4 · Ways in',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/notifications',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <NotificationsPage />,
  }),
};

export const Wallet: Story = {
  name: '4 · Wallet',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/wallet',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <WalletPage />,
  }),
};

export const Cores: Story = {
  name: '4 · /cores',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/cores',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <CoresPage />,
  }),
};

export const CoresPurchased: Story = {
  name: '4 · You got your Cores!',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    activePage: '/cores',
    handlers: walletHandlers(
      WALLET_BALANCE + landedPurchase.value,
      afterPurchaseHistory,
    ),
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
};

export const CoresGotItHome: Story = {
  name: '4 · Got it: the homepage',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    handlers: walletHandlers(
      WALLET_BALANCE + landedPurchase.value,
      afterPurchaseHistory,
    ),
    render: () => <HomeFeedPage />,
  }),
};
