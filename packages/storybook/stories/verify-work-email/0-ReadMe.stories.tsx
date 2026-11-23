import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { Labeled, Page, Section } from './kit';
import { TodayLanding, TodayPopover } from './surfaces';
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
        <div className="flex flex-col items-start gap-6 tablet:flex-row">
          <Labeled
            status="Before"
            title="Popover"
            where="Customer.io campaign 46, all platforms, ~2h after signup"
          >
            <TodayPopover />
          </Labeled>
          <ArrowIcon className="hidden shrink-0 rotate-90 self-center text-text-tertiary tablet:block" />
          <Labeled
            status="Before"
            title="Where “Get my badge” lands"
            where="A settings page that lost its verification section"
          >
            <TodayLanding />
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
                Restyle
              </span>
              <span className="font-bold typo-callout">The modal</span>
              <span className="text-text-secondary typo-footnote">
                Benefits first (logo next to your name, Verified tag, visible
                to recruiters), then the same email and code steps as
                VerifyExperienceModal.
              </span>
            </a>
          </li>
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
            The “Successful verification” email and popover still run. The
            modal’s Verified step covers the popover’s job; decide whether the
            email stays.
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
