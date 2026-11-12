import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import AuthContext, {
  useAuthContext,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { boostablePost } from '../real/screens';
import { Stage } from '../flows/purchase/stage';
import { durationOf, endedCampaign } from '../flows/after-boost/fixtures';
import { BoostAgainModal } from './after-boost/BoostAgainModal';
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

/** Your own post behind the boost modals, as the strip leaves it */
const OwnPostBackdrop = (): ReactElement => (
  <OwnPostRedesign post={boostablePost} state="new" onBoost={() => undefined} />
);

const meta: Meta = {
  title: 'Cores & Boost/Redesign/2. Boost and analytics/First boost',
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

export const OwnPostNew = story(
  'A one-row strip: the reach a boost adds, Boost, and the close button.',
  () => <OwnPost state="new" />,
);

export const OwnPostTakingOff = story(
  'The "taking off" strip is the same one-row strip with its own title.',
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

export const BoostFormCompact = story('The compact boost form.', () => (
  <Stage background={<OwnPostBackdrop />}>
    <BoostPostCompactModal
      post={boostablePost}
      onBuyCores={noop}
      onBoost={noop}
      onRequestClose={noop}
    />
  </Stage>
));

/** A box the version's modal mounts in: transform-gpu keeps its fixed overlay inside */
const VersionFrame = ({
  name,
  description,
  render,
}: {
  name: string;
  description: string;
  render: (parentSelector: () => HTMLElement) => ReactElement;
}): ReactElement => {
  const [box, setBox] = useState<HTMLDivElement | null>(null);

  return (
    <section className="flex w-[27rem] flex-col gap-3">
      <span className="flex flex-col gap-0.5">
        <strong className="typo-title3">{name}</strong>
        <span className="text-text-tertiary typo-footnote">{description}</span>
      </span>
      <div
        ref={setBox}
        className="relative h-[64rem] w-[27rem] transform-gpu overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        {box && render(() => box)}
      </div>
    </section>
  );
};

const lastBoostOf = (campaign: Campaign) => {
  const days = durationOf(campaign);

  return {
    days,
    coresPerDay: Math.round((campaign.flags.budget ?? 0) / days),
  };
};

export const BoostFormVersions: Story = {
  parameters: {
    msw: { handlers: coresHandlers({ balance }) },
    docs: {
      description: {
        story:
          'Every version of the Boost your post pop-up side by side, each live: Starter, Custom and the audience rows all work.',
      },
    },
  },
  render: () => (
    <CoresProviders
      balance={balance}
      activePage="/posts/sb-boost-post"
      hasOwnLayout
    >
      <div className="min-h-screen bg-background-default p-6">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-10">
          <VersionFrame
            name="Production"
            description="Live today: sliders for budget and duration."
            render={(parentSelector) => (
              <BoostPostModal
                isOpen
                onRequestClose={noop}
                post={boostablePost}
                origin={Origin.PostBoostButton}
                parentSelector={parentSelector}
              />
            )}
          />
          <VersionFrame
            name="Current"
            description="Starter and Custom cards, the ribbon offer."
            render={(parentSelector) => (
              <BoostPostFixedModal
                post={boostablePost}
                onBuyCores={noop}
                onBoost={noop}
                onRequestClose={noop}
                parentSelector={parentSelector}
              />
            )}
          />
          <VersionFrame
            name="Compact"
            description="The post and its numbers in one row, a two-way switch."
            render={(parentSelector) => (
              <BoostPostCompactModal
                post={boostablePost}
                onBuyCores={noop}
                onBoost={noop}
                onRequestClose={noop}
                parentSelector={parentSelector}
              />
            )}
          />
          <VersionFrame
            name="Boost again"
            description="Prefilled with the last boost, from the ended notification."
            render={(parentSelector) => (
              <BoostAgainModal
                isOpen
                post={endedCampaign.post as Post}
                lastBoost={lastBoostOf(endedCampaign)}
                onRequestClose={noop}
                onSeeBoost={noop}
                parentSelector={parentSelector}
              />
            )}
          />
        </div>
      </div>
    </CoresProviders>
  ),
};

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
OwnPostNew.storyName = '1 · Own post';
OwnPostTakingOff.storyName = '1 · Own post · taking off';
BoostForm.storyName = '2 · Boost your post · current';
BoostForm.tags = ['!dev'];
BoostFormCompact.storyName = '2 · Boost your post · compact';
BoostFormCompact.tags = ['!dev'];
BoostFormVersions.storyName = '2 · Boost your post · all versions';
BoostFormReading.storyName = '2 · Boost your post · reading the post';
BoostFormCompactStates.storyName = '2 · Boost your post · compact, all states';
BoostLaunches.storyName = '5 · Boost launches';
BoostIsLive.storyName = '6 · Boost is live!';
