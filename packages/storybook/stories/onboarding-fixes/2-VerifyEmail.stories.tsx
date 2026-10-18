import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import {
  mockOnboardingRouter,
  OnboardingAuthPage,
  OnboardingHero,
  Providers,
} from './harness';
import {
  beforeShots,
  Checklist,
  DesktopFrame,
  Labeled,
  Page,
  PhoneFrame,
  Section,
  Shot,
} from './kit';

const meta: Meta = {
  title: 'Onboarding Fixes/2. Verify email header',
  parameters: { layout: 'fullscreen' },
  beforeEach: mockOnboardingRouter,
};

export default meta;

const VERIFY_STORY = 'onboarding-fixes-2-verify-email-header--verify';

export const Compare: StoryObj = {
  name: 'Before and after',
  render: () => (
    <Page
      eyebrow="Action item · Investigate heading changes in onboarding"
      title="Verify email and the ways back"
      intro={
        <>
          The screen from the recording. The back chevron was centred on the
          title, so it sat under the mail icon, mid-column, and on phones the
          whole block was vertically centred, dropping it halfway down the
          screen. Verify now drops the arrow for a “Change email” link next to
          the resend link, where people look when the code doesn’t arrive. The
          email form before it gets the funnel’s back arrow before the logo.
        </>
      }
    >
      <Section title="Desktop">
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
          <Labeled label="Before (main)" tone="before">
            <Shot src={beforeShots.verifyDesktop} alt="Verify email before" />
          </Labeled>
          <Labeled label="After (this branch, live)" tone="after">
            <DesktopFrame storyId={VERIFY_STORY} title="Verify email after" />
          </Labeled>
        </div>
      </Section>
      <Section title="Phone (390px)">
        <div className="flex flex-wrap gap-6">
          <Labeled label="Before (main)" tone="before">
            <Shot
              src={beforeShots.verifyPhone}
              alt="Verify email before on a phone"
              width={390}
            />
          </Labeled>
          <Labeled label="After (this branch, live)" tone="after">
            <PhoneFrame
              storyId={VERIFY_STORY}
              title="Verify email on a phone"
            />
          </Labeled>
        </div>
      </Section>
      <Section title="What changed">
        <Checklist
          items={[
            {
              done: true,
              text: 'Verify has no back arrow: the icon sits above the title, so it floated mid-column. Going back from here means fixing the address, so the link says exactly that.',
            },
            {
              done: true,
              text: '“Wrong email? Change email” sits right under “Didn’t get a verification code? Resend code”, above Verify. It returns to the email form with the address filled in, so a typo is one click to fix.',
            },
            {
              done: true,
              text: 'The email form shows the funnel’s back arrow top left, then the logo after a 16px gap, app-bar style. It returns to the Google / GitHub / email choice; before, changing your mind about the provider meant reloading.',
            },
            {
              done: true,
              text: 'The email form gets the same way out: “Already have an account? Log in” under Sign up, the line the first signup screen already uses. Someone who meant to log in and tapped “Continue with email” is one click from the login screen.',
            },
            {
              done: true,
              text: 'Phones top-align the auth screens like desktop does, so the title sits under the logo instead of mid-screen.',
            },
            {
              done: true,
              text: '“A verification code has been sent to:” plus the address on its own line is now one sentence, with the address in bold.',
            },
            {
              done: true,
              text: 'Onboarding only. The sign-up modal keeps its header back button and gets no link.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};

export const Verify: StoryObj = {
  name: 'Verify step (live)',
  render: () => (
    <Providers>
      <OnboardingAuthPage defaultDisplay={AuthDisplay.EmailVerification} />
    </Providers>
  ),
};

export const Hero: StoryObj = {
  name: 'Onboarding hero (live, start here)',
  parameters: { themes: { themeOverride: 'dark' } },
  render: () => (
    <Providers isAuthenticating={false}>
      <OnboardingHero />
    </Providers>
  ),
};

export const EmailStep: StoryObj = {
  name: 'Email step (live)',
  render: () => (
    <Providers>
      <OnboardingAuthPage defaultDisplay={AuthDisplay.Registration} />
    </Providers>
  ),
};

export const Signup: StoryObj = {
  name: 'Signup step (live, for context)',
  render: () => (
    <Providers>
      <OnboardingAuthPage defaultDisplay={AuthDisplay.OnboardingSignup} />
    </Providers>
  ),
};
