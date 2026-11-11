import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid, Severity } from './kit';

const meta: Meta = {
  title: 'Startups Onboarding/6. daily.dev onboarding, reviewed',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const borrow: [string, string][] = [
  [
    'The docked primary button',
    'FunnelGlassBar, so both flows share one primary action.',
  ],
  [
    'The logo at top left',
    'FunnelStepTopBar keeps it out of the way, and adds Back when there is one.',
  ],
  [
    'The panel sign-up wall',
    "Its two equal columns are the base of the Startups layout, with the landing page's stage in place of the art. It has no test result yet.",
  ],
  [
    'Sensible defaults',
    'The tag step starts with tags picked for you, so Continue works straight away.',
  ],
];

const improve: [string, Severity, string][] = [
  [
    'Start with the sign-up wall',
    Severity.Launch,
    "The 30-day funnel shows that's where people leave, by a wide margin. Everything after it loses very little. Polishing later steps won't move the total much, so the hero deserves the attention. Caution: hero views may include people who were never going to sign up, so compare by traffic source first.",
  ],
  [
    'Test the panel wall here',
    Severity.High,
    "It has never been tested against the default wall, so don't assume art wins. It would need two funnel variants.",
  ],
  [
    'The logo collides on the hero',
    Severity.High,
    'On desktop it sits over the dimmed laptop screenshot, with post titles running behind and beside it. A stronger scrim, or moving it to the top bar as on later steps, fixes it.',
  ],
  [
    'The hero says little about why',
    Severity.High,
    'One line, then buttons. Test showing real value first, like a sample of the feed, since this is where the drop is. Check earlier experiments first: the signup screens have been tested before.',
  ],
  [
    'Keep the acquisition question for now',
    Severity.Polish,
    "I expected this to hurt, because it serves us and comes before any value. The data says almost nobody leaves there. It isn't worth moving yet.",
  ],
  [
    'Role is two taps for one answer',
    Severity.Polish,
    'Ten full-width rows, then a Continue button lower down. It could advance on tap, with a way back. A small win, since few people leave here.',
  ],
  [
    'Founders are never told about Startups',
    Severity.Polish,
    'Founder is one of the role options. That answer could lead to the Startups plan later on, once the feed is set up.',
  ],
  [
    'Progress depends on an experiment',
    Severity.Polish,
    'Dots only appear in the aura arm of onboarding_chrome. Let that result decide. No source says a progress indicator lifts completion.',
  ],
];

const families: [string, string, string, string][] = [
  ['Flow', 'daily.dev', 'Recruiter', 'Startups, today'],
  ['Header', 'Logo, top left', 'Logo with Recruiter pill', 'Grey text line'],
  [
    'Progress',
    'None, or dots in an experiment',
    'Numbered tabs',
    'Green-check circles',
  ],
  ['Primary button', 'Docked glass bar', 'Page buttons', 'Plain, left-aligned'],
  [
    'Layout',
    'Centred column, or the panel wall',
    'Full width with a side panel',
    'Left-aligned, changing width',
  ],
];

export const Review: StoryObj = {
  name: 'Review',
  render: (): ReactElement => (
    <Page
      eyebrow="app.daily.dev/onboarding, the organic-v12 funnel"
      title="The daily.dev onboarding, reviewed"
      intro="Viewed live on 4 Nov 2026 and in the Storybook playground, through the first steps (hero, role, acquisition, tags), then checked against 30 days of funnel data from Smith, which is approximate. The reading reminder, install and extension steps weren't reviewed. Recruiter was read from the code only."
    >
      <Section
        title="Three flows, three design languages"
        note="The bigger finding. Each flow solved the same problems separately."
      >
        <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full min-w-[40rem] text-left typo-footnote">
            <tbody>
              {families.map(([label, a, b, c], row) => (
                <tr
                  key={label}
                  className={
                    row
                      ? 'border-t border-border-subtlest-tertiary'
                      : 'font-bold'
                  }
                >
                  <th scope="row" className="p-3 font-bold text-text-primary">
                    {label}
                  </th>
                  <td className="p-3 text-text-secondary">{a}</td>
                  <td className="p-3 text-text-secondary">{b}</td>
                  <td className="p-3 text-text-secondary">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Card title="Recommendation: one shared onboarding frame">
          A small set of parts in packages/shared: the two-column layout, logo
          with a sub-brand pill, progress, docked button. Startups builds it
          first, and the others move over when they next change.
        </Card>
      </Section>
      <Section title="Borrow for Startups">
        <Grid>
          {borrow.map(([title, body]) => (
            <Card key={title} title={title} badge={Severity.Keep}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
      <Section title="Improve in the daily.dev onboarding">
        <Grid>
          {improve.map(([title, severity, body]) => (
            <Card key={title} title={title} badge={severity}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
