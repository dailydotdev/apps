import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import { closeRow, paddingRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Variants/5. Email sign-up',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const EmailSignUp: StoryObj = {
  name: 'Email sign-up',
  render: () => (
    <Variant
      number={5}
      question="After typing an email on Sign up"
      title="Email sign-up"
      goal={
        <p>
          Name, password, username and experience level, with the Sign up button
          at the bottom. Storybook has no Cloudflare site key, so the After
          frames show a “taking too long” notice where production shows the
          security check.
        </p>
      }
      capture="webapp-email-signup"
      story={screen('email-sign-up')}
      captions={{
        phoneBefore:
          'The back arrow at the top left closes the pop-up instead of returning to the providers',
      }}
      changes={[
        {
          ...closeRow,
          cells: [
            'A back arrow on the left on phones that closes the pop-up. A close button on the right on desktop.',
            'On the right at every size, like the landing page',
          ],
        },
        {
          aspect: 'Side padding',
          cells: ['16px on phones, 24px on desktop', '24px at every size'],
        },
      ]}
    />
  ),
};
