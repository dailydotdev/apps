import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Frame } from './frame';
import { Card, Grid, Severity } from './kit';

const meta: Meta = {
  title: 'Startups Onboarding/5. Today, reviewed',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const today = 'features-squads-daily-dev-for-startups-checkout--';

const keep: [string, string][] = [
  [
    'Auth',
    'AuthOptions, the same sign-up as the rest of daily.dev, with social accounts skipping the profile form.',
  ],
  [
    'Fields and buttons',
    'TextField, Button, Typography and the colour tokens.',
  ],
  ['Company avatar', 'SquadImage, and the handle generated from just a name.'],
  [
    'Plan words',
    'Plan bullets match the landing page word for word, and prices come from Paddle in local currency.',
  ],
  [
    'Payment',
    'usePaddlePayment, the same hook as Plus, including ?d_id= discounts.',
  ],
  [
    'Setup',
    'The copy-paste agent prompt and MCP setup. This is the most distinctive part, and Vercel docs now do something similar.',
  ],
  [
    'Tracking',
    'Every step and action logs under one target type, so the funnel reads from one filter.',
  ],
];

const fixes: [string, Severity, string][] = [
  [
    'Three money and dead-end gaps',
    Severity.Launch,
    'Paying twice after a refresh. A failed card hides the billing button. The payment form can fail with no message. See States and recoveries.',
  ],
  [
    'The order summary is incomplete',
    Severity.Launch,
    "Paddle says the page must show items, renewal terms, tax and total, because its frame doesn't. Today: name, plan, seats, price and cashback.",
  ],
  [
    'Back and refresh lose everything',
    Severity.Launch,
    "State isn't in the URL. Browser back leaves the flow, and there's no way from Plan back to Company.",
  ],
  [
    'The app surrounds the checkout',
    Severity.High,
    'The page uses MainLayout, so the app header and sidebar stay around it. Baymard recommends enclosing checkout. The stories hide this because they render the step alone.',
  ],
  [
    'No product identity',
    Severity.High,
    '"daily.dev for Startups" is a small grey line. Nothing carries over from the landing page.',
  ],
  [
    'An invented stepper',
    Severity.High,
    "Green-check circles match neither the funnel's bar nor Recruiter's tabs. The count goes from 4 to 3 after signing up, and it vanishes on the last screen.",
  ],
  [
    'The layout has no shape',
    Severity.High,
    'Content is left-aligned with empty space beside it. The column changes width on each step (md, xl, 4xl), so the page jumps.',
  ],
  [
    'Nothing shows what you are buying',
    Severity.High,
    'The buyer never sees their page until after paying, or the handle we generate for them.',
  ],
  [
    'Payment asks twice',
    Severity.High,
    'From Manage, "Choose Team" still asks for the squad and the plan again. WCAG 3.3.7 covers redundant entry.',
  ],
  [
    'The last screen is the weakest',
    Severity.High,
    'Two tall code blocks and icon-only copy buttons, with Open your page competing. No moment of arrival for someone who just paid.',
  ],
  [
    'Sign-up has six small inconsistencies',
    Severity.Polish,
    'Alignment, widths, back controls, titles, provider order and button style, listed in Group A.',
  ],
  [
    'The email form asks for a username',
    Severity.Polish,
    'Social sign-ups get one generated, and fields matter more than steps. Same for the marketing box: social sign-ups already send no consent.',
  ],
  [
    'Accessibility details',
    Severity.Polish,
    "The step doesn't move focus or update the page title, the waiting state isn't announced, and radios lack arrow keys.",
  ],
];

export const Review: StoryObj = {
  name: 'Review',
  render: (): ReactElement => (
    <Page
      eyebrow="apps #7238, with the log-in fix"
      title="What we built, reviewed"
      intro="Most of the parts are right and already daily.dev. The gaps are the frame around them and the moments around the money. Evidence for each is on the Research page."
    >
      <Section
        title="Keep"
        note="Consistent with daily.dev, and carried into the new design."
      >
        <Grid columns={3}>
          {keep.map(([title, body]) => (
            <Card key={title} title={title} badge={Severity.Keep}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
      <Section title="Fix">
        <Grid>
          {fixes.map(([title, severity, body]) => (
            <Card key={title} title={title} badge={severity}>
              {body}
            </Card>
          ))}
        </Grid>
      </Section>
      <Section title="Today's screens" note="The real components, as merged.">
        <Grid>
          {[
            'checkout-pick-squad',
            'checkout-plan',
            'checkout-payment',
            'checkout-done-team',
          ].map((id) => (
            <Frame key={id} storyId={`${today}${id}`} title={id} />
          ))}
        </Grid>
      </Section>
    </Page>
  ),
};
