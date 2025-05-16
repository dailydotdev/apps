import type { Meta, StoryObj } from '@storybook/react';
import { FunnelFact }
  from '@dailydotdev/shared/src/features/onboarding/steps/FunnelFact';
import {
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepBackground,
} from '@dailydotdev/shared/src/features/onboarding/shared';
// @ts-ignore
import image from '../../../public/images/onboarding/onboarding-fact-img.png';
import ExtensionProviders from '../../extension/_providers';

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
    <ExtensionProviders>
      <div className='flex flex-col min-h-dvh'>
        <FunnelStepBackground step={props}>
          <FunnelFact {...props} />
        </FunnelStepBackground>
      </div>
    </ExtensionProviders>
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
      visualUrl: image,
    },
  } as any,
};

export const ReversedLayout: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      visualUrl: image,
      layout: 'reversed',
    },
  } as any,
};

export const CenteredLayout: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      visualUrl: image,
      layout: 'centered',
    },
  } as any,
};

export const LegacyReverseLayout: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      visualUrl: image,
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
