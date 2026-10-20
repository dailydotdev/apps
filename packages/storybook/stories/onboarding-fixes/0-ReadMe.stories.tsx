import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from './kit';

const meta: Meta = {
  title: 'Onboarding Fixes/0. Read me first',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Row = ({
  item,
  status,
  story,
  children,
}: {
  item: string;
  status: 'Fixed';
  story: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href={`?path=/story/${story}`}
    target="_top"
    className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:bg-surface-hover"
  >
    <div className="flex items-center gap-2">
      <span className="rounded-8 bg-accent-avocado-default px-2 py-0.5 font-bold text-white typo-caption1">
        {status}
      </span>
      <p className="font-bold text-text-primary typo-callout">{item}</p>
    </div>
    <div className="text-text-secondary typo-footnote">{children}</div>
  </a>
);

export const ReadMe: StoryObj = {
  name: 'Read me first',
  render: () => (
    <Page
      eyebrow="New user experience · product sync, 14 Oct"
      title="Onboarding fixes"
      intro={
        <>
          Two of the open action items from the sync, one chapter each, plus the
          CTA placement change. The feed preview and quest card revamp live in
          their own folders. These are real changes on this branch and the pages
          render the production components.
        </>
      }
    >
      <Section title="Chapters">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Row
            item="1. Code input cursor and default state"
            status="Fixed"
            story="onboarding-fixes-1-code-input--live"
          >
            A blinking caret in the active box, a red border on a wrong code.
            Files: CodeField.tsx, CodeField.module.css,
            EmailCodeVerification.tsx.
          </Row>
          <Row
            item="2. Verify email and ways back"
            status="Fixed"
            story="onboarding-fixes-2-verify-email-header--compare"
          >
            Email form: back arrow before the logo, to the provider choice, plus
            “Already have an account? Log in”. Verify: the same top-bar back
            arrow, plus “Change email” above Verify. Phones top-aligned. Files:
            FunnelStepTopBar.tsx, FunnelHeroLanding.tsx,
            OnboardingSignupHero.tsx, AuthOptionsInner.tsx,
            RegistrationForm.tsx, EmailCodeVerification.tsx,
            pages/onboarding.tsx.
          </Row>
          <Row
            item="3. Main CTA follows the content"
            status="Fixed"
            story="onboarding-fixes-4-cta-placement--overview"
          >
            From tablet up, Continue sits right under the step and sticks to the
            bottom only when the content is longer than the screen. Phones
            unchanged. Files: FunnelStepCtaWrapper.tsx, FeedPatchy.tsx,
            FunnelInstallPwa.tsx.
          </Row>
        </div>
      </Section>
    </Page>
  ),
};
