import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackCausesPanel } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesPanel';
import { withGiveback } from './giveback.mocks';

// The "Causes" management tab: every cause as a pickable card, the ones you
// already back up top, everything else below. Toggle cards to see the "Save
// changes" bar appear (it only shows when the working set differs from what's
// saved).
const meta: Meta<typeof GivebackCausesPanel> = {
  title: 'Features/Giveback/Causes tab',
  component: GivebackCausesPanel,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof GivebackCausesPanel>;

export const WithSelection: Story = {
  decorators: [
    withGiveback({ selectedCauseIds: ['c-oss', 'c-access', 'c-docs'] }),
  ],
};

export const NothingPicked: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Empty "Your causes" state, with everything available below.',
      },
    },
  },
  decorators: [withGiveback({ selectedCauseIds: [] })],
};
