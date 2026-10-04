import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Status,
  Table,
  Verdict,
} from './kit';
import { searchRows, searchRules, SearchShape } from './searchEverywhere';
import { SquadButtonStill, SquadSearchingStill, TagsFocusedStill } from './searchMocks';
import { BookmarksScroll, HistoryScroll, SquadsScroll, TagsScroll } from './scrollPages';
import {
  SearchEntryRest,
  SearchEntryScrolled,
  SearchOpenEmpty,
  SearchOpenScoped,
  SearchOpenTyping,
  SearchResults,
} from './search';

const meta: Meta = {
  title: 'Mobile UX/3c. Search',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const steps = [
  ['1', 'Tap the field (at rest or compact)', 'Spotlight rises and locks flush with the top of the screen, a full page: field under the status bar, focused, keyboard up. The tab cluster hides. 300ms, the sheet curve.'],
  ['2', 'Empty query', 'Recently used (last searches, tags, squads), Suggested (trending tags, sources, people), Go to (places). Everything is one tap.'],
  ['3', 'Type', 'Results group live as you type, in the palette’s order: Search posts for "…" first, then Tags, Squads & sources, People, Posts, Actions. The first row is highlighted; Return picks it.'],
  ['4', 'Pick a scope chip', 'All · Posts · Squads · People · Tags · Actions narrows the list and the placeholder ("Search tags..."). Chips are the real scopes from Spotlight.'],
  ['5', 'Tap an entity', 'Tag, source, squad or person opens its page as a leaf under Explore. The sheet closes with the push.'],
  ['6', 'Tap "Search posts for …" or Return', 'The results page: a leaf with the query as its heading, a Filters button top right, result-type chips, the feed. The cluster returns.'],
  ['7', 'Dismiss', 'Drag the page down (it follows your finger and lets go past a third of the screen), tap Cancel, or the system back. You are back where you were, scrolled where you were.'],
  ['8', 'Back from results', 'Back button or edge swipe returns to Explore, not to the sheet. The last query stays in Recently used.'],
];

export const Search: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What happens when someone taps search?"
        title="Spotlight opens as a full page from the top, keyboard up, results grouped as you type; drag it down and it leaves like a sheet. One entry on Explore, one palette everywhere, one results page."
      >
        <p>
          Our search is Spotlight now: a palette that finds posts, tags,
          sources, squads and people and runs actions, and that is a better
          thing than a search field. This chapter shows exactly what a member
          sees from the tap to the result and back, using the palette&apos;s
          real groups and scopes. The entry stays where the Explore tab
          already puts it; a header icon and a square beside the tab bar were
          both tried and rejected as duplicates.
        </p>
        <ChapterNav current="3c" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Entry on Explore (floating field that stays at the bottom as a compact bar while you
        scroll), Spotlight as a full page attached to the top that can be dragged down to
        dismiss, results as a leaf under Explore. Round 5 adds &quot;Search everywhere&quot;:
        the same field cluster on every page that is a searchable list, a top-row button
        where search is one action among others.
      </Status>
      <p className="text-text-tertiary typo-footnote">
        Alternatives and research kept for the record are in the Archive: Tab
        bar, chrome, search and create.
      </p>

      <Goal
        goal="Make search feel like one gesture: tap, type, land. No page swap to a search screen, no second search UI competing with the palette."
        metric="Searches per active user and the share that end on a tap (entity or post) rather than a dismissal."
      />

      <Section
        title="The flow"
        description="Eight steps from the Explore tab to a result and back."
      >
        <Table
          head={['#', 'You', 'The app']}
          rows={steps.map((row) => [
            <span key={row[0]} className="font-bold tabular-nums text-text-primary">
              {row[0]}
            </span>,
            <span key={row[1]} className="font-bold text-text-primary">
              {row[1]}
            </span>,
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Entry"
        description="The floating field above the tab bar on Explore, and the compact bar it becomes once you scroll (the tab bar slides away, as on a post). Both open the same Spotlight."
      >
        <PhoneRow>
          <Cell label="Explore, at rest" verdict={Verdict.Ship} note="Field in our rectangle radius, 52px, above the tab bar and Create.">
            <SearchEntryRest />
          </Cell>
          <Cell label="Explore, scrolled" note="The tab bar has slid below the screen; the field sits in its slot as a compact bar, pulled in. Scroll up and the tab bar returns.">
            <SearchEntryScrolled />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Spotlight open"
        description="A full page attached to the top: field and Cancel under the status bar, scope chips, groups, keyboard. Nothing of the page behind shows, so results get the whole screen; a drag handle hints that it can be pulled down."
      >
        <PhoneRow>
          <Cell label="Empty" verdict={Verdict.Ship} note="Recently used, Suggested, Go to. The palette's own groups, nothing invented.">
            <SearchOpenEmpty />
          </Cell>
          <Cell label="Typing “react”" verdict={Verdict.Ship} note="Search posts first, then Tags, Squads & sources, People, Posts, Actions. Matches are marked; the first row is selected.">
            <SearchOpenTyping />
          </Cell>
          <Cell label="Scope: Tags" note="A scope chip narrows the list and the placeholder. Same sheet.">
            <SearchOpenScoped />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Results"
        description="Tapping “Search posts for …” or pressing Return lands here: a leaf under Explore with the query as its heading, Filters top right, type chips, the feed. Back returns to Explore."
      >
        <PhoneRow>
          <Cell label="Results page" verdict={Verdict.Ship}>
            <SearchResults />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="A page you can drag away">
            Tsahi&apos;s call: at rest Spotlight is flush with the top and
            reads as a page, which gives the results and the scope chips the
            full screen instead of losing the top strip to a peeking page.
            Underneath it is still the sheet primitive, so there is no route
            change until you pick a result, and dragging it down dismisses
            it the way a sheet does. Today&apos;s 90% drawer becomes 100%.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Why the entry stays on Explore">
            One field, one palette. Adding a header icon or a bar button gave
            the same palette a second door on the same screen and read as a
            duplicate. Explore is the browsing tab; search
            belongs to it.
          </Callout>
          <Callout title="Field and sheet sizes">
            Field 52px at rest, 44px compact (the same accessory height and
            motion as the post action bar). Spotlight at 100% height, square
            top, status bar respected. Input 52px, the field’s rest size and radius (decided in round 5).
            Scope chips in one scrolling row. Drag to dismiss commits past a
            third of the screen; below that it springs back. Keyboard-height
            is read from visualViewport so the group list never hides behind
            the keyboard.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No second search field inside the results page; the heading is
            the query and the back button returns to Explore. No autofocus
            on Explore itself; the field opens the palette on tap only. No
            search icon in the Home header or in the tab bar.
          </Callout>
        </div>
        <Quote>
          Tap, type, land. The palette does the finding; the page does the
          reading.
        </Quote>
        <DigIn title="Implementation notes">
          <p>
            The Explore field, at rest or compact, calls the Spotlight open
            action. Spotlight&apos;s existing mobile drawer becomes the
            shared Sheet primitive at a 100% detent with a square top and a
            drag-to-dismiss handle; groups, scopes and
            keyboard shortcuts are untouched. &quot;Search posts for …&quot;
            navigates to the results leaf with replace when the sheet was
            opened from Explore, so back from results goes to Explore rather
            than re-opening the sheet.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Search everywhere"
        description="Tsahi's call: one search behaviour across the app. Today there are five shapes (a sticky pill, a hero field, an inline field under a title, a field under tab pills, an icon) at three sizes. Under the rule a page that is a searchable list gets the Explore field cluster with its own placeholder; a page where search is one action among others gets a button in the top row that opens the same field; the rest have none."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={searchRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Table
          head={['Page', 'Today', 'Proposed', 'Placeholder', 'Behaviour']}
          rows={searchRows.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.today,
            <span
              key={row.shape}
              className={
                row.shape === SearchShape.Field
                  ? 'whitespace-nowrap rounded-6 bg-overlay-float-avocado px-1.5 py-0.5 font-bold text-accent-avocado-default typo-caption2'
                  : row.shape === SearchShape.Button
                    ? 'whitespace-nowrap rounded-6 bg-overlay-float-cabbage px-1.5 py-0.5 font-bold text-accent-cabbage-default typo-caption2'
                    : 'whitespace-nowrap rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5 font-bold text-text-quaternary typo-caption2'
              }
            >
              {row.shape}
            </span>,
            row.placeholder,
            row.behaviour,
          ])}
        />
        <PhoneRow>
          <Cell label="Tags directory, scroll it" verdict={Verdict.Ship} note="The field above the tab bar with its own placeholder; scroll and the tab bar slides away, the field stays as a compact bar, exactly as on Explore; the top block hides while you read (chapter 4e). No field in the hero any more.">
            <TagsScroll />
          </Cell>
          <Cell label="Tags, typing" verdict={Verdict.Ship} note="Tap the field: it rides above the keyboard with the query and a clear control; the list filters as you type; the A to Z row hides; ?q= in the URL.">
            <TagsFocusedStill />
          </Cell>
          <Cell label="Bookmarks, scroll it" verdict={Verdict.Ship} note="Same cluster with Home active in the bar; the field searches the active list. Sort and the menu stay in the top row.">
            <BookmarksScroll />
          </Cell>
          <Cell label="History, scroll it" verdict={Verdict.Ship} note="Same. The field never disappears on an empty result; the empty state sits above it.">
            <HistoryScroll />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="Squads root, scroll it" verdict={Verdict.Ship} note="The field filters Your squads and Discover together; the category chips hide while a query is set.">
            <SquadsScroll />
          </Cell>
          <Cell label="Squad page: a button" verdict={Verdict.Ship} note="Search is one of the squad's actions, so it is a top-row button beside the menu, not a field at rest.">
            <SquadButtonStill />
          </Cell>
          <Cell label="Squad page, searching" verdict={Verdict.Ship} note="The button opens the same field above the keyboard, scoped to the squad; results replace the Posts segment with the count as the first line.">
            <SquadSearchingStill />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the field goes to the bottom">
            It is where the thumb is, it is where Explore already put it,
            and it keeps the top row for the name and the actions. Apple
            moved search to the bottom of the tab bar in iOS 26 for the same
            reason; the iOS 26 search tab expands into a field the way this
            cluster does.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No field in a hero, under a title or under tab pills. No 40px
            field on one page and 48px on another. No search icon in the
            Home header or the bar. No field that vanishes on an empty
            result. No page search that is not in the URL.
          </Callout>
        </div>
        <DigIn title="Implementation notes">
          <p>
            One PageSearch component renders the field cluster (the Explore
            cluster with a placeholder and the active tab) and takes an
            onQuery; the page filters or fetches and sets ?q= with a shallow
            replace. The button variant mounts the same component hidden and
            focuses it on tap. Focus lifts the field to visualViewport.height
            minus its height and hides the tab bar; blur with an empty query
            drops it back. The Explore instance keeps opening Spotlight.
            TagDirectorySearch, PostsSearch on bookmarks and history, the
            members field and the feed-settings section fields are replaced
            on phones; desktop keeps its inline fields.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="3c" />
      </Section>
    </Page>
  ),
};
