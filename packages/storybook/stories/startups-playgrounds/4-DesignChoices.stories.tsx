import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { progressOptions, variations } from '../startups-onboarding/choices';
import { companyVisuals } from '../startups-onboarding/companyVisuals';
import { Frame } from '../startups-onboarding/frame';
import { Card, Grid, storyHref, storyId } from '../startups-onboarding/kit';

// Only what is still open. Each option is the real screen, side by side.

const meta: Meta = {
  title: 'Startups Onboarding/4. Design choices',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Option = ({
  group,
  id,
  title,
  note,
}: {
  group: string;
  id: string;
  title: string;
  note: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2">
    <p className="flex items-baseline justify-between gap-3 font-bold typo-callout">
      {title}
      <a
        href={storyHref(group, id)}
        target="_top"
        className="font-normal text-text-link underline typo-footnote"
      >
        Open
      </a>
    </p>
    <Frame storyId={storyId(group, id)} title={title} />
    <p className="text-pretty text-text-secondary typo-footnote">{note}</p>
  </div>
);

export const DesignChoices: StoryObj = {
  name: '4. Design choices',
  render: () => (
    <Page
      eyebrow="daily.dev for Startups"
      title="Design choices"
      intro="The first of each is what we chose and what's in the flow. The rest stay here to compare. Only the two removals at the end still need your yes."
    >
      <Section
        title="The company step: card stunt"
        note="What fills the box while they name their company. Open one and type a name: each reacts as you type, and starts empty. Live previews elsewhere: Cal.com previews your public page as you type, Slack shows where each answer will land, and Arc ends with a personal keepsake. The ideas themselves are new and untested."
      >
        <Grid>
          {companyVisuals.map(({ id, title, note }) => (
            <Option
              key={id}
              group="3d-company-step-directions"
              id={id}
              title={title}
              note={note}
            />
          ))}
        </Grid>
      </Section>
      <Section
        title="The sign-up panel: crew and one line"
        note="What fills the box on the first step."
      >
        <Grid>
          {variations.map(([id, title, note]) => (
            <Option
              key={id}
              group="3b-sign-up-panel"
              id={id}
              title={title}
              note={note}
            />
          ))}
        </Grid>
      </Section>
      <Section
        title="The stepper: answer chips"
        note="How progress shows at the top."
      >
        <Grid>
          {progressOptions.map(({ id, title, from, note }) => (
            <Option
              key={id}
              group="3-design-decisions"
              id={id}
              title={title}
              note={`${from}. ${note}`}
            />
          ))}
        </Grid>
      </Section>
      <Section title="Still needs your yes: two removals from email sign-up">
        <Grid>
          <Card title="No username field">
            We create one from their name, and they can change it later. Social
            sign-ups already skip it.
          </Card>
          <Card title="No marketing opt-out box">
            Social sign-ups already skip it. This one is worth checking with
            whoever owns consent before it ships.
          </Card>
        </Grid>
      </Section>
    </Page>
  ),
};
