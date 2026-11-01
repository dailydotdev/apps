import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture, Code, CompareTable, Labeled, Page, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const pages = [
  ['1. Design rules', 'The checklist every screen now follows.'],
  ['2. All screens', 'Every proposed screen side by side, phone and desktop.'],
  [
    '3. Variants',
    'Eight pages, one per screen: what changes, then production next to proposed on a phone and on desktop.',
  ],
  [
    '4. Reference',
    'The landing page’s own pop-up, and production compared side by side.',
  ],
  ['5. Still to decide', 'What this PR leaves open.'],
];

const fixed = [
  'Every pop-up is 400px wide on desktop, on the primary background (white in light theme), with 24px side padding at every size',
  'The close button sits on the right at every size, so phones no longer show two back arrows on Reset password and Verify email',
  'No per-action line under the Sign up title',
  'Sign up offers “Continue with email” as a fifth button, like the landing page, instead of an email field under an “or” divider',
  'Provider icons at 28px, so the Google mark matches the landing page',
  'Each screen’s one white action sits in the onboarding steps’ glass bar, which pins to the bottom when the content is taller than the screen',
  'Log in’s button is the outlined secondary one, since the providers above it lead',
  'One footer bar pinned to the bottom of every pop-up, with two wordings, so the Cloudflare box can’t push it off a phone screen',
  '“Not you? Use another account” moved into Welcome back’s content',
  'Verify email works like the onboarding: no back arrow, a Change email link, the mail icon above the message, “Resend code” centered on its own line',
  'The remembered email on Welcome back no longer shows a red error border',
  '“create a new account” in the wrong-password error',
];

export const StartHere: StoryObj = {
  name: 'Start here',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · Before and after, for every sign-up and log-in screen"
      title="One sign-up and log-in pop-up, everywhere"
      goal={
        <>
          <p>
            <strong>Goal:</strong> whoever clicks Sign up or Log in, on
            daily.dev or inside the app, gets a pop-up that looks the same, says
            the same thing and works the same way.
          </p>
          <p className="mt-2">
            <strong>How we’ll know:</strong> one provider list, one set of copy
            and one flow on every surface, then sign-up completion compared per
            surface once they match.
          </p>
        </>
      }
    >
      <Section
        title="Where the pop-up appears"
        note="Every screen with the full set of sign-in buttons, from the code on main and production on October 30, 2026."
      >
        <CompareTable
          firstColumn="Surface"
          columns={[
            'What people see',
            'Buttons',
            'Where it opens from',
            'Pages',
          ]}
          rows={[
            {
              aspect: 'Webapp pop-up',
              cells: [
                <>
                  <Code>AuthModal</Code>: a card on desktop, full screen on
                  phones
                </>,
                'Google, GitHub, Apple, Facebook, then an email field',
                'Header Sign up and Log in, and every action a logged-out visitor tries: upvote, bookmark, comment, follow, join Squad and 30+ more',
                'Variants 1 to 7',
              ],
            },
            {
              aspect: 'Full-page log in',
              cells: [
                <>
                  <Code>/onboarding?action=login</Code>, plus logged-out
                  settings and organization pages
                </>,
                'Google, GitHub, Apple, Facebook, then email and password',
                'The landing page’s Log in, the extension, the /onboarding hero’s Log in link',
                'Variant 8',
              ],
            },
            {
              aspect: 'Landing page pop-up',
              cells: [
                <>
                  <Code>SignupModal</Code> on daily.dev (recruiter-landing repo)
                </>,
                'Google, GitHub, then a Continue with email button',
                'Every Get started button and the header Sign up once the hero has scrolled away',
                'Landing page pop-up',
              ],
            },
          ]}
        />
        <p className="text-text-tertiary typo-footnote">
          Out of scope: the /onboarding first screen (its own Google, GitHub and
          email hero), the extension (it sends people to /onboarding instead of
          opening a pop-up), and the recruiter and candidate sign-in modals,
          which start on that slimmer screen. No GrowthBook flag changes any of
          the screens in scope.
        </p>
      </Section>

      <Section
        title="Fixed in this PR"
        note="Each variant page shows production next to the changed component."
      >
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {fixed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="The two pop-ups today">
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
          <Labeled
            label="daily.dev · landing page"
            tone="production"
            caption="Production, 1440×900"
          >
            <Capture
              name="landing-modal-desktop"
              alt="The landing page sign-up pop-up on desktop"
            />
          </Labeled>
          <Labeled
            label="app.daily.dev · webapp"
            tone="production"
            caption="Production, 1440×900"
          >
            <Capture
              name="webapp-signup-desktop"
              alt="The webapp sign-up pop-up on desktop"
            />
          </Labeled>
        </div>
      </Section>

      <Section
        title="How to read this folder"
        note="Purple “Before” labels are production captures. Green “After” labels are the changed components running here, at a phone’s visible area in Safari (390×664) and a desktop (1440×900), so they can be clicked."
      >
        <ol className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {pages.map(([title, note]) => (
            <li
              key={title}
              className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <p className="font-bold typo-callout">{title}</p>
              <p className="text-text-tertiary typo-footnote">{note}</p>
            </li>
          ))}
        </ol>
      </Section>
    </Page>
  ),
};
