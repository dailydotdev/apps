import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFundingSummary } from '@dailydotdev/shared/src/features/giveback/components/GivebackFundingSummary';
import { mockStatus, withGiveback } from './giveback.mocks';

// The hero funding meter: raised vs goal, percent funded, backers — the
// crowdfunding "pledge panel". Drives the cover progress bar.
const meta: Meta<typeof GivebackFundingSummary> = {
  title: 'Features/Giveback/Funding summary',
  component: GivebackFundingSummary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Live funding meter shown on the page cover. Seeded from the contribution overview query. Try the states below: partial funding, near-goal, fully funded, empty (nothing pledged yet) and the loading skeleton (no goal configured).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackFundingSummary>;

export const PartiallyFunded: Story = {
  decorators: [withGiveback({ status: mockStatus() })],
};

export const NearGoal: Story = {
  decorators: [
    withGiveback({
      status: mockStatus({ currentCyclePoints: 11400, contributorsCount: 2600 }),
    }),
  ],
};

export const FullyFunded: Story = {
  decorators: [
    withGiveback({
      status: mockStatus({
        currentCyclePoints: 12000,
        contributorsCount: 3120,
      }),
    }),
  ],
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Nothing pledged yet — leads with the goal and a shimmering track.',
      },
    },
  },
  decorators: [
    withGiveback({
      status: mockStatus({ currentCyclePoints: 0, contributorsCount: 0 }),
    }),
  ],
};

export const LoadingSkeleton: Story = {
  parameters: {
    docs: {
      description: {
        story: 'No goal configured / data still loading — quiet skeleton.',
      },
    },
  },
  decorators: [
    withGiveback({ status: mockStatus({ currentCycleTargetPoints: 0 }) }),
  ],
};
