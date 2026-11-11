import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Frame } from './frame';
import { Card, Grid, Severity, storyId } from './kit';
import { Providers } from './providers';
import { CompanyScreen } from './screens';
import {
  Lockup,
  LockupVariant,
  Progress,
  ProgressContext,
  ProgressStyle,
  StepId,
} from './shell';
import { progressOptions } from './choices';

const meta: Meta = {
  title: 'Startups Onboarding/3. Design decisions',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

const Option = ({
  title,
  picked,
  children,
  note,
}: {
  title: string;
  picked?: boolean;
  children: React.ReactNode;
  note: string;
}) => (
  <div className="flex min-w-0 flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
    <div className="flex items-center justify-between gap-2">
      <p className="font-bold typo-callout">{title}</p>
      {picked && (
        <span className="rounded-8 bg-accent-avocado-flat px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
          Recommended
        </span>
      )}
    </div>
    <div className="flex min-h-12 items-center">{children}</div>
    <p className="text-pretty text-text-secondary typo-footnote">{note}</p>
  </div>
);

export const Logo: StoryObj = {
  name: 'Logo lock-up',
  render: () => (
    <Page
      eyebrow="Decision 1"
      title="How the product name appears"
      intro="The /startups/ landing page has no lock-up to copy: its header is the plain daily.dev logo with a For startups nav item. So this is a new decision for both the page and the flow."
    >
      <Grid>
        <Option
          title="A. Logo and the business site's label (chosen)"
          picked
          note="The same style as the label on business.daily.dev: the text leads, with a soft purple fill and border behind it. Recruiter has a logo label too, so sub-brands stay one family. Screen readers get the full name."
        >
          <Lockup variant={LockupVariant.Pill} />
        </Option>
        <Option
          title="B. Logo and words"
          note="Reads as the full name, but it's a second sub-brand style beside Recruiter, and it's long on a phone beside the progress line."
        >
          <Lockup variant={LockupVariant.Text} />
        </Option>
        <Option
          title="C. Logo, divider, words"
          note="Quieter, and common for partner lock-ups. It reads as two companies more than one product."
        >
          <Lockup variant={LockupVariant.Divider} />
        </Option>
        <Option
          title="D. Logo only"
          note="What the landing page does today. Safe, but the buyer loses the sense of being in a product made for them."
        >
          <Lockup variant={LockupVariant.Plain} />
        </Option>
      </Grid>
      <Section title="With A chosen">
        <Card title="Use it on the landing page too">
          So the header doesn&apos;t change when someone clicks Get started.
          That&apos;s a small change in recruiter-landing, in the main-site
          header, on /startups/ only.
        </Card>
      </Section>
    </Page>
  ),
};

const inFrame = (style: ProgressStyle, name: string): StoryObj => ({
  name,
  render: () => (
    <ProgressContext.Provider value={{ style }}>
      <CompanyScreen initialName="Acme" />
    </ProgressContext.Provider>
  ),
});

export const ProgressChips = inFrame(
  ProgressStyle.Chips,
  'Progress, A in place',
);
export const ProgressGlow = inFrame(ProgressStyle.Glow, 'Progress, B in place');
export const ProgressJourney = inFrame(
  ProgressStyle.Journey,
  'Progress, C in place',
);
export const ProgressDock = inFrame(ProgressStyle.Dock, 'Progress, D in place');
export const ProgressCard = inFrame(ProgressStyle.Card, 'Progress, E in place');
export const ProgressRail = inFrame(ProgressStyle.Rail, 'Progress, F in place');

export const ProgressOptions: StoryObj = {
  name: 'Progress',
  render: () => (
    <Page
      eyebrow="Decision 2"
      title="How progress shows"
      intro="Six directions, each in place below. Tabs were dropped because they looked clickable. The references are from Nicelydone and SaaSFrame on 5 Nov 2026. No source tests one style against another, so this is a design call. Stripe, Ramp and Mercury aren't here because I couldn't verify their current flows."
    >
      <Grid>
        {progressOptions.map(({ id, style, title, from, note, picked }) => (
          <Option
            key={id}
            title={title}
            picked={picked}
            note={`${from}. ${note}`}
          >
            <div className="w-full">
              {style === ProgressStyle.Dock || style === ProgressStyle.Card ? (
                <p className="text-text-tertiary typo-footnote">
                  See it in place below.
                </p>
              ) : (
                <Progress current={StepId.Plan} style={style} />
              )}
            </div>
          </Option>
        ))}
      </Grid>
      {progressOptions.map(({ id, title }) => (
        <Section key={id} title={title}>
          <Frame storyId={storyId('3-design-decisions', id)} title={title} />
        </Section>
      ))}
    </Page>
  ),
};

export const CenteredDirection: StoryObj = {
  name: 'Layout, centred version',
  render: () => <CompanyScreen initialName="Acme" isCentered />,
};

export const Layout: StoryObj = {
  name: 'Layout',
  render: () => (
    <Page
      eyebrow="Decision 3"
      title="The layout of the screen"
      intro="There's no published outcome data on split vs centred, so this is design judgement. The pick takes the two equal columns of the panel sign-up wall (apps #6376) and fills the box with the stage from the landing page's carousel and the /startups/ agent demo: the double-border bezel, a dark gradient and two blurred glows that drift, with one colour pair per step."
    >
      <Section title="What we know about this layout">
        <Card
          title="Pick this for the brand, not for a lift"
          badge={Severity.High}
        >
          No experiment has compared the panel wall with the default wall. A
          Startups buyer arrives from a landing page already intending to buy,
          which is a different situation, so measure it rather than assume.
        </Card>
      </Section>
      <Section
        title="A. Two columns, with the landing page's box (chosen)"
        note="Chosen. The company name is spelled out as you type, and the payment fills the box. The buyer stays in the look of the page they just came from."
      >
        <Frame
          storyId={storyId('2-screens', 'company')}
          title="Two-column layout"
        />
      </Section>
      <Section
        title="B. Centred, single column"
        note="The most common pattern (Linear, Vercel, Resend). Cheapest, and a fine fallback, but it looks like everyone else's."
      >
        <Frame
          storyId={storyId('3-design-decisions', 'centered-direction')}
          title="Centred layout"
        />
      </Section>
      <Section
        title="Today"
        note="Left-aligned, with the app's layout around it. The column width changes on every step."
      >
        <Frame
          storyId="features-squads-daily-dev-for-startups-checkout--checkout-new-company"
          title="Today's layout"
        />
      </Section>
    </Page>
  ),
};
