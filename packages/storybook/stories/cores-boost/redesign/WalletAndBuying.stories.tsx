import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoresProviders, noop } from '../real/providers';
import { streakHandlers } from '../real/handlers';
import { Shell } from '../flows/cores/Shell';
import type { FirstCoresPersona } from '../flows/cores/FirstCoresSheet';
import { questHandlers } from '../real/pages';
import { FirstCoresSheet } from './cores/Moments';
import { QuestScreen } from './cores/Screens';
import {
  afterPurchaseHistory,
  firstQuestReward,
  landedPurchase,
  readQuest,
  stuckPurchase,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';
import { CoresPage } from './cores/CoresPage';
import { BuyCoresRedesignModal } from './purchase/BuyCoresRedesign';

// "Wallet and buying Cores" in the new look, from your first Cores on.

const BALANCE = 1275;
const PACK = landedPurchase.value;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/1. Wallet and buy Cores',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const FIRST_REWARD = 20;

export const YourFirstCores: StoryObj<{ persona: FirstCoresPersona }> = {
  name: '1 · Your first Cores',
  args: { persona: 'reader' },
  argTypes: {
    persona: {
      control: { type: 'inline-radio' },
      options: ['reader', 'poster'],
      description: 'Posters see Boost first, readers see Award first',
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...questHandlers(readQuest, true),
        ...streakHandlers({ balance: FIRST_REWARD }),
        ...walletHandlers(FIRST_REWARD, [firstQuestReward]),
      ],
    },
    docs: {
      description: {
        story:
          'The character art leads, the amount sits under it, and each use is a row that describes it, with its price. Nothing to tap; Got it closes the sheet.',
      },
    },
  },
  render: ({ persona }) => (
    <CoresProviders
      key={persona}
      balance={FIRST_REWARD}
      activePage="/daily-quests"
    >
      <Shell>
        <QuestScreen isClaimed />
        <FirstCoresSheet
          amount={FIRST_REWARD}
          persona={persona}
          onGotIt={() => undefined}
        />
      </Shell>
    </CoresProviders>
  ),
};

type WalletArgs = { isPendingLong: boolean };

let walletStoryHistory = walletHistory;

export const WalletScreen: StoryObj<WalletArgs> = {
  name: '2 · Wallet',
  args: { isPendingLong: false },
  argTypes: {
    isPendingLong: {
      name: 'Pending for 10+ minutes',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE }),
        ...walletHandlers(BALANCE, () => walletStoryHistory),
      ],
    },
    docs: {
      description: {
        story:
          'Squads hub layout: one card (balance hero, totals strip, Use your Cores tiles, history rows with amount pills) and widgets for packs, Plus giveback, Docs and Terms. A pending purchase pulses in the bun color.',
      },
    },
  },
  render: ({ isPendingLong }) => {
    walletStoryHistory = isPendingLong
      ? [stuckPurchase, ...walletHistory.slice(1)]
      : walletHistory;

    return (
      <CoresProviders key={String(isPendingLong)} balance={BALANCE}>
        <Shell>
          <Wallet />
        </Shell>
      </CoresProviders>
    );
  },
};

export const BuyCoresPopup: Story = {
  name: '3 · Wallet · Buy Cores',
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE }),
        ...walletHandlers(BALANCE, walletHistory),
      ],
    },
    docs: {
      description: {
        story:
          'Buy Cores from the wallet: the redesigned pop-up over the wallet, with no target to cover, so no pack is preselected.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE}>
      <Shell>
        <Wallet />
      </Shell>
      <BuyCoresRedesignModal cost={0} onPay={noop} onRequestClose={noop} />
    </CoresProviders>
  ),
};

export const Cores: Story = {
  name: '4 · /cores',
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE }),
        ...walletHandlers(BALANCE, walletHistory),
      ],
    },
    docs: {
      description: {
        story:
          'Production’s /cores layout, with the character art in place of the hands video beside the packs.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE} activePage="/cores" hasOwnLayout>
      <CoresPage />
    </CoresProviders>
  ),
};

export const BackToTheWallet: Story = {
  name: '5 · Back to the wallet',
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE + PACK }),
        ...walletHandlers(BALANCE + PACK, afterPurchaseHistory),
      ],
    },
    docs: {
      description: {
        story:
          'Back in the wallet, the Purchased cell shows +300 in green and the purchase tops the history.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE + PACK}>
      <Shell>
        <Wallet purchasedChange={PACK} />
      </Shell>
    </CoresProviders>
  ),
};
