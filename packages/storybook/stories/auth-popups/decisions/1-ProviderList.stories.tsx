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
  title: 'Auth Pop-ups/5. Still to decide/1. Provider list',
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
      question="Which sign-in options do we offer?"
      title="One provider list"
      today={
        <p>
          The landing page and the /onboarding hero offer Google, GitHub and
          email. The webapp pop-up and the log-in page add Apple and Facebook.
          The same person sees three options on daily.dev and five in the app.
        </p>
      }
      recommendation="Sign up offers Google, GitHub and email, plus Apple in the iOS app. Log in keeps all four providers."
      why={[
        'Developers sign up with Google or GitHub. Fewer choices on the first screen make the choice faster, and it’s already what the landing page and onboarding hero show.',
        'People who signed up with Apple or Facebook still need those buttons to get back in, so Log in can’t drop them.',
        'A social button on Log in still creates an account for someone new, so nobody gets stuck.',
        'The iOS app shows this same pop-up and runs its Apple and Google buttons natively. App Store rules require Sign in with Apple wherever Google sign-in is offered, so Apple stays on Sign up there.',
      ]}
      cost="Small. The provider list in AuthDefault depends on Sign up vs Log in. Check Apple and Facebook’s share of new sign-ups first: if either is large, keep it on Sign up."
      options={[
        {
          label: 'A · All four everywhere',
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
          recommended: true,
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
