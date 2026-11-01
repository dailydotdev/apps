import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompareTable, Page, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Design rules',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const DesignRules: StoryObj = {
  name: 'Design rules',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · What every sign-up and log-in screen now shares"
      title="Design rules"
      goal={
        <p>
          <strong>Goal:</strong> one checklist to review every variant against.
          A screen that breaks a rule here is a bug in this PR.
        </p>
      }
    >
      <Section title="Frame">
        <CompareTable
          firstColumn="Part"
          columns={['Rule', 'Where it lives']}
          rows={[
            {
              aspect: 'Size',
              cells: [
                '400px wide on desktop. Full screen on phones.',
                'AuthModal.tsx',
              ],
            },
            {
              aspect: 'Background',
              cells: [
                'The primary background on the whole pop-up, footer included: white in light theme',
                'AuthOptionsInner.tsx, AuthModalFooter.tsx',
              ],
            },
            {
              aspect: 'Header',
              cells: [
                'A 56px bar: the title on the left, the close button on the right at every size. A back arrow, only where there’s a step to go back to, sits before the title.',
                'AuthHeader.tsx, modals/common/ModalHeader.tsx',
              ],
            },
            {
              aspect: 'Side padding',
              cells: [
                '24px on every screen, at every size',
                'AuthContainer.tsx and each step',
              ],
            },
            {
              aspect: 'Content start',
              cells: [
                '24px under the header',
                'AuthContainer.tsx, RegistrationForm.tsx',
              ],
            },
            {
              aspect: 'Full page',
              cells: [
                'Outside a pop-up, as on /onboarding?action=login, the title is a centered 24px page title instead of a header bar',
                'AuthHeader.tsx (simplified)',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Buttons">
        <CompareTable
          firstColumn="Part"
          columns={['Rule', 'Where it lives']}
          rows={[
            {
              aspect: 'Providers',
              cells: [
                'White, 48px tall, full width, 28px icons. Sign up adds a fifth, “Continue with email”, in the same style.',
                'AuthDefault.tsx',
              ],
            },
            {
              aspect: 'One main action',
              cells: [
                'When a screen has one white action (Log in on Welcome back, Sign up, Verify, Send reset link, Change password), it sits in the onboarding steps’ glass bar. The bar follows the content and pins to the bottom when the content is taller than the screen.',
                'AuthActionBar.tsx',
              ],
            },
            {
              aspect: 'Under providers',
              cells: [
                'Where the provider buttons lead, as on Log in, the email form’s button is the outlined secondary one',
                'AuthDefault.tsx, LoginForm.tsx',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Copy and links">
        <CompareTable
          firstColumn="Part"
          columns={['Rule', 'Where it lives']}
          rows={[
            {
              aspect: 'Footer',
              cells: [
                'One bar pinned to the bottom of every pop-up that has one: “Already have an account? Log in” on Sign up, “Don’t have an account? Sign up” on Log in and Welcome back',
                'AuthModalFooter.tsx',
              ],
            },
            {
              aspect: 'Other links',
              cells: [
                'In the content, above the footer: “Forgot password?”, “Not you? Use another account”, “Wrong email? Change email”',
                'LoginForm.tsx, AuthSignBack.tsx, EmailCodeVerification.tsx',
              ],
            },
            {
              aspect: 'Legal line',
              cells: [
                'Under the five buttons on Sign up, the screen where an account is first agreed to',
                'SignupDisclaimer.tsx',
              ],
            },
            {
              aspect: 'Title only',
              cells: [
                'No subtitle under the Sign up title. Welcome back keeps “Log in to access your account” above the avatar.',
                'AuthDefault.tsx, AuthSignBack.tsx',
              ],
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
