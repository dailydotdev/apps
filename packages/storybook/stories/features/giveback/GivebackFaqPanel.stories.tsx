import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFaqPanel } from '@dailydotdev/shared/src/features/giveback/components/GivebackFaqPanel';
import { withGiveback } from './giveback.mocks';

// The "FAQ" tab: the campaign's questions and answers (the "why" headline now
// lives in the page hero).
const meta: Meta<typeof GivebackFaqPanel> = {
  title: 'Features/Giveback/FAQ tab',
  component: GivebackFaqPanel,
  parameters: { layout: 'padded' },
  decorators: [withGiveback({ selectedCauseIds: ['c-oss', 'c-access'] })],
};

export default meta;

type Story = StoryObj<typeof GivebackFaqPanel>;

export const Default: Story = {};
