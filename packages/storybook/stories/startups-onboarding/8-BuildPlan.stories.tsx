import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid } from './kit';

const meta: Meta = {
  title: 'Startups Onboarding/8. Build plan',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const phases: { title: string; note: string; items: [string, string][] }[] = [
  {
    title: 'Phase 1: before the flag opens',
    note: 'Protects money and removes dead ends. Mostly small changes to the merged code.',
    items: [
      ['Back and refresh', 'Put the step and company in the URL.'],
      [
        'No paying twice',
        'While a payment is in flight, show its status with no form. Show the status in Manage and bring back Manage billing for failed cards. May need an API field.',
      ],
      [
        'Complete order summary',
        "Plan, tax, due today, renewal terms, with Paddle's footer visible.",
      ],
      [
        'Payment form failure',
        'Detect it and offer Try again, with a clear message that nothing was charged.',
      ],
      [
        'Keep checking',
        'Polling continues after 60s, slower, and says not to pay again.',
      ],
      [
        'Handle failures',
        'Catch the name check and show the message on the field.',
      ],
    ],
  },
  {
    title: 'Phase 2: the new frame',
    note: 'What this folder shows. Uses existing queries, and no API work.',
    items: [
      [
        'Own layout',
        "A page layout without MainLayout: the panel wall's two columns, and the landing page's stage ported to shared.",
      ],
      [
        'Progress',
        'Answer chips: each finished step shows what you chose. Past steps go back, until payment.',
      ],
      [
        'Sign-up image',
        'The crew with the headline and agent logos on the first step, then the card stunt on the company step. The art needs uploading to media.daily.dev first.',
      ],
      [
        'Lock-up',
        "Generalize the Logo's isRecruiter prop into a sub-brand label, styled like business.daily.dev in dark mode. Also on /startups/ in recruiter-landing.",
      ],
      [
        'The right side',
        'The card stunt with the typed name and nothing saved, then the payment form filling the box, then the real page at Set up.',
      ],
      [
        'Plan and payment together',
        'One screen on desktop, two on phones, the pattern picked for the Plus checkout redesign. Paddle can swap the plan in place.',
      ],
      [
        'Shorter email sign-up',
        'Generate the username as social sign-ups do. Make sure paste works in the code field.',
      ],
      [
        'Entry points',
        'Manage and the upsell skip what they already know, so nobody is asked twice.',
      ],
    ],
  },
  {
    title: 'Phase 3: the arrival',
    note: 'Where the product is different from anyone else.',
    items: [
      [
        'Setup screen',
        'Agent logos, one primary Copy prompt, the crew art on the media CDN.',
      ],
      [
        'Live page checklist',
        'Poll the squad, products and branding queries, and tick items as the agent saves them.',
      ],
      [
        'Share the frame',
        'Move the parts to packages/shared for the funnel and Recruiter.',
      ],
    ],
  },
];

const tests: [string, string][] = [
  [
    'Company name before account',
    'Baymard and NN/g favour asking for the account later. Hold the name, then create the page after sign-up.',
  ],
  ['No progress indicator', 'GOV.UK says to test this first.'],
  [
    'Panel vs centred layout',
    'No outcome data exists, and the panel wall has never been tested. Only worth it with enough traffic.',
  ],
];

export const Plan: StoryObj = {
  name: 'Build plan',
  render: (): ReactElement => (
    <Page
      eyebrow="From this folder to production"
      title="Build plan"
      intro="This folder is Storybook only: no production code changed for it. Phase 1 holds even if nobody picks the new design."
    >
      {phases.map(({ title, note, items }) => (
        <Section key={title} title={title} note={note}>
          <Grid columns={3}>
            {items.map(([item, body]) => (
              <Card key={item} title={item}>
                {body}
              </Card>
            ))}
          </Grid>
        </Section>
      ))}
      <Section title="How to measure it" note="The events already exist.">
        <Card title="The funnel">
          view startups checkout by step, complete checkout, activate squad
          plan, then copy startups setup. The new layout doesn&apos;t need new
          events, except an event for the finished checklist.
        </Card>
      </Section>
      <Section
        title="Worth testing later"
        note="Early traffic will be small, so read these as direction and not proof."
      >
        <Grid columns={3}>
          {tests.map(([title, body]) => (
            <Card key={title} title={title}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
