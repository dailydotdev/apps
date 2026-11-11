import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import AuthContext, {
  useAuthContext,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Processing as ProductionProcessing } from '../today/production';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { boostablePost } from '../real/screens';
import { Stage } from '../flows/purchase/stage';
import type { OwnPostState } from '../flows/purchase/BoostFixed';
import {
  BoostPostFixedModal,
  starterBoost,
} from '../flows/purchase/BoostFixed';
import {
  BoostLaunchingRedesign,
  BoostLiveRedesign,
  OwnPostRedesign,
} from './purchase/BoostRedesign';
import { BuyCoresRedesignModal } from './purchase/BuyCoresRedesign';
import { BoostPostCompactModal } from './purchase/BoostCompact';

// "5. First boost", redrawn in the squads hub line.
// Same steps, labels and actions; only the look changes.

const balance = 20;

/** Just published and untagged, so production is still reading it */
const newPost = {
  ...boostablePost,
  id: 'sb-new-post',
  createdAt: new Date().toISOString(),
  tags: [],
} as Post;

type Step = 'post' | 'form' | 'buy' | 'processing' | 'launching' | 'live';

const WalkthroughFlow = (): ReactElement => {
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
        <OwnPostRedesign
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
        <BuyCoresRedesignModal
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
        <ProductionProcessing
          step="PROCESSING"
          origin={Origin.BoostPost}
          cores={total}
        />
      )}
      {step === 'launching' && (
        <BoostLaunchingRedesign
          post={boostablePost}
          budget={budget}
          onLaunched={onLaunched}
          onChange={() => setStep('form')}
          onRequestClose={toPost}
        />
      )}
      {step === 'live' && (
        <BoostLiveRedesign onSeeBoost={toPost} onRequestClose={toPost} />
      )}
    </Stage>
  );
};

/** Your own post behind the boost modals, as the strip leaves it */
const OwnPostBackdrop = (): ReactElement => (
  <OwnPostRedesign post={boostablePost} state="new" onBoost={() => undefined} />
);

const meta: Meta = {
  title: 'Cores & Boost/Redesign/5. First boost',
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
    <CoresProviders balance={startBalance} activePage="/posts/sb-boost-post">
      {render()}
    </CoresProviders>
  ),
});

const OwnPost = ({ state }: { state: OwnPostState }) => (
  <Stage
    background={
      <OwnPostRedesign post={boostablePost} state={state} onBoost={noop} />
    }
  />
);

export const Walkthrough = story(
  'The redesigned flow with 20 Cores: Boost from the strip, take the starter preset, buy the pack that covers it, and the boost starts by itself.',
  () => <WalkthroughFlow />,
);

export const OwnPostNew = story(
  'The strip spells the boost out: extra reach, what the starter preset costs, your balance, and how many Cores you are short.',
  () => <OwnPost state="new" />,
);

export const OwnPostTakingOff = story(
  'The "taking off" strip uses the same card with its own title.',
  () => <OwnPost state="takingOff" />,
);

export const BoostForm = story('The current boost form.', () => (
  <Stage background={<OwnPostBackdrop />}>
    <BoostPostFixedModal
      post={boostablePost}
      onBuyCores={noop}
      onBoost={noop}
      onRequestClose={noop}
    />
  </Stage>
));

export const BoostFormCustom = story(
  'The current boost form, on Custom.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostFixedModal
        post={boostablePost}
        initialMode="custom"
        onBuyCores={noop}
        onBoost={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BoostFormReading = story(
  'The current boost form, while the post is being read.',
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

const formVersions = ['Production', 'Current', 'Compact'] as const;
type FormVersion = (typeof formVersions)[number];

/** Production's form, the current one and the compact one, switched from the bar at the bottom */
const CompareForms = (): ReactElement => {
  const [version, setVersion] = useState<FormVersion>('Compact');
  const Form =
    version === 'Compact' ? BoostPostCompactModal : BoostPostFixedModal;

  return (
    <Stage background={<OwnPostBackdrop />}>
      {version === 'Production' ? (
        <BoostPostModal
          isOpen
          onRequestClose={noop}
          post={boostablePost}
          origin={Origin.PostBoostButton}
        />
      ) : (
        <Form
          key={version}
          post={boostablePost}
          onBuyCores={noop}
          onBoost={noop}
          onRequestClose={noop}
        />
      )}
      <nav className="fixed bottom-4 left-1/2 z-max flex -translate-x-1/2 flex-row items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-1 shadow-2">
        {formVersions.map((name) => (
          <Button
            key={name}
            size={ButtonSize.XSmall}
            variant={
              name === version ? ButtonVariant.Primary : ButtonVariant.Tertiary
            }
            onClick={() => setVersion(name)}
          >
            {name}
          </Button>
        ))}
      </nav>
    </Stage>
  );
};

export const BoostFormCompare = story(
  'Production’s form, the current redesign form and the compact one on the same post. Switch between them from the bar at the bottom.',
  () => <CompareForms />,
);

/** One state of the compact form, drawn in place with its own balance */
const CompactState = ({
  label,
  balance: stateBalance,
  ...props
}: {
  label: string;
  balance: number;
} & Partial<React.ComponentProps<typeof BoostPostCompactModal>>) => {
  const auth = useAuthContext();
  const user = auth.user && {
    ...auth.user,
    balance: { amount: stateBalance },
  };

  return (
    <section className="flex w-[26.25rem] max-w-full flex-col gap-3">
      <span className="text-text-tertiary typo-footnote">{label}</span>
      <AuthContext.Provider value={{ ...auth, user }}>
        <BoostPostCompactModal
          post={boostablePost}
          onBuyCores={noop}
          onBoost={noop}
          onRequestClose={noop}
          isInline
          {...props}
        />
      </AuthContext.Provider>
    </section>
  );
};

export const BoostFormCompactStates = story(
  'Every state of the compact form on one page: Starter and Custom, short on Cores and with enough, while the post is being read, and with the info tooltip open.',
  () => (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-12">
        <CompactState label="Starter · short on Cores" balance={20} />
        <CompactState label="Starter · enough Cores" balance={5000} />
        <CompactState label="Reading the post" balance={20} post={newPost} />
        <CompactState
          label="Custom · short on Cores"
          balance={20}
          initialMode="custom"
        />
        <CompactState
          label="Custom · enough Cores"
          balance={60000}
          initialMode="custom"
        />
        <CompactState label="Info tooltip open" balance={20} isInfoOpen />
      </div>
    </div>
  ),
);

export const BuyCores = story(
  'The same redesigned Buy Cores as the award flow, with a boost tile leading the "what it is for" card.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BuyCoresRedesignModal
        purpose="boost"
        cost={starterBoost.coresPerDay * starterBoost.totalDays}
        onPay={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BoostLaunches = story(
  'The Patchy rocket heads the launch screen, the boost is a row with Change, and a progress bar counts down.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostLaunchingRedesign
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
  'The rocket art replaces the success cover image, with a check badge on its edge.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostLiveRedesign onSeeBoost={noop} onRequestClose={noop} />
    </Stage>
  ),
  420,
);

// The story index reads names statically, not through the helper
Walkthrough.storyName = 'Walkthrough';
OwnPostNew.storyName = '1 · Own post';
OwnPostTakingOff.storyName = '1 · Own post · taking off';
BoostForm.storyName = '2 · Boost your post';
BoostFormCustom.storyName = '2 · Boost your post · custom';
BoostFormReading.storyName = '2 · Boost your post · reading the post';
BoostFormCompare.storyName =
  '2 · Boost your post · production vs current vs compact';
BoostFormCompactStates.storyName = '2 · Boost your post · compact, all states';
BuyCores.storyName = '3 · Buy Cores, pack preselected';
BoostLaunches.storyName = '5 · Boost launches';
BoostIsLive.storyName = '6 · Boost is live!';
