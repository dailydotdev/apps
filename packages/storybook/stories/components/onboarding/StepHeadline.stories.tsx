import type { Meta, StoryObj } from '@storybook/react';
import StepHeadline, {
  StepHeadlineAlign,
} from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';

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
      options: Object.values(StepHeadlineAlign),
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StepHeadline>;

export const Default: Story = {
  args: {
    headline: 'Welcome to daily.dev',
    explainer:
      'The professional network for developers to learn, grow, and get inspired.',
    align: StepHeadlineAlign.Center,
  },
};

export const LeftAligned: Story = {
  args: {
    ...Default.args,
    align: StepHeadlineAlign.Left,
  },
};

export const RightAligned: Story = {
  args: {
    ...Default.args,
    align: StepHeadlineAlign.Right,
  },
};

export const WithoutExplainer: Story = {
  args: {
    ...Default.args,
    explainer: undefined,
  },
};
