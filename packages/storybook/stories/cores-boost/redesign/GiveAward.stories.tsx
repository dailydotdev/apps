import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { awards } from '../real/catalog';
import { Stage } from '../flows/purchase/stage';
import {
  AwardNoteRedesign,
  AwardPickerRedesign,
  AwardSentRedesign,
} from './purchase/AwardRedesign';
import {
  BuyCoresProcessingRedesign,
  BuyCoresRedesignModal,
} from './purchase/BuyCoresRedesign';

// "2. Give an award" from the Flows pages, redrawn in the squads hub line.
// Same steps, labels and actions; only the look changes.

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

const WalkthroughFlow = (): ReactElement => {
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
        <AwardPickerRedesign
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
        <BuyCoresRedesignModal
          purpose="award"
          cost={product.value}
          product={product}
          onPay={(pack) => {
            setBought(pack.value);
            setStep('processing');
            settle(pack.value);
          }}
          onRequestClose={() => setStep('pick')}
        />
      )}
      {(step === 'processing' || step === 'timeout') && (
        <BuyCoresProcessingRedesign
          state={step}
          draftName={`Your ${product.name} award`}
          draftImage={product.image}
          onCheckAgain={() => {
            setStep('processing');
            settle(bought);
          }}
          onRequestClose={close}
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
        <AwardSentRedesign product={product} onRequestClose={close} />
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

export const PickAnAward = story(
  'The receiver leads the sheet, awards are quiet bordered tiles with the shortfall in a corner chip, and a summary row carries the pick above the CTA.',
  () => (
    <Stage>
      <AwardPickerRedesign
        initialAward="Coffee Mug"
        onBuyCores={noop}
        onPicked={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

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

export const Processing = story(
  'A glowing Core heads the screen, the saved award shows as a row, and the wallet link is a tertiary button.',
  () => (
    <Stage>
      <BuyCoresProcessingRedesign
        state="timeout"
        draftName="Your Coffee Mug award"
        draftImage={coffee.image}
        onCheckAgain={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

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

export const AwardSent = story(
  'The friendship art leads the success screen, with the award glowing over its edge and the Cores in a chip.',
  () => (
    <Stage>
      <AwardSentRedesign product={coffee} onRequestClose={noop} />
    </Stage>
  ),
  balance + 25,
);

export const OldIos = story(
  'Same redesigned picker; on builds without in-app purchase the CTA links to the App Store.',
  () => (
    <Stage>
      <AwardPickerRedesign
        initialAward="Coffee Mug"
        canPurchaseCores={false}
        onBuyCores={noop}
        onPicked={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

// The story index reads names statically, not through the helper
Walkthrough.storyName = 'Walkthrough';
PickAnAward.storyName = '2 · Pick an award';
BuyCores.storyName = '3 · Buy Cores, pack preselected';
Processing.storyName = '5 · Processing';
NoteAndSend.storyName = '6 · Note and send';
AwardSent.storyName = '7 · Award sent';
OldIos.storyName = '8 · Back where you were · old iOS';
