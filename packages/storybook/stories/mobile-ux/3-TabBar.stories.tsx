import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  Compare,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Table,
  ChapterStatus,
  Status,
} from './kit';
import { TodayTabBar } from './mocks';
import {
  ProposedExplore,
  ProposedHome,
  ProposedYou,
  TodayHome,
} from './screens';

const meta: Meta = {
  title: 'Mobile UX/3. Tab bar',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const Strip = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{ width: 375 }}
    className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    {children}
  </div>
);

const todayJudged = [
  [
    'Home',
    'The For you feed',
    'Keep. It is the root.',
    'Lit on posts, sources and discussions it did not open (useActiveNav).',
  ],
  [
    'Explore',
    '/posts with a search bar on top',
    'Keep the slot, change the job: search + every place that is a chip today.',
    'The icon is the AI sparkle-glass. It reads as "AI", not "find".',
  ],
  [
    'Headlines',
    'The Happening Now channels',
    'Move to a Home segment and an Explore row.',
    'A news channel is a feed, not a place. Peer apps put no channel in the bar.',
  ],
  [
    'Activity',
    'Notifications',
    'Keep. Only tab allowed a badge.',
    'Page has its own title and gear; fine as a root.',
  ],
  [
    'Squads',
    'My Squads if you have some, the directory if not',
    'Keep the slot, fix the destination: one Squads hub (your squads first, then discover) whatever the account state.',
    'A tab whose destination changes with account state confuses back and active state.',
  ],
  [
    '"+" (floating)',
    'New post / Share a link / Poll drawer',
    'Becomes a real button: the detached square beside the floating bar (chapter 3b), or the centre slot in the docked control arm.',
    'Covers the last card on every list; hidden on posts and settings, so it is inconsistent anyway.',
  ],
];

const tabSpec = [
  ['Home', 'For you, Headlines, Following (which includes squad posts) and custom feeds as segments', 'none', 'Pop to root, scroll to top, refresh', 'Popular feed'],
  ['Explore', 'Search field, Popular, Discussions, Happening now, Tags, Sources, Leaderboard, the Explore feed', 'none', 'Focus the search field', 'Same'],
  ['Squads', 'Your squads (posts and list) first, then Discover squads by category', 'Dot for new posts in your squads', 'Scroll to top', 'Discover only'],
  ['Activity', 'Notifications with filters', 'Unread count, cleared on view', 'Scroll to top, mark seen', 'Opens the signup sheet'],
  ['Create (button)', 'Sheet: New post, Share a link, Poll', 'none', 'n/a (it is an action)', 'Opens the signup sheet'],
  ['Avatar (header)', 'You page: profile card, streak, Bookmarks, History, Following, Custom feeds, Achievements, Plus, Settings, Help', 'Dot only for a new achievement or profile completion nudge', 'n/a', 'Log in / Sign up'],
];

export const TabBar: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Which five places earn a tab, and where does Create go?"
        title="Home · Explore · Squads · Activity in the bar, Create as its own button beside it, and your profile where your eyes already are: the top corner."
      >
        <p>
          The bar is the most valuable 64 pixels in the app. Today one of its
          five slots goes to a news channel, the create action floats on top
          of the content, and search, bookmarks and settings hide in a chip
          strip and two small header icons. Every peer app puts Search in the
          bar (chapter 2) and every measured study says visible beats hidden
          (principles 1 to 4). Profile is the exception Tsahi chose: it stays
          in the header as the avatar, the way Instagram now keeps Create in
          the header, and the bar keeps Squads.
        </p>
        <ChapterNav current="3" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="3">
        Home · Explore · Squads · Activity, Create as its own button, profile in the header.
      </Status>
      <p className="text-text-tertiary typo-footnote">
        Alternatives and research kept for the record are in the Archive: Tab
        bar, chrome, search and create.
      </p>

      <Goal
        goal="A bar where every slot is a place a member visits weekly, Create is under the thumb, and nothing important lives only in a chip."
        metric="Share of sessions that reach a second destination, and taps on Bookmarks / History / Settings (chip-only today) per active user."
      />

      <Section
        title="Today's bar, judged slot by slot"
        description="What each slot opens, the verdict, and the flaw it carries."
      >
        <Strip>
          <TodayTabBar active="Home" />
        </Strip>
        <Table
          head={['Slot', 'Opens', 'Verdict', 'Flaw']}
          rows={todayJudged.map((row) => [
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
        title="What is in the bar"
        description="Four places and one action. The floating container that carries them is chapter 3b."
      >
        <Table
          head={['Tab', 'Holds', 'Badge', 'Re-tap while active', 'Logged out']}
          rows={tabSpec.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
            row[4],
          ])}
        />
      </Section>

      <Callout title="Docked here, floating in chapter 3b">
        This chapter settles what is in the bar. Chapter 3b tests the
        container: the iOS 26 floating pill that shrinks as you scroll, its
        flat blur material, the same on iOS and Android.
        Everything below (items, badges, active state, re-tap) holds either
        way.
      </Callout>

      <Section
        title="The screens behind the bar"
        description="Home and Activity change little. Explore and the You page absorb the chip strip and the gear."
      >
        <PhoneRow>
          <Cell label="Home" note="Brand row with streak and avatar, then segmented feeds. The chip strip is gone; its feeds are segments, its places are in Explore, its lists are behind the avatar.">
            <ProposedHome />
          </Cell>
          <Cell label="Explore" note="Search first, then the places. No header at all: the search field is the header.">
            <ProposedExplore />
          </Cell>
          <Cell label="You page (from the avatar)" note="Profile card and streak, the lists that were chips, then Plus, Settings, Help. Replaces the gear and the settings drawer's role as a menu.">
            <ProposedYou />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Where Headlines and the profile go"
        description="Removing a tab is not removing a feature. Both get entry points that fit what they are."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Headlines">
            A segment on Home, second after For you, and a row in
            Explore with a &quot;5 new&quot; count, and its own channels
            inside. The reported swipe bug is fixed on the way (chapter 7).
          </Callout>
          <Callout tone={CalloutTone.Good} title="Profile">
            The avatar in the brand row, top right, next to the streak. It
            opens the You page (profile, bookmarks, history, following,
            custom feeds, settings). Instagram moved Create to the header
            corner in 2025; we move the profile there instead, because the
            bar should hold the places you visit most and Create deserves
            its own button.
          </Callout>
        </div>
        <Quote>
          A tab is for a place you return to. Squads are that place for our
          most engaged members, so the slot stays.
        </Quote>
      </Section>

      <Section
        title="Before and after on Home"
        description="The whole difference in one pair."
      >
        <Compare before={<TodayHome />} after={<ProposedHome />} />
      </Section>

      <Section title="Rules the bar follows">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Active means stack owner">
            The lit tab is the one whose stack you are in, carried in
            history.state when you navigate from the bar. A post opened from
            Explore keeps Explore lit. Deep links with no stack light nothing.
          </Callout>
          <Callout title="Always there, except under a modal">
            Rendered at first paint (not after window load). Hidden only under
            the composer; on the post page it slides away as you read and
            returns on any scroll up (chapter 6). Elsewhere it shrinks, never
            leaves.
          </Callout>
          <Callout title="One badge">
            Activity carries the unread count. You may carry a dot for a real
            new state. Nothing else. Cleared on view.
          </Callout>
        </div>
        <DigIn title="Implementation notes">
          <p>
            MobileFooterNavbar keeps its Flipper indicator or drops it; the
            proposed bar has no sliding pill, the filled icon is the state.
            The tab list moves to a single config with route roots, so
            useActiveNav can resolve &quot;which root owns this path&quot;
            before falling back to history.state. Squads resolves to one hub
            route regardless of membership.
          </p>
          <p>
            FooterPlusButton and its drawer become the Create sheet, opened
            from the detached Create button. FooterNavBarLayout stops adding
            the h-40 spacer on posts once chapter 6 ships. Analytics (chapter
            9) land first so the change can be read.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="3" />
      </Section>
    </Page>
  ),
};
