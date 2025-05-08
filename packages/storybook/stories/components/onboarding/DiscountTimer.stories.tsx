import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DiscountTimer } from '@dailydotdev/shared/src/features/onboarding/shared/DiscountTimer';

const meta: Meta<typeof DiscountTimer> = {
  title: 'Components/Onboarding/Shared/DiscountTimer',
  component: DiscountTimer,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-12341&t=0rDegJEgHQVzzmuw-4',
    },
    controls: {
      expanded: true,
    },
  },
  args: {
    discountMessage: 'Limited time offer: <b>30% discount</b> on Annual Pro plan',
    durationInMinutes: 30,
    startDate: new Date(),
    className: '',
    onTimerEnd: () => console.log('Timer ended'),
    isActive: true,
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DiscountTimer>;

export const Default: Story = {};

export const ShortTimer: Story = {
  args: {
    durationInMinutes: 1,
    discountMessage: '<b>Last chance!</b> Offer expires soon',
  },
};

export const TimerEnded: Story = {
  args: {
    durationInMinutes: 0,
    discountMessage: 'This offer has <b>expired</b>',
  },
};

export const Inactive: Story = {
  args: {
    isActive: false,
    discountMessage: 'Timer is currently paused',
  },
};
