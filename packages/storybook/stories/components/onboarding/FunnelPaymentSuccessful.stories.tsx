import { Meta, StoryObj } from '@storybook/react';
import FunnelPaymentSuccessful from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPaymentSuccessful';
import { FunnelStepTransitionType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';

const meta: Meta<typeof FunnelPaymentSuccessful> = {
  title: 'Components/Onboarding/Steps/PaymentSuccessful',
  component: FunnelPaymentSuccessful,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode',
    },
    controls: {
      expanded: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FunnelPaymentSuccessful>;

export const Default: Story = {
  args: {
    onTransition: fn(),
  },
}; 