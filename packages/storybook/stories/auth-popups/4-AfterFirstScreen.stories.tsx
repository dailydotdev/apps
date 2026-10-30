import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture, Labeled, LiveScreen, Page, ScreenRow, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/4. After the first screen',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const AfterFirstScreen: StoryObj = {
  name: 'After the first screen',
  render: () => (
    <Page
      eyebrow="Chapter 4 · Where does the pop-up go after the first screen?"
      title="Steps inside the pop-up"
      goal={
        <>
          <p>
            <strong>Goal:</strong> check that every step keeps the pop-up’s
            frame, header and buttons. These steps only exist in the webapp: the
            landing page hands email sign-up and log in to /onboarding, so its
            visitors see the full-page versions instead.
          </p>
          <p className="mt-2">
            Storybook has no Cloudflare site key, so the live email form shows
            “Turnstile is taking too long to load” where production runs the
            security check.
          </p>
        </>
      }
    >
      <Section
        title="Email sign-up"
        note="After the email field on Sign up. Name, password, username and experience level, with the legal line by the Sign up button. A back arrow returns to the providers."
      >
        <LiveScreen id="email-sign-up" title="Email sign-up" />
      </Section>

      <Section
        title="Verify email"
        note="“Verify your email” with a 6-digit code, after the form above or after logging in to an unverified account. On phones the header has two back arrows here too, and on both sizes the mail icon sits above the header instead of in the content. Production not checked: reaching it takes a real sign-up."
      >
        <LiveScreen id="verify-email" title="Verify email" />
      </Section>

      <Section
        title="Forgot password"
        note="“Reset password” from Log in’s “Forgot password?”, then “Check your email”. On phones, production shows two back arrows before the title. Desktop hides the second one."
      >
        <ScreenRow
          phone={
            <Labeled
              label="Production · from Log in"
              tone="production"
              caption="Two back arrows before the title"
            >
              <Capture
                name="webapp-forgot-phone"
                alt="Reset password on a phone with two back arrows"
              />
            </Labeled>
          }
          desktop={
            <Labeled label="Production · from Log in" tone="production">
              <Capture
                name="webapp-forgot-desktop"
                alt="Reset password on desktop with one back arrow and a close button"
              />
            </Labeled>
          }
        />
        <LiveScreen id="forgot-password" title="Forgot password" />
      </Section>

      <p className="text-text-tertiary typo-footnote">
        Not shown: the social profile form a provider sign-up lands on when the
        account still needs a username. It needs a half-registered user from the
        API, which this mock can’t fake.
      </p>
    </Page>
  ),
};
