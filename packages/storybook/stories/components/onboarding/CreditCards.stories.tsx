import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CreditCards } from '@dailydotdev/shared/src/features/onboarding/shared/CreditCards';

const meta: Meta<typeof CreditCards> = {
  title: 'Components/Onboarding/CreditCards',
  component: CreditCards,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-12149&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof CreditCards>;

export const Default: Story = {
  args: {},
};
