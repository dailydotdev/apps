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
  title: 'Auth Pop-ups/2. Log in',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const LogIn: StoryObj = {
  name: 'Log in',
  render: () => (
    <Page
      eyebrow="Chapter 2 · What changes when someone picks Log in?"
      title="Webapp pop-up: Log in"
      goal={
        <p>
          <strong>Goal:</strong> see how far Log in drifts from Sign up inside
          the same pop-up. It keeps all four providers and adds a whole password
          form under them, so it’s the tallest screen in the flow.
        </p>
      }
    >
      <Section title="Phone">
        <PhoneRow>
          <Labeled label="Production · header Log in" tone="production">
            <Capture
              name="webapp-login-phone"
              alt="Phone log-in pop-up in production"
            />
          </Labeled>
          <Labeled
            label="Live · real AuthModal"
            tone="live"
            caption="No Cloudflare box here: Storybook has no site key for it."
          >
            <LiveFrame
              storyId={screen('log-in')}
              title="Log-in pop-up on a phone"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>

      <Section title="Desktop">
        <DesktopRow>
          <Labeled label="Production · header Log in" tone="production">
            <Capture
              name="webapp-login-desktop"
              alt="Desktop log-in pop-up in production"
            />
          </Labeled>
          <Labeled label="Live · real AuthModal" tone="live">
            <LiveFrame
              storyId={screen('log-in')}
              title="Log-in pop-up on desktop"
              {...DESKTOP}
            />
          </Labeled>
        </DesktopRow>
      </Section>

      <Section title="How it differs from Sign up">
        <CompareTable
          columns={['Sign up', 'Log in']}
          rows={[
            {
              aspect: 'Header',
              cells: ['“Sign up”', '“Log in”'],
              verdict: 'same',
            },
            {
              aspect: 'Providers',
              cells: [
                'Google, GitHub, Apple, Facebook',
                'The same four, above the password form',
              ],
              verdict: 'same',
            },
            {
              aspect: 'Email',
              cells: [
                'One Email field with an arrow button',
                'Email and Password fields, “Forgot password?” and a Log in button',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Security check',
              cells: [
                'None on this screen',
                'Cloudflare’s “Verify you are human” box, always visible, between the password and Log in',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Legal line',
              cells: ['Under the email field', 'None'],
              verdict: 'missing',
            },
            {
              aspect: 'Footer',
              cells: [
                '“Already using daily.dev? Log in”',
                '“Not a member yet? Sign up”',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Errors',
              cells: [
                'Field errors on the email field',
                '“The email or password you entered doesn’t match our records. Please try again or create new account.” The last words are missing an “a”.',
              ],
              verdict: 'differs',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
