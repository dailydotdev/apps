import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import {
  DiscountTimer,
  DiscountTimerVariant,
} from '@dailydotdev/shared/src/features/onboarding/shared/DiscountTimer';
import { DISCOUNT_LOCAL_STORAGE_KEY } from '@dailydotdev/shared/src/features/onboarding/store/funnel.store';
import { ButtonSize, ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

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
    discountMessage:
      'Limited time offer: <b>30% discount</b> on Annual Pro plan',
    durationInMinutes: 30,
    startDate: new Date(),
    className: '',
    onTimerEnd: () => console.log('Timer ended'),
    isActive: true,
  },
  tags: ['autodocs'],
  beforeEach: () => {
    localStorage.removeItem(DISCOUNT_LOCAL_STORAGE_KEY);
  },
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

export const WithSlot: Story = {
  args: {
    variant: DiscountTimerVariant.WithSlot,
    discountMessage: 'Your special offer is live for the next:',
    durationInMinutes: 30,
    isActive: true,
    className: "bg-brand-default text-white",
    children: (
      <Button
        className=" bg-white text-black"
        size={ButtonSize.Medium}
        variant={ButtonVariant.Float}
      >
        Get my plan
      </Button>
    )
  },
};
