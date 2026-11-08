import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresProviders } from '../real/providers';
import { Shell, useAnimateCores } from '../flows/cores/Shell';
import { FlowStepper } from '../flows/cores/FlowStepper';
import {
  idoAward,
  receiveHistory,
  walletHandlers,
} from '../flows/cores/fixtures';
import { Wallet } from './cores/Wallet';
import { AwardNotificationPopup, NotificationsScreen } from './cores/Screens';
import { bunPost, PostModalOverFeed } from '../real/pages';

// "Receive an award", Flows/3 in the new look.

const BEFORE = 20;
const AFTER = BEFORE + idoAward.valueIncFees;
const HOME = '/';

const meta: Meta = {
  title: 'Cores & Boost/Redesign/3. Receive an award',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: walletHandlers(AFTER, receiveHistory) },
  },
};

export default meta;

type Story = StoryObj;

/** The award lands while you browse: popup, and the balance counts up */
const AwardArrives = ({ onOpen }: { onOpen?: () => void }): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const animateCores = useAnimateCores();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [arrivals, setArrivals] = useState(0);

  const arrive = useCallback(() => {
    setIsPopupOpen(true);
    animateCores(idoAward.valueIncFees);
  }, [animateCores]);

  useEffect(() => {
    const timer = window.setTimeout(arrive, 800);
    return () => window.clearTimeout(timer);
    // Once per arrival; `arrive` changes as the balance does
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivals]);

  return (
    <>
      <PostModalOverFeed post={bunPost} />
      {isPopupOpen && (
        <AwardNotificationPopup
          key={arrivals}
          isFloating
          onClick={onOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
      <Button
        className="opacity-60 fixed bottom-2 left-1/2 z-max -translate-x-1/2"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
        onClick={() => {
          setIsPopupOpen(false);
          updateUser({ ...user, balance: { amount: BEFORE } });
          setArrivals((count) => count + 1);
        }}
      >
        Storybook: send it again
      </Button>
    </>
  );
};

const steps = ['Award arrives', 'Notifications', 'Wallet'];

const WalkthroughFlow = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step > 0 && user && user.balance.amount !== AFTER) {
      updateUser({ ...user, balance: { amount: AFTER } });
    }
  }, [step, user, updateUser]);

  return (
    <Shell>
      {step === 0 && <AwardArrives onOpen={() => setStep(2)} />}
      {step === 1 && <NotificationsScreen onViewWallet={() => setStep(2)} />}
      {step === 2 && <Wallet highlightId={idoAward.id} />}
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
          'The award arrives on your post: open the popup, or step to the bell list and use View in wallet. Same path as Flows/3.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BEFORE} activePage={HOME}>
      <WalkthroughFlow />
    </CoresProviders>
  ),
};

export const AwardReceivedWithContext: Story = {
  name: '2 · Award received, with context',
  parameters: {
    docs: {
      description: {
        story:
          'The award rides on the sender’s avatar, the net Cores is a green pill, the note reads as a chat bubble, and View in wallet is a Float button next to Say thanks.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={AFTER} activePage="/notifications">
      <Shell>
        <NotificationsScreen />
        <AwardNotificationPopup isFloating />
      </Shell>
    </CoresProviders>
  ),
};

export const BalanceRefreshes: Story = {
  name: '3 · Balance refreshes',
  parameters: {
    docs: {
      description: {
        story:
          'The popup itself shows the balance counting up to its new value, so the refresh is visible wherever the header has no Cores pill.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BEFORE} activePage={HOME}>
      <Shell>
        <AwardArrives />
      </Shell>
    </CoresProviders>
  ),
};

export const WalletRowHighlighted: Story = {
  name: '4 · Wallet, row highlighted',
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
        <Wallet highlightId={idoAward.id} />
      </Shell>
    </CoresProviders>
  ),
};
