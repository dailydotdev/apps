import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Source,
  Status,
  Table,
  Verdict,
} from './kit';
import {
  FeelMotion,
  FeelVerdict,
  FeelVerdictPill,
  HitAreaSpecimen,
  IconSwapSpecimen,
  PressSpecimen,
  SheetSpecimen,
  TabularSpecimen,
  ToastSpecimen,
  WrapSpecimen,
  curves,
  feelCalls,
  feelCuts,
  feelPrinciples,
  feelReview,
  feelRules,
} from './feelMocks';

const meta: Meta = {
  title: 'Mobile UX/9l. Feel',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const count = (verdict: FeelVerdict): number => feelReview.filter((row) => row.verdict === verdict).length;

const sources: [string, string][] = [
  ['jakub.kr', 'https://jakub.kr/'],
  ['Less is more, more or less', 'https://jakub.kr/writing/less-is-more'],
  ['Details that make interfaces feel better', 'https://jakub.kr/writing/details-that-make-interfaces-feel-better'],
  ['The invisible side of design engineering', 'https://jakub.kr/writing/the-invisible-side-of-design-engineering'],
  ['Using gestures in Motion', 'https://jakub.kr/work/motion-gestures'],
  ['Drag gestures on the web', 'https://jakub.kr/work/drag-gesture'],
  ['The skills, MIT', 'https://github.com/jakubkrehel/skills'],
];

export const Feel: Story = {
  render: () => (
    <Page>
      <FeelMotion />
      <PageHeader
        eyebrow="Tsahi’s ask, 1 Oct: read jakub.kr, then review every decision so the shell feels good"
        title="Jakub Krehel’s craft in one page, every decided piece measured against it, and ten changes with exact values. Nothing new is built and no decision moves; the same components get the numbers that make them feel finished."
      >
        <p>
          Source: jakub.kr (the essays Less is more, Details that make
          interfaces feel better, The invisible side of design engineering,
          the Motion gesture, drag and shared-layout articles) and his open
          skills (better-ui, better-layout, better-typography,
          better-accessibility, better-colors, better-writing), read on 1
          Oct 2026. His values are exact numbers, not ranges, and this
          chapter uses them as written. Where a decision already matches, the
          row says Keeps; where it needs a value, Improve; where it
          contradicts him, Fix.
        </p>
        <ChapterNav current="9l" />
      </PageHeader>

      <Status status={ChapterStatus.Open} round="5">
        Ten calls for Tsahi, each with a recommendation and, where it can be
        felt, a live specimen. No decision row changes until he picks; the
        values then go into the spec file (9e, handoff item 2) and ride along
        with the PR that touches each piece.
      </Status>

      <Goal
        goal="Every tap answers in the same way, every sheet and toast comes and goes the same way, nothing waits for an animation and nothing jitters, on the phone and with reduced motion on."
        metric="Frame time under 8ms on the shrink and the hide in the wrapper; zero layout properties in any transition in the shell; every control at 44px to hit; the ten calls decided before step 1 starts."
      />

      <Section
        title="The source, in one page"
        description="What jakub.kr teaches, each rule with the exact value he gives. The column on the right says where it comes from."
      >
        <Table
          head={['Rule', 'The value', 'Where']}
          rows={feelPrinciples.map((row) => [
            <span key={row.rule} className="font-bold text-text-primary">
              {row.rule}
            </span>,
            row.value,
            <span key={`${row.rule}-w`} className="text-text-quaternary">
              {row.where}
            </span>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Restraint first">
            His first lesson is not a recipe: understand what people do with
            the thing, then animate only what makes the outcome better, and
            spend the rich motion on rare moments. Most of what follows is
            exact values for the few things that earn motion, and instant
            feedback for everything else.
          </Callout>
          <Callout title="Two curves for the whole shell">
            He runs springs with no bounce; in CSS that is {curves.interaction}{' '}
            for anything the finger drives or toggles. Chapter 7 already
            decided {curves.travel} for sheets and pushes. Those two are the
            shell’s curves; the other two in the mocks go.
          </Callout>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-text-tertiary typo-footnote">
          {sources.map(([label, href]) => (
            <Source key={href} href={href}>
              {label}
            </Source>
          ))}
        </p>
      </Section>

      <Section
        title="Every decision, against the source"
        description={`Each decided piece, what it decided, and how it reads next to his rules. ${count(FeelVerdict.Keeps)} keep as they are, ${count(FeelVerdict.Improve)} take a value, ${count(FeelVerdict.Fix)} contradict him and change.`}
      >
        <Table
          head={['Chapter', 'Decided', 'Against the source', 'Verdict']}
          rows={feelReview.map((row) => [
            <span key={row.chapter} className="whitespace-nowrap font-bold text-text-primary">
              {row.chapter}
            </span>,
            row.decided,
            row.against,
            <FeelVerdictPill key={`${row.chapter}-v`} verdict={row.verdict} />,
          ])}
        />
        <Callout tone={CalloutTone.Good} title="What holds up">
          The geometry is his: one radius family, concentric where it is
          nested, depth by a token ring and a transparent shadow, fill for the
          active state with opacity as the second cue, one filled action per
          view, tabular counts in the streak and the badge, copy that says
          what to do next. Hide on scroll is built the way he builds motion:
          a transform, his curve, interruptible, with a fade for reduced
          motion. The decisions stand; what changes is the values underneath.
        </Callout>
      </Section>

      <Section
        title="What he would cut, and what stays"
        description="His frequency test applied to the motion we decided. Scroll-driven motion passes because nobody waits for it; timed motion on high-frequency actions does not."
      >
        <Table
          head={['Candidate', 'The call']}
          rows={feelCuts.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="The ten changes, drawn"
        description="Each call with today’s value, the recommendation, and a specimen you can press, tap or play. All of them are values on components that already exist; none adds a feature, a query or a flag (9j)."
      >
        <Table
          head={['Call', 'Today', 'Recommendation']}
          rows={feelCalls.map((row) => [
            <span key={row.call} className="whitespace-nowrap font-bold text-text-primary">
              {row.call}
            </span>,
            row.today,
            <span key={`${row.call}-r`} className="text-text-primary">
              {row.recommendation}
            </span>,
          ])}
        />

        <PhoneRow>
          <Cell label="1 · Press at 0.92 (chapter 7)" verdict={Verdict.Skip} note="Press and hold any button. The dip is visible from across the room, which is the exaggeration he warns about.">
            <PressSpecimen scale={92} />
          </Cell>
          <Cell label="1 · Press at 0.96" verdict={Verdict.Ship} note="The same buttons at his number, 150ms ease-out on scale only. It is felt more than seen, and a release mid-press comes back smoothly.">
            <PressSpecimen scale={96} />
          </Cell>
        </PhoneRow>

        <PhoneRow>
          <Cell label="2 · Everything instant" verdict={Verdict.Skip} note="Tap upvote and bookmark, then the tabs. The toggles flip with no acknowledgement beyond the colour.">
            <IconSwapSpecimen crossFade={false} />
          </Cell>
          <Cell label="2 · Toggles cross-fade, tabs instant" verdict={Verdict.Ship} note="His icon recipe on the toggles (scale 0.25 to 1, blur 4 to 0, opacity, 300ms); the tabs stay instant because a tab switch is the most frequent tap on the screen.">
            <IconSwapSpecimen crossFade />
          </Cell>
        </PhoneRow>

        <PhoneRow>
          <Cell label="3 · The sheet on a keyframe (today)" verdict={Verdict.Skip} note="Open, then close before it lands: it vanishes, and reopening restarts from the bottom. A keyframe cannot be interrupted.">
            <SheetSpecimen interruptible={false} />
          </Cell>
          <Cell label="3 · The sheet on a transition" verdict={Verdict.Ship} note="300ms in on the travel curve, 200ms out, the scrim fading in 150ms. Tap twice fast: it reverses from wherever it is. The same rule for the composer, Spotlight and the sign-up page.">
            <SheetSpecimen interruptible />
          </Cell>
        </PhoneRow>

        <PhoneRow>
          <Cell label="4 · The toast" verdict={Verdict.Ship} note="Enters with opacity, 8px and blur; leaves with opacity and blur only. It carries Undo, so it stays 5s, the bar pauses while a finger is on it, and it can be closed.">
            <ToastSpecimen />
          </Cell>
          <Cell label="5 · Hit areas, drawn" verdict={Verdict.Ship} note="Dashed boxes are what you can hit: 44px around each 38px button (2px between neighbours), the row height around each 28px chip. Nothing visible changes.">
            <HitAreaSpecimen />
          </Cell>
        </PhoneRow>

        <PhoneRow>
          <Cell label="6 · Tabular counts" verdict={Verdict.Ship} note="Tap Play. The proportional bar above shifts its icons as 999 becomes 1,000; the tabular bar below holds still.">
            <TabularSpecimen />
          </Cell>
          <Cell label="7 · Default wrapping" verdict={Verdict.Skip} note="The title breaks into two long lines and a short one; the summary ends wherever the width happens to cut it.">
            <WrapSpecimen wrapped={false} />
          </Cell>
          <Cell label="7 · balance and pretty" verdict={Verdict.Ship} note="Three even lines on the title; pretty keeps a summary from ending on a lone word at widths where it would. Two declarations in the card components, nothing per page.">
            <WrapSpecimen wrapped />
          </Cell>
        </PhoneRow>

        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout title="8 · Transforms only">
            Nothing to draw: the decided looks stay. The drawer, the title
            fold and the bar shrink move on transform, opacity and a clip
            instead of height and padding, and the wrapper measures the
            shrink at 120Hz before step 1 ships.
          </Callout>
          <Callout title="9 · Two curves">
            {curves.interaction} for what the finger drives; {curves.travel}{' '}
            for what crosses the screen. 150 feedback, 300 in, 150 to 200 out,
            220 snap. The spec file holds them once.
          </Callout>
          <Callout title="10 · Reduced motion">
            Opt-in motion. With the setting on, the parallax stops, sheets and
            overlays crossfade, the shrink and the hide fade, icon swaps are
            instant, and the skeleton and the press stay. Every state keeps
            its fill, colour or label.
          </Callout>
        </div>
      </Section>

      <Section title="The rules" description="Ten lines for the spec file, so every PR in every step applies the same values.">
        <Table
          head={['Rule', 'Detail']}
          rows={feelRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Inside the scope of 9j">
            Every change here is a value on a component the shell already
            has: a scale, a duration, a curve, a hit area, a font feature, a
            wrapping mode. No feature, no data, no flag, no rewrite; the
            transform-only rule is how the decided pieces are built, not a
            project of its own.
          </Callout>
          <Callout title="One thing outside the shell">
            The theme switch in settings smears because every colour
            transition in the app fires at once. His fix is four lines
            (disable transitions, force a reflow, restore on the next frame).
            Not part of these steps; worth its own small PR when someone is
            in that file.
          </Callout>
        </div>
        <Quote>Same components, exact numbers: 0.96, 150, 300, 44, two curves, transforms only.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9l" />
      </Section>
    </Page>
  ),
};
