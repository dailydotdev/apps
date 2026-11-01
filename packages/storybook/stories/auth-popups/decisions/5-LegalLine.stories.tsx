import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ALL_PROVIDERS,
  DecisionPage,
  Divider,
  EmailField,
  FooterLink,
  LegalLine,
  MockPopup,
  PasswordField,
  ProviderList,
} from './mock';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Still to decide/5. Legal line',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const footer = <FooterLink text="Don’t have an account?" link="Sign up" />;

export const LegalLinePage: StoryObj = {
  name: 'Legal line',
  render: () => (
    <DecisionPage
      number={5}
      question="Where do the terms go?"
      title="The legal line in the same place"
      today={
        <p>
          “By continuing, you agree to the Terms of Service and Privacy Policy”
          sits under the buttons on Sign up, here and on the landing page. Log
          in and the full page’s first screen don’t show it.
        </p>
      }
      recommendation="Decided: Sign up only. Log in is for people who already agreed when they signed up."
      why={[
        'Log in stays short, and the line keeps its weight on the one screen where an account is created.',
        'It’s where the landing page shows it too.',
        'Edge case to confirm with legal: a new person who taps a social button on Log in still gets an account, and in the pop-up they don’t see the line on the way. The onboarding funnel’s profile step shows it, but the pop-up’s doesn’t.',
      ]}
      cost="None: this is how the pop-up works today."
      options={[
        {
          label: 'A · Sign up only',
          recommended: true,
          caption: 'Decided. Today’s behavior.',
          mock: (
            <MockPopup title="Log in" footer={footer}>
              <ProviderList providers={ALL_PROVIDERS} />
              <Divider />
              <EmailField />
              <PasswordField />
            </MockPopup>
          ),
        },
        {
          label: 'B · Under the providers on Log in too',
          mock: (
            <MockPopup title="Log in" footer={footer}>
              <ProviderList providers={ALL_PROVIDERS} />
              <LegalLine />
              <Divider />
              <EmailField />
              <PasswordField />
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
