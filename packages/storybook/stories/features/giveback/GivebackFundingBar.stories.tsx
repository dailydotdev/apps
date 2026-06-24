import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFundingBar } from '@dailydotdev/shared/src/features/giveback/components/GivebackFundingBar';
import { mockStatus, withGiveback } from './giveback.mocks';

// The sticky bottom progress bar shown on the campaign tabs: your points, the
// next reward, segment progress, and a "Take action" CTA. Driven by your points
// + reward tiers (useGivebackContribution).
const meta: Meta<typeof GivebackFundingBar> = {
  title: 'Features/Giveback/Funding bar (sticky)',
  component: GivebackFundingBar,
  args: { onTakeAction: () => undefined },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pinned to the bottom of the viewport. Shows progress toward the next reward, or a "top of the ladder" state when everything is unlocked.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackFundingBar>;

export const TowardNextReward: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 320 }) })],
};

export const AllRewardsUnlocked: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 2500 }) })],
};

export const JustStarted: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 0 }) })],
};
