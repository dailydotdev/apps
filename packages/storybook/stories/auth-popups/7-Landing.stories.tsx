import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Capture,
  Code,
  CompareTable,
  DesktopRow,
  Labeled,
  Page,
  PhoneRow,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/7. Landing page pop-up',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Landing: StoryObj = {
  name: 'Landing page pop-up',
  render: () => (
    <Page
      eyebrow="Chapter 7 · What does daily.dev’s own pop-up do?"
      title="Landing page pop-up"
      goal={
        <>
          <p>
            <strong>Goal:</strong> document the pop-up that lives outside this
            repo. It’s the hero’s sign-up form inside a native dialog (
            <Code>SignupModal.astro</Code> and <Code>HeroSignupForm.astro</Code>{' '}
            in recruiter-landing), opened by every “Get started” button and by
            the header’s Sign up once the hero has scrolled away.
          </p>
          <p className="mt-2">
            It only signs people up. Google and GitHub start from the page and
            land on /onboarding, while email and Log in both leave for the
            webapp’s full pages.
          </p>
        </>
      }
    >
      <Section title="Phone">
        <PhoneRow>
          <Labeled label="Production · pop-up" tone="production">
            <Capture
              name="landing-modal-phone"
              alt="Landing page pop-up on a phone"
            />
          </Labeled>
          <Labeled
            label="Production · hero form"
            tone="production"
            caption="The same form inline, with Google One Tap over it in the visitor’s Google language. The pop-up never shows One Tap."
          >
            <Capture
              name="landing-hero-phone"
              alt="Landing page hero sign-up form on a phone"
            />
          </Labeled>
        </PhoneRow>
      </Section>

      <Section title="Desktop">
        <DesktopRow>
          <Labeled label="Production · pop-up" tone="production">
            <Capture
              name="landing-modal-desktop"
              alt="Landing page pop-up on desktop"
            />
          </Labeled>
          <Labeled label="Production · hero form" tone="production">
            <Capture
              name="landing-hero-desktop"
              alt="Landing page hero sign-up form on desktop"
            />
          </Labeled>
        </DesktopRow>
      </Section>

      <Section
        title="What’s on it"
        note="Measured in production. It’s always dark, whatever the visitor’s theme. Phone values in brackets."
      >
        <CompareTable
          firstColumn="Part"
          columns={['What people see', 'Spec']}
          rows={[
            {
              aspect: 'Frame',
              cells: [
                'A card over a blurred, darkened page, on phones too',
                '464px wide [358px, 16px from each edge], 16px corners, #17171C, 1px white 10% border',
              ],
            },
            {
              aspect: 'Close',
              cells: ['A round button top right', '32px, white 6% fill'],
            },
            {
              aspect: 'Title',
              cells: [
                '“Where developers discover what’s next.”, the landing headline',
                '28px bold, Plus Jakarta Sans',
              ],
            },
            {
              aspect: 'Providers',
              cells: [
                'Continue with Google, then Continue with GitHub. Google is hidden in in-app browsers.',
                '48px tall, 14px corners, 17px. Google white and semibold, GitHub white 12% with a border, medium',
              ],
            },
            {
              aspect: 'Email',
              cells: [
                'A Continue with email button styled like GitHub, no field, no “or”',
                <>
                  Links to <Code>/onboarding?action=signupEmail</Code>
                </>,
              ],
            },
            {
              aspect: 'Legal',
              cells: [
                '“By continuing, you agree to the Terms of Service and Privacy Policy.” under the buttons',
                '11px, #A8B3CE',
              ],
            },
            {
              aspect: 'Footer',
              cells: [
                '“Already have an account? Log in”',
                <>
                  15px. Leaves for <Code>/onboarding?action=login</Code> in the
                  same tab
                </>,
              ],
            },
            {
              aspect: 'Loading and errors',
              cells: [
                'Buttons dim while the provider loads, no spinner. A red box for failures',
                '“We couldn’t complete your social sign-in. Please try again.”',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Behavior worth knowing">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          <li>
            Google and GitHub call the auth API from the page, then redirect. A
            successful sign-in lands on /onboarding through /callback.
          </li>
          <li>
            Google One Tap only arms while a hero form is on screen, never with
            the pop-up open.
          </li>
          <li>
            The homepage_hero_final experiment changes the hero forms only. The
            pop-up always renders the control form.
          </li>
          <li>
            Picking a provider saves it as the remembered sign-in, which is what
            makes the webapp open on Welcome back (chapter 3) next time.
          </li>
        </ul>
      </Section>
    </Page>
  ),
};
