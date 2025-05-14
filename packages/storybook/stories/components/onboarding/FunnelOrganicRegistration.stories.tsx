import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  FunnelStepOrganicRegistration,
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { action } from '@storybook/addon-actions';
import ExtensionProviders from '../../extension/_providers';
import {
  FunnelOrganicRegistration,
} from '@dailydotdev/shared/src/features/onboarding/steps/FunnelOrganicRegistration';
import {
  FunnelStepBackground,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '@dailydotdev/shared/src/lib/image';


const meta: Meta<typeof FunnelOrganicRegistration> = {
  title: 'Components/Onboarding/Steps/FunnelOrganicRegistration',
  component: FunnelOrganicRegistration,
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
          <FunnelOrganicRegistration {...props} />
        </FunnelStepBackground>
      </div>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof FunnelOrganicRegistration>;

const defaultArgs: FunnelStepOrganicRegistration = {
  id: 'organic-registration-step',
  type: FunnelStepType.OrganicRegistration,
  transitions: [],
  onTransition: action('onTransition'),
  parameters: {
    headline: 'Join the developer community',
    explainer: 'Get personalized content, connect with fellow developers, and grow your skills.',
    image: {
      src: cloudinaryOnboardingFullBackgroundMobile,
      srcSet: `${cloudinaryOnboardingFullBackgroundMobile} 450w, ${cloudinaryOnboardingFullBackgroundDesktop} 1024w`,
    },
    experiments: {
      reorderRegistration: false,
    },
  },
};

export const Default: Story = {
  args: defaultArgs,
};

export const WithReorderExperiment: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      experiments: {
        reorderRegistration: true,
      },
    },
  },
};

export const CustomContent: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      headline: 'Become part of our community',
      explainer: 'Join thousands of developers who use daily.dev to stay updated and grow their career.',
      image: {
        src: 'https://daily-now-res.cloudinary.com/image/upload/v1671543431/onboarding/background-registration.jpg',
        srcSet: 'https://daily-now-res.cloudinary.com/image/upload/v1671543431/onboarding/background-registration.jpg 1x, https://daily-now-res.cloudinary.com/image/upload/v1671543431/onboarding/background-registration@2x.jpg 2x',
      },
      experiments: {
        reorderRegistration: false,
      },
    },
  },
};
