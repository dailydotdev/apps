import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import { cardRow, closeRow, footerRow, paddingRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Variants/3. Welcome back with Google',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const WelcomeBackGoogle: StoryObj = {
  name: 'Welcome back with Google',
  render: () => (
    <Variant
      number={3}
      question="A returning visitor who signed in with Google"
      title="Welcome back with Google"
      goal={
        <p>
          Once a browser has signed in, the pop-up opens on “Welcome back!”
          instead of Sign up or Log in, whichever button opened it. “Use another
          account” goes to Log in.
        </p>
      }
      capture="webapp-welcome-google"
      story={screen('welcome-back-google')}
      captions={{
        phoneBefore:
          'The back arrow at the top left closes the pop-up, it doesn’t go back',
      }}
      changes={[
        closeRow,
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
        paddingRow,
        cardRow,
      ]}
    />
  ),
};
