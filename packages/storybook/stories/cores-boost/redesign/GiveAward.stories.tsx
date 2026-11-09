import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import * as today from '../today/Today.stories';
import {
  Processing as ProductionProcessing,
  ProductionAwardPicker,
  ProductionAwardSent,
  routeTo,
} from '../today/production';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { awards } from '../real/catalog';
import { Stage } from '../flows/purchase/stage';
import { AwardNoteRedesign } from './purchase/AwardRedesign';
import { BuyCoresRedesignModal } from './purchase/BuyCoresRedesign';

// "2. Give an award" from the Flows pages, redrawn in the squads hub line.
// Picking the award, processing and the sent screen stay as production has
// them; Buy Cores and the note are redesigned.

const balance = 20;
const coffee = awards.find(({ name }) => name === 'Coffee Mug') as Product;

type Step = 'pick' | 'buy' | 'processing' | 'note' | 'sent' | 'done';

const WalkthroughFlow = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState<Step>('pick');
  const [product, setProduct] = useState<Product>(coffee);
  const [bought, setBought] = useState(0);
  const close = () => setStep('done');

  return (
    <Stage
      isDone={step === 'done'}
      onRestart={() => {
        if (user) {
          updateUser({ ...user, balance: { amount: balance } });
        }
        setStep('pick');
      }}
    >
      {step === 'pick' && (
        <ProductionAwardPicker
          balance={user?.balance.amount ?? 0}
          onPicked={(picked) => {
            setProduct(picked);
            setStep('note');
          }}
          onBuyCores={(picked) => {
            setProduct(picked);
            setStep('buy');
          }}
          onRequestClose={close}
        />
      )}
      {step === 'buy' && (
        <BuyCoresRedesignModal
          purpose="award"
          cost={product.value}
          product={product}
          onPay={(pack) => {
            setBought(pack.value);
            setStep('processing');
            setTimeout(() => {
              if (user) {
                updateUser({
                  ...user,
                  balance: { amount: balance + pack.value },
                });
              }
              setStep('note');
            }, 2000);
          }}
          onRequestClose={() => setStep('pick')}
        />
      )}
      {step === 'processing' && (
        <ProductionProcessing
          step="PROCESSING"
          origin={Origin.Award}
          cores={bought}
        />
      )}
      {step === 'note' && (
        <AwardNoteRedesign
          product={product}
          coresAdded={bought}
          onBack={() => setStep('pick')}
          onSent={() => setStep('sent')}
          onRequestClose={close}
        />
      )}
      {step === 'sent' && (
        <ProductionAwardSent product={product} onRequestClose={close} />
      )}
    </Stage>
  );
};

const meta: Meta = {
  title: 'Cores & Boost/Redesign/2. Give an award',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: coresHandlers({ balance }) },
  },
};

export default meta;

type Story = StoryObj;

const story = (
  description: string,
  render: () => ReactElement,
  startBalance = balance,
): Story => ({
  parameters: {
    msw: { handlers: coresHandlers({ balance: startBalance }) },
    docs: { description: { story: description } },
  },
  render: () => (
    <CoresProviders balance={startBalance} activePage="/posts/sb-post">
      {render()}
    </CoresProviders>
  ),
});

export const Walkthrough = story(
  'The redesigned flow with 20 Cores: pick Coffee Mug, buy the pack that covers it, wait out a slow payment, then send the award.',
  () => <WalkthroughFlow />,
);

export const PickAnAward: Story = {
  ...today.AwardPickedTooExpensive,
  name: '2 · Pick an award',
  beforeEach: today.AwardPickedTooExpensive.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.AwardPickedTooExpensive.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const BuyCores = story(
  'A card names what the Cores are for and ticks once a pack covers it, packs are calm rows, and the friendship art replaces the two-hands video beside the checkout.',
  () => (
    <Stage>
      <BuyCoresRedesignModal
        purpose="award"
        cost={coffee.value}
        product={coffee}
        onPay={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const Processing: Story = {
  ...today.AwardProcessingTimedOut,
  name: '5 · Processing',
  beforeEach: today.AwardProcessingTimedOut.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.AwardProcessingTimedOut.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const NoteAndSend = story(
  'A check chip confirms the Cores, the award sits in a bordered card with its glow image and price, and the note follows.',
  () => (
    <Stage>
      <AwardNoteRedesign
        product={coffee}
        coresAdded={100}
        onBack={noop}
        onSent={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
  balance + 100,
);

export const AwardSent: Story = {
  ...today.AwardSent,
  name: '7 · Award sent',
  beforeEach: today.AwardSent.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.AwardSent.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const OldIos: Story = {
  ...today.AwardOldIos,
  name: '8 · Back where you were · old iOS',
  beforeEach: today.AwardOldIos.beforeEach ?? (() => routeTo('/')),
  parameters: {
    ...today.AwardOldIos.parameters,
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

// The story index reads names statically, not through the helper
Walkthrough.storyName = 'Walkthrough';
BuyCores.storyName = '3 · Buy Cores, pack preselected';
NoteAndSend.storyName = '6 · Note and send';
