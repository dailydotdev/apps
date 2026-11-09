import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { routeTo } from '../today/production';
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

// The fixed "After the boost" flow (Flows/6) in the latest design line: the
// squads page frame, hero cover widget rows and the Patchy art. Same
// content, controls and click path as the fixed flow; the boost
// notifications stay as production shows them.

const BALANCE = 5000;

const meta: Meta = {
  title: 'Cores & Boost/Redesign/6. After the boost',
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

enum Screen {
  Boosts = 'Boosts page',
  Campaign = 'Campaign',
  Notifications = 'Notifications',
  Again = 'Boost again',
}

const screens = Object.values(Screen);

const WalkthroughStory = (): ReactElement => {
  const [screen, setScreen] = useState(Screen.Boosts);
  const [campaign, setCampaign] = useState<Campaign>(liveCampaign);
  const index = screens.indexOf(screen);
  const openCampaign = (next: Campaign) => {
    setCampaign(next);
    setScreen(Screen.Campaign);
  };
  const goTo = (next: Screen) => {
    if (next === Screen.Campaign) {
      setCampaign(liveCampaign);
    }
    setScreen(next);
  };

  return (
    <>
      {screen === Screen.Boosts && <BoostsPage onOpenCampaign={openCampaign} />}
      {screen === Screen.Campaign && (
        <CampaignPage
          campaign={campaign}
          onBack={() => setScreen(Screen.Boosts)}
          onStop={() => goTo(Screen.Notifications)}
          onExtend={() => goTo(Screen.Notifications)}
          onBoostAgain={() => setScreen(Screen.Again)}
        />
      )}
      {screen === Screen.Notifications && <NotificationsPage />}
      {screen === Screen.Again && (
        <BoostAgainScreen onSeeBoost={() => setScreen(Screen.Boosts)} />
      )}
      <nav className="fixed bottom-4 left-1/2 z-max flex -translate-x-1/2 flex-row items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-1 shadow-2">
        {screens.map((name, position) => (
          <Button
            key={name}
            size={ButtonSize.XSmall}
            variant={
              position === index
                ? ButtonVariant.Primary
                : ButtonVariant.Tertiary
            }
            className={classNames(position !== index && 'hidden tablet:flex')}
            onClick={() => goTo(name)}
          >
            {position + 1} · {name}
          </Button>
        ))}
      </nav>
    </>
  );
};

export const Walkthrough: Story = {
  render: () => <WalkthroughStory />,
  parameters: {
    docs: {
      description: {
        story:
          'The redesigned screens in the fixed flow’s order: open the live campaign, Extend, See your boost, then Boost again from the ended notification. The bar at the bottom jumps to any step.',
      },
    },
  },
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

export const LiveNotification: Story = {
  name: '3 · Boost is live',
  beforeEach: () => routeTo('/notifications'),
  render: () => <NotificationsPage />,
  parameters: {
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const EndedNotification: Story = {
  name: '4 · Boost ended, with results',
  beforeEach: () => routeTo('/notifications'),
  render: () => <NotificationsPage />,
  parameters: {
    docs: { description: { story: 'Unchanged: production, as in Today.' } },
  },
};

export const BoostAgain: Story = {
  name: '5 · Boost again, prefilled',
  render: () => <BoostAgainScreen />,
  parameters: {
    docs: {
      description: {
        story: 'Same form as the Flows page: prefilled with the last budget.',
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
