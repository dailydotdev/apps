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
import {
  Step,
  adjustments,
  architecture,
  coverage,
  desktopNote,
  firstPr,
  flagArms,
  principles,
  prs,
  recut,
  routes,
  statusOf,
  stepNames,
  verification,
  wrapperBrief,
} from './plan';
import { PrWalker, Sequence, StatusChip, StepPill } from './planMocks';
import { specRows } from './spec';

const meta: Meta = {
  title: 'Mobile UX/10. The build',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const perStep = Object.values(Step).map((step) => ({
  step,
  count: prs.filter((pr) => pr.step === step).length,
}));

export const Build: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s ask, 1 Oct: organise everything we decided into phases and PRs I can review, merge and QA one at a time"
        title={`Every decided piece of chapters 3 to 9l placed in ${prs.length} PRs across the five steps, in the order they merge, each PR whole on its own. Read against the code on main after four inventories of the phone shell, the rows, the post page and the tooling.`}
      >
        <p>
          Nothing here is a new decision. The chapters say what the shell is;
          this page says what lands in which PR, what each PR touches in
          production, what must already be on main before it opens, and what
          proves it did not break the rest. Where the code made a chapter’s rule
          impossible or pointless as written, the adjustment is listed with its
          reason, and the rule in the chapter is the one that moves.
        </p>
        <ChapterNav current="10" />
      </PageHeader>

      <Status status={ChapterStatus.Open} round="5">
        In execution since 1 Oct: PR 0 (the four fixes together, Tsahi’s call)
        is open as dailydotdev/apps#6765, and step 1 (PRs 1.1 to 1.8 together,
        Tsahi’s call again) as dailydotdev/apps#6767, cut on top of PR 0 because
        the shell deletes the footer files PR 0 touched; merge 6765 first. On
        review Tsahi asked for the rows too, so 6767 also carries the row family
        and the Home row from 2.1, the Explore sort menu and places from 2.2,
        and the Squads, Activity, Bookmarks, Tags, Sources, Leaderboard and
        History rows and titles from 2.4, 2.5 and 2.8: no page shows a second
        header. A second review moved the remaining header buttons into the
        block (New Squad as a plus square, the streak on Home, Search and the
        menu on a squad, the menu on a profile, Sort and Share on Bookmarks,
        Filters on search results) and removed the channel line under Happening
        now; a third pass walked 110 routes at 393px and moved the last in-page
        header rows (Sources, Jobs, wallet, briefings, archives, squad form,
        experience lists) into the block. Two names were engineering picks on
        the way: the You page at /you, and the shared folder called shell (its
        first file is shell/constants.ts, because jest treats any spec.ts as a
        test).
      </Status>

      <Goal
        goal="A member never meets a broken shell: after every merge the app is complete, and after the last one it is the app in the chapters."
        metric={`${prs.length} PRs merged in order with their proof attached; zero reverts for a missing destination; the events in 9j firing from their new places on the preview after each step.`}
      />

      <Section
        title="The five steps, as PRs"
        description="The order from chapter 9, revisited: the same five steps, now as a sequence where each PR leaves the app whole. Step 1 is no longer one train; it is eight PRs a member can live with in between."
      >
        <div className="flex flex-wrap gap-2">
          {perStep.map(({ step, count }) => (
            <div
              key={step}
              className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
            >
              <StepPill step={step} />
              <span className="tabular-nums text-text-secondary typo-footnote">
                {count} PRs
              </span>
            </div>
          ))}
        </div>
        <Sequence />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why this order">
            Step 0 fixes what members complain about and needs no design debate.
            In step 1 the bar comes first because everything else hangs off its
            scroll progress and its Create square; You before the roots because
            the avatar has to open something before the gear can go; roots
            before pages because the block is written once and then given a
            second row; the sheet before menus because menus are sheets. Step 2
            starts with the row family and Home, then Explore and search,
            because every later page is a list with a field; things come last
            because they need the block, the rows and the field. Step 3 is the
            post page and the You pages, each alone. Step 4 waits for the
            wrappers.
          </Callout>
          <Callout title="Sequence, not stack">
            No PR is opened on top of an open PR. A PR branches from main,
            merges on its own, and the next one starts from the new main. That
            is why {'"after"'} lists merged PRs, not branches: the dependency is
            on what is live, never on a review that has not happened.
          </Callout>
        </div>
      </Section>

      <Section
        title="Where the plan stands"
        description="Kept by hand after every merge or review round. Shipped means on a green branch or on main; partly shipped means the shell PR absorbed the header and row half of the PR and the rest is open."
      >
        <Table
          head={['PR', 'Name', 'Status', 'Landed', 'Still open']}
          rows={prs
            .filter((pr) => statusOf(pr.id).status !== 'open')
            .map((pr) => [
              <span
                key={pr.id}
                className="font-bold tabular-nums text-text-primary"
              >
                {pr.id}
              </span>,
              pr.name.replace(/ \(.*\)$/, ''),
              <StatusChip key={`${pr.id}-s`} status={statusOf(pr.id).status} />,
              statusOf(pr.id).landed ?? '',
              statusOf(pr.id).left ?? '',
            ])}
        />
        <p className="text-text-secondary typo-callout">
          Open and untouched: 2.9 and every PR of steps 3, 4 and 5 (
          {prs.filter((pr) => statusOf(pr.id).status === 'open').length} PRs).
        </p>
        <Callout
          tone={CalloutTone.Good}
          title="Re-cut step 2 (recommendation, 1 Oct)"
        >
          The shell PR took the header and row half of every step-2 PR, so what
          is left of step 2 is no longer place-shaped (Explore, Tags, Squads)
          but thing-shaped (menus, the field, heroes, hubs, the pager). Cutting
          the remainder by thing gives five PRs instead of nine, each whole on
          its own, with no PR touching the same hero twice. Steps 3 to 5 stay as
          planned.
        </Callout>
        <Table
          head={['PR', 'Name', 'Takes over from', 'Ships']}
          rows={recut.map((pr) => [
            <span
              key={pr.id}
              className="font-bold tabular-nums text-text-primary"
            >
              {pr.id}
            </span>,
            <span key={`${pr.id}-n`} className="font-bold text-text-primary">
              {pr.name}
            </span>,
            pr.from,
            pr.ships,
          ])}
        />
      </Section>

      <Section
        title="Walk the PRs"
        description="Click a PR. What it ships, why the app is whole after it, what it touches, what it needs on main, and the proof it carries."
      >
        <PrWalker />
      </Section>

      <Section
        title="The engineering rules"
        description="Ten lines under every PR. Each one answers a way the inventory showed this work could break."
      >
        <Table
          head={['Rule', 'What it means']}
          rows={principles.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="What gets built, and what it replaces"
        description="The component inventory (9e, handoff item 3): one folder under shared for the new pieces, and the production component each one replaces under 656px."
      >
        <Table
          head={['Piece', 'Lives at', 'Replaces', 'Note']}
          rows={architecture.map((row) => [
            <span
              key={row.piece}
              className="whitespace-nowrap font-bold text-text-primary"
            >
              {row.piece}
            </span>,
            <span
              key={`${row.piece}-l`}
              className="font-mono text-text-secondary typo-caption1"
            >
              {row.lives}
            </span>,
            row.replaces,
            row.note,
          ])}
        />
        <Callout title="Two words about the code that is there">
          The inventory found no single phone header to change: below the laptop
          breakpoint the header is FeedNav on Home and Bookmarks and nothing
          anywhere else, so every other page draws its own bar or none. The
          footer is opted into by about fifty pages and waits for the window
          load event. Drawer has no drag, DropdownMenu never becomes a sheet and
          closes on any scroll, the toast is top-anchored, and “phone” in the
          hooks means under 656px. The architecture above is the smallest set of
          new pieces that turns that into the chapters.
        </Callout>
      </Section>

      <Section
        title="Every chapter, in a PR"
        description="The coverage check: each decided chapter and the PRs that carry it. The 4b and 4c fix lists now carry these PR numbers too."
      >
        <Table
          head={['Chapter', 'PRs']}
          rows={coverage.map((row) => [
            <span
              key={row[0]}
              className="whitespace-nowrap font-bold text-text-primary"
            >
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Rules the chapters set that the code adjusts"
        description="Read once more before development, as asked. Everything not on this list holds as written."
      >
        <Table
          head={['Rule as written', 'Where', 'Now', 'Why']}
          rows={adjustments.map((row) => [
            <span key={row.rule} className="font-bold text-text-primary">
              {row.rule}
            </span>,
            <span
              key={`${row.rule}-w`}
              className="whitespace-nowrap tabular-nums text-text-quaternary"
            >
              {row.where}
            </span>,
            row.now,
            row.why,
          ])}
        />
      </Section>

      <Section
        title="The proof every PR carries"
        description="How each change is reviewed before Tsahi sees it, including the simulator. Only one script is added, beside the Playwright tests. CI runs the unit tests, lint, the strict typecheck and the extension build; nothing in CI renders a phone, so the sweep and the simulator are the phone proof."
      >
        <Table
          head={['Stage', 'What runs', 'Where']}
          rows={verification.map((row) => [
            <span
              key={row[0]}
              className="whitespace-nowrap font-bold text-text-primary"
            >
              {row[0]}
            </span>,
            row[1],
            <span
              key={`${row[0]}-w`}
              className="text-text-quaternary typo-footnote"
            >
              {row[2]}
            </span>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Good}
            title="Tests render as a phone by default"
          >
            Both jest setups stub matchMedia to never match, and useViewSize
            inverts that for the mobile sizes, so every existing spec already
            runs the phone branch. Desktop cases call mockDesktop() from the
            media helper. A PR that changes a shared component adds the desktop
            case to its spec, which is the cheapest proof that desktop did not
            move.
          </Callout>
          <Callout title="What the simulator proves, and what it cannot">
            Safari on the iPhone 17 Pro simulator at the local server is real
            WebKit: safe areas, scrolling, the keyboard, drags. It is not the
            wrapper: isIOSNative needs the injected ios class and the message
            handlers, so bridge behaviour (step 4) is proved with a fake handler
            in tests and then on the mobile engineers’ build.
          </Callout>
        </div>
      </Section>

      <Section
        title="Existing flags: which arm the shell builds on"
        description="Handoff item 4. No flag is added and none is removed by this work."
      >
        <Table
          head={['Flag', 'Today', 'Under the shell']}
          rows={flagArms.map((row) => [
            <span
              key={row[0]}
              className="font-mono text-text-primary typo-caption1"
            >
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Routes"
        description="Handoff item 6. No route moves for a phone reason; two are new (About on a squad, You), one redirects (/squads/create)."
      >
        <Table
          head={['Group', 'URLs', 'What lands']}
          rows={routes.map((row) => [
            <span
              key={row[0]}
              className="whitespace-nowrap font-bold text-text-primary"
            >
              {row[0]}
            </span>,
            <span
              key={`${row[0]}-u`}
              className="font-mono text-text-secondary typo-caption1"
            >
              {row[1]}
            </span>,
            row[2],
          ])}
        />
      </Section>

      <Section
        title="The wrapper brief"
        description="Handoff item 7, for the mobile engineers. Nothing before step 4 (9j); the gates say which PR waits on which release."
      >
        <Table
          head={['Piece', 'What the wrapper does', 'Gate']}
          rows={wrapperBrief.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Desktop and the extension"
        description="Handoff item 8. The shared components the shell changes, and what proves the other widths did not move."
      >
        <Table
          head={['Component', 'What changes', 'Proof']}
          rows={desktopNote.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="The numbers, once"
        description="Handoff item 2: spec.ts in this folder, copied to production as shell/constants.ts in PR 0.4. Every value with the chapter it comes from; the 9l values as recommended."
      >
        <Table
          head={['Group', 'Value', 'Number', 'From']}
          rows={specRows.map((row) => [
            <span
              key={`${row.group}-${row.name}`}
              className="whitespace-nowrap text-text-quaternary typo-footnote"
            >
              {row.group}
            </span>,
            <span
              key={`${row.group}-${row.name}-n`}
              className="font-bold text-text-primary"
            >
              {row.name}
            </span>,
            row.value,
            <span
              key={`${row.group}-${row.name}-f`}
              className="whitespace-nowrap text-text-quaternary typo-footnote"
            >
              {row.from}
            </span>,
          ])}
        />
      </Section>

      <Section
        title="The first PR, written out"
        description="So the execution starts on a yes."
      >
        <Table
          head={['Item', 'Detail']}
          rows={firstPr.map((row) => [
            <span
              key={row[0]}
              className="whitespace-nowrap font-bold text-text-primary"
            >
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Quote>
          {prs.length} PRs, one at a time, the app whole after each.
        </Quote>
      </Section>

      <Section title="Back to the start">
        <ChapterNav current="10" />
      </Section>
    </Page>
  ),
};
