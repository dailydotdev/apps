import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '../../../extension/_providers';
import { FreeformList } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformList';

const meta: Meta<typeof FreeformList> = {
  title: 'Components/Cards/Freeform/FreeformList',
  component: FreeformList,
  decorators: [
    (Story) => (
      <QueryClientProvider>
        <Story />
      </QueryClientProvider>
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof FreeformList>;

export const Default: Story = {
  name: 'FreeformList',
};
