import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import {
  cardRow,
  closeRow,
  errorCopyRow,
  footerRow,
  paddingRow,
} from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Variants/4. Welcome back with a password',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const WelcomeBackPassword: StoryObj = {
  name: 'Welcome back with a password',
  render: () => (
    <Variant
      number={4}
      question="A returning visitor who signed in with a password"
      title="Welcome back with a password"
      goal={
        <p>
          The email is filled in and the password form takes the place of the
          provider button. Storybook has no Cloudflare site key, so the After
          frames show no security check.
        </p>
      }
      capture="webapp-welcome-password"
      story={screen('welcome-back-password')}
      changes={[
        closeRow,
        {
          aspect: 'Email field',
          cells: [
            'Red error border on the remembered email before anyone types: the log-in hint starts as “Enter your password to login”, which the form reads as an error',
            'A normal field. The hint starts empty.',
          ],
        },
        {
          aspect: 'Log in button',
          cells: [
            'White, half width and 40px tall, next to “Forgot password?”',
            'White, the only action here. In the onboarding steps’ glass bar: it follows the content and pins to the bottom when the content is taller than the screen, above the footer. “Forgot password?” sits under the password field.',
          ],
        },
        {
          aspect: 'Not you?',
          cells: [
            'A second footer line, stacked over “Don’t have an account? Sign up”',
            '“Not you? Use another account” under the button, in the content',
          ],
        },
        footerRow(
          'Two stacked links with no bar: “Not you?” and “Don’t have an account? Sign up”',
        ),
        errorCopyRow,
        paddingRow,
        cardRow,
      ]}
    />
  ),
};
