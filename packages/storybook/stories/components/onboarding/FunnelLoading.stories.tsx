import type { Meta, StoryObj } from '@storybook/react';
import FunnelLoading from '@dailydotdev/shared/src/features/onboarding/steps/FunnelLoading';
import { FunnelStepTransitionType, FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof FunnelLoading> = {
  title: 'Components/Onboarding/Steps/FunnelLoading',
  component: FunnelLoading,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FunnelLoading>;

export const Default: Story = {
  args: {
    id: 'loading-step',
    type: FunnelStepType.Loading,
    onTransition: action('onTransition'),
    parameters: {
      headline: 'Loading your personalized feed',
      explainer: "We're putting together content based on your interests. This will only take a moment.",
    },
  },
};

export const CustomText: Story = {
  args: {
    ...Default.args,
    parameters: {
      headline: 'Almost there!',
      explainer: "We're analyzing your preferences to create your custom experience.",
    },
  },
};
