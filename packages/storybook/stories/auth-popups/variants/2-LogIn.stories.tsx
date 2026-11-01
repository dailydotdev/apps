import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import {
  cardRow,
  closeRow,
  errorCopyRow,
  footerRow,
  iconsRow,
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
          tallest screen in the flow. Storybook has no Cloudflare site key, so
          the After frames show no “Verify you are human” box.
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
        errorCopyRow,
        iconsRow,
        paddingRow,
        cardRow,
      ]}
    />
  ),
};
