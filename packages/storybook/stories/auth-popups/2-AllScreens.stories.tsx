import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DESKTOP,
  Labeled,
  LiveFrame,
  Page,
  PHONE,
  PhoneRow,
  screen,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/2. All screens',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const screens: [string, string][] = [
  ['sign-up', '1. Sign up'],
  ['log-in', '2. Log in'],
  ['welcome-back-google', '3. Welcome back with Google'],
  ['welcome-back-password', '4. Welcome back with a password'],
  ['email-sign-up', '5. Email sign-up'],
  ['verify-email', '6. Verify email'],
  ['forgot-password', '7. Reset password'],
  ['login-page', '8. Full-page log in'],
];

export const AllScreens: StoryObj = {
  name: 'All screens',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · Do they all look like one pop-up?"
      title="All screens, proposed"
      goal={
        <p>
          <strong>Goal:</strong> check alignment at a glance. Every screen from
          the variant pages, side by side, as this PR renders it. Before and
          after for each one is on its own variant page.
        </p>
      }
    >
      <Section title="Phone">
        <PhoneRow>
          {screens.map(([id, label]) => (
            <Labeled key={id} label={label} tone="proposed">
              <LiveFrame
                storyId={screen(id)}
                title={`${label} on a phone`}
                {...PHONE}
              />
            </Labeled>
          ))}
        </PhoneRow>
      </Section>
      <Section title="Phone, light theme">
        <PhoneRow>
          <Labeled label="1. Sign up" tone="proposed">
            <LiveFrame
              storyId={screen('light-sign-up', undefined, 'light')}
              title="Sign up on a phone in light theme"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>
      <Section title="Desktop">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          {screens.map(([id, label]) => (
            <Labeled key={id} label={label} tone="proposed">
              <LiveFrame
                storyId={screen(id)}
                title={`${label} on desktop`}
                {...DESKTOP}
              />
            </Labeled>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
