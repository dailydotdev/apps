import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { fn } from 'storybook/test';
import { graphql, HttpResponse } from 'msw';
import type { FunnelSignupHeroBackground } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelHeroLanding } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelHeroLanding';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import ExtensionProviders from '../../extension/_providers';
import { useRouter } from '../../../mock/next-router';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import { img } from '../notifications/_mock';

// The signup wall a friend lands on from an invite link: /join redirects to
// /onboarding with the same `cid` and `userid`, and the hero shows who invited
// them above the headline. Resize to a phone to see the mobile layout.

const inviter = {
  id: 'inviter-1',
  name: 'Sam Porter',
  username: 'samp',
  image: img('user-sam', 64),
  permalink: 'https://app.daily.dev/samp',
};

const meta: Meta<typeof FunnelHeroLanding> = {
  title: 'Components/Onboarding/Steps/InviteSignup',
  component: FunnelHeroLanding,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
    msw: {
      handlers: [
        graphql.query('User', () =>
          HttpResponse.json({ data: { user: inviter } }),
        ),
      ],
    },
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
      query: { cid: ReferralCampaignKey.Generic, userid: inviter.id },
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

const withBackground = (background: FunnelSignupHeroBackground): Story => ({
  args: {
    id: 'hero-landing-step',
    type: FunnelStepType.HeroLanding,
    transitions: [],
    onTransition: action('onTransition'),
    parameters: {
      headline: "Where developers discover what's next.",
      background,
      oauthOrder: 'googleFirst',
    },
  },
});

export const Horizon: Story = withBackground('horizon');

export const Panel: Story = withBackground('panel');

export const Split: Story = withBackground('split');

export const Desk: Story = withBackground('desk');

export const Cards: Story = withBackground('cards');
