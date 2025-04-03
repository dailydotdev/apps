import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PricingPlans, type PricingPlansProps } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlans';
import { PricingPlanVariation } from '@dailydotdev/shared/src/features/onboarding/shared/PricingPlan';

const meta: Meta<typeof PricingPlans> = {
  title: 'Components/Onboarding/PricingPlans',
  component: PricingPlans,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6351&m=dev',
    },
    controls: {
      expanded: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof PricingPlans>;

// Simple wrapper with local state
const PricingPlansWithState = (args: PricingPlansProps) => {
  const [value, setValue] = useState(args.value || 'annual');
  return <PricingPlans {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  args: {
    name: 'subscription-plan',
    value: 'annual',
    perks: [
      '30-day refund, no questions asked',
      'Cancel anytime, no strings attached',
      'Works across all your devices',
    ],
    plans: [
      {
        id: 'monthly',
        value: 'monthly',
        label: 'Monthly',
        price: {
          amount: '$0.29',
          subtitle: 'per day',
        },
        badge: {
          text: 'Popular',
          background: '#6E87F5',
        },
      },
      {
        id: 'annual',
        value: 'annual',
        label: 'Annual',
        price: {
          amount: '$0.29',
          subtitle: 'per day',
        },
        badge: {
          text: 'Save 50%',
          background: '#0ABA6E',
        },
        variation: PricingPlanVariation.BEST_VALUE,
      },
    ],
  },
  render: (args) => <PricingPlansWithState {...args} />,
};
