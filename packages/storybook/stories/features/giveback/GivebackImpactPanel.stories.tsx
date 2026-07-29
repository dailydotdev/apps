import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackImpactPanel } from '@dailydotdev/shared/src/features/giveback/components/GivebackImpactPanel';
import { mockStatus, withGiveback } from './giveback.mocks';

// The "Impact" tab: the visitor's journey roadmap (the funding-progress section
// was intentionally removed). Wraps GivebackPersonalRoadmap.
const meta: Meta<typeof GivebackImpactPanel> = {
  title: 'Features/Giveback/Impact tab',
  component: GivebackImpactPanel,
  args: { onTakeAction: () => undefined },
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof GivebackImpactPanel>;

export const Default: Story = {
  decorators: [withGiveback({ status: mockStatus({ userPoints: 320 }) })],
};
