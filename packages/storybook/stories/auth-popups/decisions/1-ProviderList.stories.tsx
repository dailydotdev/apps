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
  title: 'Auth Pop-ups/5. Decisions/1. Provider list',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const signUpFooter = (
  <FooterLink text="Already have an account?" link="Log in" />
);
const logInFooter = <FooterLink text="Don’t have an account?" link="Sign up" />;

export const ProviderListPage: StoryObj = {
  name: 'Provider list',
  render: () => (
    <DecisionPage
      number={1}
      decided
      question="Which sign-in options do we offer?"
      title="One provider list"
      today={
        <p>
          The landing page and the /onboarding hero offer Google, GitHub and
          email. The webapp pop-up and the log-in page add Apple and Facebook.
          The same person sees three options on daily.dev and five in the app.
        </p>
      }
      recommendation="Keep today’s list: Google, GitHub, Apple and Facebook on every pop-up, plus email."
      why={[
        'Everyone keeps their way in, whichever provider they signed up with.',
        'The iOS app keeps Sign in with Apple next to Google, as App Store rules require.',
        'The landing page keeps its shorter list of three.',
      ]}
      cost="Nothing to build."
      options={[
        {
          label: 'A · All four everywhere',
          recommended: true,
          caption: 'Today’s webapp. Five buttons before email.',
          mock: (
            <MockPopup title="Sign up" footer={signUpFooter}>
              <ProviderList providers={[...ALL_PROVIDERS, 'email']} />
              <LegalLine />
            </MockPopup>
          ),
        },
        {
          label: 'B · Google and GitHub everywhere',
          caption:
            'Today’s landing page. Apple and Facebook accounts lose their way back in.',
          mock: (
            <MockPopup title="Log in" footer={logInFooter}>
              <ProviderList providers={['google', 'github']} />
              <Divider />
              <EmailField />
              <PasswordField />
            </MockPopup>
          ),
        },
        {
          label: 'C · Short Sign up, full Log in',
          caption:
            'Sign up matches the landing page. Log in keeps every way back in.',
          mock: (
            <MockPopup title="Sign up" footer={signUpFooter}>
              <ProviderList providers={['google', 'github', 'email']} />
              <LegalLine />
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
