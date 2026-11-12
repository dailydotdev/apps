import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { boostablePost } from '../real/screens';
import { Stage } from '../flows/purchase/stage';
import {
  durationOf,
  endedCampaign,
  liveCampaign,
} from '../flows/after-boost/fixtures';
import { NotificationsPage, RenameInPage } from '../real/pages';
import { BoostsPage, CampaignPage } from './after-boost/BoostsPage';
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

// "Boost and analytics", redrawn in the squads hub line: the first boost,
// then the boosts page and a campaign.
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
  title: 'Cores & Boost/Redesign/2. Boost and analytics',
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

/** A box the version's modal mounts in: transform-gpu keeps its fixed overlay
 * inside, and the page keeps scrolling with four modals open */
const VersionFrame = ({
  name,
  description,
  render,
}: {
  name: string;
  description: string;
  render: (modalProps: {
    parentSelector: () => HTMLElement;
    bodyOpenClassName: null;
  }) => ReactElement;
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
        className="relative h-[min(64rem,100vh)] w-[27rem] transform-gpu overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        {box && render({ parentSelector: () => box, bodyOpenClassName: null })}
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
        {/* Four open modals would lock the page; this page has to scroll */}
        <style>
          {'body.ReactModal__Body--open { overflow: auto !important; }'}
        </style>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-10">
          <VersionFrame
            name="Production"
            description="Live today: sliders for budget and duration."
            render={(modalProps) => (
              <BoostPostModal
                isOpen
                onRequestClose={noop}
                post={boostablePost}
                origin={Origin.PostBoostButton}
                {...modalProps}
              />
            )}
          />
          <VersionFrame
            name="Current"
            description="Starter and Custom cards, the ribbon offer."
            render={(modalProps) => (
              <BoostPostFixedModal
                post={boostablePost}
                onBuyCores={noop}
                onBoost={noop}
                onRequestClose={noop}
                modalProps={modalProps}
              />
            )}
          />
          <VersionFrame
            name="Compact"
            description="The post and its numbers in one row, a two-way switch."
            render={(modalProps) => (
              <BoostPostCompactModal
                post={boostablePost}
                onBuyCores={noop}
                onBoost={noop}
                onRequestClose={noop}
                modalProps={modalProps}
              />
            )}
          />
          <VersionFrame
            name="Boost again"
            description="Prefilled with the last boost, from the ended notification."
            render={(modalProps) => (
              <BoostAgainModal
                isOpen
                post={endedCampaign.post as Post}
                lastBoost={lastBoostOf(endedCampaign)}
                onRequestClose={noop}
                onSeeBoost={noop}
                {...modalProps}
              />
            )}
          />
        </div>
      </div>
    </CoresProviders>
  ),
};

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

// After the boost: Boost manager (production's Ads dashboard, renamed and
// moved from a pop-up to a settings page) and a campaign

const AFTER_BALANCE = 5000;

const afterStory = (
  description: string,
  render: () => ReactElement,
): Story => ({
  parameters: {
    msw: { handlers: coresHandlers({ balance: AFTER_BALANCE }) },
    docs: { description: { story: description } },
  },
  render: () => (
    <CoresProviders balance={AFTER_BALANCE} activePage="/settings/boosts">
      <RenameInPage from="Ads dashboard" to="Boost manager" />
      {render()}
    </CoresProviders>
  ),
});

/** Boost again from the ended notification, over production's notifications */
const BoostAgainScreen = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => setIsOpen(true), []);

  return (
    <>
      <NotificationsPage />
      {isOpen && (
        <BoostAgainModal
          isOpen
          post={endedCampaign.post as Post}
          lastBoost={lastBoostOf(endedCampaign)}
          onRequestClose={() => setIsOpen(false)}
          onSeeBoost={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export const BoostsPageStory = afterStory(
  'Squads page frame: one bordered card with a Patchy title band, squad-style Live/Ended tabs and reading-list rows (cover right, spend and impressions under the title), with the totals and Docs/Terms as widgets beside it.',
  () => <BoostsPage />,
);

export const BoostsPageEmpty = afterStory(
  'The empty tab uses CharmEmptyState with production’s copy and Learn more about boosting link in place of the gray Boost icon.',
  () => <BoostsPage campaigns={[]} />,
);

export const CampaignLive = afterStory(
  'The campaign card leads with the post, groups budget, progress and dates in one tinted block, and shows the four stats as compact tiles above Extend and Stop and refund.',
  () => <CampaignPage campaign={liveCampaign} />,
);

export const CampaignEnded = afterStory(
  'An ended campaign keeps the same layout, and Boost again becomes the primary button.',
  () => <CampaignPage campaign={endedCampaign} />,
);

export const BoostAgain = afterStory(
  'The boost form, prefilled with the last budget.',
  () => <BoostAgainScreen />,
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
BoostFormReading.tags = ['!dev'];
BoostLaunches.storyName = '3 · Boost launches';
BoostIsLive.storyName = '4 · Boost is live!';
BoostsPageStory.storyName = '5 · Boost manager';
BoostsPageEmpty.storyName = '5 · Boost manager, nothing live';
CampaignLive.storyName = '6 · Campaign';
CampaignEnded.storyName = '6 · Campaign, ended';
BoostAgain.storyName = 'Boost again, prefilled';
BoostAgain.tags = ['!dev'];
