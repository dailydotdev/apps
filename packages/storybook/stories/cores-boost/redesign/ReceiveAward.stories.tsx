import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { streakHandlers } from '../real/handlers';
import { CoresProviders } from '../real/providers';
import { Shell } from '../flows/cores/Shell';
import {
  idoAward,
  receiveHistory,
  walletHandlers,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';

// "Receive an award" in the new look. The award notification and
// the balance refresh stay as production has them.

const BEFORE = 20;
const AFTER = BEFORE + idoAward.valueIncFees;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/3. Awards/Receive an award',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        ...streakHandlers({ balance: AFTER }),
        ...walletHandlers(AFTER, receiveHistory),
      ],
    },
  },
};

export default meta;

type Story = StoryObj;

export const WalletRowHighlighted: Story = {
  name: '4 · Wallet, award in history',
  parameters: {
    docs: {
      description: {
        story:
          'The award row is marked with a purple edge on a raised background; the fee is a caption line and the note a chat bubble.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={AFTER} activePage="/wallet">
      <Shell>
        <Wallet />
      </Shell>
    </CoresProviders>
  ),
};
