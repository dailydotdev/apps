import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { CoresProviders, noop } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { boostablePost } from '../real/screens';
import { Stage } from '../flows/purchase/stage';
import { durationOf, endedCampaign } from '../flows/after-boost/fixtures';
import { NotificationsPage, RenameInPage } from '../real/pages';
import { BoostAgainModal } from './after-boost/BoostAgainModal';
import { AllStatesPage } from './after-boost/AllStates';
import {
  AnalyticsTab,
  CombinedAnalytics,
} from './after-boost/CombinedAnalytics';
import type { OwnPostState } from '../flows/purchase/BoostFixed';
import { BoostLiveRedesign, OwnPostRedesign } from './purchase/BoostRedesign';
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

export const BoostForm = story(
  'The boost form: the post and its numbers in one row, the audience rows, a Starter and Custom switch, and the Startups offer on its ribbon card.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostCompactModal
        post={boostablePost}
        onBuyCores={noop}
        onBoost={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

export const BoostFormReading = story(
  'The boost form while the post is being read.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostCompactModal
        post={newPost}
        onBuyCores={noop}
        onBoost={noop}
        onRequestClose={noop}
      />
    </Stage>
  ),
);

const lastBoostOf = (campaign: Campaign) => {
  const days = durationOf(campaign);

  return {
    days,
    coresPerDay: Math.round((campaign.flags.budget ?? 0) / days),
  };
};

export const BoostBackToForm = story(
  'As in production: once the Cores land, you are back on the boost form with the same budget, and Boost post starts it.',
  () => (
    <Stage background={<OwnPostBackdrop />}>
      <BoostPostCompactModal
        post={boostablePost}
        onBuyCores={noop}
        onBoost={noop}
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

// After the boost: one Analytics page, with production's Ads dashboard as
// its Boost tab

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
    <CoresProviders balance={AFTER_BALANCE} activePage="/boosts">
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

export const CombinedOrganic = afterStory(
  'A proposal: /analytics and Boost manager as one page with two header tabs, like Squads’ Discover and My Squads. Analytics covers every post, boosted or not, and each chart stacks the boosted reach on the organic. A boosted post’s chip opens the Boost tab. From production’s post analytics: a Limited reach chip (its note in the tooltip, the docs on click) and the AI agents section, locked behind the Startups plan.',
  () => <CombinedAnalytics />,
);

export const CombinedBoosted = afterStory(
  'The Boost tab: only the boosts, Boost manager’s metrics, chart and Live/Ended list, with Docs and Terms in the header.',
  () => <CombinedAnalytics initialTab={AnalyticsTab.Boost} />,
);

export const BoostAgain = afterStory(
  'The boost form, prefilled with the last budget.',
  () => <BoostAgainScreen />,
);

export const AllStates: Story = {
  parameters: {
    msw: { handlers: coresHandlers({ balance: AFTER_BALANCE }) },
    docs: {
      description: {
        story:
          'Every width, tab, data case and pop-up of Boost and analytics on one page, each frozen in its state, for a careful review.',
      },
    },
  },
  render: () => (
    <CoresProviders
      balance={AFTER_BALANCE}
      activePage="/analytics"
      hasOwnLayout
    >
      <AllStatesPage />
    </CoresProviders>
  ),
};

// The story index reads names statically, not through the helper
OwnPostNew.storyName = '1 · Own post';
OwnPostTakingOff.storyName = '1 · Own post · taking off';
BoostForm.storyName = '2 · Boost your post';
BoostFormReading.storyName = '2 · Boost your post · reading the post';
BoostFormReading.tags = ['!dev'];
BoostBackToForm.storyName = '3 · Back to the form';
BoostIsLive.storyName = '4 · Boost is live!';
CombinedOrganic.storyName = '5 · Analytics, combined';
CombinedBoosted.storyName = '5 · Analytics, Boost tab';
BoostAgain.storyName = 'Boost again, prefilled';
BoostAgain.tags = ['!dev'];
AllStates.storyName = 'All states';
