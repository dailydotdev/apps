import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CoresProviders } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { NotificationsPage } from '../real/pages';
import {
  durationOf,
  endedCampaign,
  liveCampaign,
} from '../flows/after-boost/fixtures';
import { BoostsPage, CampaignPage } from './after-boost/BoostsPage';
import type { Screens } from './after-boost/BoostAgainModal';
import { BoostAgainModal } from './after-boost/BoostAgainModal';

// The "After the boost" flow in the latest design line: the squads page
// frame, hero cover widget rows and the Patchy art. The boost notifications
// stay as production shows them.

const BALANCE = 5000;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/2. Boost and analytics/After the boost',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: coresHandlers({ balance: BALANCE }) },
  },
  decorators: [
    (Story) => (
      <CoresProviders balance={BALANCE} activePage="/boosts">
        <Story />
      </CoresProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const lastBoostOf = (campaign: Campaign) => {
  const days = durationOf(campaign);

  return {
    days,
    coresPerDay: Math.round((campaign.flags.budget ?? 0) / days),
  };
};

/** Boost again from the ended notification, over production's notifications */
const BoostAgainScreen = ({
  onSeeBoost,
  initialScreen,
}: {
  onSeeBoost?: () => void;
  initialScreen?: Screens;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => setIsOpen(true), []);

  return (
    <>
      <NotificationsPage />
      {isOpen && (
        <BoostAgainModal
          isOpen
          post={endedCampaign.post}
          lastBoost={lastBoostOf(endedCampaign)}
          initialScreen={initialScreen}
          onRequestClose={() => setIsOpen(false)}
          onSeeBoost={() => {
            setIsOpen(false);
            onSeeBoost?.();
          }}
        />
      )}
    </>
  );
};

export const BoostsPageStory: Story = {
  name: '1 · Boosts page',
  render: () => <BoostsPage />,
  parameters: {
    docs: {
      description: {
        story:
          'Squads page frame: one bordered card with a Patchy title band, squad-style Live/Ended tabs and reading-list rows (cover right, spend and impressions under the title), with the totals and Docs/Terms as widgets beside it.',
      },
    },
  },
};

export const BoostsPageEmpty: Story = {
  name: '1 · Boosts page, nothing live',
  render: () => <BoostsPage campaigns={[]} />,
  parameters: {
    docs: {
      description: {
        story:
          'The empty tab uses CharmEmptyState with production’s copy and Learn more about boosting link in place of the gray Boost icon.',
      },
    },
  },
};

export const CampaignLive: Story = {
  name: '2 · Campaign',
  render: () => <CampaignPage campaign={liveCampaign} />,
  parameters: {
    docs: {
      description: {
        story:
          'The campaign card leads with the post, groups budget, progress and dates in one tinted block, and shows the four stats as compact tiles above Extend and Stop and refund.',
      },
    },
  },
};

export const CampaignEnded: Story = {
  name: '2 · Campaign, ended',
  render: () => <CampaignPage campaign={endedCampaign} />,
  parameters: {
    docs: {
      description: {
        story:
          'An ended campaign keeps the same layout, and Boost again becomes the primary button.',
      },
    },
  },
};

export const BoostAgain: Story = {
  name: '5 · Boost again, prefilled',
  render: () => <BoostAgainScreen />,
  parameters: {
    docs: {
      description: {
        story: 'The boost form, prefilled with the last budget.',
      },
    },
  },
};

export const BoostIsLive: Story = {
  name: '6 · Boost is live!',
  render: () => <BoostAgainScreen initialScreen="SUCCESS" />,
  parameters: {
    docs: {
      description: {
        story:
          'The success screen trades the stock cover for the Patchy boost art, with See your boost primary and Learn more about boosting as a quiet second button.',
      },
    },
  },
};
