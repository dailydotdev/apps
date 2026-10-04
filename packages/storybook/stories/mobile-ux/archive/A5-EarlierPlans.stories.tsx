import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  ArchiveNav,
  Callout,
  CalloutTone,
  Cell,
  ChapterStatus,
  DigIn,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
  Table,
  Verdict,
} from '../kit';
import { ProposedExplore, ProposedHome, ProposedPost, ProposedTag } from '../screens';
import { issues } from '../audit';

const meta: Meta = {
  title: 'Mobile UX/Archive/Earlier plans',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const retired: [string, string, string, string][] = [
  ['Five roots with Create and You as tabs', '5', 'Round 3: "Create leaves the bar and becomes its own square button"; "Profile leaves the bar for the header avatar; the bar keeps Squads"', 'Four roots (Home, Explore, Squads, Activity) plus the Create square; You is a leaf behind the avatar.'],
  ['Create as a sheet, then the composer', '5', 'Round 4: "Create opens the production composer directly ... no drawer in front"', 'The choice sheet was one tap for nothing; kind and audience live inside the composer.'],
  ['Links leave through the Safari view or a Custom Tab', '5', 'Round 5: "Reading the link, X’s way ... a WKWebView on iOS"', 'Apple forbids overlays on its Safari view; the page in front with the post as a drawer needs a custom web view.'],
  ['Every leaf shows the PageBar chevron', '5', 'Round 4: "No floating title box in the middle of the top row"; 38px back and action buttons', 'There is no PageBar. Back is the 38px square on the left; the name sits beside it as plain text (chapter 4d).'],
  ['Post with a docked bar; Home collapsed to a compact header (ProposedPost, ProposedHome collapsed)', '5', 'Round 4: "Post page: no fold. Both bars at rest; on scroll the tab bar slides below the screen"; "The Home brand row slides up continuously"', 'The stills show the round 1 shell; the decided post page is in chapter 6 and the decided Home scroll in chapter 4e.'],
  ['Segments are For you, Headlines, Following', '5', 'Round 4: "The Home segment for the published feed is called Happening now"', 'Naming only; the map redrawn in chapter 5 uses the decided names.'],
  ['Roadmap phases 0 to 4', '9', 'Round 5: "No A/B tests and no experiments"; and every later decision the phases predate (a You tab, a centre Create, a hidden tab bar, a comment sheet, the Safari view)', 'The phases are rewritten once the open calls in chapter 9b are answered.'],
  ['Two risks tied to those phases (a coach mark on the You tab; Android back fixed in phase 4)', '9', 'Same rows', 'There is no You tab to coach, and phase 4 no longer exists.'],
  ['Open questions for product', '9', 'Chapter 9b, call 5: Agents, Hot takes and Game center are Explore rows', 'Two of the three questions are answered; the Plus banner’s home is a content question, not a shell one.'],
];

interface Root {
  tab: string;
  leaves: string[];
  note: string;
}

const roots: Root[] = [
  {
    tab: 'Home',
    leaves: ['Post', 'Tag', 'Source', 'Squad', 'Profile', 'Comment thread'],
    note: 'Segments are not leaves: switching For you to Headlines is not a push.',
  },
  {
    tab: 'Explore',
    leaves: ['Search results', 'Popular / Discussions', 'Tags directory → Tag', 'Sources directory → Source', 'Discover squads → Squad', 'Leaderboard → Profile', 'Headlines'],
    note: 'Everything that is a chip today.',
  },
  {
    tab: 'Create',
    leaves: ['Sheet → Composer (full-screen modal)'],
    note: 'An action, not a stack. Closing the composer returns to whatever was under it.',
  },
  {
    tab: 'Activity',
    leaves: ['Post', 'Comment', 'Profile', 'Notification settings'],
    note: 'Opening a notification pushes inside Activity, so back returns to the list.',
  },
  {
    tab: 'You',
    leaves: ['Profile (own)', 'Bookmarks → Post', 'History → Post', 'Following', 'Custom feeds → Feed', 'My squads → Squad', 'Settings → Sub-pages', 'Plus'],
    note: 'Settings becomes ordinary pages under You.',
  },
];

const rules = [
  ['Roots never show back', 'The five tabs are roots. A root shows a title row or the Home header, never a chevron.'],
  ['Every leaf shows the PageBar chevron', 'Chevron calls the same goBack as the iOS edge swipe and Android back. If the leaf was opened cold (deep link, no history), back goes to the tab root.'],
  ['Active tab = stack owner', 'Navigation from the bar writes the tab into history.state; pushes inherit it. useActiveNav reads it before guessing from the path.'],
  ['Tabs keep their stack and scroll', 'Switching tabs remembers where each one was (last URL + scroll offset). Coming back restores it; re-tapping the active tab pops to root, then scrolls to top, then refreshes.'],
  ['Push with motion', 'A leaf slides in from the right and slides out on back (View Transitions, 300ms, iOS curve). Tab switches cross-fade in 150ms. Reduced motion turns both into a cut.'],
  ['One modal layer', 'Composer is a full-screen modal; share, sort, create, options are sheets. Never a sheet over a sheet. Portaled overlays stop propagation.'],
  ['External links leave through an in-app browser', 'The article link opens SFSafariViewController on iOS and a Custom Tab on Android. Back is the browser Done button. On the web it stays a new tab.'],
  ['Scroll survives', 'history.scrollRestoration is manual; useScrollRestoration restores after the feed reaches height. Render from the react-query cache so a back never shows a skeleton.'],
];

const Arrow = () => (
  <span className="flex h-24 items-center text-text-quaternary typo-mega3">→</span>
);

const Step = ({
  label,
  children,
  active,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <div className="flex flex-col gap-3">
    <span
      className={classNames(
        'font-bold typo-footnote',
        active ? 'text-accent-cabbage-default' : 'text-text-tertiary',
      )}
    >
      {label}
    </span>
    {children}
  </div>
);

interface Phase {
  name: string;
  word: string;
  size: string;
  flag: string;
  ships: string[];
  fixes: string[];
  metric: string;
}

const phases: Phase[] = [
  {
    name: 'Phase 0',
    word: 'Stop the bleeding',
    size: '1 sprint, web only, no flag',
    flag: 'none (bug fixes) + analytics',
    ships: [
      'Axis-locked swipe hook; Headlines channels use it',
      'Active tab resolved from stack owner, never Home on a post',
      'Tab bar rendered at first paint',
      'Explore blank band removed',
      'Events: click footer tab, open create sheet, click back, retap tab, swipe switch',
      'Copy and icon fixes from chapter 4b (labels, casing, "Manade Ad", menu icons, hover-only triggers visible on touch, Prompt cancel)',
    ],
    fixes: ['G1', 'T1', 'T3', 'H2', 'M1'],
    metric: 'Gesture complaints 0; two weeks of navigation baseline in the warehouse.',
  },
  {
    name: 'Phase 1',
    word: 'Budget',
    size: '1 to 2 sprints, web only',
    flag: 'mobile_header_v2',
    ships: [
      'Home header: brand row collapses, segmented feed row pins',
      'PageBar on tag, source, squad, profile, notifications settings, post',
      'Tag and source heroes scroll with content; large-title fade-in',
      'Sheet primitive (grabber, shared header, swipe to dismiss, root portal) replaces every drawer variant',
      'Every three-dots menu opens the action sheet on touch; post menu grouped and capped',
      'One Share sheet, one squad menu, profile actions once, goBack() everywhere',
    ],
    fixes: ['H1', 'N2'],
    metric: 'Fixed chrome while reading 108 to 44; scroll depth and first-session card impressions up.',
  },
  {
    name: 'Phase 2',
    word: 'Structure',
    size: '2 to 3 sprints, web only',
    flag: 'mobile_shell (one rollout flag, control default until launch, no arms)',
    ships: [
      'Tab set Home · Explore · Create · Activity · You, as the floating pill from chapter 3b (the flat blur on both platforms), compact on scroll',
      'Explore hub with search, Your squads, places, the Explore feed',
      'You hub replacing the gear, avatar and chip lists',
      'Create sheet from the centre tab; floating button and chip strip removed',
      'Home segments: For you, Headlines, Following (includes squad posts), custom feeds; Squads hub as the tab',
      'Floating chrome from chapter 3b: tab bar + Create button, leaf clusters, Explore search field, engagement accessory',
      'Settings, Feed settings and Squad Manage as list → page under You; page titles match the bar (Activity, Headlines)',
    ],
    fixes: ['N1', 'T2', 'T4'],
    metric: 'Second-destination rate and D7 for new mobile users; guardrails on squad page views and headline views.',
  },
  {
    name: 'Phase 3',
    word: 'Flow',
    size: '2 sprints, web only',
    flag: 'mobile_nav_v2 (same flag, second wave)',
    ships: [
      'Per-tab stacks with remembered URL and scroll',
      'View Transitions on push and pop, cross-fade on tab switch',
      'Post page: PageBar + docked engagement bar with comment field, tab bar hidden (Arm A)',
      'Comments scroll-to with context line; reply sheet sized from visualViewport',
      'Re-tap to root / top / refresh',
    ],
    fixes: ['P1', 'P2', 'G3'],
    metric: 'Back-to-feed continuation and comments per post view.',
  },
  {
    name: 'Phase 4',
    word: 'Feel and wrappers',
    size: 'parallel track with mobile engineers',
    flag: 'none; capability-detected',
    ships: [
      'Pull to refresh in the web layer; iOS bounces on, native control off',
      'haptic and nav-state bridge messages on iOS and Android',
      'Android predictive back wired to history',
      'Android in-app browser and status bar parity verified',
    ],
    fixes: ['G2', 'W1', 'W2'],
    metric: 'Store rating trend, crash-free sessions unchanged, parity checklist green.',
  },
];

const phaseRisks = [
  ['Retained users cannot find Bookmarks or History', 'Flipboard\'s lesson. One-time coach mark on the You tab for existing members; both are the first two rows.'],
  ['Android back exits the app', 'Phase 4 is the fix; until then nothing in phases 0 to 3 makes it worse than today.'],
];

const issueTitle = (id: string): string =>
  issues.find((issue) => issue.id === id)?.title ?? id;

export const EarlierPlans: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive: chapters 5 and 9"
        title="The round 1 navigation map and the round 4 roadmap, as they were before the decisions moved on. Kept for the record; the live chapters carry the current map and the pre-development review."
      >
        <p>
          Chapter 5 now draws the map from the decisions (four roots, the
          Create square, You behind the avatar, the reading drawer); chapter 9
          holds the review and rewrites its phases once the open calls in
          chapter 9b are answered. What each said before is here, unchanged.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="5">
        Reference only. Every item names the chapter it came from and the
        decision that retired it; nothing on this page is built from.
      </Status>

      <ArchiveNav />

      <Section title="What is here and why">
        <Table
          head={['Item', 'Chapter it came from', 'Retired by', 'Why']}
          rows={retired.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <span key={`${row[0]}-c`} className="tabular-nums">{row[1]}</span>,
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section
        title="Navigation map, round 1"
        description="Five roots and what each could push, as chapter 5 first drew it. Create and You were tabs, links left through the system browser view, and every leaf carried a PageBar with a chevron."
      >
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-5">
          {roots.map((root) => (
            <div
              key={root.tab}
              className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
            >
              <span className="font-bold typo-title3">{root.tab}</span>
              <ul className="flex flex-col gap-1.5">
                {root.leaves.map((leaf) => (
                  <li
                    key={leaf}
                    className="rounded-8 bg-surface-float px-2 py-1 text-text-secondary typo-footnote"
                  >
                    {leaf}
                  </li>
                ))}
              </ul>
              <span className="text-text-tertiary typo-caption1">{root.note}</span>
            </div>
          ))}
        </div>
        <Callout tone={CalloutTone.Bad} title="What changed since">
          Create is a square beside the bar that opens the composer directly
          (round 3, round 4). You is a leaf behind the header avatar and Squads
          is the fourth root (round 3). Headlines is Happening now (round 4).
          Links open in front of the post as a WKWebView with the post as a
          drawer (round 5). The redrawn map is in chapter 5.
        </Callout>
      </Section>

      <Section
        title="Round 1: a journey that stays in its lane"
        description="Explore → Tag → Post → back → back, on the round 1 shell: a PageBar on the tag page and a docked bar on the post. The lane rule stands; the chrome in the stills does not."
      >
        <div className="flex flex-wrap items-start gap-4">
          <Step label="1 · Explore root" active>
            <ProposedExplore />
          </Step>
          <Arrow />
          <Step label="2 · Tag (leaf, PageBar)">
            <ProposedTag />
          </Step>
          <Arrow />
          <Step label="3 · Post (leaf, own bottom bar)">
            <ProposedPost />
          </Step>
        </div>
        <Callout title="What back did at each step">
          From the post: chevron, edge swipe or Android back pops to the tag
          page, scrolled where you left it, slide-out animation. From the tag
          page: pops to Explore root. From Explore root: on Android, system
          back switches to Home; a second back exits (Material&apos;s
          convention). On iOS there is nothing to pop.
        </Callout>
      </Section>

      <Section
        title="Round 1: Home → Post → Home"
        description="The everyday loop as first drawn: the post slid in under a PageBar with a docked engagement bar, and Home came back with its header collapsed."
      >
        <PhoneRow>
          <Cell label="Feed" verdict={Verdict.Skip} note="Tap a card. The round 1 Home with its pinned feed row.">
            <ProposedHome />
          </Cell>
          <Cell label="Post slides in" verdict={Verdict.Skip} note="PageBar on top, docked engagement bar at the bottom, Home stays the owner. Round 4 replaced this with both bars at rest and the tab bar sliding away on scroll (chapter 6).">
            <ProposedPost />
          </Cell>
          <Cell label="Back" verdict={Verdict.Skip} note="Slides out; the feed exactly where it was. The collapsed header became the continuous brand-row slide (round 4) and then the hiding top block (round 5, chapter 4e).">
            <ProposedHome collapsed />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Round 1: the rules"
        description="Eight lines. Stack ownership, remembered tabs, one modal layer and scroll restoration carry over into chapter 5; the PageBar chevron, the five roots and the system browser view do not."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={rules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Roadmap, round 4"
        description="Five phases as chapter 9 planned them before the round 5 decisions. Phase 2 ships a You tab and a centre Create, phase 3 a docked post bar with a comment field and a hidden tab bar; the flags it names do not exist. Read for the ordering logic, not the contents."
      >
        <div className="flex flex-col gap-5">
          {phases.map((phase) => (
            <article
              key={phase.name}
              className="grid gap-5 rounded-16 border border-border-subtlest-tertiary p-5 laptop:grid-cols-[14rem_1fr_1fr]"
            >
              <div className="flex flex-col gap-2">
                <span className="text-text-quaternary typo-caption1">{phase.name}</span>
                <span className="font-bold typo-title2">{phase.word}</span>
                <span className="text-text-tertiary typo-footnote">{phase.size}</span>
                <span className="mt-2 rounded-8 bg-surface-float px-2 py-1 text-text-secondary typo-caption1">
                  Flag: {phase.flag}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
                  Ships
                </span>
                <ul className="flex flex-col gap-1.5 text-text-secondary typo-footnote">
                  {phase.ships.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-text-quaternary">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
                    Closes
                  </span>
                  <ul className="flex flex-col gap-1 text-text-secondary typo-footnote">
                    {phase.fixes.map((id) => (
                      <li key={id}>
                        <span className="font-bold text-text-primary">{id}</span>{' '}
                        {issueTitle(id)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1 rounded-12 bg-surface-float p-3">
                  <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
                    Read before the next phase
                  </span>
                  <span className="text-text-secondary typo-footnote">{phase.metric}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Table
          head={['Risk tied to these phases', 'Mitigation as written']}
          rows={phaseRisks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <DigIn title="Open questions for product, as chapter 9 listed them">
          <p>
            Where does the Plus entry banner live once the For you tab is a
            segment (today it renders under the For you chip)? Does Game
            Center stay a chip-only destination or become a You row? Does
            the Agents feed (interest_agent flag) become a Home segment or an
            Explore row? None of these block phase 0 or 1. Chapter 9b, call 5,
            answers the second and third: Explore rows.
          </p>
        </DigIn>
      </Section>
    </Page>
  ),
};
