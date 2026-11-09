import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as today from '../today/Today.stories';
import { routeTo } from '../today/production';
import { streakHandlers } from '../real/handlers';
import { CoresProviders } from '../real/providers';
import { Shell } from '../flows/cores/Shell';
import { FlowStepper } from '../flows/cores/FlowStepper';
import {
  idoAward,
  receiveHistory,
  walletHandlers,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';
import { NotificationsPage } from '../real/pages';

// "Receive an award", Flows/3 in the new look. The award notification and
// the balance refresh stay as production has them.

const BEFORE = 20;
const AFTER = BEFORE + idoAward.valueIncFees;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/3. Receive an award',
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

const steps = ['Notifications', 'Wallet'];

const WalkthroughFlow = (): ReactElement => {
  const [step, setStep] = useState(0);

  return (
    <Shell>
      {step === 0 && <NotificationsPage />}
      {step === 1 && <Wallet />}
      <FlowStepper steps={steps} index={step} onChange={setStep} />
    </Shell>
  );
};

export const Walkthrough: Story = {
  name: 'Walkthrough',
  parameters: {
    docs: {
      description: {
        story:
          'The award notification as production shows it, then the redesigned wallet with the award in its history.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={AFTER} activePage="/notifications">
      <WalkthroughFlow />
    </CoresProviders>
  ),
};

export const AwardReceivedWithContext: Story = {
  ...today.ReceiveNotification,
  name: '2 · Award received, with context',
  beforeEach: today.ReceiveNotification.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.ReceiveNotification.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const BalanceRefreshes: Story = {
  ...today.ReceiveNotification,
  name: '3 · Balance refreshes',
  beforeEach: today.ReceiveNotification.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.ReceiveNotification.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

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
