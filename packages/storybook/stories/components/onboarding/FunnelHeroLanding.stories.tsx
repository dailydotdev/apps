import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { fn } from 'storybook/test';
import type { FunnelStepHeroLanding } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelHeroLanding } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelHeroLanding';
import ExtensionProviders from '../../extension/_providers';
import { useRouter } from '../../../mock/next-router';
import { defaultBootData, getBootMock } from '../../../mock/boot';

const meta: Meta<typeof FunnelHeroLanding> = {
  title: 'Components/Onboarding/Steps/FunnelHeroLanding',
  component: FunnelHeroLanding,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
    controls: { expanded: true },
  },
  render: (props) => (
    <ExtensionProviders>
      <FunnelHeroLanding {...props} isActive />
    </ExtensionProviders>
  ),
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

type Story = StoryObj<typeof FunnelHeroLanding>;

const baseArgs: FunnelStepHeroLanding = {
  id: 'hero-landing-step',
  type: FunnelStepType.HeroLanding,
  transitions: [],
  onTransition: action('onTransition'),
  parameters: {
    headline: 'The homepage every developer deserves.',
  },
};

export const Cards: Story = {
  args: { ...baseArgs, parameters: { ...baseArgs.parameters } },
};

export const Desk: Story = {
  args: {
    ...baseArgs,
    parameters: { ...baseArgs.parameters, background: 'desk' },
  },
};

/** Form on the left, hero cover inset as a rounded panel on the right. */
export const Panel: Story = {
  args: {
    ...baseArgs,
    parameters: {
      ...baseArgs.parameters,
      headline: "Where developers discover what's next",
      background: 'panel',
    },
  },
};


