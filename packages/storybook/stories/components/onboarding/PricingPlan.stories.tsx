import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PricingPlan, PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';

const meta: Meta<typeof PricingPlan> = {
  title: 'Components/Onboarding/Shared/PricingPlan',
  component: PricingPlan,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6351&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
  args: {
    id: 'pricing-plan',
    name: 'plan',
    label: 'Monthly',
    price: {
      amount: '$0.29',
      subtitle: 'per day',
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PricingPlan>;

// Default (unselected monthly plan)
export const Default: Story = {
  args: {
    badge: {
      text: 'Popular',
      background: '#CE3DF3',
    },
    checked: false,
  },
};

// Default Selected (selected monthly plan)
export const DefaultSelected: Story = {
  args: {
    badge: {
      text: 'Popular',
      background: '#CE3DF3',
    },
    checked: true,
    perks: [
      '30-day refund, no questions asked',
      'Cancel anytime, no strings attached',
      'Works across all your devices',
    ],
  },
  name: 'Default - Selected',
};

// Best Value (unselected annual plan)
export const BestValue: Story = {
  args: {
    label: 'Annual',
    variation: PricingPlanVariation.BEST_VALUE,
    badge: {
      text: 'Save 50%',
      background: '#0ABA6E',
    },
    checked: false,
  },
  name: 'Best Value',
};

// Best Value Selected (selected annual plan)
export const BestValueSelected: Story = {
  args: {
    label: 'Annual',
    variation: PricingPlanVariation.BEST_VALUE,
    badge: {
      text: 'Save 50%',
      background: '#0ABA6E',
    },
    checked: true,
    perks: [
      '30-day refund, no questions asked',
      'Cancel anytime, no strings attached',
      'Works across all your devices',
    ],
  },
  name: 'Best Value - Selected',
};
