import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '../../../extension/_providers';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';

const meta: Meta<typeof FreeformGrid> = {
  title: 'Components/Cards/Freeform/FreeformGrid',
  component: FreeformGrid,
  decorators: [
    (Story) => (
      <QueryClientProvider>
        <div className='grid grid-cols-3 gap-4'>
          <Story />
          <Story />
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof FreeformGrid>;

export const Default: Story = {
  name: 'FreeformGrid',
};
