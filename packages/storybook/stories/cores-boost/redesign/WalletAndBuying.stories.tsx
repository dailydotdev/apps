import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoresProviders, noop } from '../real/providers';
import { streakHandlers } from '../real/handlers';
import { Shell } from '../flows/cores/Shell';
import {
  afterPurchaseHistory,
  landedPurchase,
  stuckPurchase,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';
import { CoresPage } from './cores/CoresPage';
import { BuyCoresRedesignModal } from './purchase/BuyCoresRedesign';

// "Wallet and buying Cores" in the new look.

const BALANCE = 1275;
const PACK = landedPurchase.value;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/1. Wallet and buy Cores/Wallet and buying',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

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
  name: '2 · Wallet · Buy Cores',
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
  name: '3 · /cores',
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
