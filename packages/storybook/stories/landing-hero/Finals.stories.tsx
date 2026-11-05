import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Table, VariationPage2 } from './parts';
import { LAPTOP, PHONE, Shot } from './shot';
import { ContinueAsYou, finals, laurelOptions } from './variations2';
import { Prose } from './parts';

const GOAL =
  'One board with every pick from the review, so the test plan can be written against it.';
const METRIC =
  'Signup picks: hero signup rate, D7 retained accounts per visitor. Extension picks: account + extension within 7 days, hero signups as the guardrail.';

const meta: Meta = {
  title: 'Landing Hero/Finals',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** The `homepage_hero_final` value each final ships as (recruiter-landing#622). */
const FLAG_VALUE: Record<string, string> = {
  S9: 'auto_signin + personalized_button',
  E1: 'value_row',
  E2: 'header_door',
  E11: 'laurels',
  E12: 'discord_pair',
};

const status = (id: string): string =>
  finals.find((variation) => variation.id === id)?.final ? 'Final' : 'Pick';

export const Board: StoryObj = {
  name: 'All finals',
  render: () => (
    <Page
      chapter="Finals"
      question="What survived the review, and what does each one bet on?"
      title="The board"
      goal={GOAL}
      metric={METRIC}
    >
      <Case
        title="Status"
        note="Final = chosen to build. Pick = liked in review, in the running for a test arm."
      >
        <Table
          head={['Arm', 'Status', 'What it changes', 'Judge it on']}
          rows={finals.map((variation) => [
            `${variation.id} · ${variation.title} (${
              FLAG_VALUE[variation.id]
            })`,
            status(variation.id),
            variation.change,
            variation.id.startsWith('S')
              ? 'Hero signup rate, D7 per visitor'
              : 'Account + extension in 7 days; signups must hold',
          ])}
        />
      </Case>
      {finals.map((variation) => (
        <Case
          key={variation.id}
          title={`${variation.id} · ${variation.title} · ${status(
            variation.id,
          )}`}
          note={variation.hypothesis}
        >
          <Shot width={LAPTOP} height={variation.scroll ? 900 : undefined}>
            {variation.render()}
          </Shot>
          {variation.renderSecond && (
            <Shot width={LAPTOP} label={variation.secondLabel}>
              {variation.renderSecond()}
            </Shot>
          )}
          <div className="w-[390px]">
            <Shot width={PHONE} label="Phone · 390" note={variation.phoneNote}>
              {variation.render()}
            </Shot>
          </div>
        </Case>
      ))}
    </Page>
  ),
};

const one = (index: number): StoryObj => ({
  name: `${finals[index].id} · ${finals[index].title}`,
  render: () => (
    <VariationPage2
      variation={finals[index]}
      chapter="Finals"
      goal={GOAL}
      metric={METRIC}
    />
  ),
});

export const F1 = one(0);
export const F2 = one(1);
export const F3 = one(2);
export const F4 = one(3);
export const F5 = one(4);

export const ReturningUsers: StoryObj = {
  name: 'F1 · Returning users: can we sign them in automatically?',
  render: () => (
    <Page
      chapter="Finals"
      question="Can a developer who signed up before land on daily.dev already signed in?"
      title="F1 · Returning users, researched"
      goal="Get every returning developer into their feed with zero or one tap, on any device, without a signup wall in between."
      metric="Returning-visitor login rate on daily.dev/ and app.daily.dev; time to feed for returning visitors; auto sign-in share (select_by = auto)."
    >
      <Case
        title="What already happens today"
        note="Found in the marketing site’s hero-signup.ts and the app’s useGoogleOneTap hook."
      >
        <Prose>
          <p>
            <strong>
              A visitor who still holds a session never sees the homepage.
            </strong>{' '}
            The Cloudflare router sends anyone with a daily.dev session cookie
            straight to the web app, so the hero is only ever shown to visitors
            with no session: new people, and returning people whose session
            expired, who cleared cookies, or who are on another browser or
            device.
          </p>
          <p>
            <strong>One Tap is live but set to manual.</strong> Both surfaces
            initialize Google One Tap with auto_select off, so a returning
            Google user gets the “Continue as Joud” card and still has to tap
            it.
          </p>
        </Prose>
      </Case>

      <Case
        title="What we can switch on now: Google automatic sign-in"
        note="Google Identity Services, automatic sign-in guide. This is the mechanism that makes F1 ‘automatic’ for the largest group."
      >
        <Prose>
          <p>
            Set auto_select to true on daily.dev/ and app.daily.dev. A returning
            user who is signed into exactly one Google account in the browser
            and has already consented to daily.dev gets the ID token with no
            tap. Chrome shows a short “Signing you in” moment with Cancel (five
            seconds without FedCM); with FedCM the browser handles it. Google
            reports it as select_by = auto, so we can count it.
          </p>
          <p>
            <strong>Rules that come with it.</strong> Sign-out must call
            disableAutoSelect (or set a g_state cookie on the parent domain), or
            a signed-out user is signed straight back in. After a cancel, auto
            sign-in is off for a day. Under FedCM there is a 10-minute quiet
            period between automatic attempts, and Chrome asks once per browser
            instance to reconfirm. Safari and other ITP browsers do not support
            auto sign-in; they get the manual One Tap. Users with several Google
            accounts get the account chooser, not auto.
          </p>
          <p>
            <strong>Who it covers.</strong> Google signups are the largest
            provider on web (about half of web signups in the September cohort),
            so this is the lever with the most reach. GitHub, Apple and email
            have no silent re-authentication on the web: GitHub always needs a
            click through its OAuth page, Apple only re-authenticates on its own
            devices, and email needs a link or a password.
          </p>
        </Prose>
        <Shot
          width={LAPTOP}
          label="The automatic sign-in moment, as Chrome draws it"
        >
          <ContinueAsYou auto />
        </Shot>
      </Case>

      <Case
        title="What takes real work: passkeys for everyone else"
        note="Better Auth’s passkey plugin with conditional UI; Chrome, Edge, Safari and Firefox support it, subject to the OS."
      >
        <Prose>
          <p>
            A passkey turns any returning user, whatever their provider, into a
            one-tap login: the browser offers the saved passkey in the email
            field’s autofill, and Face ID or the device lock finishes it. No
            password, no provider page. It needs an enrollment step after signup
            (“Add a passkey for next time”), a passkey table on the API, and the
            input marked autocomplete=“username webauthn”. It cannot be fully
            silent: the user confirms with the device.
          </p>
          <p>
            Two smaller levers sit next to it. Make the session cookie live
            longer and refresh it on activity, so fewer returning users ever
            lose the session that already bypasses the homepage. And on the
            hero, keep “Already have an account? Log in” prominent so a
            returning user never reads the providers as a signup wall.
          </p>
        </Prose>
      </Case>

      <Case title="What is not possible">
        <Prose>
          <p>
            Signing someone in from a different browser or device with no
            interaction at all: no identity provider allows it, and Chrome’s own
            auto sign-in is per browser instance. Reading the visitor’s Google
            identity before they consent: Google only reveals it after the first
            approval. Silent re-authentication for GitHub, Apple on the web, or
            email: none exists.
          </p>
        </Prose>
      </Case>

      <Case title="Recommendation">
        <Table
          head={['Step', 'What', 'Covers', 'Cost']}
          rows={[
            [
              '1',
              'Turn on auto_select for One Tap on daily.dev/ and app.daily.dev, with disableAutoSelect on sign-out and select_by logged.',
              'Returning Google users in Chrome and Edge, the largest group.',
              'Days. Flag it; watch logins, cancels, and support tickets about “signed in without asking”.',
            ],
            [
              '2',
              'Lengthen and refresh the session so fewer returning users lose it.',
              'Everyone who already signed in on this browser.',
              'Days, API-side.',
            ],
            [
              '3',
              'Passkeys with conditional UI, enrolled after signup.',
              'Returning GitHub, Apple and email users; cross-device with a synced passkey.',
              'Weeks: API plugin, enrollment prompt, hero input.',
            ],
            [
              'Keep',
              'The Cloudflare session redirect and the personalized Google button (F1 screen 2).',
              'Returning users with a live session; returning Google users on the button.',
              'Already built or in F1.',
            ],
          ]}
        />
      </Case>
    </Page>
  ),
};

export const LaurelOptions: StoryObj = {
  name: 'F4 · Laurels: placement options',
  render: () => (
    <Page
      chapter="Finals"
      question="Where should the laurels sit, and should the column match their width?"
      title="F4 · Five placements of the laurels"
      goal="Pick the one placement for the laurels before the test plan."
      metric="None. Design pick."
    >
      {laurelOptions.map((option) => (
        <Case
          key={option.id}
          title={`${option.id} · ${option.title}`}
          note={option.note}
        >
          <Shot width={LAPTOP}>{option.render()}</Shot>
        </Case>
      ))}
    </Page>
  ),
};
