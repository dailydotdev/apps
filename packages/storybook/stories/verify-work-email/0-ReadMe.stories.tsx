import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { Labeled, Page, Section } from './kit';
import { ProductionLanding, ProductionPopover } from './production';
import { entryPoints } from './entryPoints';

const meta: Meta = {
  title: 'Verify Work Email/0. Read me first',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const story = (id: string): string =>
  `?path=/story/verify-work-email-2-entry-points--${id}`;

const storyIds: Record<string, string> = {
  'after-saving-job': 'after-saving-a-job',
  'unverified-job-row': 'unverified-job',
  'profile-header-chip': 'profile-header',
  'after-cv-upload': 'after-cv-upload',
  'others-badge': 'someone-elses-badge',
};

const Item = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <li className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <p className="font-bold typo-callout">{title}</p>
    <div className="text-text-secondary typo-footnote">{children}</div>
  </li>
);

export const ReadMe: StoryObj = {
  name: 'Read me first',
  render: () => (
    <Page
      eyebrow="Verify work email · proposal"
      title="Ask after someone adds their job"
      intro={
        <>
          Today a popover asks every new member to verify, on every page. In the
          last 90 days thousands saw it and almost nobody verified, and “Get my
          badge” leads to a page with no way to verify. The proposal: turn the
          popover off and ask only after someone tells us where they work, in
          five places that all open one modal. The modal leads with the
          benefits. All copy here is a placeholder.
        </>
      }
    >
      <Section title="Today">
        <div className="flex flex-col items-start gap-6">
          <Labeled
            status="Before"
            title="Popover"
            where="MarketingCtaPopoverSmall with the live verify-work-email row (Customer.io campaign 46), all platforms, ~2h after signup"
          >
            <ProductionPopover />
          </Labeled>
          <ArrowIcon className="ml-28 rotate-180 text-text-tertiary" />
          <Labeled
            status="Before"
            title="Where “Get my badge” lands"
            where="/settings/profile on a laptop: the settings sidebar, SettingsLayout and the Profile form, all production components. Verifying lives on /settings/profile/experience/work."
          >
            <div className="w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary">
              <ProductionLanding />
            </div>
          </Labeled>
        </div>
      </Section>

      <Section
        title="Proposed: five entry points, one modal"
        note="Each opens the same modal. Restyle means the entry exists in code today; New means it doesn't."
      >
        <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {entryPoints.map(({ id, title, where, status }) => (
            <li key={id}>
              <a
                href={story(storyIds[id])}
                target="_top"
                className="flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:bg-surface-hover"
              >
                <span className="font-bold text-text-tertiary typo-caption1">
                  {status}
                </span>
                <span className="font-bold typo-callout">{title}</span>
                <span className="text-text-secondary typo-footnote">
                  {where}
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="?path=/story/verify-work-email-1-modal--benefits"
              target="_top"
              className="flex h-full flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:bg-surface-hover"
            >
              <span className="font-bold text-text-tertiary typo-caption1">
                New
              </span>
              <span className="font-bold typo-callout">The modal</span>
              <span className="text-text-secondary typo-footnote">
                New: a benefits screen first (stand out, get taken seriously,
                30 seconds and free). Then the production
                VerifyExperienceModal, unchanged: one form for the email and
                the code, and a toast for the result.
              </span>
            </a>
          </li>
        </ul>
      </Section>

      <Section
        title="States in Storybook"
        note="Each one is a story, or a value of the “Member’s current job” control on the entry points."
      >
        <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          <Item title="The member’s job">
            A company we have (its logo), a typed-in company (the logos take
            turns), a long name, still loading (the asks in the page show a
            skeleton the same height, so nothing jumps), no current job and already verified (no ask
            anywhere).
          </Item>
          <Item title="The verify form">
            Success, a company we don’t have yet (“Verification initiated”),
            the email refused and a wrong code. All four use the production
            form and toasts.
          </Item>
          <Item title="Screen sizes and themes">
            Desktop, tablet and phone, where every modal is a bottom sheet.
            Light and dark from the toolbar.
          </Item>
          <Item title="Small things">
            A logo that fails to load falls back to the building icon. The
            logos hold still for people who turn off motion.
          </Item>
        </ul>
      </Section>

      <Section
        title="Before we ship"
        note="Not something Storybook can show; each needs a decision or code in the app."
      >
        <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          <Item title="When to ask">
            How often each place shows, whether “Not now” hides it everywhere
            and for how long, and no more than one ask per visit. Don’t ask
            while a verification is waiting for review.
          </Item>
          <Item title="Which job">
            With more than one current job, ask about the most recent one.
          </Item>
          <Item title="Tracking">
            Impression, click and “Not now” for each place, and verification
            started and finished, tagged with the place it came from.
          </Item>
          <Item title="Rollout">
            Behind a flag, tested against today’s popover, with campaign 46
            turned off for the test group only.
          </Item>
          <Item title="Keyboard and screen readers">
            Someone else’s badge becomes a real button with a label, so it can
            be reached by keyboard. Focus goes back to where it was when a
            modal closes.
          </Item>
          <Item title="One sheet opening another">
            On a phone, the tap that closes the “CV uploaded” sheet also closed
            the next sheet. The demo waits for the tap to finish; the app needs
            the same.
          </Item>
          <Item title="Other surfaces">
            Check the extension’s new tab and the mobile app’s web view,
            where the sheet and the logos must work too.
          </Item>
        </ul>
      </Section>

      <Section
        title="Clashes to settle"
        note="Other places that ask people to verify, and the campaigns around them."
      >
        <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          <Item title="Other verify entry points">
            The LFG “Verify where you work” card (apps#6920), the verified-only
            gate on tool discussions, and the recruiter setup checklist should
            open this modal too, so there is one way to verify.
          </Item>
          <Item title="Campaign 27: after verification">
            The “Successful verification” email and popover still run after
            someone verifies. Nothing here changes them; they keep working
            with the new entry points.
          </Item>
          <Item title="Turning off campaign 46">
            Done in Customer.io, not in code. Nobody has changed it since
            2025-11-10.
          </Item>
          <Item title="Copy">
            Every string here is a placeholder. Fine-tune once we agree on the
            flow.
          </Item>
        </ul>
      </Section>
    </Page>
  ),
};
