import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackContributionSummary } from '@dailydotdev/shared/src/features/giveback/components/GivebackContributionSummary';
import { mockStatus, withGiveback } from './giveback.mocks';

// The personal recap above the action catalog: square avatar + level badge,
// amount unlocked for your causes, actions taken, and the next reward. Reads
// your points, reward tiers and completed actions.
const meta: Meta<typeof GivebackContributionSummary> = {
  title: 'Features/Giveback/Contribution summary',
  component: GivebackContributionSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Personal progress recap. The "to go" figure is green; the avatar is a rounded square with a level badge. Shown at a few point levels.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackContributionSummary>;

export const Default: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 320 }) })],
};

export const FreshContributor: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 0 }) })],
};

export const AllRewardsUnlocked: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 2500 }) })],
};
