import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture } from '../kit';
import {
  DecisionPage,
  Divider,
  EmailField,
  FooterLink,
  MockPopup,
  PasswordField,
  ProviderList,
} from './mock';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Still to decide/4. Log in on the landing page',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const LandingLogIn: StoryObj = {
  name: 'Log in on the landing page',
  render: () => (
    <DecisionPage
      number={4}
      question="Where does “Log in” on daily.dev go?"
      title="Log in on the landing page"
      today={
        <p>
          The landing pop-up has no log-in screen: “Log in” leaves for
          app.daily.dev/onboarding?action=login. The webapp switches its pop-up
          in place.
        </p>
      }
      recommendation="Keep the hand-off to the full page."
      why={[
        'The full page now matches the pop-up: same buttons, same order, same footer (variant 8).',
        'A log-in state on the landing page means rebuilding the password form, Cloudflare check, errors and Forgot password in a second codebase, and keeping both in sync.',
        'People who log in are leaving the landing page for the app anyway, so the extra page costs them nothing.',
      ]}
      cost="None in this PR. Revisit only if log-in drop-off on that page turns out to be high."
      options={[
        {
          label: 'A · Hand off to the full page',
          recommended: true,
          caption: 'Today, now matching the pop-up.',
          mock: <Capture name="page-login-phone" alt="Full-page log in" />,
        },
        {
          label: 'B · Log in inside the landing pop-up',
          caption: 'Same screen as the webapp, built again in Astro.',
          mock: (
            <MockPopup
              title="Log in"
              footer={
                <FooterLink text="Don’t have an account?" link="Sign up" />
              }
            >
              <ProviderList providers={['google', 'github']} lead="google" />
              <Divider />
              <EmailField />
              <PasswordField />
              <Button className="w-full" size={ButtonSize.Large}>
                Log in
              </Button>
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
