import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { boostablePost } from '../real/screens';
import { Stage } from './purchase/stage';
import type { OwnPostState } from './purchase/BoostFixed';
import {
  BoostLaunchingModal,
  BoostLiveFixedModal,
  BoostPostFixedModal,
  OwnPostFixed,
  starterBoost,
} from './purchase/BoostFixed';
import {
  BuyCoresFixedModal,
  BuyCoresProcessingFixed,
} from './purchase/BuyCoresFixed';

// "First boost", fixed lane of the flow board. Only the changed screens;
// Paddle checkout is production as is.

const balance = 20;

/** Just published and untagged, so production is still reading it */
const newPost = {
  ...boostablePost,
  id: 'sb-new-post',
  createdAt: new Date().toISOString(),
  tags: [],
} as Post;

type Step = 'post' | 'form' | 'buy' | 'processing' | 'launching' | 'live';

const Walkthrough = (): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState<Step>('post');
  const [budget, setBudget] = useState(starterBoost);
  const total = budget.coresPerDay * budget.totalDays;
  const toPost = () => setStep('post');
  const onLaunched = useCallback(() => {
    if (user) {
      updateUser({
        ...user,
        balance: { amount: user.balance.amount - total },
      });
    }
    setStep('live');
  }, [total, updateUser, user]);

  return (
    <Stage
      background={
        <OwnPostFixed
          post={boostablePost}
          state="new"
          onBoost={() => {
            if (user) {
              updateUser({ ...user, balance: { amount: balance } });
            }
            setStep('form');
          }}
        />
      }
    >
      {step === 'form' && (
        <BoostPostFixedModal
          post={boostablePost}
          onBuyCores={(next) => {
            setBudget(next);
            setStep('buy');
          }}
          onBoost={(next) => {
            setBudget(next);
            setStep('launching');
          }}
          onRequestClose={toPost}
        />
      )}
      {step === 'buy' && (
        <BuyCoresFixedModal
          purpose="boost"
          cost={total}
          onPay={(pack) => {
            setStep('processing');
            setTimeout(() => {
              if (user) {
                updateUser({
                  ...user,
                  balance: { amount: user.balance.amount + pack.value },
                });
              }
              setStep('launching');
            }, 1500);
          }}
          onRequestClose={() => setStep('form')}
        />
      )}
      {step === 'processing' && (
        <BuyCoresProcessingFixed
          state="processing"
          draftName="Your boost"
          onCheckAgain={noop}
          onRequestClose={toPost}
        />
      )}
      {step === 'launching' && (
        <BoostLaunchingModal
          post={boostablePost}
          budget={budget}
          onLaunched={onLaunched}
          onChange={() => setStep('form')}
          onRequestClose={toPost}
        />
      )}
      {step === 'live' && (
        <BoostLiveFixedModal onSeeBoost={toPost} onRequestClose={toPost} />
      )}
    </Stage>
  );
};

/** Your own post behind the boost modals, as the strip leaves it */
const OwnPostBackdrop = (): ReactElement => (
  <OwnPostFixed post={boostablePost} state="new" onBoost={() => undefined} />
);

const meta: Meta = {
  title: 'Cores & Boost/Flows/5. First boost',
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
    <CoresProviders balance={startBalance} activePage="/posts/sb-boost-post">
      {render()}
    </CoresProviders>
  ),
});

const OwnPost = ({ state }: { state: OwnPostState }) => (
  <Stage
    background={
      <OwnPostFixed post={boostablePost} state={state} onBoost={noop} />
    }
  />
);

export const Flow = story(
  'Walkthrough',
  'The whole fixed flow with 20 Cores: Boost from the strip, take the starter preset, buy the pack that covers it, and the boost starts by itself.',
  () => <Walkthrough />,
);

export const OwnPostNew = story(
  '1 · Own post',
  'The new-post strip gets its own Boost button and shows on article posts too, next to the Boost button in the header.',
  () => <OwnPost state="new" />,
);

export const OwnPostTakingOff = story(
  '1 · Own post · taking off',
  'New: posts with traction from authors who never boosted get a "This post is taking off" strip.',
  () => <OwnPost state="takingOff" />,
);

export const BoostForm = story(
  '2 · Boost your post',
  'A starter preset (1 day · 2,000 Cores) sits next to the custom sliders, and with a low balance the CTA says "Get 1,980 Cores and boost" instead of "Boost post for 50K".',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostFixedModal
        post={boostablePost}
        onBuyCores={noop}
        onBoost={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BoostFormReading = story(
  '2 · Boost your post · reading the post',
  'While a new post is still being processed, the estimate says "Reading your post to estimate reach…" instead of a bare spinner.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostFixedModal
        post={newPost}
        onBuyCores={noop}
        onBoost={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BuyCores = story(
  '3 · Buy Cores, pack preselected',
  'The smallest pack covering the boost is selected, and the copy says "boost" instead of "Award".',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BuyCoresFixedModal
        purpose="boost"
        cost={starterBoost.coresPerDay * starterBoost.totalDays}
        onPay={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BoostLaunches = story(
  '5 · Boost launches',
  'New: once the Cores land, the boost the user set up starts by itself, with a Change option, instead of a second press on the form.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostLaunchingModal
        post={boostablePost}
        budget={starterBoost}
        onLaunched={noop}
        isPaused
        onChange={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
  2420,
);

export const BoostIsLive = story(
  '6 · Boost is live!',
  'The success modal points to the Boosts page ("See your boost") instead of opening the ads dashboard modal ("Track performance").',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostLiveFixedModal onSeeBoost={noop} onRequestClose={noop} />
    </Stage>
  ),
  420,
);

// The story index reads names statically, not through the helper
Flow.storyName = 'Walkthrough';
OwnPostNew.storyName = '1 · Own post';
OwnPostTakingOff.storyName = '1 · Own post · taking off';
BoostForm.storyName = '2 · Boost your post';
BoostFormReading.storyName = '2 · Boost your post · reading the post';
BuyCores.storyName = '3 · Buy Cores, pack preselected';
BoostLaunches.storyName = '5 · Boost launches';
BoostIsLive.storyName = '6 · Boost is live!';
