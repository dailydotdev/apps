import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackHero } from '@dailydotdev/shared/src/features/giveback/components/GivebackHero';
import { mockStatus, withGiveback } from './giveback.mocks';

// The page cover: brand, headline, subtitle, and the live funding meter folded
// into one block (no video / CTA — onboarding lives in the funnel).
const meta: Meta<typeof GivebackHero> = {
  title: 'Features/Giveback/Page cover (hero)',
  component: GivebackHero,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Compact cover so the tabs sit higher. The funding meter sits under the headline. Shown at a few funding levels.',
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
