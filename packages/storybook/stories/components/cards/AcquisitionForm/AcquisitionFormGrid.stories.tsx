import type { Meta, StoryObj } from '@storybook/react';
import { AcquisitionFormGrid } from '@dailydotdev/shared/src/components/cards/AcquisitionForm/AcquisitionFormGrid';
import ExtensionProviders from '../../../extension/_providers';

const meta: Meta<typeof AcquisitionFormGrid> = {
  title: 'Components/Cards/AcquisitionForm/AcquisitionFormGrid',
  component: AcquisitionFormGrid,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="grid grid-cols-3 gap-4">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AcquisitionFormGrid>;

export const Default: Story = {
  name: 'AcquisitionFormGrid',
};
