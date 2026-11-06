import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
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
import { CoresProviders } from '../real/providers';
import { Shell, useAnimateCores } from './cores/Shell';
import { FlowStepper } from './cores/FlowStepper';
import { FixedWallet } from './cores/FixedWallet';
import {
  AwardNotificationPopup,
  AwardNotificationRow,
} from './cores/AwardNotification';
import { NotificationsScreen, OwnPostScreen } from './cores/screens';
import { idoAward, receiveHistory, walletHandlers } from './cores/fixtures';

// Fixed lane of "Receive an award" on the flow board. Only the screens the
// fix changes or adds; sending the award stays as production.

const BEFORE = 20;
const AFTER = BEFORE + idoAward.valueIncFees;

const meta: Meta = {
  title: 'Cores & Boost/Flows/3. Receive an award',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: walletHandlers(AFTER, receiveHistory) },
  },
  beforeEach: () => {
    mocked(useRouter).mockReturnValue({
      ...mockedRouter,
      isReady: true,
      pathname: '/wallet',
      asPath: '/wallet',
    } as never);
  },
};

export default meta;

type Story = StoryObj;

/** The award lands while you browse: popup, and the header balance counts up */
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
      <OwnPostScreen balance={BEFORE} showNudge={false} />
      {isPopupOpen && (
        <AwardNotificationPopup
          isFloating
          onClick={onOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
      <Button
        className="fixed bottom-4 right-4 z-max"
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

  // Jumping past the arrival lands on the balance it leaves behind
  useEffect(() => {
    if (step > 0 && user && user.balance.amount !== AFTER) {
      updateUser({ ...user, balance: { amount: AFTER } });
    }
  }, [step, user, updateUser]);

  return (
    <Shell>
      {step === 0 && <AwardArrives onOpen={() => setStep(2)} />}
      {step === 1 && <NotificationsScreen onViewWallet={() => setStep(2)} />}
      {step === 2 && <FixedWallet highlightId={idoAward.id} />}
      <FlowStepper steps={steps} index={step} onChange={setStep} />
    </Shell>
  );
};

export const Walkthrough: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The award arrives on your post: open the popup, or step to the bell list and use View in wallet.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BEFORE}>
      <WalkthroughFlow />
    </CoresProviders>
  ),
};

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);

export const AwardReceivedWithContext: Story = {
  name: '2 · Award received, with context',
  parameters: {
    docs: {
      description: {
        story:
          'The notification names the award, the net Cores, the post and the note, and adds View in wallet; today it says "gave you an Award" with Say thanks only. Needs the copy from the backend.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={AFTER}>
      <Shell>
        <div className="flex flex-col gap-8 p-6 laptop:flex-row laptop:items-start">
          <div className="flex w-full max-w-[40rem] flex-col gap-2">
            <Label>Notifications page and bell</Label>
            <div className="rounded-16 border border-border-subtlest-tertiary">
              <AwardNotificationRow />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Real-time popup</Label>
            <AwardNotificationPopup />
          </div>
        </div>
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
          'New: the header Cores pill counts up when a Cores notification arrives, the way a quest claim does; today it stays stale until the next boot.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={BEFORE}>
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
          'View in wallet lands on the award row: it explains the fee, shows the note and offers Say thanks, with "Use your Cores" above.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={AFTER}>
      <Shell>
        <FixedWallet highlightId={idoAward.id} />
      </Shell>
    </CoresProviders>
  ),
};
