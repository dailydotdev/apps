import type { Meta, StoryObj } from '@storybook/react';
import {
  SquadGrid
} from '@dailydotdev/shared/src/components/squads/cards/directory/SquadGrid';
import { QueryClientProvider } from '../../../extension/_providers';

const meta: Meta<typeof SquadGrid> = {
  title: 'Components/Cards/AcquisitionForm/AcquisitionFormGrid',
  component: SquadGrid,
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

type Story = StoryObj<typeof SquadGrid>;

export const Default: Story = {
  name: 'SquadGrid',
};
