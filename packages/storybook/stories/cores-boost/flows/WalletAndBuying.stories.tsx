import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
import CoresPage from '../../../../webapp/pages/cores/index';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationsScreen } from './cores/screens';
import { CoresProviders } from '../real/providers';
import { activeHistory } from '../real/handlers';
import { Shell } from './cores/Shell';
import { FlowStepper } from './cores/FlowStepper';
import { FixedWallet } from './cores/FixedWallet';
import { CoresPurchasedModal } from './cores/CoresPurchasedModal';
import {
  afterPurchaseHistory,
  idoAward,
  landedPurchase,
  stuckPurchase,
  walletHandlers,
  walletHistory,
} from './cores/fixtures';

// Fixed lane of "Wallet and buying Cores" on the flow board. Only the screens
// the fix changes or adds; Paddle checkout stays as production.

const BALANCE = 1275;
const PACK = landedPurchase.value;

const routeTo = (pathname: string, query: Record<string, string> = {}) => {
  const search = new URLSearchParams(query).toString();

  mocked(useRouter).mockReturnValue({
    ...mockedRouter,
    isReady: true,
    pathname,
    asPath: search ? `${pathname}?${search}` : pathname,
    query,
  } as never);
};

const coresQuery = { origin: Origin.WalletPageCTA, next: '/wallet' };

const meta: Meta = {
  title: 'Cores & Boost/Flows/4. Wallet and buying',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => routeTo('/wallet'),
};

export default meta;

type Story = StoryObj;

/** Production /cores, opened from the wallet with next=/wallet */
const CoresScreen = ({ onPaid }: { onPaid?: () => void }): ReactElement => (
  <>
    <CoresPage />
    {onPaid && (
      <div className="fixed right-4 top-16 z-max flex items-center gap-2 rounded-16 border border-border-subtlest-secondary bg-background-popover p-2 shadow-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Storybook: Paddle checkout can&apos;t open here
        </Typography>
        <Button
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          onClick={onPaid}
        >
          Pay for {PACK} Cores
        </Button>
      </div>
    )}
  </>
);

const steps = ['Wallet', '/cores', 'Checkout', 'Back to the wallet'];

const beforePurchase = [idoAward, ...activeHistory];
let walkthroughHistory = beforePurchase;

const WalkthroughFlow = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const isPaid = step === 3;

  useEffect(() => {
    routeTo(step === 1 || step === 2 ? '/cores' : '/wallet', coresQuery);
  }, [step]);

  // The purchase lands: new row, new totals, new balance
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
      {step === 0 && <FixedWallet onBuyCores={() => setStep(1)} />}
      {(step === 1 || step === 2) && (
        <CoresScreen onPaid={step === 1 ? () => setStep(2) : undefined} />
      )}
      {step === 2 && (
        <CoresPurchasedModal amount={PACK} onGotIt={() => setStep(3)} />
      )}
      {step === 3 && <FixedWallet purchasedChange={PACK} />}
      <FlowStepper steps={steps} index={step} onChange={setStep} />
    </Shell>
  );
};

export const Walkthrough: Story = {
  parameters: {
    msw: {
      handlers: walletHandlers(BALANCE, () => walkthroughHistory),
    },
    docs: {
      description: {
        story:
          'Buy Cores from the wallet, pay, and Got it brings you back to the wallet with the new Cores showing; today it lands on the feed.',
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
    msw: { handlers: walletHandlers(BALANCE, walletHistory) },
    docs: {
      description: {
        story:
          'The same wallet links, each behind Cores access, plus a new one from the award notification; the boost rows are on the After the boost page.',
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

export const Wallet: StoryObj<WalletArgs> = {
  name: '2 · Wallet',
  args: { isPendingLong: false },
  argTypes: {
    isPendingLong: {
      name: 'Pending for 10+ minutes',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    msw: { handlers: walletHandlers(BALANCE, () => walletStoryHistory) },
    docs: {
      description: {
        story:
          'Totals reconcile (a Fees total; Spent counts streak restores), "Use your Cores" sits under them, received awards explain the fee, and a pending purchase says what is happening.',
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
          <FixedWallet />
        </Shell>
      </CoresProviders>
    );
  },
};

export const Cores: Story = {
  name: '3 · /cores',
  parameters: {
    msw: { handlers: walletHandlers(BALANCE, walletHistory) },
    docs: {
      description: {
        story:
          'The production /cores page, now opened with next=/wallet from every wallet link (header, packs, See more options), so Got it returns to the wallet.',
      },
    },
  },
  beforeEach: () => routeTo('/cores', coresQuery),
  render: () => (
    <CoresProviders balance={BALANCE}>
      <Shell>
        <CoresScreen />
      </Shell>
    </CoresProviders>
  ),
};

export const BackToTheWallet: Story = {
  name: '5 · Back to the wallet',
  parameters: {
    msw: { handlers: walletHandlers(BALANCE + PACK, afterPurchaseHistory) },
    docs: {
      description: {
        story:
          'Got it returns to the wallet, where the Purchased total shows what was added and the purchase tops the history; today it lands on the homepage.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BALANCE + PACK}>
      <Shell>
        <FixedWallet purchasedChange={PACK} />
      </Shell>
    </CoresProviders>
  ),
};
