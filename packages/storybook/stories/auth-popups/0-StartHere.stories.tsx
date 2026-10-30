import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture, Code, CompareTable, Labeled, Page, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const chapters = [
  ['1. Sign up', 'The webapp pop-up people see most, opened by 40+ actions.'],
  [
    '2. Log in',
    'The same pop-up after "Log in": four providers plus email and password.',
  ],
  [
    '3. Welcome back',
    'What a returning visitor sees first, for social and password accounts.',
  ],
  [
    '4. After the first screen',
    'Email sign-up, verify email and forgot password, inside the pop-up.',
  ],
  [
    '5. Phone context lines',
    'The one line under "Sign up" that changes per action, phones only.',
  ],
  [
    '6. Full-page log in',
    '/onboarding?action=login, where the landing page sends "Log in".',
  ],
  [
    '7. Landing page pop-up',
    'daily.dev’s own pop-up and hero form, a separate codebase.',
  ],
  [
    '8. Side by side',
    'Every aspect compared across the three, with a verdict per row.',
  ],
  [
    '9. What to align',
    'The differences ranked, as the scope for one consistency PR.',
  ],
];

export const StartHere: StoryObj = {
  name: 'Start here',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · What does signing up or logging in look like today?"
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
            'Chapters',
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
                '1 to 5',
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
                '6',
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
                '7',
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
        note="Purple labels are production captures. Green labels are the real components running here, at a phone’s visible area in Safari (390×664) and a desktop (1440×900), so they can be clicked."
      >
        <ol className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {chapters.map(([title, note]) => (
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
