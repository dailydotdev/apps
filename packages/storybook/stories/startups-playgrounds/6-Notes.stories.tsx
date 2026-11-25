import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid, storyHref } from '../startups-onboarding/kit';
import { gaps } from './map';

// The reading material, out of the sidebar. These pages stay reachable here.

const meta: Meta = {
  title: 'Startups Onboarding/6. Notes',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const coverageHref = '/?path=/story/startups-playgrounds-4-coverage--coverage';

const pages: [string, string, string][] = [
  [
    'The recommendation',
    'What we propose, in five lines, and what it is based on.',
    storyHref('0-read-me-first', 'read-me'),
  ],
  [
    'Design guidelines',
    'The rules behind this design, so every new screen follows them.',
    storyHref('3c-design-guidelines', 'guidelines'),
  ],
  [
    'Decisions already made',
    'Logo and layout, with the options and why.',
    storyHref('3-design-decisions', 'layout'),
  ],
  [
    'Coverage',
    "Every state, whether it has a before and an after, and what can't be a screen.",
    coverageHref,
  ],
  [
    'Today, reviewed',
    'What to keep and what to fix in what we built.',
    storyHref('5-today-reviewed', 'review'),
  ],
  [
    'daily.dev onboarding, reviewed',
    'The main onboarding, and one frame for all three flows.',
    storyHref('6-daily-dev-onboarding-reviewed', 'review'),
  ],
  [
    'Research',
    "The sources, and what we couldn't source.",
    storyHref('7-research', 'research'),
  ],
  [
    'Build plan',
    'Three phases, what each needs, and how to measure.',
    storyHref('8-build-plan', 'plan'),
  ],
];

const loading: [string, string, string][] = [
  [
    'Account: all screens',
    'No skeleton',
    'Nothing to fetch. Buttons show their own spinner during social sign-in.',
  ],
  [
    'Company: name a new page',
    'No skeleton',
    'Nothing to fetch. The art has a matching background while it loads.',
  ],
  [
    'Company: pick a page',
    'No skeleton',
    'The list is already known at boot. The check on the selected page is a spinner in the button.',
  ],
  ['Plan: choosing', 'No skeleton', 'Prices and features are in the app.'],
  [
    'Payment form',
    'Skeleton added',
    "Paddle loads in its own frame, and it's the one real wait in checkout. Before, it was blank.",
  ],
  [
    'Setting up',
    'No skeleton',
    'The checklist is the loading state: the steps are known, and they tick off.',
  ],
  [
    'Set up, page still loading',
    'Skeleton improved',
    "The plan is on and the page's details are arriving. It now has the shape of the checklist.",
  ],
  [
    'Set up, agent path',
    'No skeleton',
    'The prompt and setup text are built in the app.',
  ],
  [
    'Set up, do it yourself',
    'Skeleton added',
    'The words are known, but not what is done. Only the checks and buttons wait, so rows never flip from not done to done.',
  ],
  [
    'Finished',
    'No skeleton',
    'Everything is already loaded by the time you get here.',
  ],
  [
    'Manage › Subscription',
    'Skeleton improved',
    'Now has the shape of the page, where it was three grey blocks.',
  ],
  [
    'Manage › Seats',
    'Skeleton added',
    'People load after the plan, so the seat rows can wait on their own.',
  ],
  [
    'Squad page upsell',
    'No skeleton',
    'Most viewers never see this card, so a placeholder would be wrong for them.',
  ],
  [
    'Do it yourself edit pages',
    'Unchanged',
    "These are today's manage pages, with their own loading. I haven't changed them.",
  ],
];

export const Notes: StoryObj = {
  name: '6. Notes',
  render: (): ReactElement => (
    <Page
      eyebrow="daily.dev for Startups"
      title="Notes"
      intro="The reading behind the design. You don't need any of it to review the screens."
    >
      <Section title="Pages">
        <Grid>
          {pages.map(([title, body, href]) => (
            <Card key={title} title={title} href={href}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
      <Section
        title="Loading states, screen by screen"
        note="A skeleton only where something real is being fetched and takes long enough to see."
      >
        <Grid>
          {loading.map(([title, decision, why]) => (
            <Card key={title} title={`${title}: ${decision}`}>
              {why}
            </Card>
          ))}
        </Grid>
      </Section>
      <Section
        title="Gaps in today's build"
        note="Dead ends or missing designs from the review. Where a design exists, the card opens it."
      >
        <Grid>
          {gaps.map(({ title, body, link }) => (
            <Card
              key={title}
              title={title}
              href={link ? `/?path=/story/${link}` : undefined}
            >
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
