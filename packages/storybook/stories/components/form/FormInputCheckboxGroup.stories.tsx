import type { Meta, StoryObj } from '@storybook/react';
import {
  FormInputRating,
} from '@dailydotdev/shared/src/features/common/components/FormInputRating';
import { useState } from 'react';
import { fn } from '@storybook/test';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  FormInputCheckboxGroup,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';
import {
  CheckboxGroupVariant,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

const meta: Meta<typeof FormInputCheckboxGroup> = {
  title: 'Components/Form/FormInputCheckboxGroup',
  component: FormInputCheckboxGroup,
  args: {
    onValueChange: fn(),
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6350&t=UTlDOWAz9YE7p040-0',
    },
  },
  render: (props) => {
    return (
      <div className='max-w-lg'>
        <FormInputCheckboxGroup {...props} />
      </div>
    );
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof FormInputCheckboxGroup>;

const options = [
  {
    label: 'JavaScript',
    value: 'js',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
      alt: 'JavaScript',
    },
  },
  {
    label: 'Python',
    value: 'py',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
      alt: 'Python',
    },
  },
  {
    label: 'Go',
    value: 'go',
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
      alt: 'Go',
    },
  },
];


export const Default: Story = {
  args: {
    options: options.map(({ label, value }) => ({ label, value })),
  },
};

export const HorizontalWithImages: Story = {
  args: {
    options,
  },
};

export const HorizontalDoubleColumn: Story = {
  args: {
    cols: 2,
    options,
  },
};

export const Vertical: Story = {
  args: {
    options,
    variant: CheckboxGroupVariant.Vertical,
  },
};

export const VerticalDoubleColumn: Story = {
  args: {
    options,
    cols: 2,
    variant: CheckboxGroupVariant.Vertical,
  },
};
