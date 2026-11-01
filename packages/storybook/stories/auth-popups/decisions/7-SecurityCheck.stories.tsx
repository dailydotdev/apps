import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ALL_PROVIDERS,
  DecisionPage,
  Divider,
  EmailField,
  FooterLink,
  MockPopup,
  Note,
  PasswordField,
  ProviderList,
  SecurityCheck,
} from './mock';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Still to decide/7. Security check',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const footer = <FooterLink text="Don’t have an account?" link="Sign up" />;
const logIn = (
  <Button
    className="w-full"
    size={ButtonSize.Large}
    variant={ButtonVariant.Secondary}
  >
    Log in
  </Button>
);

export const SecurityCheckPage: StoryObj = {
  name: 'Security check',
  render: () => (
    <DecisionPage
      number={7}
      question="When does Cloudflare’s box show?"
      title="The security check only when it’s needed"
      today={
        <p>
          Log in always shows Cloudflare’s “Verify you are human” box between
          the password and the button. Email sign-up already runs the same check
          invisibly, and only shows the box when Cloudflare needs a click.
        </p>
      }
      recommendation="Decided and built: the box shows only after someone uses the email and password form, and only if Cloudflare needs a click."
      why={[
        'The check still runs silently from the moment Log in opens, so people who pass get no delay and the button never waits on it.',
        'Someone who taps Google or GitHub never sees the box.',
        'Once they tap or type in the form, the box appears only when Cloudflare needs a click, like email sign-up. Tested with Cloudflare’s always-ask test key: hidden on open, shown after clicking into the email field.',
      ]}
      cost="Built in this PR: LoginForm.tsx."
      options={[
        {
          label: 'A · Always visible',
          caption: 'Today on Log in.',
          mock: (
            <MockPopup title="Log in" footer={footer}>
              <ProviderList providers={ALL_PROVIDERS} />
              <Divider />
              <EmailField />
              <PasswordField />
              <SecurityCheck />
              {logIn}
            </MockPopup>
          ),
        },
        {
          label: 'B · Only when Cloudflare asks',
          recommended: true,
          caption:
            'Decided and built. The box only appears after the form is used.',
          mock: (
            <MockPopup title="Log in" footer={footer}>
              <ProviderList providers={ALL_PROVIDERS} />
              <Divider />
              <EmailField />
              <PasswordField />
              {logIn}
              <Note>
                The box appears here only if Cloudflare needs a click.
              </Note>
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
