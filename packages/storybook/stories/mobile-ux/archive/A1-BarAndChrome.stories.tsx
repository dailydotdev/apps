import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
  Source,
  Status,
  Table,
  Verdict,
} from '../kit';
import {
  AppleDemo,
  AppleScreen,
  BarMaterial,
  BarState,
  FloatingBar,
  FloatingDemo,
} from '../floating';
import {
  BarLook,
  Circle,
  ClusterFrame,
  CreateLook,
  createLookNotes,
  HomeChromeDemo,
  LeafChromeDemo,
  PostChromeDemo,
} from '../chrome';
import { ProposedTabBar, TabSet, TagHero } from '../mocks';
import { ProposedCreate } from '../screens';
import { CreateSheetPhone, MorphPhone } from '../create';
import { floatingResearch } from '../floatingResearch';

const meta: Meta = {
  title: 'Mobile UX/Archive/Tab bar, chrome, search and create',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const host = (url: string): string => new URL(url).hostname.replace('www.', '');

const DockedStrip = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{ width: 375 }}
    className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    {children}
  </div>
);

const Strip = ({
  children,
  height = 152,
}: {
  children: React.ReactNode;
  height?: number;
}) => (
  <div
    style={{ width: 375, height }}
    className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-accent-onion-default via-accent-cabbage-default to-accent-bun-default opacity-40" />
    <div className="absolute inset-x-0 bottom-2">{children}</div>
  </div>
);

const otherTints = Object.values(CreateLook).filter(
  (look) => look !== CreateLook.Material,
);

const tintLabel = (look: CreateLook): string =>
  look === CreateLook.Fill
    ? 'Fill (the pick before Material)'
    : look.replace(/([A-Z])/g, ' $1');

const retired = [
  ['Docked bar, today’s model', '3, 3b', 'Round 2: "Floating bar, iOS 26 direction, not docked." Round 5: "No A/B tests and no experiments anywhere."', 'It survived as the experiment control; with experiments gone there is nothing for it to be the control of.'],
  ['You tab, Squads out', '3', 'Round 3: "Profile leaves the bar for the header avatar; the bar keeps Squads."', 'Squads is a place engaged members return to; the profile is one tap away in the brand row.'],
  ['Create as a sheet from its button', '3', 'Round 4: "Create opens the production composer directly ... no drawer in front."', 'The composer already carries the kind picker and the audience chip, so the sheet asked a question twice.'],
  ['Docked geometry (49pt bar, labels, Create 36 by 28)', '3', 'Round 4: "icons only, 56px at rest and 44px compact."', 'Numbers for a bar that is not built; chapter 3b carries the live spec.'],
  ['Round 2 pill (five items, Create inside)', '3b', 'Round 3: "Create leaves the bar and becomes its own square button beside it."', 'Squat at five items with labels; Create fought for space inside the bar.'],
  ['Apple’s collapse to one icon', '3b', 'Round 3: "Instagram’s shrink is the motion model."', 'Two taps to switch tabs; Instagram did not copy it either.'],
  ['Apple’s layout and proportions (62 / 21 / 8 / 4 / 10pt)', '3b', 'Round 4: "Instagram, X and Facebook proportions, 56px at rest and 44px compact."', 'Correct by the HIG but busier than the three apps Tsahi named; the chrome family moved to their numbers.'],
  ['With labels (Apple), 62px', '3b', 'Round 4: "icons only, 56px at rest and 44px compact."', 'None of the reference apps label the bar; four labels in 271px read crowded.'],
  ['Selection looks Lens, Dot and Fill', '3b', 'Round 4: "Tint (filled glyph, nothing behind it) is the default."', 'Lens read as a pressed key on our palette, Dot was too quiet, Fill read like a segmented control.'],
  ['Six Create tints other than Material', '3b', 'Round 5: "The Create square is Material."', 'Fill was a white square on dark; the brand tints broke the no-purple rule or read as a FAB.'],
  ['Liquid Glass ingredients and the glass references', '3b', 'Round 4: "No glass effect: the floating material is production’s flat blur." Round 5: "no glass on either."', 'Research that answered a question the material decision closed.'],
  ['Always-floating leaf buttons (post and tag leaf demos)', '3b', 'Round 5: "Scroll behaviour, revised: the whole top block hides ... buttons included."', 'Chapter 4e holds the live leaf demos with the block that hides and returns.'],
  ['Solid material as the Android default', '3b', 'Round 5: "Solid is not a platform default; it appears only when the OS asks for reduced transparency."', 'Both platforms run the flat blur; Solid is a fallback the OS or a slow WebView triggers, not a look to pick.'],
  ['Home header search icon and a Search square beside the bar', '3c', 'Round 4: "both tried and rejected as duplicates; Create is the one square beside the bar."', 'A second door to the same palette on the same screen.'],
  ['Search results as chips', '3c', 'Round 5: "Search results become segments."', 'Result types are the page’s views, so they follow the segment grammar of chapter 4c.'],
  ['A · The choice sheet', '3d', 'Round 4: "Create opens the production composer directly ... no drawer in front." Round 5: "No A/B tests and no experiments anywhere."', 'One extra tap the kind chip already covers.'],
  ['B · The bar morphs', '3d', 'Round 5: "No A/B tests and no experiments anywhere ... Every alternative in the chapters is reference only."', 'Novel and in place, but an extra tap that hides navigation while open.'],
];

export const Archive: Story = {
  name: 'Tab bar, chrome, search and create',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive for chapters 3, 3b, 3c and 3d"
        title="What the tab bar, floating chrome, search and Create chapters no longer show: the docked bar, the labelled and glass variants, the other selection looks and Create tints, the search doors that were tried, and the steps that once sat in front of the composer."
      >
        <p>
          Every mock here was drawn, reviewed and set aside by a decision row
          that came after it. Nothing on this page is built from. The live
          chapters keep the decided pieces only and point here; the table
          says which row retired each item and why.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="5">
        Reference only. Rejected arms, superseded variants and research kept for the record
        from chapters 3, 3b, 3c and 3d, moved out of the live chapters in round 5.
      </Status>

      <ArchiveNav />

      <Section
        title="What is here and what retired it"
        description="One row per item. The chapter column says where it lived; the decision column quotes the row in decisions.ts that overturned it."
      >
        <Table
          head={['Item', 'Chapter it came from', 'Retired by', 'Why']}
          rows={retired.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section
        title="Chapter 3: the docked bar"
        description="The full-width docked bar was chapter 3's model before the floating cluster, then the experiment control, then nothing once experiments were dropped. The You-tab arm and the Create sheet went with it."
      >
        <PhoneRow>
          <Cell label="Docked, today’s model" verdict={Verdict.Skip} note="Four places with Create in the centre slot. Retired twice: round 2 chose floating, round 5 removed the experiment it was the control for.">
            <DockedStrip>
              <ProposedTabBar active="Home" />
            </DockedStrip>
          </Cell>
          <Cell label="Alternative: You tab, Squads out" verdict={Verdict.Skip} note="Profile in the bar, Squads folded into Home and Explore. Round 3: Squads keeps its tab and the profile is the header avatar.">
            <DockedStrip>
              <ProposedTabBar set={TabSet.YouArm} active="Home" />
            </DockedStrip>
          </Cell>
          <Cell label="Create as a sheet" verdict={Verdict.Skip} note="The floating button's three options as a sheet from the Create button. Round 4: Create opens the production composer directly; chapter 3d has the live flow.">
            <ProposedCreate />
          </Cell>
        </PhoneRow>
        <Callout title="Docked geometry, for the record">
          49pt bar + safe-area-inset-bottom, 44pt targets, icon 24, label
          typo-caption2, Create 36 by 28 filled, content ending above the bar
          with padding equal to its height. The decided bar is chapter 3b&apos;s
          cluster: 56px at rest, 44px compact, icons only.
        </Callout>
      </Section>

      <Section
        title="Chapter 3b: earlier rounds of the floating bar"
        description="The round 2 pill with five items inside, Apple's collapse to a single icon, and the Apple-proportioned layout from round 3. All superseded by the cluster with Instagram's proportions."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="Round 2 pill" verdict={Verdict.Skip} note="Squat: 60px with five items and labels, Create fighting for space inside.">
            <Strip>
              <FloatingBar material={BarMaterial.Glass} />
            </Strip>
          </Cell>
          <Cell label="Apple's collapsed state" verdict={Verdict.Skip} note="Only the active tab remains; two taps to switch. Instagram did not copy it either.">
            <Strip height={112}>
              <FloatingBar material={BarMaterial.Glass} state={BarState.Collapsed} />
            </Strip>
          </Cell>
          <Cell label="Round 3: Apple's layout at rest" verdict={Verdict.Skip} note="Places in a capsule, Create detached on the right like the iOS 26 Search role, Apple's 62 / 21 / 8 / 4 / 10pt numbers. Round 4 moved the family to 56 / 44 and our rectangle.">
            <AppleScreen />
          </Cell>
        </div>
        <PhoneRow>
          <Cell label="Round 2 pill, scroll it" verdict={Verdict.Skip} note="Two states, rest and compact, switched after 24px of travel. The decided motion is continuous over 96px (chapter 3b).">
            <FloatingDemo />
          </Cell>
          <Cell label="Round 3 Apple layout, scroll it" verdict={Verdict.Skip} note="Same two-state switch with the detached Create. Kept so the round 3 proportions can be compared with the cluster.">
            <AppleDemo />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 3b: labels and the other selection looks"
        description="Apple's labelled 62px bar and the three selection treatments that lost to Tint. Round 4: icons only, the filled glyph is the state, nothing behind it."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="With labels (Apple)" verdict={Verdict.Skip} note="Apple's 62px bar with 10px medium labels. Correct by the HIG, busier at four items in 271px.">
            <ClusterFrame p={0} labels />
          </Cell>
          <Cell label="Lens" verdict={Verdict.Skip} note="Apple's: a lighter block inset 4px behind the item, concentric radius. Reads like a pressed key on our palette.">
            <ClusterFrame p={0} look={BarLook.Lens} />
          </Cell>
          <Cell label="Dot" verdict={Verdict.Skip} note="Outline icons, a 4px dot under the active one. Quietest.">
            <ClusterFrame p={0} look={BarLook.Dot} />
          </Cell>
          <Cell label="Fill" verdict={Verdict.Skip} note="Active item on an inverted block. Loudest; reads like a segmented control.">
            <ClusterFrame p={0} look={BarLook.Fill} />
          </Cell>
          <Cell label="Dot, compact" verdict={Verdict.Skip}>
            <ClusterFrame p={1} look={BarLook.Dot} />
          </Cell>
        </div>
      </Section>

      <Section
        title="Chapter 3b: Create tints other than Material"
        description="Round 5: the Create square is Material, the same material as the bar with a primary glyph. These six were on the page for the comparison. The square's size, radius and position never changed between them."
      >
        <div className="flex flex-col gap-6">
          {otherTints.map((look) => (
            <div key={look} className="flex flex-wrap items-start gap-6">
              <ClusterFrame p={0} createLook={look} plain />
              <ClusterFrame p={0} createLook={look} />
              <div className="flex max-w-xs flex-col gap-1 pt-1">
                <span className="font-bold capitalize typo-callout">{tintLabel(look)}</span>
                <span className="text-text-tertiary typo-footnote">{createLookNotes[look]}</span>
              </div>
            </div>
          ))}
        </div>
        <Callout title="How to read them">
          Switch the Storybook theme to dark, where the complaint came from:
          Fill becomes a white square, Tonal a dark square with a light glyph,
          Brand stays purple, Brand soft becomes a dim purple square with a
          purple glyph. Material, the pick, is in chapter 3b.
        </Callout>
      </Section>

      <Section
        title="Chapter 3b: Liquid Glass, and the glass references"
        description="Research from rounds 2 and 3, when the bar was going to be glass on iOS and solid on Android. Round 4 chose production's flat blur with no rim or highlight; round 5 made it the same on both platforms. Kept for the record."
      >
        <Table
          head={['Ingredient', 'Apple', 'Web equivalent', 'Verdict at the time']}
          rows={floatingResearch.ingredients.map((row) => [
            <span key={row.ingredient} className="font-bold text-text-primary">
              {row.ingredient}
            </span>,
            row.apple,
            row.web,
            row.verdict,
          ])}
        />
        <Table
          head={['Reference', 'Shape', 'Material', 'While scrolling', 'Returns', 'Source']}
          rows={floatingResearch.references.map((row) => [
            <span key={row.name} className="font-bold text-text-primary">
              {row.name}
            </span>,
            row.shape,
            row.material,
            row.scrolling,
            row.returns,
            <Source key={row.source} href={row.source}>
              {host(row.source)}
            </Source>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          {floatingResearch.callouts.map((callout) => (
            <Callout key={callout.title} title={callout.title}>
              {callout.body}
            </Callout>
          ))}
        </div>
        <DigIn title="What still holds from this research">
          <p>
            The shrink over the collapse, the swipe axis lock and the blur
            budget all carried into the live chapters. What did not: the
            specular rim, the platform fork (glass on iOS, solid on Android)
            and the idea that Solid is Android&apos;s look. Verified 28 Sep
            2026; the sources stay in chapter 3b&apos;s list.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Chapter 3b: always-floating leaf buttons"
        description="The post and tag leaf demos from round 4, where back and the action buttons floated at rest and never left. Round 5, revised on review: the whole top block hides while reading down, buttons included, and returns on any short scroll up. Chapter 4e has the live leaf demos."
      >
        <PhoneRow>
          <Cell label="Post leaf, fixed buttons" verdict={Verdict.Skip} note="Back, share and menu float on top and stay while you read; the action bar takes the tab cluster's slot on scroll. The bottom half of this behaviour survives in chapter 6.">
            <PostChromeDemo />
          </Cell>
          <Cell label="Tag leaf, fixed buttons" verdict={Verdict.Skip} note="Hero scrolls under buttons that never move. Superseded by the block that starts transparent over the cover and turns solid with the name.">
            <LeafChromeDemo
              hero={<TagHero />}
              actions={
                <Circle material={BarMaterial.Glass} fixed>
                  <MenuIcon size={IconSize.Small} />
                </Circle>
              }
            />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 3b: Solid, the reduced-transparency fallback"
        description="Solid was Android's default material from round 2 to round 4. Round 5: both platforms run the flat blur; Solid appears only when the OS asks for reduced transparency or a WebView cannot draw the blur at frame rate. Same geometry, same motion."
      >
        <PhoneRow>
          <Cell label="Reduced transparency, Home root" verdict={Verdict.Skip} note="The fallback rendering, not a platform look. Triggered by the OS setting or a frame-budget check, never by the platform alone.">
            <HomeChromeDemo material={BarMaterial.Solid} />
          </Cell>
          <Cell label="Reduced transparency, Post leaf" verdict={Verdict.Skip} note="The round 4 post leaf in the fallback material; the always-floating buttons are superseded as above.">
            <PostChromeDemo material={BarMaterial.Solid} />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 3c: search doors that were tried"
        description="No mock survives for these; they were built into the Home header and the bottom cluster during round 4 and reverted in the same round. Recorded here so the question is not reopened."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Bad} title="Home header search icon">
            A magnifier in the brand row beside the streak and avatar, opening
            Spotlight. Rejected in round 4 as a second door to the same
            palette; Explore&apos;s field is the one entry and the magnifier
            only ever means search there.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Search square beside the bar">
            A Slack-style detached square next to the tab bar, the mirror of
            Create. Rejected in round 4: it duplicated Explore&apos;s field and
            put two squares beside the bar. Create is the one square.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Results as chips">
            The results page once narrowed by a chip row (Posts · Squads ·
            People · Tags). Round 5: result types are the page&apos;s views,
            so they are segments under the query heading, following chapter
            4c&apos;s grammar.
          </Callout>
        </div>
      </Section>

      <Section
        title="Chapter 3d: a step before the composer"
        description="Two ways to put a choice between the tap and the composer. Round 4 opened the composer directly because the kind lives inside it; round 5 retired every alternative arm."
      >
        <PhoneRow>
          <Cell label="A · The choice sheet" verdict={Verdict.Skip} note="Today's drawer on the sheet primitive: New post, Share a link, Poll. One extra tap that the kind chip already covers.">
            <CreateSheetPhone />
          </Cell>
          <Cell label="B · The bar morphs" verdict={Verdict.Skip} note="Tapping Create turns the tab bar into Post · Link · Poll and the square into a close. Novel and in place, but still an extra tap and it hides navigation while open.">
            <MorphPhone />
          </Cell>
        </PhoneRow>
      </Section>
    </Page>
  ),
};
