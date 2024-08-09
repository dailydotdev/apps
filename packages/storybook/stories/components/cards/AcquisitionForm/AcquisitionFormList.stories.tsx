import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '../../../extension/_providers';
import {
  AcquisitionFormList
} from '@dailydotdev/shared/src/components/cards/AcquisitionForm/AcquisitionFormList';

const meta: Meta<typeof AcquisitionFormList> = {
  title: 'Components/Cards/AcquisitionForm/AcquisitionFormList',
  component: AcquisitionFormList,
  decorators: [
    (Story) => (
      <QueryClientProvider>
        <Story />
      </QueryClientProvider>
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof AcquisitionFormList>;

export const Default: Story = {
  name: 'AcquisitionFormList',
};
