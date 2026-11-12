import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoresProviders } from '../real/providers';
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

export const WalletStreakBroke: Story = {
  name: '2 · Wallet, streak broke yesterday',
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE, brokenStreak: 24 }),
        ...walletHandlers(BALANCE, walletHistory),
      ],
    },
    docs: {
      description: {
        story:
          'The day after a streak breaks, the streak tile offers the restore and opens the production restore modal. Every other day it sells streak freezes.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE}>
      <Shell>
        <Wallet />
      </Shell>
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
          'Packs as tiles in the hub card, the balance as a chip, and the character art in place of the hands video, holding the selected pack and the checkout.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE} activePage="/cores">
      <Shell>
        <CoresPage />
      </Shell>
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
