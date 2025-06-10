import type { Meta, StoryObj } from '@storybook/react-vite';
import StepHeadline, {
  StepHeadlineAlign,
} from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';

const meta: Meta<typeof StepHeadline> = {
  title: 'Components/Onboarding/Shared/StepHeadline',
  component: StepHeadline,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    heading: {
      control: 'text',
    },
    description: {
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
    heading: 'Welcome to daily.dev',
    description:
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
    description: undefined,
  },
};
