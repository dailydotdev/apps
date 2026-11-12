import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { streakHandlers } from '../real/handlers';
import { CoresProviders } from '../real/providers';
import { Shell } from '../flows/cores/Shell';
import type { FirstCoresPersona } from '../flows/cores/FirstCoresSheet';
import {
  firstQuestReward,
  readQuest,
  walletHandlers,
} from '../flows/cores/fixtures';
import { questHandlers } from '../real/pages';
import { FirstCoresSheet } from './cores/Moments';
import { Wallet } from './cores/Wallet';
import { OwnPostScreen, QuestScreen } from './cores/Screens';

// "First Cores" in the new look: the same screens and click path,
// on the squads hub frame with the character art.

const FIRST_REWARD = 20;
const NUDGE_BALANCE = 5400;

type Args = { persona: FirstCoresPersona };

const meta: Meta<Args> = {
  title: 'Cores & Boost/Redesign/1. Wallet and buy Cores/First Cores',
  parameters: { layout: 'fullscreen' },
  args: { persona: 'reader' },
  argTypes: {
    persona: {
      control: { type: 'inline-radio' },
      options: ['reader', 'poster'],
      description: 'Posters see Boost first, readers see Award first',
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

const handlers = [
  ...streakHandlers({ balance: FIRST_REWARD }),
  ...walletHandlers(FIRST_REWARD, [firstQuestReward]),
];

export const YourFirstCores: Story = {
  name: '2 · Your first Cores',
  parameters: {
    msw: { handlers: [...questHandlers(readQuest, true), ...handlers] },
    docs: {
      description: {
        story:
          'The character art leads, the amount sits on it as a chip, and each use is a row that describes it, with its price and a coverage pill. Nothing to tap; Got it closes the sheet.',
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

export const WalletUseYourCores: Story = {
  name: '3 · Wallet with "Use your Cores"',
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'The wallet in the squads hub layout: balance hero with the art, totals in one strip, Use your Cores as tiles, buying and help as widgets.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={FIRST_REWARD}>
      <Shell>
        <Wallet />
      </Shell>
    </CoresProviders>
  ),
};

export const NudgeOnOwnPost: Story = {
  name: '4 · Nudge on own post',
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'The same one-row strip as the boost flow, saying your balance is enough to boost this post.',
      },
    },
  },
  render: () => (
    <CoresProviders
      balance={NUDGE_BALANCE}
      activePage="/posts/why-we-moved-to-bun"
    >
      <Shell>
        <OwnPostScreen balance={NUDGE_BALANCE} />
      </Shell>
    </CoresProviders>
  ),
};
