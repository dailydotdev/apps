import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  ArchiveNav,
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
  Shot,
  Status,
  Table,
  Verdict,
} from './kit';
import { HomeScroll, PostScroll, SquadScroll } from './scrollPages';
import { SignupPageStill } from './openCallMocks';
import {
  ActivityEmptyScroll,
  AgentsScroll,
  AndroidNavStill,
  BookmarksEmptyScroll,
  DeepLinkPostHomeLit,
  DeepLinkPostNothingLit,
  ErrorScroll,
  FormKeyboardStill,
  JobStepStill,
  JobsScroll,
  LandscapePhoneStill,
  LightboxStill,
  LoadingScroll,
  NewSquadFormScroll,
  NotFoundScroll,
  OfflineScroll,
  OrgSettingsScroll,
  ShortPageScroll,
  SmallHomeScroll,
  SquadsEmptyScroll,
  TabletStill,
  ThreeBadgesStill,
  ToastStill,
  VisitorExploreScroll,
  VisitorSquadsScroll,
} from './finalMocks';

const meta: Meta = {
  title: 'Mobile UX/9e. Last pass',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const checked: [string, string][] = [
  ['Chapters', '22 live chapters and 7 archive pages read end to end against the decisions table.'],
  ['Decisions', '76 rows; 12 struck through by a later row; no two live rows contradict each other. Two contradictions found inside chapter 3 (below).'],
  ['Mocks', '14 scroll pages, the post and reading playgrounds, the sheets, Spotlight, the composer, the streak sheet and popup, the forms: all on the decided rules.'],
  ['Routes', '198 pages under packages/webapp/pages, each placed in a class: root, leaf, thing, no-shell, redirect or desktop only. Seven groups still needed a call (below).'],
  ['Sweep', 'All 29 stories load with zero errors and zero horizontal overflow at 375px; typecheck clean.'],
];

const calls: [string, string, string][] = [
  ['1 · Agents', 'A leaf under Explore’s Agents row with segments Agents · Arena · Ask, the URLs the area already has. An agent’s page is a thing with the circle avatar (it is not a person), Open as its primary action.', 'The area has its own bar today; under the system it is a page like Tags or Sources, and the circle keeps the people-square rule intact.'],
  ['2 · Creating a squad', 'One route (/squads/new; /squads/create redirects), one form leaf from the New tile with Save as the check icon; the desktop wizard’s steps become fields on one page.', 'Two routes for one thing is a duplicate, and 9d already decided how a form looks.'],
  ['3 · Editing a post', 'The full-page composer from 3d, prefilled, Post reads Save; /posts/[id]/edit stays as the URL that opens it. Squad post settings and analytics remain leaves.', 'One composer for writing, commenting and editing; no third editor.'],
  ['4 · Organization settings', 'One leaf named after the organization with segments General · Members · Billing, the URLs they have.', 'The 4c grammar: which view of one thing → segments.'],
  ['5 · Not found, error, offline', 'All three inside the shell. 404 and error are one line and one way out with the cluster still there; offline is a banner under the block over what loaded last, and only the error state when nothing is cached.', 'A dead end with no bar is a trap; a full offline page throws away content the member already has.'],
  ['6 · The lit tab on a deep link', 'The root that owns the URL lights (Home for posts, tags, sources and profiles; Squads for squads; Explore for search and the directories), because back goes there (chapter 5). Chapter 3’s “light nothing” is retired.', 'Two chapters disagreed; the tab that lights and the place back goes should be the same place.'],
  ['7 · Badges', 'The Activity count only. No dot on Squads, none on the avatar. Chapter 3’s table gave both a dot against its own one-badge rule.', 'New squad posts and achievements are notifications; they land in Activity, which already counts them.'],
  ['8 · Visitors on Explore, Squads and Activity', 'Explore and Squads as members see them minus the personal parts: Log in and Open app in the row, no Your squads. Activity and Create open the sign-up page directly with its context line; the round 1 sheet is gone (9b).', 'Chapter 4 drew Home and a leaf only; the other roots were never shown logged out.'],
  ['9 · Jobs', 'The list and a job are plain leaves; the candidate flow’s steps (questions, preference, done) are the no-shell class like onboarding. Behind jobs_ui, so nothing ships with the shell.', 'A flow is not a place; the class already exists.'],
  ['10 · Tablet, landscape, small phones', 'The phone shell below production’s tablet breakpoint (656px); iPad keeps the desktop layout as today. 360px is the narrowest width: the cluster is then 320px wide with four 64px items and the square, and nothing else scales with width. A phone turned sideways is not the desktop layout: it gets the shell, laid out for landscape (chapter 9g, four looks, look 1 recommended).', 'The shell is a phone shell; a phone stays a phone when it turns.'],
];

const states: [string, string][] = [
  ['Loading', 'Block and cluster at rest, skeletons in the content. Nothing hides: there is nothing to read yet.'],
  ['Empty', 'Content, in the first screen: one icon, one line, at most one action (the one that makes the page fill: Turn on notifications, Browse Popular). The chrome does not change, and a page that short never hides its block.'],
  ['Short pages', 'Nothing scrolls, so nothing hides; the dead zone already covers it.'],
  ['Offline', 'A strip under the status bar, above the block, on top of everything, with Retry; it stays while the block hides. A page with nothing cached shows the error state.'],
  ['Error', 'One line, Retry, the cluster stays so you can leave.'],
  ['Keyboard', 'The cluster stays at the layout viewport’s bottom and is covered by the keyboard; only fields ride it (Spotlight, list search, the composer, a form’s focused field). The block does not hide while a field is focused (4e).'],
  ['Long names', 'The name truncates with an ellipsis; the buttons, the menu and Join never shrink and never wrap.'],
  ['Toasts', '12px above the cluster, inside its 20px inset, one at a time; production’s Toast moves up by the cluster’s height. Never under the cluster.'],
  ['Lightbox', 'Full screen over the status bar, the dark overlay, no cluster; the close is the header button (38px, 14px radius, 16px inset, the page material), so it follows the theme; back closes.'],
  ['Posts without a link', 'Freeform, shared, poll and video posts have no Read button and the same action bar; 6b never happens. Video plays inline, the poll is content.'],
  ['Arriving on a page', 'Push starts at the top with the block shown; back restores the position and shows the block. The block is never hidden on arrival.'],
  ['Pull to refresh', 'From the top, where the block is always shown; the spinner sits under the block.'],
  ['Android navigation', 'Three-button navigation: the cluster sits above the system bar at its usual 8px (safe-area-inset-bottom once the wrapper is edge to edge). Gesture navigation: the same 8px over the home area, as on iOS.'],
  ['Dark mode', 'Tokens throughout; the two shots below. The primary chip, the material and the status text were checked in both themes.'],
];

const readingLinks: [string, string][] = [
  ['A daily.dev link (post, squad, tag, profile)', 'The reading page closes and the app pushes the leaf. The wrapper hands universal links back to the web layer instead of loading them in the page.'],
  ['A download, a PDF, mailto, tel, an App Store link', 'Handed to the system; the reading page stays where it was.'],
  ['A sign-in wall or paywall', 'The site’s own; nothing from us. Open in Safari sits in the page menu for members who are signed in there.'],
  ['A link to another page of the same site', 'Navigates inside the reading page; back pops the page’s history first, then closes it (decided).'],
  ['A page that refuses to load', 'The page’s own error inside the reading area; the drawer stays, so the post and its comments are still there.'],
];

const access: [string, string][] = [
  ['Hit areas', 'The 38px top buttons get a 44px hit area (3px each side; the 8px gap allows it). Bar items are 44px already.'],
  ['Labels', 'Every icon-only control carries a label; the bar is a nav with the active tab marked current; the badge reads as a count.'],
  ['Focus order', 'The block stays in the document when hidden (it moves, it is not removed), so the order never changes; while hidden it is marked hidden so focus cannot land in it.'],
  ['Text size', 'The webapp does not follow the system text size today (rem based inside the WebView); this work does not change that. Nothing in the shell is sized by a line count, so 120% browser zoom holds.'],
  ['Contrast', 'Light status text over a cover sits on the top scrim (35% to 0 over 96px); a cover the scrim cannot rescue gets a darker one. Verified: the primary chip, the tier chip and the toast in both themes.'],
  ['Motion and transparency', 'Reduced motion cuts instead of slides (7); reduced transparency turns the material solid (decided). Blur stays otherwise.'],
  ['Blur budget', 'At most two blurred surfaces on screen: the cluster, and the top buttons over a cover. The reading drawer’s bar is the third only while a page is open.'],
  ['RTL', 'Not supported in the product; unchanged.'],
];

const handoffWork: [string, string, string][] = [
  ['1 · Chapter clean-up', 'The 20 drift rows in chapter 9: stale copy, verdicts and demos in chapters 1 to 8 rewritten to the decided model, so a developer reading any chapter reads the same product.', 'Half a day. No decision.'],
  ['2 · One spec file', 'Done 1 Oct: spec.ts in this folder, every size, radius, inset, duration and tolerance with the chapter it comes from, the three conflicts resolved (hide travel 64, one shadow recipe, insets 20 and 16), the 9l values as recommended; appleSpec stays only under the archived Apple bar. Production copies it as shell/constants.ts in PR 0.4.', 'Done.'],
  ['3 · Component inventory', 'Done 1 Oct in chapter 10: the architecture table (mock → production piece it replaces → where it lives) and the touches column of every PR.', 'Done.'],
  ['4 · Existing flags', 'Done 1 Oct in chapter 10 (the flags table): which arm of each existing flag the shell builds on and what happens to the other.', 'Done.'],
  ['5 · Events, kept', 'The list in 9j; chapter 10 names the PR each event moves in (1.1 carries the two additions). No schema, no new targets.', 'Done.'],
  ['6 · Route table and redirects', 'Done 1 Oct in chapter 10 (the routes table): no route moves; the one redirect is /squads/create to /squads/new; Happening now keeps /highlights and Explore keeps /posts, an adjustment to chapter 5 explained there.', 'Done.'],
  ['7 · Wrapper brief', 'Done 1 Oct in chapter 10 (the wrapper brief): the reading screen and sheet, the bridge messages, refresh, haptics, status bar style, edge to edge, reduced transparency, the Android back contract; the Android inspection named as a gate. Chapter 8 stays as the round 1 record.', 'Done; then the mobile engineers.'],
  ['8 · Extension and desktop note', 'Done 1 Oct in chapter 10 (desktop and the extension): one line per shared component and the proof.', 'Done.'],
];

export const LastPass: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="The last pass before development, 1 Oct 2026"
        title="Everything decided stands. Read end to end once more, three things are left: ten small calls with a recommendation each, the states every rule implies but nobody drew, and the handoff work that is engineering, not design."
      >
        <p>
          This is the second full pass. The first (30 Sep, chapter 9b) closed
          the ten calls that changed the design. This one found no decision
          to reopen; it found routes that no row places, states that the
          rules cover but no picture shows, and two lines in chapter 3 that
          contradict each other. Every call below carries a recommendation
          and, where a picture helps, a mock built from the decided pieces.
          The phases are proposed in chapter 9.
        </p>
        <ChapterNav current="9e" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Opened 1 Oct 2026 after the full pass; Tsahi answered the same day.
        All ten calls are decided as recommended, with three corrections to
        the states (a button on the empty Activity page, the offline strip on
        top of everything, the lightbox close as the header button).
        Landscape has its own chapter, 9g (look 1 decided); ads and the
        arbitrage page are 9f; the bottom prompts are 9h.
      </Status>

      <Goal
        goal="A developer can start any phase without asking a design question, and a member never meets a screen the system did not think about."
        metric="Zero design questions raised in the first two phases’ PRs; zero shell bugs filed against empty, loading, offline or keyboard states."
      />

      <Section title="What was checked" description="The pass, in five lines.">
        <Table
          head={['What', 'Result']}
          rows={checked.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="The last calls"
        description="Ten. None changes a decided chapter; each places something the chapters never placed, or settles two lines that disagree. The recommendation is what I would build."
      >
        <Table
          head={['Call', 'Recommendation', 'Why']}
          rows={calls.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <span key={`${row[0]}-r`} className="font-bold text-text-primary">
              {row[1]}
            </span>,
            row[2],
          ])}
        />
        <PhoneRow>
          <Cell label="1 · Agents" verdict={Verdict.Ship} note="From the Explore row: a page with the area’s three views as segments. Agents wear the circle, the people-square rule stays whole.">
            <AgentsScroll />
          </Cell>
          <Cell label="2 · New squad" verdict={Verdict.Ship} note="From the New tile: one form, the check dimmed until name and handle are filled. No wizard.">
            <NewSquadFormScroll />
          </Cell>
          <Cell label="4 · Organization settings" verdict={Verdict.Ship} note="One leaf, three segments, the URLs they have.">
            <OrgSettingsScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="5 · Not found" verdict={Verdict.Ship} note="Back if there is a stack, one line, one way out. The cluster stays.">
            <NotFoundScroll />
          </Cell>
          <Cell label="5 · Nothing cached" verdict={Verdict.Ship} note="The error state: one line and Retry, in the shell.">
            <ErrorScroll />
          </Cell>
          <Cell label="5 · Offline with content" verdict={Verdict.Ship} note="The strip on top of everything (Tsahi, 1 Oct): under the status bar, above the block, and it stays while the block hides. Scroll it. The feed is what loaded last.">
            <OfflineScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="8 · Explore, visitor" verdict={Verdict.Ship} note="Log in and Open app where the avatar is; the places and the feed as members see them.">
            <VisitorExploreScroll />
          </Cell>
          <Cell label="8 · Squads, visitor" verdict={Verdict.Ship} note="Discover only; no Your squads, no New tile.">
            <VisitorSquadsScroll />
          </Cell>
          <Cell label="8 · Activity, visitor" verdict={Verdict.Ship} note="The tab opens the sign-up page directly, its context line keyed by the trigger (9b). Create does the same.">
            <SignupPageStill context="Sign up to see who replied, who upvoted and what your squads posted" />
          </Cell>
        </PhoneRow>
        <Callout tone={CalloutTone.Good} title="Decided, 1 Oct">
          1 Agents as a leaf with segments; 2 one squad-creation form; 3
          editing a post in the composer; 4 organization settings as
          segments; 5 not found, error and offline inside the shell; 8 the
          visitor roots as drawn, Activity and Create opening the sign-up
          page. Tsahi accepted the recommendations as drawn.
        </Callout>
        <Callout tone={CalloutTone.Good} title="What these do not touch">
          The bar, the rows, the block, the sheets, the composer, the streak,
          the reading drawer: every decided piece is used as decided. The ten
          calls place routes and settle two contradictions; they do not
          redesign anything.
        </Callout>
      </Section>

      <Section
        title="Calls 6, 7, 9 and 10, drawn"
        description="Tsahi asked what these mean. Each is two or three phones: what the chapters say today on the left, the recommendation on the right."
      >
        <PhoneRow>
          <Cell label="6 · Today: a post from a link, nothing lit" verdict={Verdict.Skip} note="Chapter 3: you open a post from a push notification or a shared link, there is no stack, so no tab lights. The bar says you are nowhere.">
            <DeepLinkPostNothingLit />
          </Cell>
          <Cell label="6 · Recommended: Home lights" verdict={Verdict.Ship} note="The same post: Home is lit because Home owns posts, and back (the arrow, the edge swipe, Android back) goes to Home. The bar and the back button say the same thing.">
            <DeepLinkPostHomeLit />
          </Cell>
          <Cell label="6 · A squad from a link: Squads lights" verdict={Verdict.Ship} note="Same rule: the root that owns the URL. Tags, sources and profiles light Home; squads light Squads; search and the directories light Explore.">
            <SquadScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="7 · Today: three marks" verdict={Verdict.Skip} note="Chapter 3’s table: the Activity count, a dot on Squads for new posts in your squads, a dot on the avatar for a new achievement. Three red marks compete on one screen.">
            <ThreeBadgesStill />
          </Cell>
          <Cell label="7 · Recommended: one mark" verdict={Verdict.Ship} note="The Activity count only. New squad posts and achievements are notifications, so they are already in that count. Nothing on Squads, nothing on the avatar.">
            <HomeScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="9 · Jobs, the list" verdict={Verdict.Ship} note="A plain leaf: back, the name, filter chips, the cluster. Behind the jobs_ui flag today; nothing ships with the shell.">
            <JobsScroll />
          </Cell>
          <Cell label="9 · A step of the candidate flow" verdict={Verdict.Ship} note="Questions, preferences and the done screens are a flow, not a place: the no-shell class from 9b, like onboarding and checkout. Close top left, the step’s own Continue, no cluster.">
            <JobStepStill />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="10 · The narrowest phone, 360 by 640" verdict={Verdict.Ship} note="The same shell, nothing scaled: the cluster is 320px wide with four 64px items and the square. This is the floor we design for.">
            <SmallHomeScroll />
          </Cell>
          <Cell label="10 · A phone turned sideways, 812 by 375 (withdrawn)" verdict={Verdict.Skip} note="The first recommendation: the desktop layout, because 812px is wider than the tablet breakpoint. Tsahi wants the shell in landscape instead; chapter 9g has four looks and the recommendation.">
            <LandscapePhoneStill />
          </Cell>
          <Cell label="10 · iPad, 768 by 1024 (half size)" verdict={Verdict.Ship} note="The same: production’s tablet breakpoint keeps the desktop layout. The phone shell is for phones held upright.">
            <TabletStill />
          </Cell>
        </PhoneRow>
        <Callout tone={CalloutTone.Good} title="Decided, 1 Oct">
          6: the tab that lights is the place back goes. 7: one red mark, on
          Activity. 9: Jobs pages are leaves, Jobs steps are no-shell. 10:
          the phone shell is for phones, 360px is the floor, iPad keeps the
          desktop layout; a phone turned sideways keeps the shell, laid out
          for landscape in chapter 9g.
        </Callout>
      </Section>

      <Section
        title="States the rules imply, drawn"
        description="Loading, empty, offline, keyboard, long names, toasts, lightbox, Android navigation. Each follows from a decided rule; the picture is here so no developer improvises one."
      >
        <PhoneRow>
          <Cell label="Loading" verdict={Verdict.Ship} note="Block and cluster at rest, skeletons in the content. Nothing hides.">
            <LoadingScroll />
          </Cell>
          <Cell label="Squads, no squads yet" verdict={Verdict.Ship} note="The New tile alone with one quiet line, then Discover. The chrome is the member’s chrome.">
            <SquadsEmptyScroll />
          </Cell>
          <Cell label="Activity, empty" verdict={Verdict.Ship} note="One icon, one line, and the one action that makes the page fill: Turn on notifications (Tsahi, 1 Oct). It opens the system permission prompt, or notification settings if the prompt was already answered. The chips stay: they are the page’s filters, not a result.">
            <ActivityEmptyScroll />
          </Cell>
          <Cell label="Bookmarks, empty" verdict={Verdict.Ship} note="One action at most. The search field stays compact at the bottom (3c: it never disappears on an empty list).">
            <BookmarksEmptyScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="A short page" verdict={Verdict.Ship} note="Three rows: nothing scrolls, nothing hides. Try to scroll it.">
            <ShortPageScroll />
          </Cell>
          <Cell label="A long name in the solid block" verdict={Verdict.Ship} note="Scroll past the hero: the name truncates, the menu and Join keep their size.">
            <SquadScroll title="The Frontend Infrastructure Watercooler" />
          </Cell>
          <Cell label="A form with the keyboard up" verdict={Verdict.Ship} note="The field rides the keyboard; the cluster does not. It stays at the layout viewport’s bottom, covered. The check stays top right.">
            <FormKeyboardStill />
          </Cell>
          <Cell label="A toast" verdict={Verdict.Ship} note="12px above the cluster, inside its inset. One at a time. Undo where there is something to undo.">
            <ToastStill />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="The lightbox" verdict={Verdict.Ship} note="Full screen over the status bar, the dark overlay, no cluster. The close is the header’s button, same size, place and material (Tsahi, 1 Oct): light in light mode, dark in dark mode. Back closes.">
            <LightboxStill />
          </Cell>
          <Cell label="A post without a link" verdict={Verdict.Ship} note="Freeform: no Read button, the same bar, the same block. Reading the link never applies.">
            <PostScroll external={false} />
          </Cell>
          <Cell label="Android, three-button navigation" verdict={Verdict.Ship} note="The system bar takes 48px; the cluster sits above it at its usual 8px. With gesture navigation the cluster is where it is on iOS.">
            <AndroidNavStill />
          </Cell>
        </PhoneRow>
        <div className="flex flex-wrap gap-6">
          <Shot src="/mobile-ux/dark-home.png" label="Dark, Home" note="The same page in the dark theme: the material, the chips and the cluster on tokens; nothing tuned per theme." />
          <Shot src="/mobile-ux/dark-squad.png" label="Dark, a squad page" note="The solid block with Join, the segments and the cover in dark." />
          <Shot src="/mobile-ux/dark-streak.png" label="Dark, the streak sheet" note="The tier chip and the pink discs keep their contrast in dark." />
        </div>
        <Table
          head={['State', 'Rule']}
          rows={states.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Inside the reading page"
        description="What a link inside the article does. Chapter 6b decided the drawer and the bar; these five rows are the links it never named."
      >
        <Table
          head={['The link is', 'What happens']}
          rows={readingLinks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Accessibility and devices"
        description="Eight lines, so the handoff has them in one place."
      >
        <Table
          head={['Item', 'Rule']}
          rows={access.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="The handoff work"
        description="Eight artifacts no chapter provides yet. None needs a design decision. In this order, because each one feeds the next."
      >
        <Table
          head={['Item', 'What', 'Size']}
          rows={handoffWork.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Recommendation">
            Confirm the ten calls, then I do the eight items in one pass and
            the chapters become the handoff: chapter 0 is the brief, 3 to 9d
            are the spec, 9 is the plan, the Archive is the record. The
            phases in chapter 9 are proposed; confirming them is the last
            decision before the first PR.
          </Callout>
          <Callout title="What stays out">
            Feed cards, the post content, onboarding, the logged-out prompts,
            the desktop and the extension. Anything found in production while
            building (a real layout bug, a missing event) becomes its own PR,
            never a rider on a shell PR.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The phases are in{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/9. Roadmap')}
            className="font-bold text-text-primary underline"
          >
            chapter 9
          </button>
          , proposed from the decisions.
        </p>
        <Quote>Nothing left to design. Ten routes to place, a dozen states written down, eight documents to write, and the phases to confirm.</Quote>
      </Section>

      <Section title="Archive">
        <ArchiveNav />
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9e" />
      </Section>
    </Page>
  ),
};
