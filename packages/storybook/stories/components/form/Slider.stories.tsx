import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { useState } from 'react';

const SliderWithValue = (props: React.ComponentProps<typeof Slider>) => {
  const [value, setValue] = useState(props.defaultValue || [0]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm text-theme-label-secondary">
        <span>Value: {value.join(', ')}</span>
        <span>
          {props.min} - {props.max}
        </span>
      </div>
      <Slider {...props} onValueChange={(newValue) => setValue(newValue)} />
    </div>
  );
};

const meta: Meta<typeof SliderWithValue> = {
  title: 'Form/Slider',
  component: SliderWithValue,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'object',
      description: 'The default value of the slider',
    },
    min: {
      control: 'number',
      description: 'The minimum value of the slider',
    },
    max: {
      control: 'number',
      description: 'The maximum value of the slider',
    },
    step: {
      control: 'number',
      description: 'The step value of the slider',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SliderWithValue>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    disabled: true,
  },
};

export const CustomStep: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 10,
  },
};
