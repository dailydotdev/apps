import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackPersonalRoadmap } from '@dailydotdev/shared/src/features/giveback/components/GivebackPersonalRoadmap';
import { mockStatus, withGiveback } from './giveback.mocks';

// The visitor's reward-ladder "journey": a battle-pass rail of every reward
// tier, with the level you're on highlighted, claimed perks marked, the next
// milestone's progress, and the connector track. Driven by your points
// (status.userPoints) and the reward tiers.
const meta: Meta<typeof GivebackPersonalRoadmap> = {
  title: 'Features/Giveback/Journey roadmap',
  component: GivebackPersonalRoadmap,
  args: { onTakeAction: () => undefined },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Vary your points to move along the ladder. States: early (nothing unlocked), mid-journey with claimable rewards, some already claimed, near the top, and the empty "journey starts soon" state when no tiers exist. In any state with a claimable tier, click "Claim" to see the reward celebration (the ring burst + sparkles + button pop).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackPersonalRoadmap>;

export const ClaimAReward: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'One tier just unlocked and unclaimed. Click "Claim" to trigger the celebration animation.',
      },
    },
  },
  decorators: [withGiveback({ status: mockStatus({ userPoints: 120 }) })],
};

export const MidJourney: Story = {
  parameters: {
    docs: {
      description: {
        story: '320 pts: two tiers unlocked and claimable, next at 500.',
      },
    },
  },
  decorators: [withGiveback({ status: mockStatus({ userPoints: 320 }) })],
};

export const SomeClaimed: Story = {
  decorators: [
    withGiveback({
      status: mockStatus({ userPoints: 320 }),
      claimedRewardIds: ['t-cores'],
    }),
  ],
};

export const EarlyJourney: Story = {
  parameters: {
    docs: { description: { story: '0 pts: level 1, working toward the first tier.' } },
  },
  decorators: [withGiveback({ status: mockStatus({ userPoints: 0 }) })],
};

export const NearTheTop: Story = {
  decorators: [
    withGiveback({
      status: mockStatus({ userPoints: 2100 }),
      claimedRewardIds: ['t-cores', 't-plus', 't-discount'],
    }),
  ],
};

export const EmptyJourney: Story = {
  parameters: {
    docs: { description: { story: 'No reward tiers configured yet.' } },
  },
  decorators: [
    withGiveback({ status: mockStatus({ userPoints: 0 }), rewardTiers: [] }),
  ],
};
