import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  Compare,
  DigIn,
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
import {
  duplicates,
  pinnedToday,
  tabFixes,
  tabRows,
  tabRules,
  TabLevel,
  TabVerdict,
  worked,
} from './tabs';
import {
  ActivityStill,
  BookmarksStill,
  activityTypes,
  Chips,
  ChipTone,
  MenuLabel,
  SegmentLook,
  segmentLookNotes,
  ExploreFeedDemo,
  LevelsStill,
  RowSpecimen,
  Segments,
  SquadsRootStill,
  TagPageStill,
  TagsDirectoryStill,
} from './tabMocks';
import { SearchResults } from './search';
import { ActivityScroll, HomeScroll, ProfileScroll, SquadScroll, SquadsScroll } from './scrollPages';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SegmentMenu } from './secondRow';
import {
  benchmarks,
  differentLevels,
  guidance,
  patterns,
  researchSources,
  specFacts,
} from './secondRowResearch';

const meta: Meta = {
  title: 'Mobile UX/4c. Tabs everywhere',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const verdictClassName: Record<TabVerdict, string> = {
  [TabVerdict.Keep]: 'bg-overlay-float-avocado text-accent-avocado-default',
  [TabVerdict.Reshape]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [TabVerdict.Move]: 'bg-overlay-float-cheese text-accent-cheese-default',
  [TabVerdict.Remove]: 'bg-overlay-float-ketchup text-accent-ketchup-default',
};

const VerdictTag = ({ verdict }: { verdict: TabVerdict }): ReactElement => (
  <span
    className={classNames(
      'whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2',
      verdictClassName[verdict],
    )}
  >
    {verdict}
  </span>
);

const levelClassName: Record<TabLevel, string> = {
  [TabLevel.Bar]: 'border-text-primary text-text-primary',
  [TabLevel.Segments]: 'border-accent-cabbage-default text-accent-cabbage-default',
  [TabLevel.Chips]: 'border-accent-water-default text-accent-water-default',
  [TabLevel.Menu]: 'border-accent-cheese-default text-accent-cheese-default',
  [TabLevel.None]: 'border-border-subtlest-tertiary text-text-quaternary',
};

const LevelTag = ({ level }: { level: TabLevel }): ReactElement => (
  <span
    className={classNames(
      'whitespace-nowrap rounded-6 border px-1.5 py-0.5 font-bold typo-caption2',
      levelClassName[level],
    )}
  >
    {level}
  </span>
);


const shots = [
  {
    src: '/mobile-ux/prod-tabs-tags.jpg',
    label: '/tags: three rows',
    note: 'The Home strip (Tags selected), then All tags · Technical Debt · Career · AWS (All tags selected too), then the A to Z index. Two selected tabs for one place, and the Recommended line repeats the navbar’s tags.',
  },
  {
    src: '/mobile-ux/prod-tabs-posts.jpg',
    label: '/posts: two pinned bars',
    note: 'Search header pinned at the top, a blank band, then Popular · By upvotes · By comments · By date pinned under it. The bar says Explore; the strip on Home also has a Popular.',
  },
  {
    src: '/mobile-ux/prod-tabs-tag-react.jpg',
    label: '/tags/react: a row of exits',
    note: 'All tags · React · Next.js · Web Development. Only React is this page; the other four leave it. No back button, and the Home strip is gone, so the page has no parent.',
  },
  {
    src: '/mobile-ux/prod-tabs-highlights.jpg',
    label: '/highlights: three names',
    note: 'Bar tab Headlines, title Happening Now, first tab Headlines. The channel tabs pin at the top; they are also the only row that swipes, with the 40px threshold from the feedback.',
  },
  {
    src: '/mobile-ux/prod-tabs-squads-discover.jpg',
    label: '/squads/discover: categories as tabs',
    note: 'Discover · Featured · Languages · Web · Mobile scroll away with the page. Featured is a section on the same page and a tab. Squads is also the bar tab and a Home chip.',
  },
  {
    src: '/mobile-ux/prod-tabs-squad-page.jpg',
    label: 'Squad page: tabs below the fold',
    note: 'Posts · About sit under the cover, description, stats and Join, and scroll away. They are local state, so About has no URL.',
  },
  {
    src: '/mobile-ux/prod-tabs-profile.jpg',
    label: 'Profile: tabs off screen',
    note: 'About · Posts · Replies · Upvoted are below the fold, local state, and each also exists as its own page with a back header.',
  },
];

const fixPrs = Array.from(new Set(tabFixes.map((fix) => fix.pr))).sort();

export const Tabs: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Every row of tabs, segments and chips on the phone"
        title="Fourteen tab rows, five ways to pin, two active tabs on one screen and three names for one page. The fix is a grammar of three levels: the bar, one segment row, one chip row, and rules for what pins, what swipes and what is a link instead."
      >
        <p>
          Tsahi asked for a map of every tab on every page, aligned so that
          rows behave the same while they are shown and while you scroll, with
          no duplicated navigation. This chapter is that map: the inventory
          from the code and the simulator, the duplicates, the rules, and the
          pages redrawn under the rules. It sits on the decisions of chapters
          3b (the floating chrome), 4 (the Home row) and 4b (every page).
        </p>
        <ChapterNav current="4c" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Revised after research and Tsahi&apos;s review: the two-question test (which
        list → segments; narrow → chips; reorder or a second dimension → menu), one of
        each per page and never stacked, the X-style menu on the active segment for
        Happening now (his pick), search results as segments, the Explore sort as a menu;
        nine duplicates removed.
      </Status>

      <Callout title="Archived from this chapter">
        The seven other segment looks, the Happening now draft and
        alternatives A to G, the A/B row mapping switch and the pinned-row
        demos from before the hiding block now live in Mobile UX / Archive /
        Tab rows and segments. This chapter keeps the Quiet look, option H
        and the scroll demos on the block.
      </Callout>

      <Goal
        goal="A member can tell what a row does before tapping it (switch a view, filter a list, or leave the page), the switch is always reachable while scrolling, and nothing is a tab in two places."
        metric="Tab taps per session on the pages that lose rows (Tags, Explore, Happening now) should hold or rise while bounce from those pages drops; zero rows rendered without a selected item."
      />

      <Section
        title="What the phone shows today"
        description="Production, logged out, iPhone 17 Pro. Each capture is one of the problems the rules below close."
      >
        <div className="map-scroll-none flex gap-6 overflow-x-auto pb-2">
          {shots.map((shot) => (
            <Shot key={shot.src} src={shot.src} label={shot.label} note={shot.note} width={260} />
          ))}
        </div>
      </Section>

      <Section
        title="Duplicates"
        description="Nine places where the same destination is a tab twice, or a row shows two selections, or no selection."
      >
        <Table
          head={['What', 'Where', 'Fix']}
          rows={duplicates.map((row) => [
            <span key={row.what} className="font-bold text-text-primary">
              {row.what}
            </span>,
            row.where,
            row.fix,
          ])}
        />
      </Section>

      <Section
        title="What the research says"
        description="Eighteen apps, ten patterns, and the design guidance, gathered 2026-09-29. The short version: nobody stacks two rows that look alike. The second dimension is either folded into one row, turned into a different shape, put in a menu, or moved into the content."
      >
        <Table
          head={['App', 'Primary row', 'Second dimension', 'Pins', 'How the levels differ']}
          rows={benchmarks.map((row) => [
            <span key={row.app} className="font-bold text-text-primary">
              {row.app}
            </span>,
            row.primary,
            row.second,
            row.pins,
            row.differs,
          ])}
        />
        <Table
          head={['#', 'Pattern', 'Who does it', 'For', 'Against']}
          rows={patterns.map((row) => [
            <span key={row.id} className="font-bold tabular-nums text-text-primary">
              {row.id}
            </span>,
            <span key={row.name} className="font-bold text-text-primary">
              {row.name}
            </span>,
            row.examples,
            row.pros,
            row.cons,
          ])}
        />
        <div className="flex flex-col gap-4">
          <Table
            head={['Guidance', 'Says']}
            rows={guidance.map((row) => [
              <a key={row.source} href={row.url} target="_blank" rel="noreferrer" className="font-bold text-text-primary underline">
                {row.source}
              </a>,
              row.says,
            ])}
          />
          <div className="grid gap-4 laptop:grid-cols-2">
            <Table
              head={['Measured', 'Numbers']}
              rows={specFacts.map((row) => [
                <span key={row[0]} className="font-bold text-text-primary">
                  {row[0]}
                </span>,
                row[1],
              ])}
            />
            <Table
              head={['Two rows read as two levels when', 'How']}
              rows={differentLevels.map((row) => [
                <span key={row[0]} className="font-bold text-text-primary">
                  {row[0]}
                </span>,
                row[1],
              ])}
            />
          </div>
        </div>
        <DigIn title="Sources">
          <ul className="flex flex-col gap-1">
            {researchSources.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-text-secondary underline typo-footnote">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </DigIn>
      </Section>

      <Section
        title="Happening now: the second row, seven other ways"
        description="Tsahi flagged the draft: the channel chips under the Home segments felt too connected and looked too similar. The pick is H; the draft and alternatives A to G are in the archive story Tab rows and segments."
      >
        <PhoneRow>
          <Cell label="H · The segment is the picker" verdict={Verdict.Ship} note="A chevron on the active segment opens the channel sheet (iOS title menu, Reddit's Home ▾). The chosen channel shows on the list header line with a clear control and in the URL. One row, nothing added to the chrome.">
            <SegmentMenu />
          </Cell>
          <Cell label="H · Channel chosen" verdict={Verdict.Ship} note="Security is on; the line says so and the X clears it. Swipe still moves between segments.">
            <SegmentMenu channel="Security" />
          </Cell>
          <Cell label="H · The sheet" note="Channels with a dot on the current one; a tap picks and closes. Room for counts and a Follow later.">
            <SegmentMenu open />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why H">
            It is the only option that adds nothing to the chrome and still
            tells you channels exist (the chevron sits on the word you just
            tapped). Reddit moved its feeds into exactly this kind of menu to
            have fewer things competing on the main screen, and the iOS title
            menu is the platform&apos;s own version. The state is visible on
            the first line of content and lives in the URL, so back, refresh
            and deep links work. And it keeps the decided Home row untouched.
          </Callout>
          <Callout title="What changes elsewhere">
            The same rule applies wherever a second dimension would have sat
            under segments: the Explore feed keeps its sort chips because it
            has no segment row; Activity and search results keep theirs for
            the same reason; the squad and profile segments have no second
            dimension. Chips are now tonal (no border) so that even alone
            they never look like a segment row.
          </Callout>
        </div>
      </Section>

      <Section
        title="Every row, page by page"
        description="From the code inventory. Level and verdict apply the grammar in the next section; the last column is the proposal for that row."
      >
        <Table
          head={['Page', 'Labels today', 'While scrolling', 'Linking · swipe', 'Level', 'Verdict', 'Proposed']}
          rows={tabRows.map((row) => [
            <span key={row.page} className="flex flex-col gap-1">
              <span className="font-bold text-text-primary">{row.page}</span>
              <code className="text-text-quaternary typo-caption2">{row.routes}</code>
              <code className="typo-caption2">{row.component}</code>
            </span>,
            row.labels,
            row.scrolling,
            <span key={row.linking}>
              {row.linking}. Swipe: {row.swipe.charAt(0).toLowerCase() + row.swipe.slice(1)}
            </span>,
            <LevelTag key={row.level} level={row.level} />,
            <VerdictTag key={row.verdict} verdict={row.verdict} />,
            row.proposed,
          ])}
        />
      </Section>

      <Section
        title="How rows pin today"
        description="Five behaviours for one job. Three z-index values, one overlap, and most rows that filter the main list leave the screen after one flick."
      >
        <Table
          head={['Row', 'Today']}
          rows={pinnedToday.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Which control? Two questions"
        description="Tsahi asked why search results, Activity and Bookmarks looked different. The answer is the test below; every row in the app is decided by it, and the worked list is the copy-from sheet for any new page."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Which list? Segments">
            The tap changes what kind of thing you see, or where it comes
            from: Posts vs People, Quick saves vs Read it later, For you vs
            Following. Each has its own URL you would send someone. Text with
            an underline, up to five or so, swipe between them.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Narrow this list? Chips">
            The tap keeps the same list and shows a subset of it: Mentions in
            Activity, Web in Discover squads, the letter R in Tags. Tonal
            pills, as many as needed, scroll sideways, query in the URL. Only
            on pages with no segment row.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Reorder, period, or a second dimension? Menu">
            The tap changes the order or a setting of the list, or narrows a
            segment&apos;s list where chips are not allowed: Popular ▾ on the
            Explore feed, Happening now ▾ on Home. A label with a chevron
            that opens a sheet; the choice shows in the label and the URL.
          </Callout>
        </div>
        <Table
          head={['Page', 'Items', 'The question', 'Control']}
          rows={worked.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.items,
            row.question,
            <LevelTag key={row.control} level={row.control} />,
          ])}
        />
        <Callout title="Why search results changed">
          Chapter 3c drew Posts · Squads · People · Tags as chips. Under the
          test they are different things, so they are segments now, the
          same as Bookmarks; Activity stays chips because every type is a
          slice of one stream. The Explore feed&apos;s sort was a chip row
          and is now a menu, because an order is not a list.
        </Callout>
      </Section>

      <Section
        title="The grammar"
        description="Level 0 the bar, level 1 segments, level 2 chips or a menu, and nine rules that decide where a row may appear, what it does, how it pins and how it moves."
      >
        <div className="flex flex-wrap items-start gap-8">
          <LevelsStill />
          <div className="flex max-w-md flex-col gap-3 pt-2">
            <span className="font-bold typo-title3">Three levels</span>
            <p className="text-text-secondary typo-callout">
              Home on Happening now at rest. Level 0 is the floating bar. Level 1 is
              the segment row: For you · Happening now · Following · +, the views of
              this page. Level 2 is the filter: here a menu on the active segment and
              a line that shows the choice; on Activity, the Explore feed and search
              results it is a chip row, because those pages have no segments. A page
              never has more than one of each, and a row never repeats something a
              level above it already offers.
            </p>
            <p className="text-text-secondary typo-callout">
              Everything that is not one of these three is a link in content: a row,
              a card, or a chip drawn as a link.
            </p>
          </div>
        </div>
        <Table
          head={['#', 'Rule', 'What it means']}
          rows={tabRules.map((rule) => [
            <span key={rule.id} className="font-bold tabular-nums text-text-primary">
              {rule.id}
            </span>,
            <span key={rule.rule} className="font-bold text-text-primary">
              {rule.rule}
            </span>,
            rule.detail,
          ])}
        />
      </Section>

      <Section
        title="Segments: the look"
        description="Tsahi rejected the underline, the track and then the filled pills (too big, too dominant, busy). The pick is the product's own chip, the one the feed strip draws today: quiet text, a soft tonal fill with a hairline on the active one. Every phone in the Storybook uses it; the seven other treatments are in the archive story Tab rows and segments."
      >
        <div className="flex flex-wrap items-start gap-6">
          <RowSpecimen label="Quiet (the pick)" note={segmentLookNotes[SegmentLook.Quiet]}>
            <Segments
              items={['For you', 'Happening now', 'Following']}
              active={1}
              look={SegmentLook.Quiet}
              trailing={
                <span className="ml-auto flex size-8 shrink-0 items-center justify-center text-text-tertiary">
                  <PlusIcon size={IconSize.Small} />
                </span>
              }
            />
          </RowSpecimen>
          <div className="w-[23.4375rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
            <Segments items={['Quick saves', 'Read it later', 'Frontend picks']} active={0} look={SegmentLook.Quiet} />
          </div>
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Decided: the product's own chip, one size, one primary">
            Nothing invented. Segments are the chip the feed strip already
            draws, at the chip size: 28px, footnote bold, the active one on
            a soft tonal fill with a hairline, the rest plain tertiary text.
            Filter chips are the same chip hairline-outlined, and the active
            one is a primary button, black on white and white on black, so
            the one filter you are in is unmistakable. Link chips are the
            same chip with a hairline and no state, the way the tag directory
            draws its recommended tags today. Menus stay text with a chevron.
            The squad page redesign uses the same hairline and tonal pills,
            so the phone matches it.
          </Callout>
          <Callout title="Why the levels still read apart">
            Plain text with one tonal pill means "the views of this page"; a
            row of outlined chips with one solid one means "narrow this list";
            outlined chips with a hash and no state mean "go somewhere". State
            does the work, and no two rows stack on one page.
          </Callout>
        </div>
      </Section>

      <Section
        title="One look per level"
        description="The two row components at 1:1. Both inset 16 to line up with the content padding and the top buttons."
      >
        <div className="flex flex-wrap gap-8">
          <RowSpecimen
            label="Segments"
            note="The product's chip: 28px in a 44px row, footnote bold, the active one on a soft tonal fill with a hairline, the rest plain tertiary text. Scrolls sideways when it must, the selected one scrolled into view. An optional trailing control (+, a sort icon)."
          >
            <Segments items={['For you', 'Happening now', 'Following']} active={1} />
          </RowSpecimen>
          <RowSpecimen
            label="Chips"
            note="The same 28px chip, hairline-outlined, the active one a primary button (black on white, white on black). One row that scrolls sideways; wraps only for the A to Z index."
          >
            <Chips items={activityTypes} active={0} />
          </RowSpecimen>
          <RowSpecimen
            label="Chips as links"
            note="Same chip, regular weight, no selection: a row of places to go (Recommended tags, Related tags). It never pins and never swipes."
          >
            <Chips items={['#react', '#nextjs', '#webdev', '#typescript', '#vite']} tone={ChipTone.Link} />
          </RowSpecimen>
          <RowSpecimen
            label="Menu"
            note="Small plain text with a chevron, no fill, on a list header line (Explore feed) or on the active segment (Happening now). Opens a sheet; the label shows the choice. On Explore the sheet holds the five sorts and, for Upvoted and Discussed only, the period (production offers a period for those two sorts alone)."
          >
            <div className="flex h-11 items-center justify-between px-4">
              <span className="font-bold typo-title3">Explore feed</span>
              <MenuLabel>Popular</MenuLabel>
            </div>
          </RowSpecimen>
        </div>
      </Section>

      <Section
        title="Try it: how rows behave on scroll"
        description="Scroll each phone. The row lives in the top block; the block hides while you read and comes back on a nudge up; the bottom cluster shrinks as everywhere else."
      >
        <PhoneRow>
          <Cell label="Squad page" verdict={Verdict.Ship} note="Cover edge to edge (chapter 4); once the intro has passed the block turns solid with the name and Posts · About; reading on hides the block, a nudge up brings it back (chapter 4e). Both segments have URLs.">
            <SquadScroll />
          </Cell>
          <Cell label="Profile" verdict={Verdict.Ship} note="About · Posts · Replies · Upvoted behave the same way; the three standalone pages become this page scrolled here.">
            <ProfileScroll />
          </Cell>
          <Cell label="Home, Happening now" verdict={Verdict.Ship} note="Segments pin under the status bar as decided in chapter 4. No second row: the channel lives in the segment's menu and on the list header line.">
            <HomeScroll />
          </Cell>
          <Cell label="Explore feed" verdict={Verdict.Ship} note="The places scroll away; the order is a small menu on the feed's header line, so nothing pins. The search field stays at the bottom.">
            <ExploreFeedDemo />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="Squads root, long list" verdict={Verdict.Ship} note="Scroll down: Your squads and the Discover heading scroll off and the category chips join the block under the name row; reading on hides the whole block; a short scroll up brings it back with the chips. The field stays compact at the bottom.">
            <SquadsScroll />
          </Cell>
          <Cell label="Activity root, long list" verdict={Verdict.Ship} note="The model: name row and type chips are one block; reading down hides it, a nudge up brings it back, the list never reflows.">
            <ActivityScroll />
          </Cell>
        </PhoneRow>
        <Callout title="What pins, in one sentence">
          Nothing at the top is permanently pinned: the block (brand row or
          buttons, plus the page&apos;s row) hides while you read and returns
          on a short scroll up; the bottom cluster shrinks and grows with the
          scroll direction. Chapter 4e has every page.
        </Callout>
      </Section>

      <Section
        title="Page by page, under the rules"
        description="The pages that change most, today beside the proposal."
      >
        <div className="flex flex-col gap-10">
          <Compare
            before={<Shot src="/mobile-ux/prod-tabs-tags.jpg" label="Tags directory" note="Strip + navbar + letters." width={260} />}
            after={
              <Cell label="Tags directory" verdict={Verdict.Ship} note="A leaf under Explore: back button, heading, search, Recommended as links, the A to Z index as the one chip row.">
                <TagsDirectoryStill />
              </Cell>
            }
          />
          <Compare
            before={<Shot src="/mobile-ux/prod-tabs-tag-react.jpg" label="Tag page" note="All tags · React · Next.js · Web Development." width={260} />}
            after={
              <Cell label="Tag page" verdict={Verdict.Ship} note="Back button, hero with Follow, Related as a chip row of links, the feed.">
                <TagPageStill />
              </Cell>
            }
          />
          <Compare
            before={<Shot src="/mobile-ux/prod-tabs-squads-discover.jpg" label="Squads directory" note="Discover · Featured · categories as tabs." width={260} />}
            after={
              <Cell label="Squads root" verdict={Verdict.Ship} note="Your squads first, then Discover with one chip row of categories that pins when it reaches the top. Featured is a section.">
                <SquadsRootStill />
              </Cell>
            }
          />
          <PhoneRow>
            <Cell label="Activity" verdict={Verdict.Ship} note="Name in the brand row, then the type chips pinned under it: slices of one stream, so chips. Same items as today, with a URL.">
              <ActivityStill />
            </Cell>
            <Cell label="Bookmarks" verdict={Verdict.Ship} note="A leaf under You: name beside the back button; the lists are segments with URLs (Quick saves · Read it later · folders · +) because each is a different list; Sort and the menu float top right.">
              <BookmarksStill />
            </Cell>
            <Cell label="Search results" verdict={Verdict.Ship} note="The query in the top row, the counts, then Posts · Squads · People · Tags as segments (different things), Filters floating.">
              <SearchResults />
            </Cell>
          </PhoneRow>
        </div>
      </Section>

      <Section
        title="Fix list"
        description="Fifteen changes, grouped by the PR in chapter 10 that closes them. 2.1 ships the row family and the Home row; the rest move the remaining rows onto it, page by page."
      >
        {fixPrs.map((pr) => (
          <div key={pr} className="flex flex-col gap-2">
            <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
              PR {pr}
            </span>
            <Table
              head={['#', 'Fix']}
              rows={tabFixes
                .filter((fix) => fix.pr === pr)
                .map((fix) => [
                  <span key={fix.id} className="font-bold tabular-nums text-text-primary">
                    {fix.id}
                  </span>,
                  fix.fix,
                ])}
            />
          </div>
        ))}
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why segments pin under the buttons, not behind them">
            The top buttons never move (chapter 3b). A pinned row sliding
            behind them would be half hidden, and moving it above them would
            put a bar over the content the buttons float on. Docking the row
            under the button band and giving the band the same material at
            that moment gives one 96px bar with the buttons inside it, which
            is what X and Threads do when a profile scrolls.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Why chips filter and never navigate">
            A chip that leaves the page (All tags, a related tag, a Home chip
            for Leaderboard) breaks the promise the row makes: tap here and
            the list below changes. Keeping links out of chip rows is what
            lets a member predict a tap, and it is why the Home strip shrinks
            from fifteen items to three.
          </Callout>
          <Callout title="Swipe">
            Only segments swipe, with the axis lock from chapter 7. The
            Happening now channels stop swiping; that is the row the feedback
            in chapter 1 was about, and a chip row that scrolls sideways
            should not also change on a sideways flick.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No second sticky header above a row. No row of tabs where the
            items are other pages. No tab without a URL. No row with nothing
            selected. No tab named differently from its page. No purple, no
            capsules, no tab bar duplicates.
          </Callout>
        </div>
        <Quote>One bar, one row of views, one row of filters. Everything else is a link.</Quote>
        <DigIn title="Implementation notes">
          <p>
            Two shared components replace the six in use: Segments (items with
            hrefs or a tab= value, shallow routing, role tablist, axis-locked
            swipe on the content it controls, scrolls the selected item into
            view) and Chips (items with a query value, no swipe). Both read the
            selected item from a route prefix match, never an exact one.
            Pinning is CSS: the row is position sticky with top set to the
            band height on leaves (52px plus the safe area) and 0 on Home; an
            IntersectionObserver on a one-pixel sentinel above the row toggles
            the material on the row and on the band, and browsers with
            scroll-driven animations get the fade on an animation-timeline
            instead. One z-index token for pinned rows, below the floating
            chrome. TabContainer and TabList stay on desktop; UnifiedMobileFeedNav,
            TagPageNavbar, the Explore FeedExploreHeader branch and the
            tablet-only strip on notifications are deleted on phones.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="4c" />
      </Section>
    </Page>
  ),
};
