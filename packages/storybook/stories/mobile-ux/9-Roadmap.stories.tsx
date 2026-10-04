import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  ArchiveNav,
  Callout,
  CalloutTone,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  Section,
  Status,
  Table,
} from './kit';
import { drift, handoff, openCalls, routeGaps } from './review';

const meta: Meta = {
  title: 'Mobile UX/9. Roadmap',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// Proposed on 1 Oct 2026 from the decisions, after chapter 9e. No flag:
// each step goes live for everyone when it merges (Tsahi, 1 Oct). The
// steps are an order of delivery, each read on its own numbers before the
// next one starts.
const phases: [string, string, string, string, string][] = [
  ['0 · Fixes', 'The swipe axis lock, the bar at first paint, press states, pull to refresh, the three-dots menus reachable on touch, the two header bugs, the missing events on the footer items.', '1, 7', 'Fix PRs, one each', 'Gesture complaints per month; an event baseline for the bar.'],
  ['1 · The shell', 'The floating cluster and the Create square opening the composer; the root brand rows with the avatar and the You page; the leaf header, titles and hide on scroll; menus as sheets; back and history; the no-shell class; the visitor header; the rounded-square avatars.', '3, 3b, 3d, 4, 4b, 4d, 4e, 5, 9b, 9c', 'One release, live for everyone', 'Share of sessions reaching a second destination; posts opened per session; D7 of phone-first members.'],
  ['2 · Places', 'The tabs grammar and the nine duplicates; the Explore page; search everywhere with Spotlight; covers on squads and profiles with their segments; best-of in the sort menu; Agents, New squad and the other placed routes.', '3c, 4c, 4, 9e', 'PRs per page, live as they merge', 'Search opens per session; squad and Happening now views per active member.'],
  ['3 · Post and you', 'The post page bar on the scroll progress and the composer for comments; the streak sheet and the milestone popup; Settings and the forms; the Activity settings glyph.', '6, 9d', 'PRs per page, live as they merge', 'Comment rate; settings reach; streak sheet opens.'],
  ['4 · Reading the link, the wrappers', 'The reading drawer; the iOS screen and the Android sheet; the bridge (haptics, back contract, edge to edge, status bar style); the reduced transparency fallback.', '6b, 7, 8', 'Web PRs plus wrapper releases', 'Reads per post opened; time in the reading page; back-outs before reading.'],
];

const risks = [
  ['Squads engagement drops when the bar changes', 'Squads keeps its tab (round 3); squad page views per active user are read after the rollout, not in an experiment.'],
  ['View Transitions on older WebViews', 'Feature-detected; the fallback is today\'s cut. No layout depends on the animation.'],
  ['Chrome leaving on posts changes tab hops', 'The tab bar returns on any scroll up; tab hops per post session are read after the rollout.'],
];

const notDoing = [
  'A native tab bar or a native navigation stack over the WebView.',
  'A sixth tab, a More tab, or a product bet (Plus, Agents, Game Center) in the bar.',
  'A settings toggle for swipe sensitivity; the gesture gets fixed instead.',
  'Any new Open-in-app banner; the logged-out header and footer PRs own that.',
  'Changes to feed cards, onboarding or the post content itself.',
];

export const Roadmap: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="In what order, and measured how?"
        title="Five steps, no flag and no experiments, proposed from the decisions. The pre-development review (the calls, the drift, the routes, the handoff) stays on this page as the record."
      >
        <p>
          The first step removes live complaints and gives us numbers with
          no design debate, the structural change ships as one release for
          everyone, the decided pages follow in two steps, and the wrapper
          work runs last with the mobile engineers. The chapter-to-
          phase table is below; chapter 9e lists what the handoff still needs
          and the order to write it in.
        </p>
        <ChapterNav current="9" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Reviewed before development on 30 Sep 2026 and again on 1 Oct (chapter 9e); the steps decided on 1 Oct (chapter 9i): five steps in this order, no flag, one PR at a time with review, merge and QA between them, Tsahi calling each step done. The order was revisited on 1 Oct in chapter 10, which turns the five steps into the PR list, each PR whole on its own; where chapter 10 and this page differ, chapter 10 is current. The review sections below stay as the record; the round 4 phases are in the Archive: Earlier plans.
      </Status>

      <Section
        title="Before development: the calls, all made"
        description="The review left ten calls only Tsahi could close. All ten were closed on 30 Sep 2026 and are in the decisions table in chapter 0; chapter 9b keeps each with its picture and the reasoning. Chapter 9c holds the one question that followed (the avatar on the left)."
      >
        {openCalls.length > 0 && (
          <Table
            head={['Topic', 'Question', 'Where', 'Recommendation']}
            rows={openCalls.map((row) => [
              <span key={row.topic} className="font-bold text-text-primary">
                {row.topic}
              </span>,
              row.question,
              row.where,
              <span key={`${row.topic}-r`} className="font-bold text-text-primary">
                {row.recommendation}
              </span>,
            ])}
          />
        )}
        <ChapterNav current="9" />
      </Section>

      <Section
        title="Before development: chapters to bring in line"
        description="Copy, verdicts, mocks or data that still describe a model a later decision overturned. Developers build whichever they read first, so every row is fixed before handoff."
      >
        <Table
          head={['Chapter', 'Still says', 'Fix']}
          rows={drift.map((row) => [
            <span key={row.chapter} className="font-bold tabular-nums text-text-primary">
              {row.chapter}
            </span>,
            row.stale,
            row.fix,
          ])}
        />
      </Section>

      <Section
        title="Before development: routes with no decision"
        description="Production routes under packages/webapp/pages that no page row, audit row or tab row covers."
      >
        <Table
          head={['Group', 'Routes', 'Does the shell fit']}
          rows={routeGaps.map((row) => [
            <span key={row.group} className="font-bold text-text-primary">
              {row.group}
            </span>,
            <span key={`${row.group}-r`} className="font-mono text-text-secondary typo-caption1">
              {row.routes}
            </span>,
            row.covered,
          ])}
        />
      </Section>

      <Section
        title="Before development: what the handoff still needs"
        description="Artifacts no chapter provides yet, with what exists today."
      >
        <Table
          head={['Item', 'Today', 'Needed']}
          rows={handoff.map((row) => [
            <span key={row.item} className="font-bold text-text-primary">
              {row.item}
            </span>,
            row.today,
            row.needed,
          ])}
        />
      </Section>

      <Goal
        goal="No big-bang launch, every issue from chapter 1 assigned to a phase, and a metric per phase we can read before starting the next."
        metric="Each step's metric moves in the right direction before the next step starts."
      />

      <Section
        title="The steps, decided"
        description="Five steps from the decisions, every chapter in one of them. No flag, no experiment, nothing hidden (Tsahi, 1 Oct 2026): each step goes live for everyone when it merges, the way the logged-out mobile header shipped. Decided in this order, to be revisited in the implementation plan; chapter 9i explains it in plain words."
      >
        <Table
          head={['Step', 'Ships', 'Chapters', 'How it ships', 'Read afterwards']}
          rows={phases.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            <span key={`${row[0]}-c`} className="whitespace-nowrap tabular-nums text-text-secondary">
              {row[2]}
            </span>,
            <span key={`${row[0]}-f`} className="font-mono text-text-secondary typo-caption1">
              {row[3]}
            </span>,
            row[4],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why this order">
            Phase 0 removes live complaints and gives numbers with no flag and
            no design debate. Phase 1 is the structural change and everything
            that depends only on the web layer; it is the one members notice.
            Phases 2 and 3 fill the shell with the decided pages, one PR per
            page, so a problem in one page is one revert. Phase 4 needs the
            mobile engineers and ships with wrapper releases.
          </Callout>
          <Callout title="What a step must do before the next">
            No time gate (Tsahi, 1 Oct). Each PR is built, reviewed, merged
            and QA’d; when it is right, the next one starts, as fast as that
            allows. The metrics are read as they come and inform the next PR
            rather than hold it. A problem found after a merge is fixed
            forward or reverted by a PR; there is no switch to flip.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The round 4 plan (five phases, their flags, what each closed and
          measured) is in the{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/Archive/Earlier plans')}
            className="font-bold text-text-primary underline"
          >
            Archive: Earlier plans
          </button>
          .
        </p>
      </Section>

      <Section
        title="No experiments"
        description="Tsahi's call in round 5: no A/B tests and no experiment arms anywhere in this work."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="How it ships instead">
            No flag at all (Tsahi, 1 Oct 2026): each step merges and goes
            live for everyone; every alternative mocked in the chapters is
            reference only, and the &quot;A/B arm&quot; verdict is retired.
          </Callout>
          <Callout title="What is still read">
            The same metrics, after the fact: share of sessions reaching a
            second destination, posts opened per session, D7 retention of
            phone-first users, squad page views and Happening now views per
            active user, comment rate, settings reach. New versus retained
            is still reported as a split, because the numbers differ.
          </Callout>
        </div>
      </Section>

      <Section title="Risks and the answer to each">
        <Table
          head={['Risk', 'Mitigation']}
          rows={risks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section title="What this plan does not do">
        <ul className="flex flex-col gap-2 text-text-secondary typo-callout">
          {notDoing.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-text-quaternary">·</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Back to the start">
        <ChapterNav current="9" />
        <ArchiveNav />
      </Section>
    </Page>
  ),
};
