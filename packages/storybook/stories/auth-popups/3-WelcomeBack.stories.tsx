import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LiveScreen, Page, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Welcome back',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const WelcomeBack: StoryObj = {
  name: 'Welcome back',
  render: () => (
    <Page
      eyebrow="Chapter 3 · What does a returning visitor see?"
      title="Webapp pop-up: Welcome back"
      goal={
        <>
          <p>
            <strong>Goal:</strong> account for the screen most returning people
            get instead of chapters 1 and 2. Once a browser has signed in, it
            remembers the account, and the pop-up opens on “Welcome back!”,
            whichever button opened it, Sign up included.
          </p>
          <p className="mt-2">
            The landing page saves that same memory when someone picks Google or
            GitHub there, but never shows this screen itself.
          </p>
        </>
      }
    >
      <Section
        title="Signed in with Google before"
        note="One button for the remembered account. “Use another account” goes to Log in (chapter 2) and “Sign up” to chapter 1."
      >
        <LiveScreen id="welcome-back-google" title="Welcome back with Google" />
      </Section>

      <Section
        title="Signed in with a password before"
        note="The email is filled in and the password form takes the place of the button."
      >
        <LiveScreen
          id="welcome-back-password"
          title="Welcome back with a password"
        />
      </Section>

      <Section title="Copy on this screen">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          <li>Title “Welcome back!” and “Log in to access your account”</li>
          <li>The account’s avatar and email, with the provider’s badge</li>
          <li>“Not you? Use another account”</li>
          <li>
            “Don’t have an account? Sign up”, the fourth wording of this line
            (see chapter 8)
          </li>
        </ul>
      </Section>
    </Page>
  ),
};
