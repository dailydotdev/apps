import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresProviders } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { awards } from '../real/catalog';
import { Stage } from './purchase/stage';
import {
  AwardNoteFixed,
  AwardPickerFixed,
  AwardSent,
} from './purchase/AwardFixed';
import {
  BuyCoresFixedModal,
  BuyCoresProcessingFixed,
} from './purchase/BuyCoresFixed';

// "Give an award with a low balance", fixed lane of the flow board. Only the
// changed screens; Paddle checkout and "Award sent" are production as is.

const balance = 20;
const coffee = awards.find(({ name }) => name === 'Coffee Mug') as Product;

type Step =
  | 'pick'
  | 'buy'
  | 'processing'
  | 'timeout'
  | 'note'
  | 'sent'
  | 'done';

const Walkthrough = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState<Step>('pick');
  const [product, setProduct] = useState<Product>(coffee);
  const [bought, setBought] = useState(0);
  const [hasTimedOut, setTimedOut] = useState(false);
  const close = () => setStep('done');

  const settle = useCallback(
    (cores: number) => {
      const delay = hasTimedOut ? 1200 : 2000;
      setTimeout(() => {
        // The first try shows the timeout state, Check again lands the Cores
        if (!hasTimedOut) {
          setTimedOut(true);
          setStep('timeout');
          return;
        }
        if (user) {
          updateUser({ ...user, balance: { amount: balance + cores } });
        }
        setStep('note');
      }, delay);
    },
    [hasTimedOut, updateUser, user],
  );

  return (
    <Stage
      isDone={step === 'done'}
      onRestart={() => {
        if (user) {
          updateUser({ ...user, balance: { amount: balance } });
        }
        setTimedOut(false);
        setStep('pick');
      }}
    >
      {step === 'pick' && (
        <AwardPickerFixed
          initialAward={product.name}
          onBuyCores={(picked) => {
            setProduct(picked);
            setStep('buy');
          }}
          onPicked={(picked) => {
            setProduct(picked);
            setStep('note');
          }}
          onRequestClose={close}
        />
      )}
      {step === 'buy' && (
        <BuyCoresFixedModal
          purpose="award"
          cost={product.value}
          awardName={product.name}
          onPay={(pack) => {
            setBought(pack.value);
            setStep('processing');
            settle(pack.value);
          }}
          onRequestClose={() => setStep('pick')}
        />
      )}
      {(step === 'processing' || step === 'timeout') && (
        <BuyCoresProcessingFixed
          state={step}
          draftName={`Your ${product.name} award`}
          onCheckAgain={() => {
            setStep('processing');
            settle(bought);
          }}
          onRequestClose={close}
        />
      )}
      {step === 'note' && (
        <AwardNoteFixed
          product={product}
          coresAdded={bought}
          onBack={() => setStep('pick')}
          onSent={() => setStep('sent')}
          onRequestClose={close}
        />
      )}
      {step === 'sent' && (
        <AwardSent product={product} onRequestClose={close} />
      )}
    </Stage>
  );
};

const meta: Meta = {
  title: 'Cores & Boost/Flows/2. Give an award',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: coresHandlers({ balance }) },
  },
};

export default meta;

type Story = StoryObj;

const story = (
  name: string,
  description: string,
  render: () => ReactElement,
  startBalance = balance,
): Story => ({
  name,
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

export const Flow = story(
  'Walkthrough',
  'The whole fixed flow with 20 Cores: pick Coffee Mug, buy the pack that covers it, wait out a slow payment, then send the award without picking it again.',
  () => <Walkthrough />,
);

export const PickAnAward = story(
  '2 · Pick an award',
  'Each award shows how many Cores the balance is missing, the picked award stays highlighted, and the CTA says "Get 55 Cores and send" instead of "Buy Cores 75".',
  () => (
    <Stage>
      <AwardPickerFixed
        initialAward="Coffee Mug"
        onBuyCores={() => undefined}
        onPicked={() => undefined}
        onRequestClose={() => undefined}
      />
    </Stage>
  ),
);

export const BuyCores = story(
  '3 · Buy Cores, pack preselected',
  'The smallest pack that covers the shortfall is selected on every width, the copy counts the current balance, and the header "+" focuses the packs instead of doing nothing.',
  () => (
    <Stage>
      <BuyCoresFixedModal
        purpose="award"
        cost={coffee.value}
        awardName={coffee.name}
        onPay={() => undefined}
        onRequestClose={() => undefined}
      />
    </Stage>
  ),
);

export const Processing = story(
  '5 · Processing',
  'A slow payment stays in the modal with Check again and keeps the award draft, instead of "Processing timed out" sending the user to the wallet.',
  () => (
    <Stage>
      <BuyCoresProcessingFixed
        state="timeout"
        draftName="Your Coffee Mug award"
        onCheckAgain={() => undefined}
        onRequestClose={() => undefined}
      />
    </Stage>
  ),
);

export const NoteAndSend = story(
  '6 · Note and send',
  'Once the Cores land, the note step opens with Coffee Mug still selected, instead of "You got your Cores!" and the picker again.',
  () => (
    <Stage>
      <AwardNoteFixed
        product={coffee}
        coresAdded={100}
        onBack={() => undefined}
        onSent={() => undefined}
        onRequestClose={() => undefined}
      />
    </Stage>
  ),
  balance + 100,
);

export const OldIos = story(
  '8 · Back where you were · old iOS',
  'iOS builds without in-app purchase link to the App Store with "Update the app to buy Cores", instead of a disabled "Insufficient Cores" button.',
  () => (
    <Stage>
      <AwardPickerFixed
        initialAward="Coffee Mug"
        canPurchaseCores={false}
        onBuyCores={() => undefined}
        onPicked={() => undefined}
        onRequestClose={() => undefined}
      />
    </Stage>
  ),
);

// The story index reads names statically, not through the helper
Flow.storyName = 'Walkthrough';
PickAnAward.storyName = '2 · Pick an award';
BuyCores.storyName = '3 · Buy Cores, pack preselected';
Processing.storyName = '5 · Processing';
NoteAndSend.storyName = '6 · Note and send';
OldIos.storyName = '8 · Back where you were · old iOS';
