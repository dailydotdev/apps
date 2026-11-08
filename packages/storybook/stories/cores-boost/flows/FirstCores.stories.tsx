import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { CoresProviders } from '../real/providers';
import { Shell } from './cores/Shell';
import { FlowStepper } from './cores/FlowStepper';
import type { FirstCoresPersona } from './cores/FirstCoresSheet';
import { FirstCoresSheet } from './cores/FirstCoresSheet';
import { FixedWallet } from './cores/FixedWallet';
import { GatedQuestCard } from './cores/GatedEntryPoints';
import { questHandlers, SwapInPage } from '../real/pages';
import { findQuestCard, OwnPostScreen, QuestScreen } from './cores/screens';
import { firstQuestReward, readQuest, walletHandlers } from './cores/fixtures';

// Fixed lane of "First Cores: earning to a first spend" on the flow board.
// Only the screens the fix changes or adds; the rest stays as production.

const FIRST_REWARD = 20;
const NUDGE_BALANCE = 5400;

type Args = { persona: FirstCoresPersona };

const meta: Meta<Args> = {
  title: 'Cores & Boost/Flows/1. First Cores',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    mocked(useRouter).mockReturnValue({
      ...mockedRouter,
      isReady: true,
      pathname: '/',
      asPath: '/',
    } as never);
  },
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

const handlers = walletHandlers(FIRST_REWARD, [firstQuestReward]);

const steps = [
  'Quest reward',
  'Your first Cores',
  'Wallet',
  'Nudge on own post',
];

const WalkthroughFlow = ({
  persona,
}: {
  persona: FirstCoresPersona;
}): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState(0);

  // Jumping ahead lands on the balance that step expects. The nudge comes
  // later, once the balance covers the smallest boost.
  useEffect(() => {
    const expected = [0, FIRST_REWARD, FIRST_REWARD, NUDGE_BALANCE][step];

    if (user && step > 0 && user.balance.amount !== expected) {
      updateUser({ ...user, balance: { amount: expected } });
    }
  }, [step, user, updateUser]);

  return (
    <Shell>
      {step <= 1 && (
        <QuestScreen isClaimed={step === 1} onClaimed={() => setStep(1)} />
      )}
      {step === 1 && (
        <FirstCoresSheet
          amount={FIRST_REWARD}
          persona={persona}
          onShowMe={() => setStep(2)}
          onLater={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <FixedWallet
          onUse={(use) => {
            if (use === 'boost') {
              setStep(3);
            }
          }}
        />
      )}
      {step === 3 && <OwnPostScreen balance={NUDGE_BALANCE} />}
      <FlowStepper steps={steps} index={step} onChange={setStep} />
    </Shell>
  );
};

export const Walkthrough: Story = {
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'Claim the quest, then follow the screens; the bar at the bottom left jumps between steps.',
      },
    },
  },
  render: ({ persona }) => (
    <CoresProviders balance={0} activePage="/daily-quests">
      <WalkthroughFlow persona={persona} />
    </CoresProviders>
  ),
};

export const QuestReward: StoryObj<Args & { coresAccess: boolean }> = {
  name: '1 · Quest reward',
  args: { coresAccess: true },
  argTypes: {
    coresAccess: {
      control: 'boolean',
      description: 'Without Cores access (coresRole None) the reward hides',
    },
  },
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'Quest Cores rewards and the sidebar Cores cell only render with Cores access; today users without it see Cores and get redirected home from the wallet.',
      },
    },
  },
  render: ({ coresAccess }) => (
    <CoresProviders
      key={String(coresAccess)}
      balance={FIRST_REWARD}
      coresRole={coresAccess ? CoresRole.Creator : CoresRole.None}
      activePage="/daily-quests"
    >
      <QuestScreen />
      {!coresAccess && (
        <SwapInPage find={findQuestCard}>
          <GatedQuestCard quest={readQuest} />
        </SwapInPage>
      )}
    </CoresProviders>
  ),
};

export const YourFirstCores: Story = {
  name: '2 · Your first Cores',
  parameters: {
    msw: { handlers: [...questHandlers(readQuest, true), ...handlers] },
    docs: {
      description: {
        story:
          'New: shown once after the first claim, with the ways to spend Cores ordered by who the user is (persona control).',
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
          onShowMe={() => undefined}
          onLater={() => undefined}
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
          'The wallet adds "Use your Cores" under the totals, each row saying whether the balance covers it; today the only action is Buy Cores.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={FIRST_REWARD}>
      <Shell>
        <FixedWallet />
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
          'New: on your own post, only once the balance covers the smallest boost (boost_settings.min, 5,000 today), so it never leads to a purchase wall.',
      },
    },
  },
  render: () => (
    <CoresProviders balance={NUDGE_BALANCE} activePage="/posts/sb-bun-post">
      <Shell>
        <OwnPostScreen balance={NUDGE_BALANCE} />
      </Shell>
    </CoresProviders>
  ),
};
