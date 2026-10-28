import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { LandingPage } from './hero';
import { Case, Page, Prose, Table } from './parts';
import { LAPTOP, PHONE, Shot } from './shot';
import { extensionVariations, signupVariations } from './variations';

const meta: Meta = {
  title: 'Landing Hero/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Production: StoryObj = {
  name: 'Production today',
  render: () => (
    <Page
      chapter="Chapter 0"
      question="What does the homepage hero look like right now?"
      title="The baseline every variation is measured against"
      goal="Keep the port honest: every value here was read off recruiter-landing main on 28 Oct 2026 and the live daily.dev HTML."
      metric="None. This is the control."
    >
      <Prose>
        <p>
          The hero is the signup: the <strong>/onboarding</strong> provider
          stack rendered inline under the tagline, over the illustration, with
          the new-tab demo in a glass frame below and the proof cards under the
          fold. It won <strong>homepage_hero_signup</strong> against the
          extension-install CTAs on desktop and{' '}
          <strong>homepage_mobile_signup</strong> against the app-store CTAs on
          phones. The header reads Log in | Sign up so the form can end on its
          member line.
        </p>
        <p>
          Laptop: art at clamp(760px, 46vw, 950px), focal point 47%, the column
          centered in the art and sharing the demo frame’s 56rem lane. Phone: a
          312px art banner, then the centered headline and form.
        </p>
      </Prose>
      <Case title="Laptop · 1440">
        <Shot width={LAPTOP}>
          <LandingPage playVideo />
        </Shot>
      </Case>
      <Case title="Phone · 390">
        <div className="w-[390px]">
          <Shot width={PHONE}>
            <LandingPage />
          </Shot>
        </div>
      </Case>
    </Page>
  ),
};

export const Brief: StoryObj = {
  name: 'Brief & recommendation',
  render: () => (
    <Page
      chapter="Chapter 0"
      question="What should we test, and in which order?"
      title="Two directions, twenty variations, one guardrail"
      goal="Pick the arms for the next two homepage experiments: one for signups, one for extension awareness."
      metric="Signup: hero signup rate (provider click → account) with D7 retained accounts as the guardrail. Extension: store clicks and installs per exposed visitor, with hero signups as the guardrail."
    >
      <Case
        title="What we already know"
        note="Three homepage tests decided the shape of today’s hero. The variations respect them."
      >
        <Table
          head={['Test', 'Result', 'What it means here']}
          rows={[
            [
              'homepage_variant2 (reboot)',
              'Won: signup +14.8%, install intent +16.6%, D1 retention neutral.',
              'The long-form page, the illustration and the restraint are settled. Variations change the column, not the page.',
            ],
            [
              'homepage_hero_signup + mobile_signup',
              'Inline signup beat the install and app-store CTAs on every device.',
              'The signup stays the only primary action in the hero.',
            ],
            [
              'homepage_side_by_side (Oct 13–18)',
              'Lost: signups −16% (−23% on Windows desktop where the Add to Chrome column showed). Install intent +450%, no retention gain. Reverted in #599.',
              'A second offer at equal weight next to the form cannibalizes. Every extension arm here is lighter than a column, and several are sequenced after the account instead of beside it.',
            ],
          ]}
        />
      </Case>

      <Case
        title="Chapter 1 · Signup conversion"
        note="Ten ways to get more accounts out of the same visitors. Ordered by how much they change."
      >
        <Table
          head={['Arm', 'Lever', 'Cost to build']}
          rows={signupVariations.map((variation) => [
            `${variation.id} · ${variation.title}`,
            variation.change,
            variation.id === 'A2' ||
            variation.id === 'A7' ||
            variation.id === 'A10'
              ? 'Copy only'
              : variation.id === 'A3' || variation.id === 'A9'
              ? 'Needs data plumbing'
              : 'Markup + CSS',
          ])}
        />
      </Case>

      <Case
        title="Chapter 2 · Extension awareness"
        note="Ten ways to say the extension exists without putting a second door beside the signup. Ordered from quietest to boldest."
      >
        <Table
          head={['Arm', 'Lever', 'Distance from the form']}
          rows={extensionVariations.map((variation) => [
            `${variation.id} · ${variation.title}`,
            variation.change,
            variation.id === 'B4' ||
            variation.id === 'B6' ||
            variation.id === 'B7'
              ? 'Outside the column'
              : variation.id === 'B3' || variation.id === 'B8'
              ? 'Headline area'
              : 'Inside the column',
          ])}
        />
      </Case>

      <Case
        title="Recommendation"
        note="Run two experiments, not twenty. Each ships one arm against control, three arms at most, so a win is attributable."
      >
        <Prose>
          <p>
            <strong>Signup, test 1 (copy pack):</strong> A2 promise + objections
            and A10 what happens next, shipped together as one arm, versus
            control. Cheapest build, no layout risk, and both attack the same
            thing: the hero makes a brand claim and never says what you get or
            how short the path is.
          </p>
          <p>
            <strong>Signup, test 2 (structure):</strong> A5 one door versus A1
            proof in the hero versus control. A5 is the biggest single change to
            the form itself and the easiest to read out by provider. A1 is the
            standard CRO move and the one most likely to be asked about if we
            skip it. Hold A3, A4, A6, A8, A9 for a second round, with A3 (pick
            your stack) first among them because it feeds the tag step and the
            personalization promise.
          </p>
          <p>
            <strong>Extension, test 1:</strong> B10 opt-in checkbox versus B4
            the demo wears the badge versus control. B10 captures intent inside
            the one decision the visitor is already making and never adds a
            door; B4 puts the install where the new tab is being demonstrated, a
            screen below the form. Both keep the form’s silhouette identical to
            control, which is what the side-by-side arm failed to do. Guardrail:
            hero signups on Windows desktop, read daily.
          </p>
          <p>
            <strong>Extension, test 2:</strong> B5 step two, optional as the
            sequencing message, measured at the onboarding install step, and B7
            header door as the only in-chrome CTA worth trying. B9 is the
            fallback if everything quieter does nothing, and it goes out with a
            10% split. B1, B2, B3, B6 and B8 are awareness-only; pick one as the
            phone arm (B1) because phones have no extension to install.
          </p>
          <p>
            <strong>Prerequisite for B10 and B5:</strong> an install step in
            onboarding that the checkbox can promise. The flag read, the
            platform classes and the tag names from the removed experiment
            (#590/#599) are the plumbing to reuse.
          </p>
        </Prose>
      </Case>
    </Page>
  ),
};
