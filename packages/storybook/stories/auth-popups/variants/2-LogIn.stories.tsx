import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Labeled,
  LiveFrame,
  PHONE,
  PhoneRow,
  screen,
  Section,
  Variant,
} from '../kit';
import {
  cardRow,
  closeRow,
  errorCopyRow,
  fieldsRow,
  footerRow,
  iconsRow,
  loginErrorsRow,
  logInButtonRow,
  paddingRow,
} from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Variants/2. Log in',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const LogIn: StoryObj = {
  name: 'Log in',
  render: () => (
    <Variant
      number={2}
      question="After “Log in”, or the header’s Log in"
      title="Log in"
      goal={
        <p>
          The same pop-up with a password form under the four providers, the
          tallest screen in the flow. Storybook uses Cloudflare’s always-pass
          test key, so the After frames pass the security check without a box,
          as most people do.
        </p>
      }
      capture="webapp-login"
      story={screen('log-in')}
      captions={{
        phoneBefore:
          '“Not a member yet? Sign up” is below the screen’s edge: the Cloudflare box makes the pop-up 732px tall on a 664px phone.',
        phoneAfter: 'The footer is pinned to the bottom at any height.',
      }}
      changes={[
        closeRow,
        logInButtonRow,
        footerRow(
          '“Not a member yet? Sign up”, only after a scroll on phones: the Cloudflare box pushes it out',
        ),
        loginErrorsRow,
        fieldsRow,
        errorCopyRow,
        iconsRow,
        paddingRow,
        cardRow,
      ]}
    >
      <Section
        title="Errors"
        note="Live: each frame fills the form and presses Log in. Storybook has no auth API, so any password comes back as a wrong one."
      >
        <PhoneRow>
          <Labeled
            label="After · empty or invalid field"
            tone="proposed"
            caption="An invalid email and no password: each field says what to fix, and the first one gets focus."
          >
            <LiveFrame
              storyId={screen('log-in-field-errors')}
              title="Log in with field errors on a phone"
              {...PHONE}
            />
          </Labeled>
          <Labeled
            label="After · wrong password"
            tone="proposed"
            caption="One strip right above Log in, with a way to create an account. Typing in either field clears it."
          >
            <LiveFrame
              storyId={screen('log-in-wrong-password')}
              title="Log in with a wrong password on a phone"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>
    </Variant>
  ),
};
