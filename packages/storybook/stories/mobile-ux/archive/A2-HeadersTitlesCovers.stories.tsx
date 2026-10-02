import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArchiveNav,
  Callout,
  Cell,
  ChapterStatus,
  Compare,
  DigIn,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
  Table,
  Verdict,
} from '../kit';
import { PageBar, ProposedHomeHeader } from '../mocks';
import { ProposedHome, ProposedTag, TodayTag } from '../screens';
import { VisitorBarLeafStill, VisitorFlatLeafStill } from '../visitors';
import { galleryPages } from '../gallery';
import {
  BookmarksAt,
  RootTitleDemo,
  TitleScroll,
  TitleScrollDemo,
  TitleSize,
  titleSizes,
} from '../titles';
import { EdgeStyle } from '../chrome';
import { CoverDemo, CoverKind } from '../covers';

const meta: Meta = {
  title: 'Mobile UX/Archive/Headers, titles and covers',
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

const budget = [
  ['Home', 'Logo row 48 + chips 60 = 108, sticky', 'Brand 48 + segments 44 = 92 at rest, 44 scrolled'],
  ['Explore', 'Search 64 + blank 80 + sort 50 = 194', 'Search field 60 as the header; sort inside the Popular page'],
  ['Discussions / Leaderboard', 'Logo 48 + chips 60 = 108', 'PageBar 48 (they are Explore leaves)'],
  ['Tags directory', 'Logo 48 + chips 60 + tabs 50 + hero 260', 'PageBar 48 + search field'],
  ['Tag page', 'Tabs 50 + centred hero 300', 'PageBar 48 with Follow; hero collapses into it'],
  ['Source / Squad page', 'Logo 32 or chevron 48 + cover 112 + actions', 'PageBar 48 over the cover; title fades in on scroll'],
  ['Headlines', 'Gradient title 56 + channels 50', 'Home segment: 44 (channels as a second row inside)'],
  ['Post', 'Back bar 48 (+ auth 56 + logo 48 logged out)', 'PageBar 48'],
  ['Activity', 'Title row 56', 'Title row 48, no back (root)'],
  ['Settings', 'Drawer bar 56', 'PageBar 48 (it becomes a page)'],
];

const archived = [
  ['Leaf header as a 48px PageBar, screen by screen', '4', 'Round 4: top back and action buttons are fixed 38px squares; no floating title box', 'The bar became floating buttons and the name moved to chapter 4d, so the round 3 strips no longer match the chrome.'],
  ['Tag page, round 3 after', '4', 'Round 5: page titles live in the top header area; the whole top block hides', 'Built on the PageBar with Follow in the bar. TagScroll in chapter 4 is the decided page.'],
  ['Home scrolled: segments pinned on a blur', '4', 'Round 5: pinned rows and the top band are solid page background; the whole top block hides', 'Segments no longer pin under a blurred band. Chapter 4e has the hiding block.'],
  ['Four fixed segments (For you · Following · Headlines · Squads)', '4', 'Round 4: Home feed row is For you · Happening now · Following · +', 'Too much row before a member has added anything, and Squads already has a tab.'],
  ['Visitor header B, flat row', '4', 'Round 5: visitors get the same header, confirmed by Tsahi (A)', 'Roots and leaves get different tops and the bar returns.'],
  ['Visitor header C, bottom bar', '4', 'Round 5: visitors get the same header, confirmed by Tsahi (A)', 'Loses Home and Explore for visitors.'],
  ['Duplicate Visitors story', '4', 'Round 5: visitors get the same header, confirmed by Tsahi (A)', 'The same cells rendered twice. The Header story keeps the root demo and A.'],
  ['Header budget table (PageBar 48, 44px while reading)', '4', 'Round 5: nothing at the top is permanently sticky', 'The budget counted pixels for a pinned bar. Nothing pins now, so the table is history.'],
  ['Every page, round 4 gallery', '4b', 'Round 5: in-content headings withdrawn; Happening now has no second row; no glass effect', 'Glass material, headings in the content and a channel row under the segments. Chapters 4d and 4e redraw the pages.'],
  ['Title in content at 24 and 32', '4d', 'Round 5: one title size, the page name is 20px wherever it appears', 'Pushes the lists down and repeats what the row can say; 32 is bigger than any name in the app.'],
  ['Squad cover with pinned segments (CoverDemo)', '4d', 'Round 5, revised: things start transparent over the cover and turn solid with the name; the block hides while reading', 'SquadScroll is the decided page.'],
  ['Activity root with pinned chips (RootTitleDemo)', '4d', 'Round 5, revised: the whole top block hides as one solid piece', 'ActivityScroll is the decided page.'],
  ['On scroll: title stays over a soft edge (A), title leaves and buttons float (B), title stays on a solid band (C)', '4d', 'Round 5, revised: the soft scroll edge and the always-floating leaf buttons are withdrawn', 'D, the block hides, is the pick. The gradient did not read right and a band that stays reads as a bar.'],
];

export const HeadersTitlesCovers: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive · chapters 4, 4b and 4d"
        title="Headers, titles and covers: the arms that were rejected, superseded or parked, kept here so the live chapters show only what is decided."
      >
        <p>
          Nothing on this page is built from. Each item names the chapter it
          came from and the decision row that retired it, quoted from the
          decisions log. The live chapters (4. Header, 4b. Every page, 4d. Page
          titles) carry the decided version of each.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="5">
        Reference only. Collected in round 5 from chapters 4, 4b and 4d; nothing here changes
        a decision.
      </Status>

      <ArchiveNav />

      <Section
        title="What is here and why"
        description="One row per archived item. Retired by quotes the decision row in a few words."
      >
        <Table
          head={['Item', 'Chapter it came from', 'Retired by', 'Why']}
          rows={archived.map((row) => [
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
        title="Chapter 4 · The leaf header as a PageBar, screen by screen"
        description="Round 3. A 48px bar with a back chevron, a title with an optional subtitle and at most two actions, on every screen that is not a tab root. Superseded by the floating buttons (chapter 3b), the 20px name beside the back button (chapter 4d) and the hiding block (chapter 4e)."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="Post" verdict={Verdict.Skip} note="Back, share, menu; the source named once, in the content.">
            <Strip>
              <PageBar
                title="The Rust Blog"
                subtitle="shown on scroll only"
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
            </Strip>
          </Cell>
          <Cell label="Tag" verdict={Verdict.Skip} note="Follow in the bar. Round 4 moved text actions into the content; round 5 put Join or Follow at the right edge of the solid block.">
            <Strip>
              <PageBar
                title="#javascript"
                subtitle="54.1K stories"
                actions={
                  <>
                    <span className="mr-1 flex h-8 items-center rounded-10 bg-text-primary px-3 font-bold text-surface-invert typo-footnote">
                      Follow
                    </span>
                    <Action>
                      <MenuIcon size={IconSize.Small} />
                    </Action>
                  </>
                }
              />
            </Strip>
          </Cell>
          <Cell label="Squad" verdict={Verdict.Skip} note="Title fades in as the cover scrolls under the bar; search this squad as an action.">
            <Strip>
              <PageBar
                title="daily.dev Changelog"
                subtitle="11.5K members"
                actions={
                  <>
                    <Action>
                      <SearchIcon size={IconSize.Small} />
                    </Action>
                    <Action>
                      <MenuIcon size={IconSize.Small} />
                    </Action>
                  </>
                }
              />
            </Strip>
          </Cell>
          <Cell label="Profile" verdict={Verdict.Skip} note="Follow in the bar, Award in the hero.">
            <Strip>
              <PageBar
                title="Maya Chen"
                subtitle="@mayachen"
                actions={
                  <>
                    <span className="mr-1 flex h-8 items-center rounded-10 border border-border-subtlest-secondary px-3 font-bold typo-footnote">
                      Follow
                    </span>
                    <Action>
                      <MenuIcon size={IconSize.Small} />
                    </Action>
                  </>
                }
              />
            </Strip>
          </Cell>
          <Cell label="Settings" verdict={Verdict.Skip} note="Settings as a page under You, with the bar.">
            <Strip>
              <PageBar title="Settings" />
            </Strip>
          </Cell>
          <Cell label="Activity (root)" verdict={Verdict.Skip} note="Roots used the same bar without the chevron. Round 5 puts the root name in the brand row instead.">
            <Strip>
              <PageBar
                leading={<span className="w-3" />}
                title="Activity"
                actions={
                  <Action>
                    <SettingsIcon size={IconSize.Small} />
                  </Action>
                }
              />
            </Strip>
          </Cell>
        </div>
      </Section>

      <Section
        title="Chapter 4 · Tag page, round 3 after"
        description="The round 3 before and after. The after put the tag name and Follow in a PageBar; the decided page (TagScroll, chapter 4) keeps the hero in the content and hides the block while reading."
      >
        <Compare before={<TodayTag />} after={<ProposedTag />} afterLabel="Round 3 proposal" />
      </Section>

      <Section
        title="Chapter 4 · Home header arms"
        description="Two cells from the Home header section. The scrolled state pinned the segments on a blurred band; round 5 made every pinned row solid and then took the whole block away while reading. The four-segment row was rejected in round 4."
      >
        <PhoneRow>
          <Cell label="Home, scrolled (round 4)" verdict={Verdict.Skip} note="44px. The brand row has slid up; the segmented row pins with a blurred background; the bar is compact.">
            <ProposedHome collapsed />
          </Cell>
          <Cell label="Four fixed segments" verdict={Verdict.Skip} note="Round three's row (For you · Following · Headlines · Squads). Too much row before a member has added anything, and Squads already has a tab.">
            <Strip>
              <ProposedHomeHeader segments={['For you', 'Following', 'Headlines', 'Squads']} />
            </Strip>
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 4 · Visitor header, B and C"
        description="The two alternatives to A (Log in and Open app floating beside the back button, confirmed by Tsahi). Both were on the page as reference and rendered a second time in a duplicate Visitors story."
      >
        <PhoneRow>
          <Cell label="B · Leaf, flat row" verdict={Verdict.Skip} note="Today's bar tidied: back, Log in and Open app in one pinned 48px row. Keeps the actions visible forever, but roots and leaves get different tops and the bar returns.">
            <VisitorFlatLeafStill />
          </Cell>
          <Cell label="C · Visitor bar at the bottom" verdict={Verdict.Skip} note="Top keeps only the back button; the bottom cluster becomes Log in · Open app under the thumb. Strong for conversion; loses Home and Explore for visitors.">
            <VisitorBarLeafStill />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 4 · Header budget, round 3"
        description="Pixels above the first content row on a 375pt phone, today versus the round 3 proposal. The proposed column counts a 48px PageBar and a 44px reading budget; neither exists now that nothing at the top is permanently pinned."
      >
        <Table
          head={['Page', 'Today', 'Proposed (round 3)']}
          rows={budget.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Chapter 4b · Every page, round 4 gallery"
        description="Nineteen page types drawn with the round 4 system at rest: glass material, roots with a content heading, leaves with the back button and their heading in the content, Happening now with a channel row under the segments. Chapter 4d put the name in the top row at 20px and chapter 4e made the block hide, so every page here has a newer drawing."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-10">
          {galleryPages.map((page) => (
            <Cell key={page.name} label={page.name} verdict={Verdict.Skip} note={page.note}>
              {page.render()}
            </Cell>
          ))}
        </div>
      </Section>

      <Section
        title="Chapter 4d · The name in content, two sizes"
        description="Bookmarks with the heading first in the content, at 24 and at 32. The pick is the 20px name beside the back button."
      >
        <PhoneRow>
          <Cell label={`In content · ${titleSizes[TitleSize.Title]}`} verdict={Verdict.Skip} note="The round 4 draft: a 24px heading first in content. Reads well but pushes the lists down and repeats what the row could say.">
            <BookmarksAt size={TitleSize.Title} />
          </Cell>
          <Cell label={`In content · ${titleSizes[TitleSize.Large]}`} verdict={Verdict.Skip} note="The first tabs draft at 32px. Withdrawn: bigger than any name in the app.">
            <BookmarksAt size={TitleSize.Large} />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 4d · Things and roots before the hiding block"
        description="Scroll both. The squad cover collapsed under a band that stayed, with the segments pinned under it; the Activity brand row slid away and the type chips pinned. Round 5 revised both: the block turns solid with the name and then hides while reading (SquadScroll and ActivityScroll in chapters 4 and 4c)."
      >
        <PhoneRow>
          <Cell label="Squad page, pinned band" verdict={Verdict.Skip} note="Cover edge to edge, the name at 24 in the hero; on scroll the name fades into the top row as the band turns solid and the segments pin under it.">
            <CoverDemo kind={CoverKind.Squad} />
          </Cell>
          <Cell label="Profile, pinned band" verdict={Verdict.Skip} note="Same mechanics on a profile.">
            <CoverDemo kind={CoverKind.Profile} />
          </Cell>
          <Cell label="Activity root, pinned chips" verdict={Verdict.Skip} note="Activity where Home has the logo; the row slides away and the type chips pin.">
            <RootTitleDemo />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Chapter 4d · On scroll: the three set-aside arms"
        description="Bookmarks scrolled three ways that were on the table beside D (the block hides, solid). Scroll each."
      >
        <PhoneRow>
          <Cell label="A · Title stays, soft edge" verdict={Verdict.Skip} note="Apple's iOS 26 scroll edge effect under a title that stays. The gradient did not read right, and once everything hides there is nothing for it to do.">
            <TitleScrollDemo title={TitleScroll.Stays} edge={EdgeStyle.Soft} />
          </Cell>
          <Cell label="B · Title leaves, buttons float" verdict={Verdict.Skip} note="Only the floating buttons remain. Set aside with A.">
            <TitleScrollDemo title={TitleScroll.Leaves} edge={EdgeStyle.Soft} />
          </Cell>
          <Cell label="C · Title stays, solid band" verdict={Verdict.Skip} note="A band that stays reads as a bar. D keeps the solid look but takes the whole block away while reading.">
            <TitleScrollDemo title={TitleScroll.Stays} edge={EdgeStyle.Solid} />
          </Cell>
        </PhoneRow>
        <Callout title="Where the decided versions live">
          Chapter 4 has the Home header at rest, the tag page as TagScroll, the
          covers as SquadScroll and ProfileScroll, and the visitor header A.
          Chapter 4d has the 20px name beside the back button and D. Chapter 4e
          has the hiding block on every page.
        </Callout>
        <DigIn title="Why these stay in Storybook at all">
          <p>
            The decisions log cites them. A reviewer who reads &quot;the
            underline was rejected&quot; or &quot;the soft edge was withdrawn&quot;
            can open this page and see what was rejected, without the live
            chapters carrying a Reference only pill next to every decided cell.
          </p>
        </DigIn>
      </Section>
    </Page>
  ),
};
