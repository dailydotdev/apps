import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture, CompareTable, Section } from '../kit';
import {
  DecisionPage,
  Divider,
  EmailField,
  FooterLink,
  MockPopup,
  PasswordField,
  ProviderList,
} from './mock';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Decisions/4. Log in on the landing page',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const LandingLogIn: StoryObj = {
  name: 'Log in on the landing page',
  render: () => (
    <DecisionPage
      number={4}
      decided
      question="Where does “Log in” on daily.dev go?"
      title="Log in on the landing page"
      today={
        <p>
          The landing pop-up has no log-in screen: “Log in” leaves for
          app.daily.dev/onboarding?action=login. The webapp switches its pop-up
          in place.
        </p>
      }
      recommendation="Keep today’s hand-off to the full log-in page."
      why={[
        'The full page now matches the pop-up: same buttons, same order, same footer (variant 8).',
        'A log-in state on the landing page means rebuilding the password form, Cloudflare check, errors and Forgot password in a second codebase, and keeping both in sync.',
        'People who log in are leaving the landing page for the app anyway, so the extra page costs them nothing.',
        'Staying on the landing page after logging in isn’t possible: Cloudflare sends logged-in visitors from daily.dev to the app.',
      ]}
      cost="Nothing to build. An after_auth link on the landing’s Log in buttons stays an option for later."
      options={[
        {
          label: 'A · Hand off to the full page',
          recommended: true,
          caption: 'Today, now matching the pop-up. Decided.',
          mock: <Capture name="page-login-phone" alt="Full-page log in" />,
        },
        {
          label: 'B · Log in inside the landing pop-up',
          caption: 'Same screen as the webapp, built again in Astro.',
          mock: (
            <MockPopup
              title="Log in"
              footer={
                <FooterLink text="Don’t have an account?" link="Sign up" />
              }
            >
              <ProviderList providers={['google', 'github']} lead="google" />
              <Divider />
              <EmailField />
              <PasswordField />
              <Button className="w-full" size={ButtonSize.Large}>
                Log in
              </Button>
            </MockPopup>
          ),
        },
      ]}
    >
      <Section
        title="What happens after Log in"
        note="Your question: people who click Log in on a landing page want to carry on where they were. Here is the path today, and what an after_auth link would add later."
      >
        <CompareTable
          firstColumn="Step"
          columns={['Today', 'Optional later']}
          rows={[
            {
              aspect: '1. Click Log in on daily.dev',
              cells: [
                'Opens app.daily.dev/onboarding?action=login',
                'The same page, with an after_auth link back to the app page that matches where they clicked',
              ],
            },
            {
              aspect: '2. Log in',
              cells: [
                'The full page, now the same as the pop-up (variant 8)',
                'Unchanged',
              ],
            },
            {
              aspect: '3. After Log in',
              cells: [
                'Always the feed, since the landing’s links carry no after_auth',
                'The after_auth page, or the feed when there isn’t one. The full page already honors after_auth.',
              ],
            },
            {
              aspect: 'Inside the app',
              cells: [
                'The pop-up switches to Log in in place, and the person stays on the page they were on',
                'Unchanged',
              ],
            },
          ]}
        />
      </Section>
    </DecisionPage>
  ),
};
