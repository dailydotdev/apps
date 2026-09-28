import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { fn } from 'storybook/test';
import { graphql, HttpResponse } from 'msw';
import type { FunnelStepHeroLanding } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelHeroLanding } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelHeroLanding';
import { featureReferralLadder } from '@dailydotdev/shared/src/lib/featureManagement';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import { useRouter } from '../../mock/next-router';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { friends } from './_mock';

// The signup page a friend lands on from an invite link
// (/join?cid=generic&userid=… forwards here with the same query).

const inviter = { ...friends[1], id: 'inviter-1' };

const meta: Meta<typeof FunnelHeroLanding> = {
  title: 'Experiments/Referral Ladder Invite Signup',
  component: FunnelHeroLanding,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
    msw: {
      handlers: [
        graphql.query('User', () =>
          HttpResponse.json({
            data: {
              user: {
                ...inviter,
                permalink: `https://app.daily.dev/${inviter.username}`,
              },
            },
          }),
        ),
      ],
    },
  },
  render: (props) => (
    <ExtensionProviders>
      <FeatureOverrides values={{ [featureReferralLadder.id]: true }}>
        <FunnelHeroLanding {...props} isActive />
      </FeatureOverrides>
    </ExtensionProviders>
  ),
  beforeEach: () => {
    useRouter.mockImplementation(() => ({
      replace: fn(),
      push: fn(),
      pathname: '/onboarding',
      query: { cid: 'generic', userid: inviter.id },
      events: { on: fn(), off: fn() },
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
    headline: "Where developers discover what's next.",
    background: 'horizon',
    oauthOrder: 'googleFirst',
  },
};

export const Horizon: Story = {
  name: 'Invited (current signup page)',
  args: baseArgs,
};

export const Cards: Story = {
  name: 'Invited (cards background)',
  args: {
    ...baseArgs,
    parameters: {
      headline: 'The homepage every developer deserves.',
    },
  },
};
