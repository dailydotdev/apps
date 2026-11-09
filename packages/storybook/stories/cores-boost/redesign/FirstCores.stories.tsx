import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { streakHandlers } from '../real/handlers';
import { CoresProviders } from '../real/providers';
import { Shell } from '../flows/cores/Shell';
import { FlowStepper } from '../flows/cores/FlowStepper';
import type { FirstCoresPersona } from '../flows/cores/FirstCoresSheet';
import { GatedQuestCard } from '../flows/cores/GatedEntryPoints';
import {
  firstQuestReward,
  readQuest,
  walletHandlers,
} from '../flows/cores/fixtures';
import { findQuestCard } from '../flows/cores/screens';
import { questHandlers, SwapInPage } from '../real/pages';
import { FirstCoresSheet } from './cores/Moments';
import { Wallet } from './cores/Wallet';
import { OwnPostScreen, QuestScreen } from './cores/Screens';

// "First Cores", Flows/1 in the new look: the same screens and click path,
// on the squads hub frame with the character art.

const FIRST_REWARD = 20;
const NUDGE_BALANCE = 5400;

type Args = { persona: FirstCoresPersona; hasCoresAccess: boolean };

const meta: Meta<Args> = {
  title: 'Cores & Boost/Redesign/1. First Cores',
  parameters: { layout: 'fullscreen' },
  args: { persona: 'reader', hasCoresAccess: true },
  argTypes: {
    persona: {
      control: { type: 'inline-radio' },
      options: ['reader', 'poster'],
      description: 'Posters see Boost first, readers see Award first',
    },
    hasCoresAccess: {
      name: 'Cores access',
      control: { type: 'boolean' },
      description: 'Without it (coresRole None) Cores rewards are hidden',
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

const handlers = [
  ...streakHandlers({ balance: FIRST_REWARD }),
  ...walletHandlers(FIRST_REWARD, [firstQuestReward]),
];

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
        <Wallet
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
  name: 'Walkthrough',
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'Claim, Show me, then Boost your post: the same path as Flows/1, in the new look.',
      },
    },
  },
  render: ({ persona }) => (
    <CoresProviders balance={0} activePage="/daily-quests">
      <WalkthroughFlow persona={persona} />
    </CoresProviders>
  ),
};

export const QuestReward: Story = {
  name: '1 · Quest reward',
  parameters: {
    msw: { handlers },
    docs: {
      description: {
        story:
          'The quest card sits in a rounded popover with a shadow, like the hub widgets; toggle Cores access to see the gated version.',
      },
    },
  },
  render: ({ hasCoresAccess }) => (
    <CoresProviders
      key={String(hasCoresAccess)}
      balance={FIRST_REWARD}
      coresRole={hasCoresAccess ? CoresRole.Creator : CoresRole.None}
      activePage="/daily-quests"
    >
      <Shell>
        <QuestScreen />
        {!hasCoresAccess && (
          <SwapInPage find={findQuestCard}>
            <GatedQuestCard quest={readQuest} />
          </SwapInPage>
        )}
      </Shell>
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
          'The character art leads, the amount sits on it as a chip, and the uses are fixed-height rows with a coverage pill.',
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
          'A quieter card: Patchy on the boost rocket at the left, the balance on two lines, a Small Boost button.',
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
