import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  DigIn,
  Goal,
  Page,
  PageHeader,
  Quote,
  Section,
  Table,
  ChapterStatus,
  Status,
} from './kit';
import { NavMap } from './openCallMocks';

const meta: Meta = {
  title: 'Mobile UX/5. Navigation model',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const backRows: string[][] = [
  ['Open the app', '/', 'Home', 'Leaves the app'],
  ['Tap Following', '/following', 'Home (replaced)', 'Leaves the app: a segment is a view of the page, not a place you went to'],
  ['Open a post', '/posts/abc', 'Home › Post', 'Returns to Following, where you were'],
  ['Tap Read', '/posts/abc (page in front)', 'Home › Post › Page', 'Pops the page’s own history first, then closes the page and shows the post'],
  ['Open Spotlight, a sheet or the composer', 'unchanged', 'unchanged', 'Closes the overlay; they are not history entries'],
  ['Land on a deep link', '/squads/watercooler', 'Squad (no stack)', 'Goes to the root that owns the URL: the Squads root'],
  ['Re-tap the lit root', 'unchanged', 'unchanged', 'Scrolls to the top; a second re-tap returns to the first segment'],
];

const routeRows: string[][] = [
  ['Home segments', '/ and /following; Happening now has no URL', '/, /following, /happening-now, /happening-now?channel=security, /feeds/[slug]'],
  ['Explore feed sort', '/popular, /upvoted, /discussed', '/explore?sort=upvoted&period=month (one page, a menu); old routes redirect'],
  ['Search results', '/search/posts?q=', '/search?q=react&type=posts | squads | people | tags'],
  ['Profile tabs', '/[user] with tab state', '/[user], /[user]/replies, /[user]/upvoted'],
  ['Squad tabs', '/squads/[handle] with tab state', '/squads/[handle], /squads/[handle]/about'],
  ['Bookmarks lists', '/bookmarks, /bookmarks/later, /bookmarks/[folderId]', 'Unchanged; the lists are segments under You'],
  ['Tag and tags', '/tags with a strip, /tags/[tag] with a navbar', '/tags (directory), /tags/[tag] (thing); no strip, no navbar'],
];

export const NavigationModel: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Where am I, how did I get here, and how do I get back?"
        title="Four roots and the Create square. You is a leaf behind the avatar, segments replace, leaves push, overlays are not history, and back means one thing on iOS, Android and the web."
      >
        <p>
          The web app has pages and a browser history; the wrapper has an edge
          swipe that pops WebKit history; the header has a back button that
          calls router.back; Android has a system back that today goes to
          whatever the WebView decides. None of these know which tab you are
          in, which is why Home lights up on a post you opened from Squads and
          why a deep link into a tag page has no way up. Hotwire Native&apos;s
          rule is the target: content is web, navigation is a stack.
        </p>
        <ChapterNav current="5" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Redrawn from the decisions and closed on 30 Sep: Home · Explore · Squads · Activity plus the Create square, You behind the avatar, the no-shell class, the reading drawer; segments replace, leaves push, overlays are not history entries, back inside the reading page pops page history first. The round 1 map is in the Archive: Earlier plans.
      </Status>

      <Goal
        goal="A navigation model you can draw on a napkin: four stacks, one square, one back."
        metric="Back-to-feed continuation (a post view followed by another feed interaction in the same session), and posts opened per session."
      />

      <Section
        title="The map"
        description="Four roots and what each can push, the Create square, You as a leaf, the pages that carry no shell, and what back, overlays and re-taps do. If a screen is not on this map, it does not get a route on the phone."
      >
        <NavMap />
      </Section>

      <Section
        title="What back does after each kind of move"
        description="Segments replace the history entry, leaves push, overlays are not entries, the reading page pops its own history first. The rule is open call 4 in chapter 9b; this table is its recommendation."
      >
        <Table
          head={['You do', 'URL', 'History', 'Back does']}
          rows={backRows.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <span key={`${row[0]}-u`} className="font-mono text-text-secondary typo-caption1">
              {row[1]}
            </span>,
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section
        title="Routes"
        description="Every segment, channel, query and tab has a URL (round 5). Today's route next to the proposed one; the retired routes redirect."
      >
        <Table
          head={['Page', 'Route today', 'Route proposed']}
          rows={routeRows.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <span key={`${row[0]}-t`} className="font-mono text-text-secondary typo-caption1">
              {row[1]}
            </span>,
            <span key={`${row[0]}-p`} className="font-mono text-text-secondary typo-caption1">
              {row[2]}
            </span>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="What is decided">
            Four roots and the Create square (round 3), You behind the avatar
            (round 3), the composer opened directly (round 4), a URL for every
            segment and channel with one selected item per row (round 5), the
            page in front with the post as a drawer (round 5), and the
            no-shell class recommended in chapter 9b.
          </Callout>
          <Callout title="What is open">
            Whether a segment switch is a push or a replace, what Android back
            does inside the reading page, and the exact route strings above.
            All three are call 4 in chapter 9b; the tables here follow its
            recommendation and change with the answer.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The round 1 map, its journey stills and its eight rules are in the{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/Archive/Earlier plans')}
            className="font-bold text-text-primary underline"
          >
            Archive: Earlier plans
          </button>
          .
        </p>
        <Quote>
          If the user cannot predict what back will do, no amount of visual
          polish will make the app feel native.
        </Quote>
      </Section>

      <Section title="Implementation notes">
        <DigIn title="Stack ownership without a native router">
          <p>
            Keep Next&apos;s pages. When a bar item is tapped, push with
            history.state.tab set; on every subsequent push copy the current
            tab into the new state. useActiveNav becomes: state.tab, else the
            root that owns the path, else none. Store per-tab last URL and
            scroll in a small in-memory map keyed by tab; tapping a tab with a
            remembered URL navigates there instead of the root.
          </p>
        </DigIn>
        <DigIn title="View Transitions with the Pages Router">
          <p>
            Wrap router.push / router.back in document.startViewTransition
            when supported (Safari 18+, Chrome 111+; both store apps qualify
            on current OS versions) and set a direction attribute on html so
            CSS can pick slide-in vs slide-out. The old page is captured as a
            snapshot, so the feed does not need to stay mounted. Fall back to
            a plain navigation otherwise.
          </p>
        </DigIn>
        <DigIn title="iOS edge swipe and Android back">
          <p>
            WKWebView&apos;s allowsBackForwardNavigationGestures is already on;
            it pops browser history, which is our stack, so it needs no
            bridge. Its weakness is the snapshot it peels (chapter 8). Android
            needs the wrapper to register an OnBackPressedCallback enabled
            while canGoBack() and call goBack(); at a root, the web layer
            tells the wrapper (bridge) whether to switch to Home or let the
            system exit. Inside the reading page the wrapper pops the
            page&apos;s history first and closes it when there is none.
          </p>
        </DigIn>
        <DigIn title="Deep links">
          <p>
            Universal links and dailydev:// open a leaf with no history. The
            leaf resolves its owner root from the map above and back
            navigates there with replace, so the user is never stranded and
            the bar lights the right tab.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="5" />
      </Section>
    </Page>
  ),
};
