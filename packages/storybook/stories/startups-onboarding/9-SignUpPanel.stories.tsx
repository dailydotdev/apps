import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { bootAsAnonymous } from '../extension/_providers';
import { Page, Section } from '../onboarding-fixes/kit';
import { Frame } from './frame';
import { Card, Grid, storyId } from './kit';
import {
  AwardsPanel,
  BrandPanel,
  CrewPanel,
  LogosPanel,
  QuotePanel,
  StatsPanel,
} from './panels';
import { Providers } from './providers';
import { AccountScreen } from './screens';
import { variations } from './choices';

const meta: Meta = {
  title: 'Startups Onboarding/3b. Sign-up panel',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  beforeEach: bootAsAnonymous,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const CrewLine: Story = {
  name: 'Default. Crew and one line',
  render: () => <AccountScreen />,
};

export const Quote: Story = {
  name: '1. Big quote',
  render: () => <AccountScreen panel={<QuotePanel />} />,
};

export const Logos: Story = {
  name: '2. Crew and company logos',
  render: () => <AccountScreen panel={<LogosPanel />} />,
};

export const Stats: Story = {
  name: '3. Stats',
  render: () => <AccountScreen panel={<StatsPanel />} />,
};

export const Awards: Story = {
  name: '4. Awards and ratings',
  render: () => <AccountScreen panel={<AwardsPanel />} />,
};

export const Brand: Story = {
  name: '5. Brand colour and one line',
  render: () => <AccountScreen panel={<BrandPanel />} />,
};

export const Crew: Story = {
  name: '6. Crew image only',
  render: () => <AccountScreen panel={<CrewPanel />} />,
};

const others: [string, string][] = [
  [
    'Quote',
    'Attio, Supabase and Clerk. Attio and Clerk use a customer, and Supabase shows a post from a developer.',
  ],
  [
    'Logos',
    'Retool (art above "Trusted by"), Sentry (beside the form) and Zapier (a row below).',
  ],
  [
    'Product or lifestyle art',
    'Retool and Cal.com. Cal.com runs a strip of photos above a centred form.',
  ],
  ['Nothing', 'Framer, Plain and Mintlify: a centred form on a plain page.'],
  [
    'Stats or awards',
    "None of the sign-up pages I checked use this, though it's common on landing pages. That makes it distinctive but unproven.",
  ],
];

export const Overview: Story = {
  name: 'Compare all',
  render: (): ReactElement => (
    <Page
      eyebrow="The first step's right side"
      title="What fills the box while someone signs up"
      intro="Once they move on, the box changes to the company page, then the real payment form. Sign-up is the only step where the box has nothing to preview, so it's free for art or proof. I found no test comparing these patterns, so the picks are judgement."
    >
      <Section
        title="What others do"
        note="Their sign-up pages, viewed on 4 Nov 2026."
      >
        <Grid>
          {others.map(([title, body]) => (
            <Card key={title} title={title}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
      {variations.map(([id, title, note]) => (
        <Section key={id} title={title} note={note}>
          <Frame storyId={storyId('3b-sign-up-panel', id)} title={title} />
        </Section>
      ))}
    </Page>
  ),
};
