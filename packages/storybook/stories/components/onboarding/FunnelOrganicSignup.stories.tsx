import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FunnelStepOrganicSignup,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { action } from 'storybook/actions';
import ExtensionProviders from '../../extension/_providers';
import { FunnelOrganicSignup } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelOrganicSignup';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '@dailydotdev/shared/src/lib/image';
import { useRouter } from '../../../mock/next-router';
import { fn } from 'storybook/test';
import { defaultBootData, getBootMock } from '../../../mock/boot';

const meta: Meta<typeof FunnelOrganicSignup> = {
  title: 'Components/Onboarding/Steps/FunnelOrganicSignup',
  component: FunnelOrganicSignup,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  render: (props) => {
    return (
      <ExtensionProviders>
        <div className="flex flex-col min-h-dvh">
          <FunnelStepBackground step={props}>
            <FunnelOrganicSignup {...props} isActive={true} />
          </FunnelStepBackground>
        </div>
      </ExtensionProviders>
    );
  },
  beforeEach: () => {
    useRouter.mockImplementation(() => ({
      replace: fn(),
      push: fn(),
      pathname: '/onboarding',
      query: {},
    }));

    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: {
        id: 'anonymous user',
        firstVisit: 'first visit',
        referrer: 'string',
      },
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    });
  },
};

export default meta;

type Story = StoryObj<typeof FunnelOrganicSignup>;

const defaultArgs: FunnelStepOrganicSignup = {
  id: 'organic-registration-step',
  type: FunnelStepType.OrganicSignup,
  transitions: [],
  onTransition: action('onTransition'),
  parameters: {
    headline: 'Where developers suffer together',
    explainer: `We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)`,
    image: cloudinaryOnboardingFullBackgroundDesktop,
    imageMobile: cloudinaryOnboardingFullBackgroundMobile,
  },
};

export const Default: Story = {
  args: defaultArgs,
};

export const MobileRevamp: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      ...defaultArgs.parameters,
      headline:
        'Yes, this is the signup screen <br/><b>Let’s get things set up</b>',
      explainer: '',
      version: 'v2_mobile',
      imageMobile:
        'https://media.daily.dev/image/upload/s--r4MiKjLD--/f_auto/v1743601527/public/login%20background',
    },
  },
};

export const CustomContent: Story = {
  args: {
    ...defaultArgs,
    parameters: {
      headline: 'Become part of our community',
      explainer:
        'Join thousands of developers who use daily.dev to stay updated and grow their career.',
      image:
        'https://media.daily.dev/image/upload/v1671543431/onboarding/background-registration@2x.jpg',
      imageMobile:
        'https://media.daily.dev/image/upload/v1671543431/onboarding/background-registration.jpg',
    },
  },
};
