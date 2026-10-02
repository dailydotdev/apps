import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { ClusterMode, HomeHideDemo, LeafHideDemo } from '../hide';
import { hideLevers, hideRules } from '../hideSpec';
import { TitleScroll, TitleScrollDemo } from '../titles';
import { EdgeStyle, PostStill } from '../chrome';
import { BarMaterial } from '../floating';
import { BlockActionLayout, SquadScroll } from '../scrollPages';

const meta: Meta = {
  title: 'Mobile UX/Archive/Scroll arms, post page and reading',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const retired: [string, string, string, string][] = [
  ['The first hide-on-scroll spec (hideSpec.ts: nine rules, five levers)', '4e', 'Round 5, scroll behaviour revised: "the whole top block hides as one solid page-background piece, buttons included"', 'The first spec kept the leaf buttons floating and offered the cluster hide as an arm; the revision hides the buttons with the block and settles the cluster on the shrink.'],
  ['Soft edge, title stays', '4e', 'Round 5, revised: "the soft scroll edge and the always-floating leaf buttons are withdrawn"', 'Tsahi: the gradient is not it. A block that hides is page background or nothing.'],
  ['Buttons stay, row hides (Safari on a leaf)', '4e', 'Round 5, revised: "buttons included"', 'Roots and leaves behave alike once everything hides; a floating button that needs a background is a bar in disguise.'],
  ['Cluster hides too', '4e', 'Round 5, revised: "the bottom cluster shrinks and never leaves"', 'No benchmark app hides its bottom bar and Apple asks that a tab bar never hide.'],
  ['Solid material on the post page', '6', 'Round 5: "Solid is not a platform default; it appears only when the OS asks for reduced transparency"', 'Round 2 made solid the Android default. Both platforms now run the flat blur; solid is a fallback, not a design.'],
  ['Comment as a keyboard-height sheet', '6', 'Round 5: "the comment field opens the full-page composer, not a sheet"', 'One composer everywhere: the post page, the in-app browser and Create open the same full page.'],
  ['Read post opens the Safari view or a Custom Tab', '6', 'Round 5: "a WKWebView on iOS because Apple forbids overlays on its Safari view"', 'The Safari view cannot carry the post’s actions; chapter 6b replaces it with the page in front and the post as a drawer.'],
  ['A WKWebView sheet with our bar over the post; a Custom Tab first on Android', '6b', 'Round 5: "the page fills the screen ... and the post becomes a bottom drawer"', 'The layering was inverted. The page is in front and the post is the drawer; a Custom Tab’s toolbar cannot expand into the post, so Android needs a WebView too.'],
];

export const ScrollPostReading: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive: chapters 4e, 6 and 6b"
        title="The scroll arms, the post page pieces and the reading framing that a later decision retired. Kept so the decisions stay legible; nothing here is built from."
      >
        <p>
          Chapter 4e keeps the scroll demos, the stickiness tables and the
          research; chapter 6 keeps the playground and the two decided bars;
          chapter 6b keeps the drawer and its rules. Everything below came out
          of those chapters because a row in the decisions log overturned it.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="5">
        Reference only. Each item names the chapter it came from and the
        decision that retired it; developers build from the live chapter.
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
        title="Chapter 4e: the primary action in the returning block, two layouts set aside"
        description="Decided in round 5: on a thing the solid block carries back, the name, then the menu just left of Join or Follow at the right edge. These two lost to it."
      >
        <PhoneRow>
          <Cell label="Same icons" verdict={Verdict.Skip} note="The solid block keeps search and menu; Join stays in the hero, which is off screen once the block is solid, so the primary action disappears exactly when the page is being read.">
            <SquadScroll layout={BlockActionLayout.Same} />
          </Cell>
          <Cell label="A · Join replaces share, menu stays right" verdict={Verdict.Skip} note="X's layout: back, name, Join, then the menu at the edge. Tsahi preferred the menu just left of Join with Join owning the edge.">
            <SquadScroll layout={BlockActionLayout.Primary} />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 4e: the first hide-on-scroll spec"
        description="Written for the first round 5 decision (X's model with floating leaf buttons). The revised decision kept the direction rule, the dead zone, the tolerances and the overlay rule, and changed three things: the buttons hide with the block, the block is solid page background, and the cluster shrink is settled rather than an arm."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={hideRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Table
          head={['Lever', 'First spec', 'Benchmarks']}
          rows={hideLevers.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <Callout tone={CalloutTone.Bad} title="Where this spec and the live chapter disagree">
          Leaves keep their buttons (live: they hide with the block). The
          cluster hide is an arm (live: settled on the shrink). Travel is 92px
          on Home and the snap 180ms (live: the numbers in hide.tsx, one spec
          file being open call 2 in chapter 9b). The live rules are the
          stickiness guideline in chapter 4e.
        </Callout>
      </Section>

      <Section
        title="Chapter 4e: the arms considered and set aside"
        description="The three phones that sat under the scroll demos this round. Scroll each to see the behaviour that was not chosen."
      >
        <PhoneRow>
          <Cell label="Soft edge, title stays" verdict={Verdict.Skip} note="Apple's iOS 26 scroll edge effect under a title that never hides. Tsahi: the gradient is not it; if everything hides anyway, the block should be page background.">
            <TitleScrollDemo title={TitleScroll.Stays} edge={EdgeStyle.Soft} />
          </Cell>
          <Cell label="Buttons stay, row hides" verdict={Verdict.Skip} note="Safari's model on a leaf. Rejected in favour of hiding the buttons with the block, so roots and pages behave alike.">
            <LeafHideDemo />
          </Cell>
          <Cell label="Cluster hides too" verdict={Verdict.Skip} note="Maximum content; the tabs and Create leave until you scroll up. No benchmark app hides its bottom bar; set aside, the cluster shrinks and never leaves.">
            <HomeHideDemo cluster={ClusterMode.Hide} />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 6: the post page pieces that went"
        description="The solid material as a design choice, the comment sheet and the Safari view for the link. The two bars and their fold are unchanged and live in chapter 6."
      >
        <PhoneRow>
          <Cell label="Solid material" verdict={Verdict.Skip} note="Round 2 made this the Android default. Round 5: one flat blur material on both platforms; solid appears only for reduced transparency or a WebView that cannot blur at frame rate. Same geometry, same motion.">
            <PostStill p={1} material={BarMaterial.Solid} />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Round 4: the comment sheet (withdrawn)">
            Tapping comment opened a keyboard-height sheet with the composer,
            the cluster hiding while typing. Reply and Add a comment opened the
            same bottom sheet, not a full-screen drawer, sized from
            visualViewport so it sat on the keyboard; when the sheet closed the
            new comment scrolled into view and the cluster returned in the
            state it was in. The &quot;do not&quot; list said never to open a
            full-screen drawer for a one-line comment.
          </Callout>
          <Callout tone={CalloutTone.Good} title="What replaced it">
            Round 5: commenting opens the same full-page composer everywhere,
            with the post as a compact card, the field, the toolbar and Post.
            Chapter 3d draws it; chapters 6 and 6b point to it.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Round 4: reading the article in the system browser view (withdrawn)">
            The full-width Read button opened the source in an in-app browser:
            SFSafariViewController on iOS and Custom Tabs on Android. It already
            did on iOS for foreign origins; Android needed a check. On the web
            it stayed a new tab.
          </Callout>
          <Callout tone={CalloutTone.Good} title="What replaced it">
            Round 5: the page fills the screen and the post becomes a drawer,
            in a WKWebView drawn by the wrapper because App Review 5.1.1 vii
            forbids drawing over the Safari view. Chapter 6b has the flow, the
            rules and the playground. The mobile web keeps the new tab.
          </Callout>
        </div>
      </Section>

      <Section
        title="Chapter 6b: the sheet over the post"
        description="The first framing of reading the link put a browser sheet over the post with our action bar on it, and a Custom Tab as Android's first step. Tsahi's review inverted it: the page is what you asked for and gets the screen; the post is the drawer."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Withdrawn: why a sheet with our bar, not the system browser view">
            Apple&apos;s Safari view cannot carry anything over the page (App
            Review 5.1.1 vii), so a member who wants to upvote or comment has
            to come back first, and most do not; X&apos;s own reason for the
            change was that &quot;the web browser covers the post and people
            forget to Like or Reply&quot;. A WKWebView sheet with our bar
            keeps the reading in the post&apos;s context. On Android a Custom
            Tab can already carry our bar as its bottom toolbar, which is the
            cheap first step there.
          </Callout>
          <Callout tone={CalloutTone.Good} title="What stands">
            The reason survived, the shape did not. The page is in front and
            the post is the drawer with four heights; the action bar is the
            post page&apos;s own capsule, never redrawn. A Custom Tab&apos;s
            toolbar cannot expand into the post, so Android is a WebView with
            a bottom sheet from the start, not a second step.
          </Callout>
        </div>
        <DigIn title="Why the archive keeps the text">
          <p>
            The two callouts read alike and reach opposite layouts, which is
            exactly the kind of drift the pre-development review in chapter 9
            exists to catch. Keeping the withdrawn wording next to the live
            one makes the difference visible without reopening the call.
          </p>
        </DigIn>
      </Section>
    </Page>
  ),
};
