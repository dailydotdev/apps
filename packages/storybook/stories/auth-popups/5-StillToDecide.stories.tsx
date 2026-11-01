import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Finding } from './kit';
import { Findings, Page, Section } from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Still to decide',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const decisions: Finding[] = [
  {
    title: 'One provider list',
    detail:
      'The landing page and the /onboarding hero offer Google and GitHub. The webapp pop-up and the log-in page add Apple and Facebook. Pick one list, or one rule such as “Apple and Facebook on Log in only”, and use it everywhere.',
    where:
      'apps: components/auth/common.tsx (providers), AuthDefault.tsx · recruiter-landing: HeroSignupForm.astro',
  },
  {
    title: 'One button hierarchy',
    detail:
      'The landing page makes Google the white primary and the rest translucent. The pop-up makes all four white, so nothing leads. Pick one.',
    where:
      'apps: AuthDefault.tsx provider buttons · recruiter-landing: HeroSignupForm.astro',
  },
  {
    title: 'One title',
    detail:
      'The landing headline, a 17px “Sign up” header bar, or a 24px page title. One pattern for the pop-up on both sites, with “Welcome back!” following it.',
    where:
      'apps: AuthHeader.tsx, AuthDefault.tsx · recruiter-landing: SignupModal.astro',
  },
  {
    title: 'Log in on the landing page',
    detail:
      'Log in leaves daily.dev for the full page, while the webapp switches the pop-up in place. Either give the landing pop-up a Log in state or accept the hand-off and make the page match the pop-up.',
    where: 'recruiter-landing: SignupModal.astro, site.config.ts',
  },
];

const fixes: Finding[] = [
  {
    title: 'The legal line in the same place',
    detail:
      'Under the buttons on the landing page and now on the pop-up’s Sign up. Still missing from Log in and from the full page’s first screen.',
    where: 'apps: SignupDisclaimer.tsx, AuthDefault.tsx',
  },
  {
    title: 'The landing page card, and the phone layout',
    detail:
      'The webapp pop-up is now 400px on the primary background. The landing page’s is 464px, #17171C, with a blurred backdrop, so it needs its own PR to match. The webapp also goes full screen on phones instead of staying a card.',
    where:
      'recruiter-landing: SignupModal.astro · apps: modals/common/Modal.tsx',
  },
  {
    title: 'Keep One Tap away from the open pop-up',
    detail:
      'On phones Google One Tap slides over the pop-up and hides its Log in line. The landing page never arms it while its pop-up is open. The webapp could follow the same rule.',
    where: 'apps: AuthOptionsInner.tsx (canUseOneTap)',
  },
  {
    title: 'The security check only when it’s needed',
    detail:
      'Log in and email sign-up always show Cloudflare’s “Verify you are human” box. Sign up and the landing page show none on their first screen.',
    where: 'apps: LoginForm.tsx, RegistrationForm.tsx',
  },
];

export const StillToDecide: StoryObj = {
  name: 'Still to decide',
  render: () => (
    <Page
      eyebrow="Next · What does this PR leave open?"
      title="Still to decide"
      goal={
        <>
          <p>
            <strong>Goal:</strong> list what the variants don’t fix yet. The
            first group needs a product call before anyone writes code. The
            second is safe to build once those calls are made.
          </p>
          <p className="mt-2">
            The landing page lives in recruiter-landing, so matching both sites
            takes a PR in each repo: the webapp pop-up and log-in page here, the
            landing pop-up there.
          </p>
        </>
      }
    >
      <Section title="Decisions first">
        <Findings items={decisions} />
      </Section>
      <Section title="Then build, after this PR">
        <Findings items={fixes} />
      </Section>
      <p className="text-text-tertiary typo-footnote">
        Out of scope here: the font. The landing page uses Plus Jakarta Sans and
        the app uses Helvetica Neue everywhere, so changing it means changing
        the whole app, not just the pop-up.
      </p>
    </Page>
  ),
};
