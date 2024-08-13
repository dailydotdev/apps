import type { Meta, StoryObj } from '@storybook/react';
import {
  AcquisitionFormGrid
} from '@dailydotdev/shared/src/components/cards/AcquisitionForm/AcquisitionFormGrid';
import { QueryClientProvider } from '../../../extension/_providers';

const meta: Meta<typeof AcquisitionFormGrid> = {
  title: 'Components/Cards/AcquisitionForm/AcquisitionFormGrid',
  component: AcquisitionFormGrid,
  decorators: [
    (Story) => (
      <QueryClientProvider>
      <div className='grid grid-cols-3 gap-4'>
        <Story />
      </div>
      </QueryClientProvider>
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof AcquisitionFormGrid>;

export const Default: Story = {
  name: 'AcquisitionFormGrid',
};
