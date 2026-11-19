import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Frame } from './frame';
import { Card, Grid, storyHref, storyId } from './kit';
import { Providers } from './providers';

const meta: Meta = {
  title: 'Startups Onboarding/0. Read me first',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const ideas: [string, string][] = [
  [
    'Make it theirs',
    'A stadium of seats spells their company name as they type it, and at Set up the real page fills in beside the checklist. Today they first see it after paying.',
  ],
  [
    'The panel layout',
    'Two columns from our panel sign-up wall on desktop, its art-first layout on phones, with a Startups logo, and the app sidebar and header gone.',
  ],
  [
    'Fewer things to fill in',
    'Plan and payment on one screen, no username, and nobody asked twice.',
  ],
  [
    'Protect the money',
    'No way to pay twice, a complete order summary, and a clear message for every failure.',
  ],
  [
    'Make arrival the best moment',
    'One primary action for the agent, with the page ticking off as it fills in.',
  ],
];

const pages: [string, string, string, string][] = [
  [
    '1. Playgrounds',
    'The new design, live, once per use case. Click through the whole flow.',
    '1-playgrounds',
    'new-founder',
  ],
  [
    '2. Before and after',
    'Every screen of a use case, today beside the proposal.',
    '2-before-and-after',
    'new-founder',
  ],
  [
    '3. Do it yourself',
    'Every edit page behind the checklist, one row at a time.',
    '3-do-it-yourself',
    'the-list',
  ],
  [
    '4. Design choices',
    'What we chose for the company step, sign-up panel and stepper, the options beside them, and what still needs a yes.',
    '4-design-choices',
    'design-choices',
  ],
  [
    '5. Plan name and icon',
    'What to call the settings item, and how it fits with user settings.',
    '5-plan-name-and-icon',
    'plan-name-and-icon',
  ],
  [
    '6. Notes',
    'Guidelines, research, reviews, the build plan and the gaps.',
    '6-notes',
    'notes',
  ],
];

export const ReadMe: StoryObj = {
  name: 'Read me first',
  render: (): ReactElement => (
    <Providers>
      <Page
        eyebrow="daily.dev for Startups"
        title="Making the onboarding stand out"
        intro="The parts we built are right, and mostly already daily.dev. What's missing is the frame around them, the moments around the money, and a reason to feel something. This is a proposal: nothing here is in production."
      >
        <Frame
          storyId={storyId('2-screens', 'company')}
          title="The new company page step"
        />
        <Section title="The recommendation in five lines">
          <Grid columns={3}>
            {ideas.map(([title, body]) => (
              <Card key={title} title={title}>
                {body}
              </Card>
            ))}
          </Grid>
        </Section>
        <Section title="What's in this folder">
          <Grid>
            {pages.map(([title, body, group, story]) => (
              <Card key={title} title={title} href={storyHref(group, story)}>
                {body}
              </Card>
            ))}
          </Grid>
        </Section>
        <Section title="What this is based on, honestly">
          <Grid>
            <Card title="Evidence where it exists">
              Field counts, the order summary, webhooks and accessibility have
              real sources. Most checkout research is e-commerce.
            </Card>
            <Card title="Judgement where it doesn't">
              Nobody has published data on split vs centred, or on one progress
              style against another, and our panel wall has never been tested.
              Those picks are design judgement and are marked as such.
            </Card>
          </Grid>
        </Section>
      </Page>
    </Providers>
  ),
};
