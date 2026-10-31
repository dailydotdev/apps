import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import { closeRow, errorCopyRow, logInButtonRow, paddingRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Variants/4. Welcome back with a password',
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
      changes={[closeRow, logInButtonRow, errorCopyRow, paddingRow]}
    />
  ),
};
