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
import { CoresProviders } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import { BoostsPage, CampaignPage } from './after-boost/BoostsPage';
import {
  BoostEndedNotification,
  BoostLiveNotification,
  NotificationsColumn,
} from './after-boost/BoostNotifications';
import { BoostAgainModal } from './after-boost/BoostAgainModal';
import {
  durationOf,
  endedCampaign,
  liveCampaign,
} from './after-boost/fixtures';

// The fixed "After the boost" lane from the flow board: only the screens that
// change. Built from the production boost components (see after-boost/).

const BALANCE = 5000;

const meta: Meta = {
  title: 'Cores & Boost/Flows/6. After the boost',
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

/** Boost again from the ended notification, over the notifications page */
const BoostAgainScreen = ({
  onSeeBoost,
}: {
  onSeeBoost?: () => void;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => setIsOpen(true), []);

  return (
    <>
      <NotificationsColumn>
        <BoostEndedNotification
          campaign={endedCampaign}
          onBoostAgain={() => setIsOpen(true)}
        />
      </NotificationsColumn>
      {isOpen && (
        <BoostAgainModal
          isOpen
          post={endedCampaign.post}
          lastBoost={lastBoostOf(endedCampaign)}
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
  Live = 'Boost is live',
  Ended = 'Boost ended',
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
          onStop={() => goTo(Screen.Live)}
          onExtend={() => goTo(Screen.Live)}
          onBoostAgain={() => setScreen(Screen.Again)}
        />
      )}
      {screen === Screen.Live && (
        <NotificationsColumn>
          <BoostLiveNotification
            campaign={liveCampaign}
            onSeeBoost={() => openCampaign(liveCampaign)}
          />
        </NotificationsColumn>
      )}
      {screen === Screen.Ended && (
        <NotificationsColumn>
          <BoostEndedNotification
            campaign={endedCampaign}
            onSeeBoost={() => openCampaign(endedCampaign)}
            onBoostAgain={() => setScreen(Screen.Again)}
          />
        </NotificationsColumn>
      )}
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
          'The five changed screens in order. Their own buttons move along the flow (open a campaign, See your boost, Boost again), and the bar at the bottom jumps to any step.',
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
          'New: the Ads dashboard modal becomes a /boosts page with Live and Ended tabs and all-time totals, including clicks on the post.',
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
        story: 'The /boosts page before any boost, with the empty Live tab.',
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
          'Changed: the campaign is a page, shows clicks on the post, adds Extend, and the stop button names the refund before stopping.',
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
          'Changed: an ended campaign keeps production’s Boost again, which now opens the boost modal prefilled.',
      },
    },
  },
};

export const LiveNotification: Story = {
  name: '3 · Boost is live',
  render: () => (
    <NotificationsColumn>
      <BoostLiveNotification campaign={liveCampaign} />
    </NotificationsColumn>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Changed: sent when the boost starts instead of at 70% spend ("Your post boost is 70% done"), and names the post with a See your boost button.',
      },
    },
  },
};

export const EndedNotification: Story = {
  name: '4 · Boost ended, with results',
  render: () => (
    <NotificationsColumn>
      <BoostEndedNotification campaign={endedCampaign} />
    </NotificationsColumn>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Changed: "Your post boost has ended" now carries the results and the refunded Cores, with Boost again on the row.',
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
        story:
          'Changed: Boost again opens the boost modal (today it crashes) prefilled with the last budget and duration, which it names.',
      },
    },
  },
};
