import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Status,
  Table,
} from './kit';
import { PhaseDial, phaseQuestions, phases } from './phasesMocks';

const meta: Meta = {
  title: 'Mobile UX/9i. The phases, explained',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Phases: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question, 1 Oct: what am I deciding when I confirm the phases?"
        title="Five short questions, each with a plain answer and a recommendation. The viewer below walks the five steps: pick one and see what members have once it has shipped."
      >
        <p>
          A phase is one step of the delivery: a bundle of chapters that
          ships together and is read on its own numbers before the next step
          starts. There is no flag and no experiment (decided 1 Oct): a step
          is live for everyone the day it merges, and a problem is fixed
          forward or reverted by a PR.
        </p>
        <ChapterNav current="9i" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi, 1 Oct 2026: five steps, in this order (to be
        revisited when the implementation plan is written), no flag, no time
        gate between steps: one PR at a time, reviewed, merged and QA’d, then
        the next; Tsahi calls a step done.
      </Status>

      <Goal
        goal="Tsahi can answer the rollout questions in five minutes, and a developer reading chapter 9 knows what ships when and what turns it off."
        metric="All five answered; chapter 9 Decided; the implementation plan written next."
      />

      <Section
        title="The steps, one at a time"
        description="Click a step. The phone shows the page that changes most in it; the notes say what ships, what a member sees, and what we read before the next step starts."
      >
        <PhaseDial />
      </Section>

      <Section
        title="The five steps, side by side"
        description="Left to right, 0 to 4. Each phone is the page that changes most in that step."
      >
        <PhoneRow>
          {phases.map((phase) => (
            <figure key={phase.value} className="flex w-[23.4375rem] flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-bold tabular-nums typo-title3">{phase.value}</span>
                <span className="font-bold typo-callout">{phase.name}</span>
              </div>
              {phase.render()}
              <figcaption className="text-text-tertiary typo-footnote">{phase.memberSees}</figcaption>
            </figure>
          ))}
        </PhoneRow>
      </Section>

      <Section
        title="The five questions"
        description="Plain words, one recommendation each, and Tsahi’s answers where they differ from the recommendation (4 and 5)."
      >
        <Table
          head={['Question', 'In plain words', 'Recommendation', 'Why']}
          rows={phaseQuestions.map((row) => [
            <span key={row.question} className="font-bold text-text-primary">
              {row.question}
            </span>,
            row.plain,
            <span key={`${row.question}-r`} className="font-bold text-text-primary">
              {row.recommendation}
            </span>,
            row.why,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="What happens now">
            Chapter 9 is Decided and chapter 10 holds the implementation
            plan: the eight handoff items and the PR list in order, each PR
            whole on its own (so question 3’s “one PR train” became eight
            PRs that each leave the app complete). The first PR is step 0’s
            first fix. Each PR is built, reviewed, merged and QA’d before the
            next one starts.
          </Callout>
          <Callout title="What a no means">
            Any question answered differently changes only chapter 9. The
            chapters themselves (what is built) do not move; only when and
            behind what.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The full table with chapters and metrics per phase is in{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/9. Roadmap')}
            className="font-bold text-text-primary underline"
          >
            chapter 9
          </button>
          .
        </p>
        <Quote>Five steps in order, each live for everyone the day it merges, each read before the next.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9i" />
      </Section>
    </Page>
  ),
};
