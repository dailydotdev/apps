import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArchiveNav,
  Callout,
  CalloutTone,
  ChapterNav,
  ChapterStatus,
  Compare,
  DigIn,
  Metric,
  Page,
  PageHeader,
  Quote,
  Section,
  Status,
  Table,
} from './kit';
import { TodayHome, TodayPost } from './screens';
import { HomeStill, PostStill } from './chrome';
import { HomeScroll } from './scrollPages';
import { PostPlayground } from './postPlayground';
import { decisions as decisionLog } from './decisions';
import { feedback, issues } from './audit';

const meta: Meta = {
  title: 'Mobile UX/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

interface Lever {
  word: string;
  optimize: string;
  metric: { label: string; baseline: string; target: string };
  line: string;
  strategy: string;
  chapters: string;
}

const levers: Lever[] = [
  {
    word: 'Structure',
    optimize: 'How many places a phone user can reach, and how fast.',
    metric: {
      label: 'Sessions that reach a second destination',
      baseline: 'unmeasured',
      target: '+25%',
    },
    line: 'Four places in the bar and one Create square, nothing important hidden in a chip strip or behind a gear.',
    strategy:
      'Home · Explore · Squads · Activity, with Create as its own square beside the bar. Feeds (For you, Happening now with its channels in a menu, Following, custom feeds) become one segmented row on Home. Places (Popular, Discussions, Happening now, Tags, Sources, Leaderboard, Agents, Hot takes, Game center) are rows on Explore, with search as the floating field. Personal lists (Bookmarks, History, Following, Settings, Plus) live behind the header avatar. The floating "+" becomes the Create square.',
    chapters: '3, 3b, 5',
  },
  {
    word: 'Budget',
    optimize: 'Pixels above the first card, and whether we ever give them back.',
    metric: {
      label: 'Fixed chrome while reading the feed',
      baseline: '108px',
      target: '0px while reading; the bottom cluster stays at 44px',
    },
    line: 'One top block that hides while you read and returns on any scroll up; floating buttons on leaves; no bar anywhere.',
    strategy:
      'The brand row and the page’s row hide as one solid block while you read and come back on any scroll up; the bottom cluster shrinks and never leaves. Leaves get floating back and action buttons (38px) with the page name beside back at 20px; squads and profiles run their cover under the status bar. The Tags hero, the empty logged-out logo row, the Explore blank band and the three stacked rows on the Explore family go away.',
    chapters: '4, 4c, 4d, 4e',
  },
  {
    word: 'Flow',
    optimize: 'Moving between a feed and a post and back without losing your place or your bearings.',
    metric: {
      label: 'Posts opened per feed session',
      baseline: 'unmeasured',
      target: '+15%',
    },
    line: 'Tabs are roots, posts are leaves, back always means the same thing.',
    strategy:
      'Each tab keeps its own history. A post pushes in from the right with a View Transition and pops back with the floating back button, the iOS edge swipe or Android back. The active tab is the one you came from, never Home by default. Re-tapping the active tab pops to root, scrolls to top, then refreshes. The article opens in front of the post, which sinks into a drawer at the bottom (chapter 6b). Scroll position is restored before paint.',
    chapters: '5, 6, 6b',
  },
  {
    word: 'Feel',
    optimize: 'Whether the app behaves like software the phone shipped with.',
    metric: {
      label: '"Mobile site" gesture complaints per month',
      baseline: '1 (September)',
      target: '0',
    },
    line: 'Fix the swipe that switches channels while you scroll, then add the gestures people expect.',
    strategy:
      'Axis-locked swipe on the segment rows, pull-to-refresh that refetches instead of reloading, a bar that is there at first paint, press states, one haptic on the moments that matter (upvote, streak, tab change), sheets that follow the finger. Most of it is web-only work; haptics need one bridge message and the in-app browser needs the wrapper (chapter 8).',
    chapters: '7, 8',
  },
  {
    word: 'Proof',
    optimize: 'Knowing which change moved what.',
    metric: {
      label: 'Navigation events instrumented',
      baseline: '0 of 7',
      target: '7 of 7',
    },
    line: 'Tab taps send no analytics today, so the first ship is a logging PR.',
    strategy:
      'Log tab taps, composer opens, back taps, re-tap-to-top and segment switches with the source route. Read two weeks of baseline, then ship the shell behind one rollout flag, no experiments, and read first-session depth, posts per session and D7 after, split by new and retained members.',
    chapters: '9',
  },
];


export const StartHere: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Mobile navigation, header, footer · reviewed 28 Sep 2026"
        title="The phone app is the desktop app squeezed into 375px. Make it one system: five places, one header row, one back stack, and gestures that do not fight the phone."
      >
        <p>
          Scope: the shell a phone user moves through in the App Store and
          Google Play apps and on the mobile web. Tab bar, headers, menus,
          drawers, how a post opens and closes, what the thumb does. Not the
          feed cards, not onboarding. Logged-out header and footer prompts are
          already in flight (dailydotdev/apps#6731 and the footer PR); this
          review assumes they land and focuses on the member experience.
        </p>
        <p>
          Evidence: production captured in iOS Simulator Safari, a local build
          with a fake member against the production API, the shell source and
          the iOS wrapper&apos;s Swift, and a desk review of Apple, Google and
          nine peer apps. Every claim links back to a file or a URL. Every
          recommendation is mocked so you can say yes or no to a picture.
        </p>
        <ChapterNav current="0" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        The direction is set and reviewed chapter by chapter: floating rounded-rectangle chrome at Instagram proportions with production&apos;s flat blur, the hide-on-scroll block, one tab grammar, 20px titles, the reading drawer. Rows in the decisions table that a later call overturned are struck through with the call that replaced them; build from the latest row only.
      </Status>

      <Section
        title="Try the direction first"
        description="Two working phones. Scroll the feed to see the chrome shrink and pull in; on the post, scroll to watch the tab bar slide away and the action bar take its slot, then tap every icon and read what happened."
      >
        <div className="flex flex-wrap items-start gap-10">
          <HomeScroll />
          <PostPlayground />
        </div>
      </Section>

      <Section
        title="Decisions so far"
        description="Every call Tsahi made across the review rounds, in order, with the chapter that carries it. A struck-through row was overturned by a later call, shown under it. This is the list to present: what is changing and why."
      >
        <Table
          head={['Round', 'Decision', 'Chapter']}
          rows={decisionLog.map((row) => [
            <span key={row.decision} className="font-bold tabular-nums text-text-primary">
              {row.round}
            </span>,
            row.supersededBy ? (
              <span key={`${row.decision}-d`} className="flex flex-col gap-1">
                <span className="text-text-quaternary line-through">{row.decision}</span>
                <span className="font-bold text-text-primary">Superseded. {row.supersededBy}</span>
              </span>
            ) : (
              row.decision
            ),
            row.where,
          ])}
        />
      </Section>

      <Section
        title="What we found, in one screen"
        description="The full list with evidence is in chapter 1. These are the headlines."
      >
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          <Callout tone={CalloutTone.Bad} title="Two navigation systems">
            The bar has 5 tabs. The home chip strip has 15 chips. Eight of
            them are places the bar also reaches, and six exist only there.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Five top bars for one job">
            Tag pages have no back. Source pages have a logo. Squads a lone
            chevron. Profile a title. Post a &quot;Read post&quot;. Each was
            designed alone.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="108px that never collapse">
            Home keeps logo row + chips sticky forever. Tags stacks three rows
            and a hero before the first tag. Explore has a blank band.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Two bottom bars on a post">
            Engagement pill above the tab bar, 160px reserved, and Home is lit
            even though you came from Squads.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Swipe fires while scrolling">
            Headlines switches channel on any drag that ends more horizontal
            than vertical past 40px. A user wrote in about it this month.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Zero events on the bar">
            Tab taps, the &quot;+&quot;, the gear and the avatar log nothing.
            We cannot measure a navigation change today.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Desktop menus on a phone">
            Every three-dots menu is a floating popup; the post one holds up
            to twenty rows. Three menus are hover-only, so they do not exist
            on touch.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Seven ways back">
            router.back with a logo fallback, with a slash fallback, hard
            links, a drawer that reopens, a drawer that goes to your profile,
            and eleven pages with no back at all.
          </Callout>
        </div>
        <Quote>&ldquo;{feedback.quote}&rdquo;</Quote>
        <p className="text-text-tertiary typo-footnote">
          {feedback.user}, {feedback.when}. Root cause and fix in chapter 7.
        </p>
      </Section>

      <Section
        title="Five levers"
        description="Each one names what it optimizes, how we will know, and the strategy in prose. Structure is the foundation; the rest compound on it."
      >
        <div className="flex flex-col gap-6">
          {levers.map((lever, index) => (
            <article
              key={lever.word}
              className="grid gap-5 rounded-16 border border-border-subtlest-tertiary p-5 laptop:grid-cols-[14rem_1fr]"
            >
              <div className="flex flex-col gap-3">
                <span className="text-text-quaternary typo-caption1">
                  Lever {index + 1}
                </span>
                <span className="font-bold typo-mega3">{lever.word}</span>
                <span className="text-text-tertiary typo-footnote">
                  {lever.optimize}
                </span>
                <Metric {...lever.metric} />
                <span className="text-text-quaternary typo-caption1">
                  Chapters {lever.chapters}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-bold typo-title3">{lever.line}</p>
                <p className="max-w-[78ch] text-text-secondary typo-callout">
                  {lever.strategy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="The target, before and after"
        description="Home and a post, today and proposed. Every other screen follows from these two."
      >
        <Compare before={<TodayHome />} after={<HomeStill p={0} />} />
        <Compare before={<TodayPost />} after={<PostStill p={1} />} />
        <DigIn title="What changed between the two Home screens">
          <p>
            Bar: a floating rounded rectangle with Home · Explore · Squads · Activity
            and a Create button beside it; Happening now becomes a Home segment.
            Header: the gear is gone (Settings live behind the avatar), the
            chip strip is gone (feeds are the segmented row, places are in
            Explore, lists are behind the avatar). Streak and avatar stay top
            right.
          </p>
          <p>
            Post: floating back, share and menu buttons instead of a bar that
            repeated the source; &quot;Read the full post&quot; becomes a
            real button in the content; both bars show at rest and, as you
            read, the tab bar slides away and the action bar (upvote, downvote,
            comment, bookmark, share) takes its slot; comment opens the
            full-page composer; Read opens the article with the post sinking
            into a drawer at the bottom (chapter 6b).
          </p>
        </DigIn>
      </Section>


      <Section
        title="How to review"
        description={`${issues.length} shell issues plus 27 page-level fixes, each tagged with the chapter that closes it. Read 1 for the evidence, 2 for the outside view, 3 and 3b for the bar and the floating chrome, 4, 4b, 4c, 4d and 4e for headers, menus, every page, every tab row, page titles and scroll behaviour, 5 to 8 for flow, post page, reading the link, feel and wrappers, 9 for the review before development, 9b for the ten calls it raised and their decisions, 9c for the avatar-on-the-left question. Everything rejected or parked along the way is in the Archive, with the decision that retired it.`}
      >
        <ChapterNav current="0" />
        <ArchiveNav />
      </Section>
    </Page>
  ),
};
