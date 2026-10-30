import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Capture,
  CompareTable,
  DESKTOP,
  DesktopRow,
  Labeled,
  LiveFrame,
  Page,
  PHONE,
  PhoneRow,
  screen,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/6. Full-page log in',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const FullPageLogIn: StoryObj = {
  name: 'Full-page log in',
  render: () => (
    <Page
      eyebrow="Chapter 6 · Where does Log in go when there’s no pop-up?"
      title="Full-page log in"
      goal={
        <>
          <p>
            <strong>Goal:</strong> compare the log-in page with the pop-up it
            copies. It’s /onboarding?action=login, where the landing page’s two
            Log in links go, and what the extension and the /onboarding hero’s
            Log in link open. Logged-out settings and organization pages render
            the same screen in place.
          </p>
          <p className="mt-2">
            It’s the same component as chapter 2 in its “simplified” form: no
            card, a page title in place of the header bar, the logo instead of a
            close button.
          </p>
        </>
      }
    >
      <Section title="Phone">
        <PhoneRow>
          <Labeled label="Production" tone="production">
            <Capture
              name="page-login-phone"
              alt="Full-page log in on a phone in production"
            />
          </Labeled>
          <Labeled label="Live · real AuthOptions" tone="live">
            <LiveFrame
              storyId={screen('login-page')}
              title="Full-page log in on a phone"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>

      <Section title="Desktop">
        <DesktopRow>
          <Labeled label="Production" tone="production">
            <Capture
              name="page-login-desktop"
              alt="Full-page log in on desktop in production"
            />
          </Labeled>
          <Labeled label="Live · real AuthOptions" tone="live">
            <LiveFrame
              storyId={screen('login-page')}
              title="Full-page log in on desktop"
              {...DESKTOP}
            />
          </Labeled>
        </DesktopRow>
      </Section>

      <Section title="How it differs from the Log in pop-up">
        <CompareTable
          columns={['Pop-up (chapter 2)', 'Full page']}
          rows={[
            {
              aspect: 'Frame',
              cells: [
                'Card on desktop, full screen with a header bar on phones',
                'The page itself, a 30rem column under the funnel’s top bar',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Title',
              cells: [
                '“Log in” in the header bar, 17px',
                '“Log in” as the page title, 24px, centered',
              ],
              verdict: 'differs',
            },
            {
              aspect: 'Close',
              cells: ['Close button', 'None. The logo top left, no back arrow'],
              verdict: 'differs',
            },
            {
              aspect: 'Providers and form',
              cells: [
                'Four providers, email, password, security check',
                'The same',
              ],
              verdict: 'same',
            },
            {
              aspect: 'Footer',
              cells: [
                '“Not a member yet? Sign up”',
                'The same, but Sign up stays on this page and shows the four providers again',
              ],
              verdict: 'same',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
