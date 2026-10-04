import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  Quote,
  Section,
  Status,
  Table,
} from './kit';
import { keepWorking, outOfScope, scopeRules, stepProofs } from './guardrails';

const meta: Meta = {
  title: 'Mobile UX/9j. Keep it working',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Guardrails: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s ask, 1 Oct: the technical side, without leaving the scope"
        title="This work changes how members reach what exists. It adds no feature, no data, no flag and no technical project. Eight scope rules, fifteen things that must keep working exactly as today, and what proves it at each step."
      >
        <p>
          Read from the code on 1 Oct 2026: every event the phone chrome
          fires, every shared piece that also renders on desktop or in the
          extension, every flag on these pages, the URLs and their head tags,
          the tests, the native bridge. Where the review worktree is behind
          main (the logged-out header, the footer and sheet, the scroll
          restoration rewrite) the row says so; every step starts from main.
        </p>
        <ChapterNav current="9j" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        The scope rules restate Tsahi’s decisions (no feature, no flag, no
        experiment, UX and UI only). The keep-working rows are facts from the
        code with the rule each implies; nothing here asks for a decision.
      </Status>

      <Goal
        goal="Every event, URL, test and bridge message that works today works the same the day after each step ships, and no PR in this work adds anything a member could not do before."
        metric="Zero missing events in the log stream after each step; zero changed head tags on the SEO pages; the shared, webapp and extension suites green on every PR."
      />

      <Section title="The scope rules" description="Eight lines. A PR that breaks one is out of this initiative, however good the idea.">
        <Table
          head={['Rule', 'What it means in a PR']}
          rows={scopeRules.map((row) => [
            <span key={row.rule} className="font-bold text-text-primary">
              {row.rule}
            </span>,
            row.detail,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="The test for scope">
            Ask of every change: could a member do this yesterday? If yes, the
            change is a shell change and belongs here. If no, it is a feature
            and gets its own initiative, even when it is small and even when
            it is tempting to slip it into a page that is open anyway.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Where scope usually leaks">
            A new row in the You page that did not exist as a page; a new
            sort or filter on a list; a new prompt; a new query to make an
            empty state nicer; a flag “just for safety”; a refactor of a
            shared component that touches desktop. All out.
          </Callout>
        </div>
      </Section>

      <Section
        title="What must keep working"
        description="Fifteen areas. Today is what the code does now, with file names where a developer will look; the rule is what the shell has to honour."
      >
        <Table
          head={['Area', 'Today', 'Rule for the shell']}
          rows={keepWorking.map((row) => [
            <span key={row.area} className="font-bold text-text-primary">
              {row.area}
            </span>,
            row.today,
            <span key={`${row.area}-r`} className="text-text-primary">
              {row.rule}
            </span>,
          ])}
        />
        <Callout title="The one small addition to analytics">
          The bottom bar fires nothing today, so the only new events in this
          work are one Click per tab on the cluster and ClickNotificationIcon
          with NotificationTarget.Footer on the Activity tab, an enum entry
          that already exists. Everything else keeps the events it has, from
          its new place. No schema, no new targets, no dashboard work.
        </Callout>
      </Section>

      <Section
        title="What proves nothing broke, per step"
        description="Which files each step touches and what the PR shows green before it merges. The specs are the ones that exist; none is written for this table."
      >
        <Table
          head={['Step', 'Touches', 'Proves']}
          rows={stepProofs.map((row) => [
            <span key={row.step} className="whitespace-nowrap font-bold text-text-primary">
              {row.step}
            </span>,
            row.touches,
            row.proves,
          ])}
        />
      </Section>

      <Section title="Out of scope, said once" description="So no PR in this work has to argue it.">
        <ul className="flex flex-col gap-2 text-text-secondary typo-callout">
          {outOfScope.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-text-quaternary">·</span>
              {item}
            </li>
          ))}
        </ul>
        <Quote>Same events, same URLs, same data, same tests. Only where things are, and how they move.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9j" />
      </Section>
    </Page>
  ),
};
