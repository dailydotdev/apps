import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RequestHandler } from 'msw';
import { delay, graphql, HttpResponse } from 'msw';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import { CoresProviders, noop } from '../real/providers';
import { streakHandlers } from '../real/handlers';
import { questHandlers } from '../real/pages';
import { Shell } from '../flows/cores/Shell';
import {
  afterPurchaseHistory,
  coffee,
  firstQuestReward,
  readQuest,
  stuckPurchase,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';
import { QuestScreen } from './cores/Screens';
import { CoresPurchasedModal, FirstCoresSheet } from './cores/Moments';
import { Wallet } from './cores/Wallet';
import { CoresPage } from './cores/CoresPage';
import { RecentPostsPicker } from './cores/BoostHeroTile';
import { BuyCoresRedesignModal } from './purchase/BuyCoresRedesign';

// Every case of "Wallet and buy Cores", one per story, each filling the
// window at its own size. "2. All states" loads these in iframes at each
// device width, so tablet:/laptop: and the phone sheets behave as in the app.

const BALANCE = 1275;
const FIRST_REWARD = 20;
const PURCHASED = 300;
/** Today's boost deal: 3 days at 5,000 a day, 30% off */
const DEAL_PRICE = 10500;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/3. States',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const walletState = ({
  balance = BALANCE,
  history = walletHistory,
  brokenStreak,
  extra = [],
}: {
  balance?: number;
  history?: UserTransaction[];
  brokenStreak?: number;
  /** Handlers that answer first, like a request that never ends */
  extra?: RequestHandler[];
} = {}): Story['parameters'] => ({
  msw: {
    handlers: [
      ...extra,
      ...streakHandlers({ balance, brokenStreak }),
      ...walletHandlers(balance, history),
    ],
  },
});

const WalletScreen = ({
  balance = BALANCE,
  isPlus,
  purchasedChange,
  children,
}: {
  balance?: number;
  isPlus?: boolean;
  purchasedChange?: number;
  /** What is open over the wallet */
  children?: ReactNode;
}): ReactElement => (
  <CoresProviders balance={balance} isPlus={isPlus}>
    <Shell>
      <Wallet purchasedChange={purchasedChange} />
    </Shell>
    {children}
  </CoresProviders>
);

const firstCores = (persona: 'reader' | 'poster'): Story => ({
  parameters: {
    msw: {
      handlers: [
        ...questHandlers(readQuest, true),
        ...streakHandlers({ balance: FIRST_REWARD }),
        ...walletHandlers(FIRST_REWARD, [firstQuestReward]),
      ],
    },
  },
  render: () => (
    <CoresProviders balance={FIRST_REWARD} activePage="/daily-quests">
      <Shell>
        <QuestScreen isClaimed />
        <FirstCoresSheet
          amount={FIRST_REWARD}
          persona={persona}
          onGotIt={noop}
        />
      </Shell>
    </CoresProviders>
  ),
});

export const FirstCoresReader: Story = {
  name: 'First Cores · reader',
  ...firstCores('reader'),
};

export const FirstCoresPoster: Story = {
  name: 'First Cores · poster',
  ...firstCores('poster'),
};

export const WalletDefault: Story = {
  name: 'Wallet',
  parameters: walletState(),
  render: () => <WalletScreen />,
};

export const WalletLoading: Story = {
  name: 'Wallet · loading',
  parameters: walletState({
    extra: [
      graphql.query('TransactionSummary', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
      graphql.query('transactions', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    ],
  }),
  render: () => <WalletScreen />,
};

export const WalletEmpty: Story = {
  name: 'Wallet · no Cores yet',
  parameters: walletState({ balance: 0, history: [] }),
  render: () => <WalletScreen balance={0} />,
};

export const WalletFirstCores: Story = {
  name: 'Wallet · first Cores only',
  parameters: walletState({
    balance: FIRST_REWARD,
    history: [firstQuestReward],
  }),
  render: () => <WalletScreen balance={FIRST_REWARD} />,
};

export const WalletPendingLong: Story = {
  name: 'Wallet · pending 10+ minutes',
  parameters: walletState({
    history: [stuckPurchase, ...walletHistory.slice(1)],
  }),
  render: () => <WalletScreen />,
};

export const WalletAfterPurchase: Story = {
  name: 'Wallet · after a purchase',
  parameters: walletState({
    balance: BALANCE + PURCHASED,
    history: afterPurchaseHistory,
  }),
  render: () => (
    <WalletScreen balance={BALANCE + PURCHASED} purchasedChange={PURCHASED} />
  ),
};

export const WalletStreakBroke: Story = {
  name: 'Wallet · streak broke yesterday',
  parameters: walletState({ brokenStreak: 30 }),
  render: () => <WalletScreen />,
};

export const WalletPlus: Story = {
  name: 'Wallet · Plus member',
  parameters: walletState(),
  render: () => <WalletScreen isPlus />,
};

export const DealPickerShort: Story = {
  name: 'Boost deal · not enough Cores',
  parameters: walletState(),
  render: () => (
    <WalletScreen>
      <RecentPostsPicker
        pick="deal"
        balance={BALANCE}
        onPick={noop}
        onBuyCores={noop}
        onRequestClose={noop}
      />
    </WalletScreen>
  ),
};

export const DealPickerEnough: Story = {
  name: 'Boost deal · enough Cores',
  parameters: walletState({ balance: DEAL_PRICE + BALANCE }),
  render: () => (
    <WalletScreen balance={DEAL_PRICE + BALANCE}>
      <RecentPostsPicker
        pick="deal"
        balance={DEAL_PRICE + BALANCE}
        onPick={noop}
        onRequestClose={noop}
      />
    </WalletScreen>
  ),
};

export const BuyFromWallet: Story = {
  name: 'Buy Cores · from the wallet',
  parameters: walletState(),
  render: () => (
    <WalletScreen>
      <BuyCoresRedesignModal cost={0} onPay={noop} onRequestClose={noop} />
    </WalletScreen>
  ),
};

export const BuyForBoost: Story = {
  name: 'Buy Cores · for the boost deal',
  parameters: walletState(),
  render: () => (
    <WalletScreen>
      <BuyCoresRedesignModal
        purpose="boost"
        cost={DEAL_PRICE}
        onPay={noop}
        onRequestClose={noop}
      />
    </WalletScreen>
  ),
};

export const BuyForAward: Story = {
  name: 'Buy Cores · for an award',
  parameters: walletState({
    balance: FIRST_REWARD,
    history: [firstQuestReward],
  }),
  render: () => (
    <WalletScreen balance={FIRST_REWARD}>
      <BuyCoresRedesignModal
        purpose="award"
        cost={coffee?.value ?? 0}
        product={coffee}
        onPay={noop}
        onRequestClose={noop}
      />
    </WalletScreen>
  ),
};

export const BuyPlus: Story = {
  name: 'Buy Cores · Plus member',
  parameters: walletState(),
  render: () => (
    <WalletScreen isPlus>
      <BuyCoresRedesignModal cost={0} onPay={noop} onRequestClose={noop} />
    </WalletScreen>
  ),
};

export const BuyCheckout: Story = {
  name: 'Buy Cores · checkout',
  parameters: walletState(),
  render: () => (
    <WalletScreen>
      <BuyCoresRedesignModal
        purpose="boost"
        cost={DEAL_PRICE}
        isCheckoutShown
        onPay={noop}
        onRequestClose={noop}
      />
    </WalletScreen>
  ),
};

export const Purchased: Story = {
  name: 'You got your Cores!',
  parameters: walletState({
    balance: BALANCE + PURCHASED,
    history: afterPurchaseHistory,
  }),
  render: () => (
    <WalletScreen balance={BALANCE + PURCHASED} purchasedChange={PURCHASED}>
      <CoresPurchasedModal amount={PURCHASED} onGotIt={noop} />
    </WalletScreen>
  ),
};

const coresPage = (isPlus?: boolean): Story => ({
  parameters: walletState(),
  render: () => (
    <CoresProviders
      balance={BALANCE}
      isPlus={isPlus}
      activePage="/cores"
      hasOwnLayout
    >
      <CoresPage />
    </CoresProviders>
  ),
});

export const CoresDefault: Story = {
  name: '/cores',
  ...coresPage(),
};

export const CoresPlus: Story = {
  name: '/cores · Plus member',
  ...coresPage(true),
};
