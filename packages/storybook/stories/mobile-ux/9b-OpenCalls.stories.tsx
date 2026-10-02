import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BrowserChrome,
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  Page,
  PageHeader,
  Phone,
  PhoneRow,
  Section,
  Shot,
  Status,
  Table,
  Verdict,
} from './kit';
import { ExploreScroll, PostScroll, ProfileScroll, SquadsScroll, TagScroll, YouScroll } from './scrollPages';
import { FieldFocusedStill } from './searchMocks';
import { VisitorLeafStill } from './visitors';
import { ExploreHub, FeedList } from './mocks';
import { hideSpec } from './hide';
import {
  ArchiveScroll,
  BrowserMenuStill,
  FieldSpecimens,
  MobileWebStill,
  NavMap,
  OnboardingStepStill,
  PeriodSheetStill,
  PlusCheckoutStill,
  SettingsGeneralStill,
  SignupPageStill,
  SortSheetStill,
} from './openCallMocks';
import { posts } from './data';

const meta: Meta = {
  title: 'Mobile UX/9b. Open calls',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const Decided = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Callout tone={CalloutTone.Good} title="Decided, 30 Sep">
    {children}
  </Callout>
);

const ExploreWithAgents = (): React.ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center px-4 font-bold typo-title3">Explore</div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <ExploreHub withSearch={false} withSquads={false} withFeed={false} withAgents />
        <FeedList items={posts} compact />
      </div>
    </div>
  </Phone>
);

const entryPoints: [string, string, string][] = [
  ['A gated action (save, upvote, downvote, comment, join, follow, create, award, filter, settings: forty triggers)', 'A full-screen Sign up opens at once (captured below from Follow on a tag page): a back chevron, Continue with Google, GitHub, Apple, Facebook, an email field, the terms line, Already using daily.dev? Log in. No step before it.', 'Keep this screen. Two changes: the close button top left instead of the back chevron (the no-shell class), and one line under the title naming what the action gets you. The action completes on return.'],
  ['Visitor header: Log in, Open app', 'A 56px row with the logo and two small buttons, placed differently on six page families. Log in goes to daily.dev/onboarding?action=login (captured below).', 'Decided in round 5: the same slots members have for the streak and avatar, on roots and leaves. Log in opens the log-in page as it is today.'],
  ['The sign-up page itself (daily.dev/onboarding)', 'The hero, "Where developers discover what’s next", Google, GitHub, Continue with email, Log in (captured below).', 'Unchanged. It is the front door for visitors who arrive to sign up; the gated screen is the same choice without the hero.'],
  ['Sign-up strips and banners on public pages (pinned strip, Explore strip, post banner, custom banner, public page banner, cover strip, authentication banner, signup widget)', 'Eight components, several of which can show at once.', 'Out of this review: the visitor prompts stay their own project, as round 1 said. One rule from here: at most one prompt on screen, and it opens the same sign-up page.'],
  ['After a social sign-in: registration and onboarding forms', 'Full-screen steps.', 'No-shell pages (call 6): close top left, the step’s own Continue.'],
  ['Email code verification, password reset, OAuth consent', 'Full-screen pages.', 'No-shell pages.'],
  ['The round 1 login sheet (Save this post: Sign up or Log in)', 'Proposed in chapter 4b, never in production.', 'Withdrawn: it is one more tap before the same screen.'],
];

export const OpenCalls: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What was left to decide, shown"
        title="Ten calls, all closed on 30 Sep. Each section keeps its picture and states the decision, so the reasoning stays next to the answer."
      >
        <p>
          These were the items from the review in chapter 9 that only Tsahi
          could close. The decisions table in chapter 0 carries all of them;
          the chapters are being brought in line.
        </p>
        <ChapterNav current="9b" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Ten of ten decided. Call 5 changed on review (no Happening now on
        Explore, New squad as the first tile of Your squads (9c), the profile as
        production has it with segments, the five progress rows in the menu
        behind the avatar). Call 7 closed on production’s own screen with
        two UI touches. A related question, the avatar on the left, is
        chapter 9c.
      </Status>

      <Section
        title="1 · The post page's top chrome"
        description="Every page without a cover hides its top block while you read (chapter 4e). The post page now follows the same rule."
      >
        <PhoneRow>
          <Cell label="Solid block that hides, like every page" verdict={Verdict.Ship} note="Scroll it: back, share and menu ride out as one solid piece while you read and return on any scroll up; the tab bar slides away and the action bar takes its slot on the same progress. No name in the row: the content is the name.">
            <PostScroll />
          </Cell>
        </PhoneRow>
        <Decided>
          The 4e rule applies to the post page: a solid block (back, share,
          menu) that hides with the scroll and returns on any scroll up, no
          name in the row. The chapter 6 playground now runs on it, and the
          post page is the fourteenth scroll demo in 4e.
        </Decided>
      </Section>

      <Section
        title="2 · One scroll progress for everything"
        description="The top block and the bottom cluster run on one hook and one set of numbers."
      >
        <PhoneRow>
          <Cell label="Post page, one progress" verdict={Verdict.Ship} note="The block, the tab bar and the action bar move together: same dead zone, same tolerances, same snap.">
            <PostScroll />
          </Cell>
          <Cell label="Explore, one progress" verdict={Verdict.Ship} note="The name row and the search cluster move together the same way.">
            <ExploreScroll />
          </Cell>
        </PhoneRow>
        <Table
          head={['Number', 'Value', 'Means']}
          rows={[
            ['Travel', `${hideSpec.distance}px`, 'How far you read for the block to go from shown to hidden; the cluster shrinks over the same distance.'],
            ['Dead zone', `${hideSpec.deadZone}px`, 'Nothing hides in the first stretch of a page.'],
            ['Hide tolerance', `${hideSpec.hideTolerance}px`, 'Reading down has to travel this much before hiding starts, so a wobble does nothing.'],
            ['Reveal tolerance', `${hideSpec.revealTolerance}px`, 'Any scroll up longer than this brings everything back.'],
            ['Stop', '300ms', 'After the finger stops, a half-hidden block snaps to shown or hidden.'],
            ['Scrub and snap', '140ms and 220ms', 'The two transition lengths: while following the finger, and for the final snap.'],
            ['Fold and haptic', 'None', 'The bottom cluster is continuous; the p = 0.5 fold with a haptic in chapter 3b is withdrawn.'],
          ]}
        />
        <Decided>
          One progress: these numbers drive the block and the bottom cluster
          everywhere. The post page playground and the Explore cluster now use
          the same hook; the numbers move into one spec file in the handoff.
        </Decided>
      </Section>

      <Section
        title="3 · The search field's geometry"
        description="Three small forks a developer would otherwise guess: the radius, the focused height, and the mobile web."
      >
        <PhoneRow>
          <Cell label="Rest and compact" verdict={Verdict.Ship} note="The field is one of the family: radius follows height like the bar and the buttons.">
            <FieldSpecimens />
          </Cell>
          <Cell label="Focused, 52px" verdict={Verdict.Ship} note="Focused is the rest size with the primary hairline, on a page and inside Spotlight alike; the keyboard pushes it up.">
            <FieldFocusedStill title="Tags" query="rea">
              <div className="px-4 pt-2 text-text-tertiary typo-footnote">Type to search tags</div>
            </FieldFocusedStill>
          </Cell>
          <Cell label="Mobile web: the cluster stays" verdict={Verdict.Ship} note="Safari's own pill sits at the bottom, so the cluster starts compact and floats above it. No full-width docked bar for the web.">
            <MobileWebStill />
          </Cell>
        </PhoneRow>
        <Decided>
          Radius follows height (22 at rest, 18 compact); a focused field is
          52px everywhere, Spotlight included; the mobile web keeps the
          floating cluster at compact size.
        </Decided>
      </Section>

      <Section
        title="4 · Back, history and URLs"
        description="Every segment has a URL. What back does after each kind of move, and the route table developers need. Both tables now live in chapter 5."
      >
        <Table
          head={['You do', 'URL', 'History', 'Back does']}
          rows={[
            ['Open the app', '/', 'Home', 'Leaves the app'],
            ['Tap Following', '/following', 'Home (replaced)', 'Leaves the app: a segment is a view of the page, not a place you went to'],
            ['Open a post', '/posts/abc', 'Home › Post', 'Returns to Following, where you were'],
            ['Tap Read', '/posts/abc (page in front)', 'Home › Post › Page', 'Pops the page’s own history first, then closes the page and shows the post'],
            ['Open Spotlight, a sheet or the composer', 'unchanged', 'unchanged', 'Closes the overlay; they are not history entries'],
            ['Land on a deep link', '/squads/watercooler', 'Squad (no stack)', 'Goes to the root that owns the URL: the Squads root'],
            ['Re-tap the lit root', 'unchanged', 'unchanged', 'Scrolls to the top; a second re-tap returns to the first segment'],
          ]}
        />
        <Decided>
          Segments replace, leaves push, overlays are not history entries,
          the reading page pops its own history first. Chapter 5 carries the
          map, this table and the route table.
        </Decided>
      </Section>

      <Section
        title="5 · The leftover destinations"
        description="Changed on review: achievements, streak, DevCard, hot takes and game center are rows in the menu behind the avatar; Explore loses its Happening now row; the Squads root row carries only New squad; the profile page stays as production has it, with segments for its content."
      >
        <PhoneRow>
          <Cell label="Explore: Agents added, Happening now gone" verdict={Verdict.Ship} note="Happening now is a Home segment, so it is not repeated as an Explore row. Agents is a place, so it is a row here. Hot takes and Game center are about you, so they moved to the profile.">
            <ExploreWithAgents />
          </Cell>
          <Cell label="Squads root: New squad as the first tile" verdict={Verdict.Ship} note="Revised in 9c: the brand row is name and avatar; New squad is the first tile of Your squads.">
            <SquadsScroll />
          </Cell>
          <Cell label="Profile: production's page, with segments" verdict={Verdict.Ship} note="About · Posts · Replies · Upvoted, like the squad page's Posts · About. About is production's profile page as it is (about me, achievements showcase, stack, hot takes, workspace photos, reading overview, experiences); the Activity block's Posts, Replies and Upvoted tabs become the other segments. Scroll it.">
            <ProfileScroll />
          </Cell>
          <Cell label="The menu behind the avatar" verdict={Verdict.Ship} note="Tapping the avatar opens You: Plus first, then Custom feeds, My squads, Following, Bookmarks, History; Your progress (achievements, streak, DevCard, hot takes, game center); then Core wallet, Invite friends, Settings. Help is the page's one top action. No streak on the name row; every row icon is the same outline.">
            <YouScroll />
          </Cell>
          <Cell label="Share stays on things" verdict={Verdict.Ship} note="Tag, source, squad and profile keep share and the menu on the right.">
            <TagScroll />
          </Cell>
        </PhoneRow>
        <Decided>
          Agents on Explore; achievements, streak, DevCard, hot takes and
          game center as rows in the menu behind the avatar; no Happening now
          row on Explore; New squad as the first tile of Your squads (9c); the profile
          page is production’s page with segments About · Posts · Replies ·
          Upvoted, About the default; Share stays on things.
        </Decided>
      </Section>

      <Section
        title="6 · The no-shell pages"
        description="Checkout, Plus, onboarding, sign-in, OAuth, join, verification, the invite landing and the permission prompt are flows, not places. They get no cluster and no floating buttons."
      >
        <PhoneRow>
          <Cell label="Plus checkout" verdict={Verdict.Ship} note="One close button top left, the page's own primary button at the bottom, nothing from the shell. System back closes.">
            <PlusCheckoutStill />
          </Cell>
          <Cell label="An onboarding step" verdict={Verdict.Ship} note="Same class: close top left, the step's own Continue at the bottom, the progress line at the top.">
            <OnboardingStepStill />
          </Cell>
        </PhoneRow>
        <Decided>
          A named class of no-shell pages: no cluster, no floating buttons, a
          close button top left, system back closes.
        </Decided>
      </Section>

      <Section
        title="7 · Sign-up on a gated action"
        description="The visitor header is decided. Production already opens its Sign up screen directly when a visitor taps save, upvote or comment, so the round 1 sheet was the only extra step, and it is withdrawn. The screen stays exactly as it is; two UI touches are added."
      >
        <Table
          head={['Entry point', 'Today in production', 'Proposed']}
          rows={entryPoints.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <PhoneRow>
          <Shot src="/mobile-ux/prod-auth-signup.jpg" label="Today: the sign-up page" note="daily.dev/onboarding on a phone, captured 30 Sep: the hero, the headline, Google, GitHub, Continue with email, Log in." />
          <Shot src="/mobile-ux/prod-auth-login.jpg" label="Today: log in" note="daily.dev/onboarding?action=login: the four providers, email and password, the human check, Forgot password." />
          <Shot src="/mobile-ux/prod-auth-gated.jpg" label="Today: a gated action" note="Follow on the public React tag page opens this full-screen Sign up at once: back chevron, four providers, email, terms, Log in. There is no sheet before it." />
        </PhoneRow>
        <PhoneRow>
          <Cell label="Proposed: the same screen, two changes" verdict={Verdict.Ship} note="Production's gated Sign up as it is, with the close button top left (the no-shell class) and one line under the title naming what the action gets you. The action completes the moment you are in.">
            <SignupPageStill />
          </Cell>
          <Cell label="The header, decided" verdict={Verdict.Ship} note="Log in and Open app in the streak and avatar slots; Log in opens today's log-in page.">
            <VisitorLeafStill />
          </Cell>
        </PhoneRow>
        <Decided>
          Production’s screen stays exactly as it is: the same providers in
          the same order, the same email step, terms and Log in link, the same
          component, flow and analytics. Two UI touches only: the close button
          top left instead of the back chevron, and one line under Sign up
          naming what the action gets you, keyed by the trigger (save, upvote,
          comment, join, follow). Nothing else changes: not daily.dev/onboarding,
          not the log-in page, not the events sent.
        </Decided>
        <Callout title="For the developer">
          Keep AuthOptions and AuthModal and every logEvent they send. The
          change is in the header (a close control where the back chevron is)
          and a subtitle under the title, a short map from the trigger to a
          sentence. No new step, no new component, no change to the providers
          or the email flow.
        </Callout>
      </Section>

      <Section
        title="8 · Reading the link: three details"
        description="Reload in the menu, Share once, no percentage rule for reading, and a home for the setting."
      >
        <PhoneRow>
          <Cell label="The page menu" verdict={Verdict.Ship} note="Open in Safari, Copy link, Reload; Back and Forward. Share is on the page's bar and not repeated here.">
            <BrowserMenuStill />
          </Cell>
          <Cell label="The setting, under Settings · General" verdict={Verdict.Ship} note="Open links in the app, on by default. Off sends links to the system browser, the way X and Reddit offer it.">
            <SettingsGeneralStill />
          </Cell>
        </PhoneRow>
        <Decided>
          Confirmed by Tsahi: reload in the menu, Share once on the bar,
          reading counted as the Read button counts it today with no
          percentage, the setting under Settings, General. Chapter 6b’s menu
          and rules are updated.
        </Decided>
      </Section>

      <Section
        title="9 · Best-of archives"
        description="The period is one option inside the sort menu. It opens its own short list, and the last row leads to the archive month."
      >
        <PhoneRow>
          <Cell label="The sort menu" verdict={Verdict.Ship} note="Popular, Most upvoted, Most discussed, then Period as one row showing the current value.">
            <SortSheetStill />
          </Cell>
          <Cell label="Period" verdict={Verdict.Ship} note="This week, this month, this year, a month in the archive. Applies to the two sorts that have a period.">
            <PeriodSheetStill />
          </Cell>
          <Cell label="An archive month" verdict={Verdict.Ship} note="Back and the month as the name, the list under it; nothing new to learn.">
            <ArchiveScroll />
          </Cell>
        </PhoneRow>
        <Decided>
          Archives are plain leaves named after the month; the period is one
          option inside the sort menu, as Tsahi asked. If “one option” meant
          something else, say so and this section changes.
        </Decided>
      </Section>

      <Section
        title="10 · Chapter 5, redrawn"
        description="The navigation map as the decisions left it. Chapter 5 now is this map with the two tables from section 4."
      >
        <NavMap />
        <Decided>Chapter 5 is rewritten from this map and marked decided.</Decided>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9b" />
      </Section>
    </Page>
  ),
};
