import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StepHeadline from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';

const meta: Meta<typeof StepHeadline> = {
  title: 'Components/Onboarding/StepHeadline',
  component: StepHeadline,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    headline: {
      control: 'text',
    },
    explainer: {
      control: 'text',
    },
    align: {
      control: 'radio',
      options: ['left', 'center'],
    },
    type: {
      control: 'select',
      options: Object.values(FunnelStepType),
    },
  },
};

export default meta;

type Story = StoryObj<typeof StepHeadline>;

export const Default: Story = {
  args: {
    headline: 'Welcome to daily.dev',
    explainer: 'The professional network for developers to learn, grow, and get inspired.',
    align: 'center',
  },
};

export const LeftAligned: Story = {
  args: {
    ...Default.args,
    align: 'left',
  },
};

export const QuizType: Story = {
  args: {
    ...Default.args,
    type: FunnelStepType.Quiz,
    headline: 'Pop Quiz Time!',
    explainer: 'Test your knowledge with this quick quiz.',
  },
};

export const WithVisual: Story = {
  args: {
    ...Default.args,
    visualUrl: 'https://daily.dev/daily-logo.svg',
  },
}; 