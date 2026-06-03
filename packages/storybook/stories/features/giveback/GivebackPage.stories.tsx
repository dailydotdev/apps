import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackPage } from '@dailydotdev/shared/src/features/giveback/components/GivebackPage';

const meta: Meta<typeof GivebackPage> = {
  title: 'Features/Giveback/GivebackPage',
  component: GivebackPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GivebackPage>;

export const Default: Story = {};
