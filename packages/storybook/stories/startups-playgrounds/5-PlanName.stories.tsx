import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AnalyticsIcon,
  CoinIcon,
  CreditCardIcon,
  EmbedIcon,
  MedalBadgeIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid } from '../startups-onboarding/kit';

// One decision: what the settings item for a company page's plan is called, which
// icon it has, and how it sits next to the user's own subscription settings.

const meta: Meta = {
  title: 'Startups Onboarding/5. Plan name and icon',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Row = ({
  icon,
  label,
  isActive,
}: {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}): ReactElement => (
  <li
    className={`flex h-10 items-center gap-3 rounded-12 px-3 typo-callout ${
      isActive ? 'bg-surface-float text-text-primary' : 'text-text-tertiary'
    }`}
  >
    {icon}
    {label}
  </li>
);

const Menu = ({
  group,
  icon,
  label,
}: {
  group: string;
  icon: ReactNode;
  label: string;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
    <p className="px-3 font-bold text-text-tertiary typo-footnote">{group}</p>
    <ul className="flex flex-col gap-1">
      <Row icon={icon} label={label} isActive />
      {group === 'Tools' && (
        <>
          <Row icon={<AnalyticsIcon />} label="Analytics" />
          <Row icon={<EmbedIcon />} label="Integrations" />
          <Row icon={<TrashIcon />} label="Danger zone" />
        </>
      )}
    </ul>
  </div>
);

const options: {
  title: string;
  group: string;
  icon: ReactNode;
  label: string;
  note: string;
}[] = [
  {
    title: 'A. Subscription, with a credit card (our decision)',
    group: 'Billing',
    icon: <CreditCardIcon />,
    label: 'Subscription',
    note: 'The word and icon agree, and user settings already use both ("Payment & Subscription"). It still reads right before they buy. Gets its own group, away from tools.',
  },
  {
    title: 'Today: Plan, with a credit card',
    group: 'Tools',
    icon: <CreditCardIcon />,
    label: 'Plan',
    note: 'A card says "payment", but the word says "plan". The two pull apart, and it sits among tools.',
  },
  {
    title: 'B. Billing, with a credit card',
    group: 'Billing',
    icon: <CreditCardIcon />,
    label: 'Billing',
    note: 'The most common label in the tools I checked. But this page is mostly the plan, cashback and seats, and it reads wrong for a page with no plan yet.',
  },
  {
    title: 'C. Plan and billing, with a credit card',
    group: 'Billing',
    icon: <CreditCardIcon />,
    label: 'Plan and billing',
    note: 'The clearest about what is inside, and the longest, which matters in a narrow menu.',
  },
  {
    title: 'D. Plan, with a medal',
    group: 'Tools',
    icon: <MedalBadgeIcon />,
    label: 'Plan',
    note: 'Keeps the word, and makes it about status rather than paying. Nothing else in our settings uses it this way.',
  },
  {
    title: 'E. Plan, with a star',
    group: 'Tools',
    icon: <StarIcon />,
    label: 'Plan',
    note: 'Reads as "premium", but a star already means favourite in many products.',
  },
  {
    title: 'F. Plan, with a shield',
    group: 'Tools',
    icon: <ShieldCheckIcon />,
    label: 'Plan',
    note: 'Echoes verified squads, but also suggests security settings.',
  },
  {
    title: 'G. Plan, with a coin',
    group: 'Tools',
    icon: <CoinIcon />,
    label: 'Plan',
    note: 'Points at money and cashback, but could be confused with the wallet.',
  },
];

const sources: [string, string, string][] = [
  [
    'Linear',
    'Settings › Administration › Billing',
    'https://linear.app/docs/billing-and-plans',
  ],
  [
    'Vercel',
    'Settings › Billing',
    'https://vercel.com/docs/plans/pro-plan/billing',
  ],
  ['Notion', 'Settings › Billing', 'https://www.notion.com/help/billing'],
  [
    'GitHub',
    'Names "Billing and licensing" pages, with no click path',
    'https://docs.github.com/en/billing/managing-your-billing/about-billing-on-github',
  ],
  [
    'GitLab',
    'An issue proposes renaming "Billing" to "Subscription", because it misled free users',
    'https://gitlab.com/gitlab-org/gitlab/-/issues/558372',
  ],
];

export const PlanNameAndIcon: StoryObj = {
  name: '5. Plan name and icon',
  render: (): ReactElement => (
    <Page
      eyebrow="One decision"
      title="Plan is now Subscription"
      intro="Decided: Subscription, keeping the credit card, in its own Billing group. It's in the settings menu now. You choose a plan and you manage a subscription, so the Plan step in checkout keeps its name."
    >
      <Section title="Our decision, and the options we compared">
        <Grid columns={3}>
          {options.map(({ title, group, icon, label, note }) => (
            <div key={title} className="flex flex-col gap-3">
              <p className="text-balance font-bold typo-callout">{title}</p>
              <Menu group={group} icon={icon} label={label} />
              <p className="text-pretty text-text-secondary typo-footnote">
                {note}
              </p>
            </div>
          ))}
        </Grid>
      </Section>
      <Section
        title="With the user's own settings"
        note="Today, user settings have Billing and Monetization › Payment & Subscription, with a credit card. That's the person's own Plus. A company page's plan is on the page."
      >
        <Grid>
          <Card title="Don't merge them">
            A page&apos;s plan belongs to the page and can be run by its admins,
            and Plus belongs to one person. Merging them would put a page&apos;s
            seats in someone&apos;s personal settings.
          </Card>
          <Card title="Match them, and link them">
            Same word and icon in both places. Then add a short list in Payment
            & Subscription: the pages you pay for, each with its plan and a link
            to its Subscription settings. That&apos;s a new idea, and needs
            someone to build it.
          </Card>
        </Grid>
      </Section>
      <Section
        title="What I checked"
        note="Vendors' own help pages, read on 5 Nov 2026. Slack's and Figma's pages didn't state a label, so they aren't here. No source compares labels with data, so this is a judgement call."
      >
        <Grid>
          {sources.map(([name, body, href]) => (
            <Card key={name} title={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener"
                className="text-text-link underline"
              >
                {body}
              </a>
            </Card>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
