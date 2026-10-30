import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import { closeRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Variants/7. Reset password',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const ResetPassword: StoryObj = {
  name: 'Reset password',
  render: () => (
    <Variant
      number={7}
      question="After “Forgot password?” on Log in"
      title="Reset password"
      goal={
        <p>
          “Reset password”, then “Check your email” once the link is sent. Its
          back arrow returns to Log in.
        </p>
      }
      capture="webapp-forgot"
      story={screen('forgot-password')}
      captions={{
        phoneBefore:
          'Two back arrows: the left one closes the pop-up, the second goes back to Log in',
      }}
      changes={[
        {
          ...closeRow,
          cells: [
            'Two back arrows on phones. A back arrow and a close button on desktop.',
            'One back arrow on the left and the close button on the right, at every size',
          ],
        },
        {
          aspect: 'Send reset link',
          cells: [
            '40px tall and right-aligned, smaller than every other button in the pop-up',
            'Full width and 48px tall, like Verify and the provider buttons',
          ],
        },
        {
          aspect: 'Side padding',
          cells: ['56px at every size', '24px at every size'],
        },
      ]}
    />
  ),
};
