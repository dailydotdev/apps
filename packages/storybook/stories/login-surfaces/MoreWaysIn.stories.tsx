import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface, Url } from './inventory';

const meta: Meta = {
  title: 'Login Surfaces/More ways in',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const notCaptured: [string, ReactElement][] = [
  [
    'Profile step after Google or GitHub',
    <>
      Name and username before the account exists. It only shows after a real
      social sign-up.
    </>,
  ],
  [
    'Email code',
    <>
      The screen that asks for the code emailed after the email form. It only
      shows after a real sign-up is submitted.
    </>,
  ],
  [
    'Squad invite link',
    <>
      <Url>/squads/[handle]/[token]</Url> needs a real invite token. Without one
      it is the public squad page below.
    </>,
  ],
  [
    'Organization invite',
    <>
      <Url>/join/organization?token=…</Url>, joining a team&apos;s Plus. Without
      a token it redirects home.
    </>,
  ],
  [
    'Jobs: Show interest',
    <>
      A job page&apos;s Show interest opens its own candidate sign-in modal. The
      jobs page had no open roles to capture.
    </>,
  ],
];

const MoreWaysIn = (): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-12">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          For review · production, Oct 29, 2026, logged out
        </p>
        <h1 className="font-bold typo-title1">More ways in</h1>
        <p className="text-text-secondary typo-callout">
          Sign-up and log-in screens the Web and Mobile overviews don&apos;t
          cover yet, found from every sign-up trigger in the code. Once
          reviewed, each moves into its platform&apos;s overview with an aligned
          mock. Click a capture for full size.
        </p>
      </header>

      <Surface
        title="Sign-up modal"
        note="The sign-up screen people see most. About 40 triggers open it from wherever they are: vote, comment, bookmark, follow, feed filters, search, join squad, award, report, hide. A modal on desktop, full screen on phone, with all four providers and email. Decided Oct 29, 2026: the phone version drops its “Sign up to …” line under the title, as web already does (the line is phone only today, AuthDefault.tsx). Not built."
        shots={[
          {
            file: 'more-modal-desktop',
            step: 'Desktop',
            title: 'Modal over the page',
            note: 'Here from voting on a post.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-modal-pixel',
            step: 'Phone',
            title: 'Full screen',
            note: 'The “Sign up to vote on posts and comments.” line under the title goes, as decided.',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Log in"
        note={
          <>
            Every way to log in. The page, <Url>/onboarding?action=login</Url>,
            is where “Log in” links go, the extension’s too with{' '}
            <Url>r=extension</Url>. From a page like a post, Log in in the
            header opens the same form as a modal: on desktop it drops from the
            top right, not centered like sign up. Phone shows it full screen.
            All four providers, email and password, Cloudflare’s check, Forgot
            password, then “Not a member yet? Sign up”.
          </>
        }
        shots={[
          {
            file: 'more-login-page-desktop',
            step: 'Desktop',
            title: 'Log in page',
            note: <Url>/onboarding?action=login</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-login-extension-desktop',
            step: 'Extension',
            title: 'Log in page',
            note: <Url>/onboarding?r=extension&amp;action=login</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-login-modal-desktop',
            step: 'Desktop',
            title: 'Log in modal',
            note: 'From Log in in a page’s header, here a post.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-login-page-pixel',
            step: 'Phone',
            title: 'Log in page',
            note: 'The logo mark top left, the form below.',
            device: 'phone',
            isToAlign: true,
          },
          {
            file: 'more-login-modal-pixel',
            step: 'Phone',
            title: 'Log in, full screen',
            note: 'From Log in in a page’s header.',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Post page"
        note="Where most shared links land, signed out. Desktop keeps a sign-up banner over the bottom of the page, with a headline personalized by country, and Log in and Sign up in the header. Phone has no sign-up block, only Log in, Open app and “Open daily.dev app”; any action opens the full-screen sign up above."
        shots={[
          {
            file: 'more-post-desktop',
            step: 'Desktop',
            title: 'Post with a sign-up banner',
            note: '“daily.dev is the fastest growing developer platform in Israel!” Google and GitHub, then email and log in as links.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-post-signup-desktop',
            step: 'Desktop',
            title: 'Sign up from the header',
            note: 'The sign-up modal, centered.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-post-pixel',
            step: 'Phone',
            title: 'Post, no sign-up block',
            note: 'Log in and Open app in the header.',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Continue with email"
        note={
          <>
            Where “Continue with email” goes,{' '}
            <Url>/onboarding?action=signupEmail</Url>: one form with email,
            name, password, username and experience level, the marketing
            opt-out, Cloudflare&apos;s check and Sign up.
          </>
        }
        shots={[
          {
            file: 'more-email-desktop',
            step: 'Desktop',
            title: 'Email sign-up form',
            note: <Url>/onboarding?action=signupEmail</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-email-pixel',
            step: 'Phone',
            title: 'Email sign-up form',
            note: 'The same form.',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Squads"
        note="A public squad page signed out. Join Squad opens the sign-up modal with “Sign up to join this Squad.” A squad invite link needs a real token, so it is not captured."
        shots={[
          {
            file: 'more-squad-desktop',
            step: 'First screen',
            title: 'Public squad page',
            note: <Url>/squads/warengonzaga</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-squad-join-desktop',
            step: 'Join Squad',
            title: 'Sign-up modal',
            note: 'Same modal as everywhere else.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-squad-pixel',
            step: 'First screen',
            title: 'Public squad page',
            note: 'Join Squad, and “Open daily.dev app” at the bottom.',
            device: 'phone',
            isToAlign: true,
          },
          {
            file: 'more-squad-join-pixel',
            step: 'Join Squad',
            title: 'Full-screen sign up',
            note: '“Sign up to join this Squad.”',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="/welcome"
        note="A phone-only page: a signed-out sample feed under a hero with its own headline, “Where developers suffer together”, and Sign up in the header. On a laptop it redirects to /onboarding. Nothing in the app links to it, so people reach it from a direct link, such as a campaign."
        shots={[
          {
            file: 'more-welcome-pixel',
            step: 'First screen',
            title: 'Hero and sample feed',
            note: <Url>/welcome</Url>,
            device: 'phone',
            isToAlign: true,
          },
          {
            file: 'more-welcome-scroll-pixel',
            step: 'Scrolled',
            title: 'Sample feed',
            note: 'Sign up stays in the header.',
            device: 'phone',
            isToAlign: true,
          },
          {
            file: 'more-welcome-signup-pixel',
            step: 'Sign up',
            title: 'Full-screen sign up',
            note: 'The shared sign-up screen.',
            device: 'phone',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Sign in with daily.dev"
        note={
          <>
            <Url>/oauth/login</Url> and <Url>/oauth/consent</Url>, for apps and
            tools that connect to a daily.dev account. Signed out it opens the
            sign-up modal on an empty page before it reads the app&apos;s
            parameters, so this is what people see with a real app too. The
            consent step after sign-up is not shown.
          </>
        }
        shots={[
          {
            file: 'more-oauth-desktop',
            step: 'Signed out',
            title: 'Modal on an empty page',
            note: <Url>/oauth/login</Url>,
            device: 'desktop',
            isToAlign: true,
          },
        ]}
      />

      <Surface
        title="Pages whose main action needs an account"
        note="Signed-out pages whose main button opens the sign-up modal or sends people to sign up. The marketplace is in the sidebar and in quests; nothing in the app links to the quiz, so people reach it from a direct link."
        shots={[
          {
            file: 'more-quiz-desktop',
            step: 'AI fluency quiz',
            title: '“Sign in to take test”',
            note: <Url>/quiz/ai-fluency</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-quiz-signin-desktop',
            step: 'AI fluency quiz',
            title: 'Sign-up modal',
            note: 'Says sign in, opens sign up.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-marketplace-desktop',
            step: 'Marketplace',
            title: 'Submit a plugin',
            note: <Url>/marketplace</Url>,
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-marketplace-submit-desktop',
            step: 'Marketplace',
            title: 'Sign-up modal',
            note: 'On Submit a plugin.',
            device: 'desktop',
            isToAlign: true,
          },
          {
            file: 'more-plus-desktop',
            step: 'daily.dev Plus',
            title: 'Redirects to the funnel',
            note: (
              <>
                Signed out, <Url>/plus</Url> goes straight to{' '}
                <Url>/onboarding</Url>.
              </>
            ),
            device: 'desktop',
            isToAlign: true,
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          Not captured
        </h2>
        <div className="grid gap-3 tablet:grid-cols-2">
          {notCaptured.map(([title, note]) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <h3 className="font-bold typo-callout">{title}</h3>
              <p className="text-text-tertiary typo-footnote">{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export const MoreWays: StoryObj = {
  name: 'More ways in',
  render: () => <MoreWaysIn />,
};
