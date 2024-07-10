import React, { ComponentProps } from 'react';
import type { Meta } from '@storybook/react';
import { GenericLoader } from '@dailydotdev/shared/src/components/utilities/loaders';
import { StoryObj } from '@storybook/react';

type CustomProps = ComponentProps<typeof GenericLoader> & { label?: string };

const meta: Meta<CustomProps> = {
  title: 'Atoms/GenericLoader',
  component: GenericLoader,
  args: {
    label: 'Preparing...',
  },
};

export default meta;

type Story = StoryObj<CustomProps>;

export const Default: Story = {
  render: (props) => {
    return <GenericLoader {...props} />;
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=5501%3A8388&mode=dev',
    },
  },
};
