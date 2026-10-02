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
  Verdict,
  VerdictPill,
} from './kit';
import {
  LandscapeLook,
  LandscapePostStill,
  LandscapeStill,
  landscapeBenchmarks,
  landscapeLookNotes,
  landscapeRules,
} from './landscapeMocks';

const meta: Meta = {
  title: 'Mobile UX/9g. Landscape',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const looks: { look: LandscapeLook; label: string; verdict: Verdict }[] = [
  { look: LandscapeLook.Bottom, label: '1 · The portrait shell, turned', verdict: Verdict.Ship },
  { look: LandscapeLook.Rail, label: '2 · A rail on the left', verdict: Verdict.Skip },
  { look: LandscapeLook.Corners, label: '3 · Two corners, two thumbs', verdict: Verdict.Skip },
  { look: LandscapeLook.Reader, label: '4 · Landscape as reading mode', verdict: Verdict.Skip },
];

const Wide = ({ label, verdict, note, children }: { label: string; verdict: Verdict; note: string; children: React.ReactNode }): React.ReactElement => (
  <figure className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <span className="font-bold typo-callout">{label}</span>
      <VerdictPill verdict={verdict} />
    </div>
    <div className="overflow-x-auto">{children}</div>
    <figcaption className="max-w-[50rem] text-text-tertiary typo-footnote">{note}</figcaption>
  </figure>
);

export const Landscape: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question, 1 Oct: how does the shell behave when a phone is turned sideways?"
        title="Four ways to place the shell on a phone held sideways. The recommendation is the first: the portrait shell turned, the cluster compact and centred at portrait width, the block one line that hides while reading, everything inside the safe areas."
      >
        <p>
          A phone in landscape is 812 by 375: wide, and shorter than a
          portrait screen is wide. Whatever is pinned costs a lot more here.
          The four looks below keep every decided piece (the material, the
          sizes, the radii, the icons, the hide rule) and move only where the
          cluster and the row sit. Each is drawn on Home; the first is also
          drawn on a post. The status bar is hidden, as iOS does in landscape.
        </p>
        <ChapterNav current="9g" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi, 1 Oct 2026: look 1, the portrait shell turned. The
        other three stay on the page for the record. Landscape applies to the
        mobile web in Safari and to the wrappers if they allow rotation; the
        eight rules below hold either way.
      </Status>

      <Goal
        goal="A member who turns the phone keeps the same places, the same gestures and the same bar, and reads with as little pinned as possible."
        metric="No drop in tab taps per session on rotated sessions; no gesture complaints about landscape."
      />

      <Section
        title="The four looks"
        description="Home in each. The content column is at reading width (640px) in all of them; only the chrome moves."
      >
        <div className="flex flex-col gap-10">
          {looks.map(({ look, label, verdict }) => (
            <Wide key={look} label={label} verdict={verdict} note={landscapeLookNotes[look]}>
              <LandscapeStill look={look} />
            </Wide>
          ))}
        </div>
      </Section>

      <Section
        title="Look 1 on a post"
        description="The leaf block is one line (back, share, menu); the action bar and the tab bar share the bottom as in portrait, compact by default, centred at portrait width. Reading hides the line and slides the tab bar away; the action bar stays compact."
      >
        <div className="flex flex-col gap-10">
          <Wide label="1 · A post, sideways, at rest" verdict={Verdict.Ship} note="The line at the top, the action bar over the tab bar at the bottom, centred at portrait width: the portrait post page turned. It costs 48 + 116 of 375, which is why it never stays like this for long.">
            <LandscapePostStill />
          </Wide>
          <Wide label="1 · A post, sideways, while reading" verdict={Verdict.Ship} note="The line is gone, the tab bar has slid away, the action bar is compact in its slot: 320px of 375 is article. Read the full post opens the reading drawer in the wrappers and a new tab on the mobile web, as in portrait.">
            <LandscapePostStill reading />
          </Wide>
        </div>
      </Section>

      <Section title="Why look 1" description="The recommendation, and what the others cost.">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="It is the platform’s answer">
            iOS keeps the tab bar at the bottom in landscape and makes it
            shorter; Safari keeps its address bar at the bottom too. A member
            who rotates finds the bar where their thumb already is, at the
            size the compact state already has. Nothing new to learn, nothing
            new to build: the compact state, the centring and the safe-area
            insets are CSS on the pieces that exist.
          </Callout>
          <Callout title="What the rail costs">
            Look 2 is the desktop rail at phone size. It reads well and it
            matches layout v2, but it takes 68px of a 812px width for the
            whole session, puts the tabs under the left thumb only, and makes
            the bottom cluster a different object in landscape than in
            portrait: two shells to test, two sets of gestures, and the
            rotation animation has to morph one into the other.
          </Callout>
          <Callout title="What the corners cost">
            Look 3 is the most ergonomic for a phone held with two hands, and
            the tab bar at 240px is small. But the bar and Create stop being
            one cluster: the pieces split on rotation and rejoin on the way
            back, and on the post page the action bar has nowhere to go that
            is not the middle. It is a games layout; we are a reading app.
          </Callout>
          <Callout title="What reading mode costs">
            Look 4 hides everything by default, which is right for a post and
            wrong for Home: a member who rotates on the feed loses the bar and
            has to scroll up to find it. The 4e rule already gives look 1 this
            behaviour on a post once reading starts, without a second default
            state to explain.
          </Callout>
        </div>
      </Section>

      <Section title="The rules" description="Eight lines that hold for whichever look is picked.">
        <Table
          head={['Rule', 'Detail']}
          rows={landscapeRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section title="What others do" description="Six references, read for the landscape rule only.">
        <Table
          head={['App', 'In landscape', 'Reads as']}
          rows={landscapeBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <Quote>Turn the phone, keep the shell. The bar stays under the thumb, gets shorter, and the block is one line that leaves while you read.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9g" />
      </Section>
    </Page>
  ),
};
