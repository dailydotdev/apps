import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationsScreen } from './cores/Screens';
import { CoresProviders } from '../real/providers';
import { activeHistory, streakHandlers } from '../real/handlers';
import { Shell } from '../flows/cores/Shell';
import { FlowStepper } from '../flows/cores/FlowStepper';
import {
  afterPurchaseHistory,
  idoAward,
  landedPurchase,
  stuckPurchase,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';
import { CoresPage } from './cores/CoresPage';
import { CoresPurchasedModal } from './cores/Moments';

// "Wallet and buying Cores", Flows/4 in the new look.

const BALANCE = 1275;
const PACK = landedPurchase.value;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/4. Wallet and buying',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const steps = ['Wallet', '/cores', 'Checkout', 'Back to the wallet'];

const beforePurchase = [idoAward, ...activeHistory];
let walkthroughHistory = beforePurchase;

const WalkthroughFlow = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const isPaid = step === 3;

  useEffect(() => {
    walkthroughHistory = isPaid
      ? [landedPurchase, ...beforePurchase]
      : beforePurchase;
    queryClient.invalidateQueries({ queryKey: [RequestKey.Transactions] });
  }, [isPaid, queryClient]);

  useEffect(() => {
    const expected = isPaid ? BALANCE + PACK : BALANCE;

    if (user && user.balance.amount !== expected) {
      updateUser({ ...user, balance: { amount: expected } });
    }
  }, [isPaid, user, updateUser]);

  return (
    <Shell>
      {step === 0 && <Wallet onBuyCores={() => setStep(1)} />}
      {(step === 1 || step === 2) && (
        <CoresPage initialPack={PACK} onPay={() => setStep(2)} />
      )}
      {step === 2 && (
        <CoresPurchasedModal amount={PACK} onGotIt={() => setStep(3)} />
      )}
      {step === 3 && <Wallet purchasedChange={PACK} />}
      <FlowStepper steps={steps} index={step} onChange={setStep} />
    </Shell>
  );
};

export const Walkthrough: Story = {
  name: 'Walkthrough',
  parameters: {
    msw: {
      handlers: [
        ...streakHandlers({ balance: BALANCE }),
        ...walletHandlers(BALANCE, () => walkthroughHistory),
      ],
    },
    docs: {
      description: {
        story:
          'Buy Cores, Pay for 300 Cores, Got it: back in the wallet with the new Cores showing. Same path as Flows/4.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE}>
      <WalkthroughFlow />
    </CoresProviders>
  ),
};

export const WaysIn: Story = {
  name: '1 · Ways in',
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
          'The same gated wallet links; the award notification row is the new card with View in wallet as a Float button.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE} activePage="/notifications">
      <Shell>
        <NotificationsScreen />
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

export const YouGotYourCores: Story = {
  name: '4 · You got your Cores!',
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
          'The success modal leads with the character art and the amount as a chip; same copy and Got it.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE + PACK} activePage="/cores">
      <Shell>
        <CoresPage initialPack={PACK} />
        <CoresPurchasedModal amount={PACK} onGotIt={() => undefined} />
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
