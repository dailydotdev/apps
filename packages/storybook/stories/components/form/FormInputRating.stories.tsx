import type { Meta, StoryObj } from '@storybook/react';
import { FormInputRating } from '@dailydotdev/shared/src/features/common/components/FormInputRating';
import { useState } from 'react';
import { fn } from '@storybook/test';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

const meta: Meta<typeof FormInputRating> = {
  title: 'Components/Form/FormInputRating',
  component: FormInputRating,
  args: {
    name: 'rating',
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
      <div className="max-w-lg">
        <FormInputRating {...props} />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof FormInputRating>;

export const Default: Story = {
  args: {},
};

export const withLabels: Story = {
  args: {
    children: (
      <>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Not at all
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          very much
        </Typography>
      </>
    ),
  },
};
