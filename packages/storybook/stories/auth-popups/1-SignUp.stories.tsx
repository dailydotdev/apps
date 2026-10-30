import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Capture,
  CompareTable,
  DESKTOP,
  DesktopRow,
  Labeled,
  LiveFrame,
  Page,
  PHONE,
  PhoneRow,
  screen,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Sign up',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const SignUp: StoryObj = {
  name: 'Sign up',
  render: () => (
    <Page
      eyebrow="Chapter 1 · What does the webapp sign-up pop-up look like?"
      title="Webapp pop-up: Sign up"
      goal={
        <p>
          <strong>Goal:</strong> the baseline every other surface is compared
          against. It opens from the header’s Sign up and from every action a
          logged-out visitor tries, and it’s the only screen offering all four
          providers before an account exists.
        </p>
      }
    >
      <Section title="Phone">
        <PhoneRow>
          <Labeled label="Production · from an upvote" tone="production">
            <Capture
              name="webapp-signup-phone"
              alt="Phone sign-up pop-up in production"
            />
          </Labeled>
          <Labeled
            label="Production · with One Tap"
            tone="production"
            caption="Google One Tap slides over the bottom and hides the Log in line. It’s in the visitor’s Google language, here Hebrew."
          >
            <Capture
              name="webapp-signup-phone-onetap"
              alt="Google One Tap covering the bottom of the phone pop-up"
            />
          </Labeled>
          <Labeled label="Live · real AuthModal" tone="live">
            <LiveFrame
              storyId={screen('sign-up')}
              title="Sign-up pop-up on a phone"
              {...PHONE}
            />
          </Labeled>
          <Labeled
            label="Live · light theme"
            tone="live"
            caption="The webapp follows the theme. The landing page pop-up is always dark."
          >
            <LiveFrame
              storyId={screen('light-sign-up')}
              title="Sign-up pop-up on a phone in light theme"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>

      <Section title="Desktop">
        <DesktopRow>
          <Labeled label="Production · header Sign up" tone="production">
            <Capture
              name="webapp-signup-desktop"
              alt="Desktop sign-up pop-up in production"
            />
          </Labeled>
          <Labeled label="Live · real AuthModal" tone="live">
            <LiveFrame
              storyId={screen('sign-up')}
              title="Sign-up pop-up on desktop"
              {...DESKTOP}
            />
          </Labeled>
        </DesktopRow>
      </Section>

      <Section
        title="What’s on it"
        note="Measured in production, dark theme. Phone values in brackets."
      >
        <CompareTable
          firstColumn="Part"
          columns={['What people see', 'Spec']}
          rows={[
            {
              aspect: 'Frame',
              cells: [
                'A card over the page on desktop. On phones it takes the whole screen, with no card edges.',
                '420px wide, 16px corners, 1px border, #161921 card [full screen, #0F1218]',
              ],
            },
            {
              aspect: 'Header',
              cells: [
                '“Sign up” on the left, close on the right [close on the left, then “Sign up”]',
                '17px bold, Helvetica Neue like the rest of the app',
              ],
            },
            {
              aspect: 'Context line',
              cells: [
                'Phones only: one line saying what the action gets, like “Sign up to vote on posts and comments.” See chapter 5.',
                'Hidden from tablet width up',
              ],
            },
            {
              aspect: 'Providers',
              cells: [
                'Continue with Google, GitHub, Apple, Facebook. All four look identical.',
                'White primary buttons, 48px tall, 14px corners, 17px semibold [full width, 342px]',
              ],
            },
            {
              aspect: 'Email',
              cells: [
                '“or”, then an Email field with an arrow button inside it',
                'Submitting goes to the email sign-up form inside the pop-up (chapter 4)',
              ],
            },
            {
              aspect: 'Legal',
              cells: [
                '“By continuing, you agree to the Terms of Service and Privacy Policy.” under the email field',
                '12px, #CDD4E4',
              ],
            },
            {
              aspect: 'Footer',
              cells: [
                '“Already using daily.dev? Log in”',
                'Switches the same pop-up to Log in',
              ],
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
