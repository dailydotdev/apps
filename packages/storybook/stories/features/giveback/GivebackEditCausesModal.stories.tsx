import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackEditCausesModal } from '@dailydotdev/shared/src/features/giveback/components/GivebackEditCausesModal';
import { withGiveback } from './giveback.mocks';

// The "edit your causes" pop-up, opened from the Campaign tab. Reuses the picker
// grid, seeded with the saved selection so it opens with the current picks
// ready to toggle, and saves on confirm.
const meta: Meta<typeof GivebackEditCausesModal> = {
  title: 'Features/Giveback/Edit causes modal',
  component: GivebackEditCausesModal,
  args: { onClose: () => undefined },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The pop-up for changing causes after onboarding. Opens with the saved picks pre-selected; toggle and save.',
      },
    },
  },
  decorators: [withGiveback({ selectedCauseIds: ['c-oss', 'c-access'] })],
};

export default meta;

type Story = StoryObj<typeof GivebackEditCausesModal>;

export const Default: Story = {};

export const NothingPicked: Story = {
  decorators: [withGiveback({ selectedCauseIds: [] })],
};
