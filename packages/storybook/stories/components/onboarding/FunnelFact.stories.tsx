import type { Meta, StoryObj } from '@storybook/react';
import FunnelFact
  from '@dailydotdev/shared/src/features/onboarding/steps/FunnelFact';
import {
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';

const meta: Meta<typeof FunnelFact> = {
  title: 'Components/Onboarding/Steps/Fact',
  component: FunnelFact,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  render: (props) => (
    <div className='invert'>
      <FunnelFact {...props} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof FunnelFact>;

const defaultArgs = {
  id: 'welcome-step',
  type: FunnelStepType.Fact,
  transitions: [],
  parameters: {
    headline: 'Welcome to daily.dev',
    explainer: 'The professional network for developers to learn, grow, and get inspired.',
    align: 'center',
    cta: 'Get Started',
  },
  onTransition: () => alert('Transition triggered'),
};

export const Default: Story = {
  args: defaultArgs as any,
};

export const WithVisual: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      visualUrl: 'https://daily.dev/daily-logo.svg',
    },
  } as any,
};

export const ReverseLayout: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      visualUrl: 'https://daily.dev/daily-logo.svg',
      reverse: 'true',
    },
  } as any,
};

export const LeftAligned: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      align: 'left',
    },
  } as any,
};
