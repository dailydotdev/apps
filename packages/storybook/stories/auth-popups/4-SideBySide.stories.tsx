import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture, CompareTable, Labeled, Page, PhoneRow, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/4. Reference/Production side by side',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const columns = ['Landing pop-up', 'Webapp pop-up', 'Full-page log in'];

export const SideBySide: StoryObj = {
  name: 'Side by side',
  render: () => (
    <Page
      eyebrow="Reference · Where do the three surfaces disagree in production today?"
      title="Side by side"
      goal={
        <p>
          <strong>Goal:</strong> one table with every aspect of the three
          surfaces, so the consistency PR can settle each row once. The buttons
          already share their size, corners and type size. Nearly everything
          around them differs.
        </p>
      }
    >
      <Section title="On a phone">
        <PhoneRow>
          <Labeled label="Landing pop-up" tone="production">
            <Capture
              name="landing-modal-phone"
              alt="Landing pop-up on a phone"
            />
          </Labeled>
          <Labeled label="Webapp · Sign up" tone="production">
            <Capture
              name="webapp-signup-phone"
              alt="Webapp sign-up on a phone"
            />
          </Labeled>
          <Labeled label="Webapp · Log in" tone="production">
            <Capture name="webapp-login-phone" alt="Webapp log in on a phone" />
          </Labeled>
          <Labeled label="Full-page log in" tone="production">
            <Capture
              name="page-login-phone"
              alt="Full-page log in on a phone"
            />
          </Labeled>
        </PhoneRow>
      </Section>

      <Section title="Every aspect">
        <CompareTable
          columns={columns}
          rows={[
            {
              aspect: 'Providers',
              cells: [
                'Google, GitHub',
                'Google, GitHub, Apple, Facebook',
                'Google, GitHub, Apple, Facebook',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Button style',
              cells: [
                'Google white, the rest translucent with a border',
                'All four white',
                'All four white',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Button size',
              cells: ['48px, 14px corners, 17px', 'The same', 'The same'],
              verdict: 'same',
            },
            {
              aspect: 'Email',
              cells: [
                'Continue with email button, leaves for /onboarding',
                '“or” and an Email field, stays in the pop-up',
                '“or”, Email and Password fields',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Title',
              cells: [
                'The landing headline, 28px, centered',
                '“Sign up” or “Log in” in a 17px header bar',
                '“Log in”, 24px, centered',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Log in',
              cells: [
                'No log-in state. Log in leaves the page',
                'Switches in place, keeps all four providers',
                'Is the log-in state',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Footer copy',
              cells: [
                '“Already have an account? Log in”',
                '“Already using daily.dev? Log in” or “Not a member yet? Sign up”',
                '“Not a member yet? Sign up”',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Legal line',
              cells: [
                'Under the buttons, 11px',
                'Under the email field in Sign up, 12px. None in Log in',
                'None',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Close',
              cells: [
                'Round 32px button, top right',
                'In the header: right on desktop, left on phones',
                'None, the logo instead',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Phone layout',
              cells: [
                'A centered card with 16px margins',
                'Full screen with a header bar',
                'Full page',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Desktop frame',
              cells: [
                '464px card, #17171C, blurred backdrop',
                '420px card, #161921, no blur',
                'No card',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Font',
              cells: ['Plus Jakarta Sans', 'Helvetica Neue', 'Helvetica Neue'],
              verdict: 'differs',
            },
            {
              aspect: 'Theme',
              cells: ['Always dark', 'Follows the theme', 'Follows the theme'],
              verdict: 'differs',
            },
            {
              aspect: 'Returning visitor',
              cells: [
                'The same screen',
                'Welcome back, with the remembered account',
                'Welcome back',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Phone context line',
              cells: ['None', 'Sign up only, 23 actions', 'None'],
              verdict: 'differs',
            },
            {
              aspect: 'Security check',
              cells: [
                'None on screen',
                'Cloudflare box in Log in only',
                'Cloudflare box',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Google One Tap',
              cells: [
                'Hero only, never with the pop-up',
                'Covers the bottom of the pop-up on phones',
                'The same rule as the pop-up',
              ],
              verdict: 'differs',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
