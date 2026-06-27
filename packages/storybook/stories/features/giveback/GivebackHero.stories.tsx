import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackHero } from '@dailydotdev/shared/src/features/giveback/components/GivebackHero';
import { mockStatus, withGiveback } from './giveback.mocks';

// The page cover: brand + "How it works" across the top, the "Ad budgets buy
// clicks. Ours funds real causes." headline with the funding meter on the left,
// and charm on the right.
const meta: Meta<typeof GivebackHero> = {
  title: 'Features/Giveback/Page cover (hero)',
  component: GivebackHero,
  args: { onHowItWorks: () => undefined },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Headline + funding meter (with milestone markers) on the left, charm on the right. Shown at a few funding levels.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackHero>;

export const PartiallyFunded: Story = {
  decorators: [withGiveback({ status: mockStatus() })],
};

export const Empty: Story = {
  decorators: [
    withGiveback({ status: mockStatus({ currentCyclePoints: 0, contributorsCount: 0 }) }),
  ],
};

export const NearGoal: Story = {
  decorators: [
    withGiveback({ status: mockStatus({ currentCyclePoints: 11600 }) }),
  ],
};
