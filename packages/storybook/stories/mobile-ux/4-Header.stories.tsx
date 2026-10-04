import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
  Section,
  Table,
  Verdict,
  ChapterStatus,
  Status,
} from './kit';
import {
  PageBar,
  ProposedHomeHeader,
  TodayChips,
  TodayHeadlinesHeader,
  TodayLogoRow,
  TodayPostBar,
  TodaySearchHeader,
  TodayTagHeader,
} from './mocks';
import { ProposedHome, TodayTag } from './screens';
import { BarMaterial } from './floating';
import { Circle, LeafTop, PostStill } from './chrome';
import { ProfileScroll, SquadScroll, TagScroll } from './scrollPages';
import {
  CoverKind,
  CoverRestStill,
  CoverTodayStill,
  coverBenchmarks,
  coverNotes,
  wrapperNotes,
} from './covers';
import { VisitorHomeDemo, VisitorLeafStill } from './visitors';
import { SourceAvatar } from './mocks';
import { posts } from './data';
import { headerActions } from './pages';

const meta: Meta = {
  title: 'Mobile UX/4. Header',
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

const Action = ({ children }: { children: React.ReactNode }) => (
  <span className="flex size-10 items-center justify-center text-text-secondary">
    {children}
  </span>
);

export const Header: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="How much do we draw above the first card, and does it ever come back?"
        title="Two headers in the whole app: a Home header that collapses to one row, and one leaf header every other screen shares, drawn as floating buttons rather than a bar, and never repeating what the content already says."
      >
        <p>
          Today nine different top bars exist because each page grew its own.
          The Home header holds 108 fixed pixels and never gives them back;
          the Tags page holds three navigation rows and a marketing hero. Apple
          collapses large titles on scroll, Material returns the bar on any
          upward scroll (enterAlways), and Reddit&apos;s attempt to un-fix the
          header entirely was rejected by users (chapter 2). Minimize, keep
          one row pinned, standardize the rest.
        </p>
        <ChapterNav current="4" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Home header collapses to the segments; leaves get back and action buttons only; nothing repeats the first content row; no title box. Round 5 adds the visitor header (variant A, confirmed), edge-to-edge covers on squads and profiles, and moves page names to chapter 4d.
      </Status>

      <Callout title="Archived from this chapter">
        The round 3 PageBar strips, the round 3 tag page, the scrolled Home
        header with pinned segments, the four-segment row, visitor headers B
        and C and the header budget table now live in Mobile UX / Archive /
        Headers, titles and covers. This chapter keeps only what is decided.
      </Callout>

      <Goal
        goal="One header system, a fixed budget of 44px while reading, and a back affordance on every screen that is not a root."
        metric="Fixed chrome height on Home while scrolled (108 to 44), and the first card fully visible at load on a 667pt phone for every Explore-family page."
      />

      <Section
        title="Today's top bars, side by side"
        description="Captured from the code and the screenshots in chapter 1. Same app, six shapes."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="Home / Bookmarks / History" note="MobileFeedActions + UnifiedMobileFeedNav">
            <Strip>
              <TodayLogoRow />
              <TodayChips />
            </Strip>
          </Cell>
          <Cell label="Explore" note="SpotlightTrigger + FeedExploreHeader with a desktop offset">
            <Strip>
              <TodaySearchHeader />
            </Strip>
          </Cell>
          <Cell label="Headlines" note="HighlightsPage gradient title + swipeable TabContainer">
            <Strip>
              <TodayHeadlinesHeader />
            </Strip>
          </Cell>
          <Cell label="Post" note="GoBackHeaderMobile + PostHeaderActions">
            <Strip>
              <TodayPostBar />
            </Strip>
          </Cell>
          <Cell label="Tag page" note="Tag tabs + centred hero; no back, no title bar">
            <Strip>
              <TodayTagHeader />
            </Strip>
          </Cell>
        </div>
      </Section>

      <Section
        title="Home header"
        description="Brand row: logo left, streak and avatar right, flat on the page. Segmented row: the feeds. The brand row slides up with the scroll, its height shrinking with it, so the segments follow without a jump; scroll up and it slides back the same way. A Slack-style floating version was tried and reverted."
      >
        <PhoneRow>
          <Cell label="At rest" verdict={Verdict.Ship} note="92px. Logo, streak, avatar, then the feed segments with the + for a custom feed.">
            <ProposedHome />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="What is in the brand row">
            Logo on the left. On the right: the streak and the avatar, flat
            on the page (floating chrome is for leaves and the bottom
            cluster; the root header is content). The streak opens the
            streak sheet, the avatar opens the You page. The gear is gone,
            the bell was already in the bar, and search lives on Explore. The streak stays because it is
            the one number worth a glance on every open, and it opens the same
            drawer it does today.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Search: the Explore field, one tap away">
            Our search is Spotlight, a palette that finds posts, tags,
            sources, people and squads. Two placements were tried on Home
            (a header icon, then a Slack-style square beside the bar) and
            both read as a duplicate of Explore&apos;s field, so search stays
            where the Explore tab already puts it: the floating field above
            the cluster, which opens Spotlight as a sheet.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Segments, not chips">
            For you · Happening now · Following · your custom feeds · +.
            Following includes the posts from squads you joined. Text with an
            underline indicator, swipeable with an axis lock,
            the default segment is a setting (Threads). Sort and feed
            settings move into a sheet behind a small control at the end of
            the row, not a separate sticky block.
          </Callout>
        </div>
        <Strip>
          <ProposedHomeHeader />
        </Strip>
        <div className="flex flex-wrap gap-6">
          <Cell label="With two custom feeds" note="Custom feeds slot in after Following; the row scrolls once it overflows and the + stays pinned at the end.">
            <Strip>
              <ProposedHomeHeader segments={['For you', 'Happening now', 'Following', 'Rust', 'AI infra']} />
            </Strip>
          </Cell>
        </div>
        <DigIn title="Why For you · Happening now · Following">
          <p>
            The row holds feeds, not places: things you scroll in the same
            card format that differ by what is in them. For you is the
            default. Happening now is the feed we publish (today&apos;s
            Headlines tab, under the name the page already uses), one tap from
            Home so removing its footer tab loses nothing. Following is everything a
            member chose to follow: sources, tags, people, and the posts from
            the squads they joined, so squad posts finally have one place to
            be read together without a fourth segment. The plus adds a custom
            feed (tags, sources, squads) which becomes a segment of its own.
            Tsahi&apos;s call in round four.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Rule zero: nothing appears twice"
        description="Tsahi's catch on the first draft: the post header showed the source name and meta, and the content row right under it showed the same source, avatar and meta, with a menu in both. X's post screen is the model: the bar says only where you are, the content says who and what, once."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="First draft" note="PageBar repeats the source and carries a second menu.">
            <Strip>
              <PageBar
                title="DEV"
                subtitle="7m read · May 16"
                actions={
                  <>
                    <Action>
                      <ShareIcon size={IconSize.Small} />
                    </Action>
                    <Action>
                      <MenuIcon size={IconSize.Small} />
                    </Action>
                  </>
                }
              />
              <div className="flex items-center gap-2 px-4 py-3">
                <SourceAvatar post={posts[0]} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold typo-footnote">DEV</span>
                  <span className="text-text-tertiary typo-caption1">7m read time · May 16</span>
                </div>
                <MenuIcon size={IconSize.Small} className="text-text-secondary" />
              </div>
            </Strip>
          </Cell>
          <Cell label="Now" verdict={Verdict.Ship} note="Floating back, share and menu buttons; the source row exists once, in the content, with no second menu.">
            <div
              style={{ width: 375 }}
              className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
            >
              <div className="absolute inset-x-0 top-2 z-2">
                <LeafTop
                  material={BarMaterial.Glass}
                  p={0}
                  actions={
                    <>
                      <Circle material={BarMaterial.Glass} fixed>
                        <ShareIcon size={IconSize.Small} />
                      </Circle>
                      <Circle material={BarMaterial.Glass} fixed>
                        <MenuIcon size={IconSize.Small} />
                      </Circle>
                    </>
                  }
                />
              </div>
              <div className="flex items-center gap-2 px-4 pb-3 pt-16">
                <SourceAvatar post={posts[0]} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold typo-footnote">DEV</span>
                  <span className="text-text-tertiary typo-caption1">May 16 · 7m read time</span>
                </div>
              </div>
            </div>
          </Cell>
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="The rule">
            The top chrome carries navigation (back), the screen&apos;s own
            actions (share, menu, follow) and nothing else. It never carries a
            name, an avatar or a date that the first content row shows.
          </Callout>
          <Callout tone={CalloutTone.Good} title="One menu per screen">
            The screen&apos;s menu lives in the top-right button. Content
            rows on that screen (the post&apos;s source row, a squad&apos;s
            hero) do not get a second menu; comments and feed cards keep
            theirs because they are separate objects.
          </Callout>
        </div>
      </Section>

      <Section
        title="The leaf header: PageBar content, floating"
        description="Chapter 3b turned the bar into floating buttons (back on the left, actions on the right, nothing in the middle). The content spec below is unchanged; the strips show what each screen puts in those pieces. Full-width docked rendering is the reduced-transparency and mobile-web fallback."
      >
        <PhoneRow>
          <Cell label="Post, at rest" note="Back, share and menu; nothing in the middle.">
            <PostStill p={0} />
          </Cell>
          <Cell label="Post, scrolled" note="Same buttons, same size, same place; only the content scrolls under them.">
            <PostStill p={1} />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="What floats and what does not, page by page"
        description="Tsahi asked whether text actions like Follow should float in the header too. No. The floating row holds icon-only square buttons (back, share, menu, search, sort, settings, filters). Text actions (Follow, Join, Save, Read post, Buy cores) live once in the content next to the thing they act on, because a floating text button repeats the hero's button and reads as a second, unrelated control. The one exception is Save on a form page, drawn as a check icon, because it belongs to the whole page."
      >
        <Table
          head={['Page', 'Floating top row', 'In the content', 'Why']}
          rows={headerActions.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.floating,
            row.inContent,
            row.why,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Icon buttons float">
            Back, Share, Menu, Sort, Filters, Settings, and Save as a check
            mark. Always 38px squares (smaller than the bar, Telegram&apos;s
            proportion), always the same positions: back left, actions
            right, at most two on the right.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Text buttons do not float">
            Follow, Join, Award, Read post, Buy cores, New Squad. They sit in
            the hero or the content once. Today&apos;s profile header shows
            Follow twice (sticky bar and hero); the floating row fixes that by
            carrying only Back and Menu.
          </Callout>
        </div>
      </Section>

      <Section
        title="Tag page, before and after"
        description="The clearest case: a marketing hero and no way back, versus a bar and the posts."
      >
        <Compare before={<TodayTag />} after={<TagScroll />} />
        <DigIn title="Large-title behaviour for tag, source and squad">
          <p>
            The hero (name, count, description, cover) stays but scrolls with
            the content, Apple large-title style. The PageBar title is empty
            until the hero&apos;s name crosses under the bar, then fades in.
            Follow / Join are in the hero and repeat in the bar once the hero
            is gone. This keeps SEO content and the identity moment without
            spending 300px of every visit on them.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Covers: edge to edge"
        description="Tsahi's call: now that the buttons float, the squad and profile cover can take the whole top of the screen, status bar included, the way X does it. Today the cover starts under a bar, so the top strip is empty chrome and the image is shorter."
      >
        <PhoneRow>
          <Cell label="Today · squad" verdict={Verdict.Skip} note="A 48px bar, then the cover. The bar carries nothing but the back arrow.">
            <CoverTodayStill kind={CoverKind.Squad} />
          </Cell>
          <Cell label="Proposed · squad, scroll it" verdict={Verdict.Ship} note="The cover starts under the status bar (light status text), the buttons float over it, the mark overlaps its bottom edge. Scroll: half-speed parallax; once the intro has passed the block turns solid with the name and Posts · About; reading on hides the block, a nudge up brings it back.">
            <SquadScroll />
          </Cell>
          <Cell label="Today · profile" verdict={Verdict.Skip} note="The ‹ Profile bar, then the cover.">
            <CoverTodayStill kind={CoverKind.Profile} />
          </Cell>
          <Cell label="Proposed · profile, scroll it" verdict={Verdict.Ship} note="Same mechanics; the avatar ring and the Follow button are unchanged.">
            <ProfileScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="Squad at rest" note="For the gallery: the still of the top of the page.">
            <CoverRestStill kind={CoverKind.Squad} />
          </Cell>
          <Cell label="Profile at rest">
            <CoverRestStill kind={CoverKind.Profile} />
          </Cell>
        </PhoneRow>
        <Table
          head={['Part', 'Spec']}
          rows={coverNotes.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Table
          head={['App', 'Cover position', 'Over the cover', 'On scroll and status bar']}
          rows={coverBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
        <DigIn title="What the web page and the wrapper must do">
          <Table
            head={['Where', 'What']}
            rows={wrapperNotes.map((row) => [
              <span key={row[0]} className="font-bold text-text-primary">
                {row[0]}
              </span>,
              row[1],
            ])}
          />
        </DigIn>
      </Section>

      <Section
        title="Visitors: the same header logged out"
        description="Production (main, after this branch: the mobile app header PRs) shows visitors a 56px row with the logo, Log in (tertiary, small) and Open app (primary, small, the r.daily.dev/get smart link). It sits inside the sticky strip on tags, sources and leaderboard, above the search header on Explore, in the back bar on posts, squads and the ‹ Profile bar, and in the Squads row where New Squad was. Changing the header changes all of this, so the visitor header is designed here, not left to fall out."
      >
        <PhoneRow>
          <Cell label="Root, scroll it" verdict={Verdict.Ship} note="Log in and Open app sit where members see the streak and avatar. The brand row slides away on scroll exactly as it does for members; the segments stay.">
            <VisitorHomeDemo />
          </Cell>
          <Cell label="A · Leaf, floating pair" verdict={Verdict.Ship} note="Back on the left; Log in (material) and Open app (filled) on the right, the same 38px height and 14px radius as every top button. The one place text floats, because these two belong to the shell, not to the content.">
            <VisitorLeafStill />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why A">
            One header grammar for members and visitors: the right side of
            the brand row and of the leaf row is &quot;who you are&quot;
            (streak and avatar) or &quot;become someone&quot; (Log in, Open
            app). Nothing else moves, and the logged-out prompt work in the
            mobile header and sticky footer folders plugs into the same two
            slots.
          </Callout>
          <Callout title="What visitors get and do not get">
            Today the visitor bar has Home and Activity pointing at
            onboarding, no Bookmarks, a floating plus that links to
            onboarding, and no bottom sign-up banner on phones (the strips
            are tablet and up). Under the system: the same four tabs, with
            Home and Activity opening the login sheet in place; the Create
            square opens it too; the segments are Popular · Happening now ·
            Discussions instead of For you · Happening now · Following. The
            two buttons keep the production variants (tertiary and primary,
            small) and the smart link.
          </Callout>
        </div>
      </Section>

      <Section
        title="Budget, page by page"
        description="The today-versus-proposed pixel table from round 3 (PageBar 48, 44px while reading) is in the archive story Headers, titles and covers; nothing at the top is permanently pinned any more. The two notes below still apply."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Two bugs to fix regardless">
            The Explore blank band is FeedExploreHeader&apos;s
            top-[4.5rem] sticky offset clearing a header phones do not have.
            The logged-out empty logo row is MobileFeedActions with nothing on
            the right; dailydotdev/apps#6731 fills it with Log in + Open app.
          </Callout>
          <Callout title="Scroll behaviour spec">
            One scroll progress drives it: the brand row translates up by
            48px × p and its slot shrinks with it, so the segmented row rides
            up smoothly instead of snapping; the row gains blur past the
            half-way point. Any scroll up reverses it at the same rate.
            Reduced motion turns the interpolation into a cut. In production
            this is a scroll-driven animation (Safari 26+, Chrome 115+) with
            a JS fallback for direction.
          </Callout>
        </div>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="4" />
      </Section>
    </Page>
  ),
};
