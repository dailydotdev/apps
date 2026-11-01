import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, Variant } from '../kit';
import { errorCopyRow, iconsRow, logInButtonRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Variants/8. Full-page log in',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const FullPageLogIn: StoryObj = {
  name: 'Full-page log in',
  render: () => (
    <Variant
      number={8}
      question="Where the landing page’s Log in goes"
      title="Full-page log in"
      goal={
        <p>
          /onboarding?action=login: the Log in form as a page, under the
          funnel’s top bar, with a 24px title and no close button. Logged-out
          settings and organization pages land here too.
        </p>
      }
      capture="page-login"
      story={screen('login-page')}
      changes={[logInButtonRow, errorCopyRow, iconsRow]}
    />
  ),
};
