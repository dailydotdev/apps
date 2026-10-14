import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { HistoryItem } from './data';
import type { ReaderPreview } from './layouts/Reader';
import { Reader } from './layouts/Reader';
import type { Nav } from './shell';
import { AppShell } from './shell';
import { Device, devices } from './device';
import type { Step } from './doc';
import {
  Callout,
  click,
  clickText,
  DocPage,
  Ok,
  Scripted,
  Section,
  StateCard,
  Table,
  Todo,
  type,
} from './doc';

const meta: Meta = {
  title: 'History/Redesign',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------- helpers */

type Size = keyof typeof devices;

/** The app at one device size, in a frozen or live state. */
const App = ({
  size,
  preview,
  steps,
  empty,
  transform,
  note,
  plus,
  nav,
}: {
  size: Size;
  preview?: ReaderPreview;
  steps?: Step[];
  empty?: boolean;
  transform?: (items: HistoryItem[]) => HistoryItem[];
  note?: ReactNode;
  /** A Plus member; every other device is a free reader. */
  plus?: boolean;
  nav?: Nav;
}): ReactElement => {
  const device = devices[size];
  return (
    <Device
      width={device.width}
      height={device.height}
      label={device.label}
      note={note}
    >
      <Scripted steps={steps}>
        <AppShell
          empty={empty}
          transform={transform}
          holdToasts={!!steps}
          isPlus={plus}
          nav={nav}
        >
          <Reader preview={preview} />
        </AppShell>
      </Scripted>
    </Device>
  );
};

const rowMenu = 'nav[aria-label="Reading history"] [aria-label="Options"]';
const firstRow = 'nav[aria-label="Reading history"] a';

/** Scrolls a phone's page down the list. */
const scrollDown: Step = (root) => {
  root.ownerDocument.defaultView?.scrollTo(0, 1100);
};

/** Taps the first row fully on screen. */
const tapVisibleRow: Step = (root) => {
  [...root.querySelectorAll<HTMLElement>(firstRow)]
    .find((row) => row.getBoundingClientRect().top > 120)
    ?.click();
};

/** The selected row's ⋯ in the history column. */
const openPostMenu: Step = (root) =>
  click(
    root,
    'nav[aria-label="Reading history"] [data-selected] [aria-label="Options"]',
  );
const upvoteSelected: Step[] = [
  openPostMenu,
  (root) => clickText(root, 'Upvote'),
];
const bookmarkSelected: Step[] = [
  openPostMenu,
  (root) => clickText(root, 'Save to bookmarks'),
];
const saveToFolder: Step[] = [
  openPostMenu,
  (root) => clickText(root, 'Save to folder'),
];
const removeSelected: Step[] = [
  openPostMenu,
  (root) => clickText(root, 'Remove post'),
];

/** A history with one read of `id` first, so it is the selected post. */
const readFirst =
  (id: string) =>
  (items: HistoryItem[]): HistoryItem[] => {
    const item = items.find((entry) => entry.id === id);
    return item
      ? [
          { ...item, readAt: items[0].readAt, key: `${id}-first` },
          ...items.filter((entry) => entry !== item),
        ]
      : items;
  };

/** One public post of each type production's post page renders. */
const postTypes: { id: string; title: string; check: string }[] = [
  {
    id: 'mGfmauFls',
    title: 'Article',
    check: 'PostContent: TLDR, tags, Read post on the source line.',
  },
  {
    id: 'Dnpojr9DY',
    title: 'Collection',
    check:
      'CollectionPostContent: the sources pill and the timeline of updates.',
  },
  {
    id: 'whtli8Ms7',
    title: 'Share',
    check:
      'SquadPostContent: the squad member’s commentary over the shared post.',
  },
  {
    id: 'M3jfp4ES4',
    title: 'Freeform',
    check: 'SquadPostContent: a squad member’s own post, no link out.',
  },
  {
    id: 'oo3EByGCR',
    title: 'Poll',
    check: 'PollPostContent: the options and the vote.',
  },
  {
    id: 'OXxsiaaEd',
    title: 'X post',
    check: 'SocialTwitterPostContent: the tweet and what it quotes.',
  },
];

/** A long title, a broken image, and the same post read twice. */
const edgeCases = (items: HistoryItem[]): HistoryItem[] => {
  const [first, second, ...rest] = items;
  return [
    {
      ...first,
      title:
        'A very long title that keeps going to check that two lines clamp cleanly in the narrow history column and in the row on phones, without pushing the source line out of the row',
    },
    { ...second, image: 'https://media.daily.dev/image/upload/missing.png' },
    {
      ...rest[3],
      key: `${rest[3].key}-again`,
      readAt: new Date(second.readAt.getTime() - 60_000),
    },
    ...rest,
  ];
};

const Grid = ({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}): ReactElement => (
  <div
    className={
      columns === 3
        ? 'grid grid-cols-1 gap-10 laptop:grid-cols-3'
        : 'grid grid-cols-1 gap-10 laptopL:grid-cols-2'
    }
  >
    {children}
  </div>
);

/* ------------------------------------------------------------- overview */

const OverviewPage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign · Reader pane"
    title="Reader pane: the full review"
    intro={
      <>
        <p>
          The history on the left, the real post page on the right, in
          production’s squads discover frame mirrored. On tablets and phones
          there is no split: the list fills the page, a tap opens the post as it
          does today, and back returns to the same place in the list.
        </p>
        <p>
          The pages in this folder cover every width (Responsive), every state
          (States), the main journeys step by step (Flows), and below: what
          changed in production since the exploration, where every action of
          today’s page lives now, links and SEO, accessibility, analytics and
          open questions.
        </p>
      </>
    }
  >
    <Section
      title="Live, at laptop size"
      lead="Click a row to read it, cmd-click to open the post in a new tab, use ↑ ↓ to move and Delete to remove. The address row shows the URL the page would be on."
    >
      <App size="laptopL" />
    </Section>

    <Section
      title="What changed in production since the exploration"
      lead="The branch was merged with main on 14 Oct (42 commits). These are the ones that touch /history, and how the design follows them."
    >
      <Table
        head={['Change', 'What it means here']}
        rows={[
          [
            'Phone shell, step 3 (#6855)',
            'Phones: History is a page under You, so its block is a back square and the title on one 52px line. The bar stays, the search field floats 8px above it on the 16px gutter, a post’s actions ride in one 52px capsule above the bar, toasts drop in 16px under the top. Content starts on the 16px gutter.',
          ],
          [
            'One empty state (#6855)',
            'Empty history is production’s CharmEmptyState: “Nothing read yet”, with Back to feed. Search with no results keeps “No results found”. Both are used as they ship.',
          ],
          [
            'Skeletons shaped like the page (#6855)',
            'Loading uses production’s ReadingHistoryPlaceholder with its date header; the post card gets a matching skeleton.',
          ],
          [
            'Classic post page kept (#6882)',
            'The right side and the phone post view render the classic PostContent, the only post page now.',
          ],
          [
            'Squads topic hub (#6843)',
            'The frame (max-w-5xl/6xl, bordered cards, 20rem column) is SquadDiscoverFrame’s, now on main; build can reuse it instead of the Storybook copy.',
          ],
          [
            'No full-page reloads on navigation (#6866), scroll restoration',
            'Opening a post from the list and coming back must keep the list’s scroll, as useScrollRestoration does for every page. The phone flow shows it.',
          ],
          [
            'Following feed back, hot takes and worlds removed (#6879, #6877, #6878)',
            'No effect on history.',
          ],
        ]}
      />
    </Section>

    <Section
      title="Every action of today’s page, and where it lives now"
      lead="Nothing from production is dropped. Laptop: every action in the row’s ⋯, shown on hover and on the selected row; nothing is laid over the post page. Tablet and phone: in each row’s ⋯, and in the capsule on the post page."
    >
      <Table
        head={['Today', 'Laptop', 'Tablet and phone', 'Status']}
        rows={[
          [
            'Open a post',
            'Click selects; Enter or cmd-click opens the page',
            'Tap opens the post page',
            <Ok key="1" />,
          ],
          [
            'Upvote / downvote',
            'Row ⋯ (first items)',
            '⋯ (first items); capsule on the post',
            <Ok key="2" />,
          ],
          ['Copy link', 'Row ⋯', '⋯; capsule', <Ok key="3" />],
          ['Share post via…', 'Row ⋯', '⋯', <Ok key="4" />],
          [
            'Save to / Remove from bookmarks, with “Change folder”',
            'Row ⋯',
            '⋯; capsule',
            <Ok key="5" />,
          ],
          ['Remove post', 'Row ⋯, or Delete key', '⋯', <Ok key="6" />],
          [
            'Search with suggestions',
            'Top of the column, ↑ ↓ Enter',
            'Field above the bar (phone), top (tablet)',
            <Ok key="7" />,
          ],
          [
            'Infinite scroll',
            'Inside the column',
            'Page scroll',
            <Ok key="8" />,
          ],
          [
            'Empty history, no results',
            'Production screens',
            'Production screens',
            <Ok key="9" />,
          ],
          [
            'Day headers',
            'Sticky in the column',
            'Sticky under the block',
            <Ok key="10" />,
          ],
          [
            'New: Send in a message, Save to folder (Plus members pick a folder; free readers see the Plus badge and production’s upsell), one share prompt',
            'Yes',
            'Yes',
            <Ok key="11" />,
          ],
        ]}
      />
    </Section>

    <Section
      title="Links and SEO: nothing changes"
      lead="/history is a private, logged-in page; it stays out of search. Posts keep their canonical URLs, so no link equity moves."
    >
      <Table
        head={['Check', 'Design', 'Status']}
        rows={[
          [
            'Route',
            'Stays /history. No new page, no redirect.',
            <Ok key="a" />,
          ],
          [
            'Indexing',
            'Keeps noindex, nofollow and the “History” title from pages/history.tsx.',
            <Ok key="b" />,
          ],
          [
            'Post links',
            'Every row is a real <a href> to /posts/<slug> (getPostPath), as PostItemCard is today. Cmd, ctrl, shift and middle click open it as a link.',
            <Ok key="c" />,
          ],
          [
            'Search in the URL',
            '?q= stays, as RouterPostsSearch writes it today.',
            <Ok key="d" />,
          ],
          [
            'Selected read in the URL',
            'New ?post=<slug>, shallow, on laptop only, so back, reload and a shared link keep the read. Proposal: confirm with SEO that it carries no canonical (the page is noindex).',
            <Todo key="e">Decide</Todo>,
          ],
          [
            'Phone and tablet open the post page',
            '/posts/<slug>, the indexed page, exactly as today.',
            <Ok key="f" />,
          ],
          [
            'Logged out',
            'ProtectedPage still sends visitors to /onboarding?after_auth=/history.',
            <Ok key="g" />,
          ],
        ]}
      />
    </Section>

    <Section title="Accessibility">
      <Table
        head={['Check', 'Design', 'Status']}
        rows={[
          [
            'Landmarks',
            'The list is <nav aria-label="Reading history">; the post is a <section> named after its title.',
            <Ok key="a" />,
          ],
          [
            'Selection',
            'The selected row has aria-current="true", and focus moves with ↑ ↓. Rows stay links, never role="option" with buttons inside.',
            <Ok key="b" />,
          ],
          [
            'Keyboard',
            'Tab reaches the search, chips, every row and every action. ↑ ↓ move, Enter opens, Delete removes.',
            <Ok key="c" />,
          ],
          [
            'Icon buttons',
            'Every one has an aria-label (Upvote, Downvote, Save to bookmarks, Copy link, Options); pressed states use aria-pressed.',
            <Ok key="d" />,
          ],
          [
            'Toasts',
            'role="status", its action (Change folder) reachable by keyboard, 6s on screen.',
            <Ok key="e" />,
          ],
          [
            'Focus visible',
            'focus-outline on rows; buttons use the design system’s.',
            <Ok key="f" />,
          ],
          [
            'Touch targets',
            'Rows and ⋯ are at least 44px on phones; the capsule’s buttons sit in a 52px bar.',
            <Ok key="g" />,
          ],
          [
            'The post page inside the card',
            'Engineering: render PostContent in the page, not an iframe (Storybook uses one only to get the tablet layout), so screen readers read one document.',
            <Todo key="h">Build note</Todo>,
          ],
          [
            'Reduced motion',
            'No new animation beyond the toast and the menu’s fade.',
            <Ok key="i" />,
          ],
        ]}
      />
    </Section>

    <Section
      title="Analytics"
      lead="Today a click on a history row logs nothing, Remove logs nothing, and the page view is logged twice. Fix those first, then this is what the Reader pane needs."
    >
      <Table
        head={['Event', 'When', 'Extra']}
        rows={[
          ['page view (once)', 'History opens', 'origin: history'],
          [
            'history select post (new)',
            'A row is selected on laptop',
            'post_id, position, via: click | keyboard',
          ],
          [
            'click article / open post',
            'Enter, cmd-click, or a tap on phone and tablet',
            'origin: history',
          ],
          [
            'impression (post)',
            'The selected post is shown on the right',
            'origin: history, so the reading stats stay honest',
          ],
          [
            'upvote / downvote / bookmark / share post / copy link',
            'Any action',
            'origin: history (already passed today)',
          ],
          ['hide read history (new)', 'Remove post', 'post_id'],
          [
            'submit search, focus search',
            'Search',
            'as RouterPostsSearch logs today',
          ],
        ]}
      />
    </Section>

    <Section title="Open questions">
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Callout
          title="Does the right side count as reading the post?"
          tone="warn"
        >
          Selecting a row shows the whole post. If that counts as a read, it
          writes a new history entry and moves the post to the top. Proposal: it
          doesn’t, until the reader scrolls or clicks into it.
        </Callout>
        <Callout title="Which post types render on the right?">
          Decided: every type, with the same map as pages/posts/[id]. The post
          page has one component per type: article and video (PostContent),
          shares and squad posts (SquadPostContent), collections, briefs, polls,
          X posts, digests.
        </Callout>
        <Callout title="?post= in the URL" tone="warn">
          Keeps a read through back and reload. Needs a yes from SEO (the page
          is noindex) and from the team on shallow routing.
        </Callout>
        <Callout title="Laptop width with the post at tablet layout">
          Decided: between 1020 and 1360 the post card is about 650px, so the
          post shows its tablet layout without the sidebar widgets. Fine for
          reading; comments still show.
        </Callout>
        <Callout title="Swipe actions on phones">
          Not in this round: every action is one tap away in ⋯. Swipe to remove
          or save could come later.
        </Callout>
        <Callout title="Pause history and Clear all">
          Removed at review. Remove post is the only removal, with no Undo, as
          today; worth a later privacy pass in settings.
        </Callout>
      </div>
    </Section>
  </DocPage>
);

/* ----------------------------------------------------------- responsive */

const ResponsivePage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign"
    title="Every width"
    intro={
      <p>
        One component at real breakpoints: each device is its own window, so the
        layouts below are what each width gets. Everything is live: pick posts,
        open menus, search, open a post on the phone and go back.
      </p>
    }
  >
    <Section
      title="Laptop XL · 1920"
      lead="The frame caps at 72rem (max-w-6xl) and centres, as the squads pages do; the rest is page background."
    >
      <App size="laptopXL" />
    </Section>
    <Section
      title="Laptop L · 1440"
      lead="The main size: a 20rem history column, the post in the main card."
    >
      <App size="laptopL" />
    </Section>
    <Section
      title="Laptop · 1024"
      lead="The frame is 64rem (max-w-5xl); the post card is about 650px, so the post shows its tablet layout."
    >
      <App size="laptop" />
    </Section>
    <Section
      title="Tablet and phone"
      lead="No split. The list fills the page, ⋯ holds every action, a tap opens the post page."
    >
      <div className="flex flex-wrap items-start gap-10">
        <App size="tablet" />
        <App size="phone" />
        <App size="phoneS" />
      </div>
    </Section>
  </DocPage>
);

/* ----------------------------------------------------------- navigation */

const navSizes: { size: Size; lead: ReactNode }[] = [
  {
    size: 'laptopXL',
    lead: 'New: the rail and the floating card. Old: the 64px header and the expanded sidebar, the page beside it with no card.',
  },
  {
    size: 'laptopL',
    lead: 'The old sidebar takes 15rem against the rail’s 5rem, but the frame still fits: the post card is 784px under both.',
  },
  {
    size: 'laptop',
    lead: 'The tightest pair: the post card is about 550px under the new navigation and about 420px under the old one, so it reads at its phone layout.',
  },
  {
    size: 'tablet',
    lead: 'The same shell either way: production serves SidebarTablet on tablets with layout_v2_2 on or off.',
  },
  {
    size: 'phone',
    lead: 'The same either way: the phone shell (#6855) has no flag.',
  },
  { size: 'phoneS', lead: 'The same either way.' },
];

const NavigationPage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign"
    title="Old and new navigation"
    intro={
      <p>
        Production serves two laptop navigations behind layout_v2_2: the new
        rail with the floating card, and the old header with the expanded
        sidebar. Every size, under each, with production’s own header and
        sidebar for the old one.
      </p>
    }
  >
    {navSizes.map(({ size, lead }) => (
      <Section key={size} title={devices[size].label} lead={lead}>
        <div
          className={classNames(
            'grid items-start gap-10',
            devices[size].width >= 1024
              ? 'grid-cols-1 laptopL:grid-cols-2'
              : 'grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),max-content))]',
          )}
        >
          <StateCard title="New navigation">
            <App size={size} nav="new" />
          </StateCard>
          <StateCard title="Old navigation">
            <App size={size} nav="old" />
          </StateCard>
        </div>
      </Section>
    ))}
  </DocPage>
);

/* ------------------------------------------------------- laptop states */

const LaptopStatesPage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign"
    title="States · laptop"
    intro={
      <p>
        Each device freezes one state at 1440, reached the way a person would
        reach it. They stay live, so you can carry on from any of them.
      </p>
    }
  >
    <Section title="Selection">
      <Grid>
        <StateCard
          title="Default"
          check="The newest read is selected; the URL has no ?post= until you pick one."
        >
          <App size="laptopL" />
        </StateCard>
        <StateCard
          title="Another read selected"
          check="Row lit with aria-current, the post on the right, ?post=<slug> in the URL."
        >
          <App size="laptopL" preview={{ selected: 4 }} />
        </StateCard>
        <StateCard
          title="A video"
          check="The video post page: thumbnail, its consent step, length."
        >
          <App size="laptopL" preview={{ selected: 2 }} />
        </StateCard>
        <StateCard
          title="Edge cases"
          check="A long title clamps to two lines; a broken image falls back; the same post read twice shows twice, each its own read."
        >
          <App size="laptopL" transform={edgeCases} preview={{ selected: 1 }} />
        </StateCard>
      </Grid>
    </Section>

    <Section
      title="Every post type"
      lead="The right side renders each post with the component production’s post page picks for its type (pages/posts/[id]’s CONTENT_MAP), from real posts. Briefs and digests are private to their reader, so there is no public one to show; they use BriefPostContent and DigestPostContent the same way."
    >
      <Grid>
        {postTypes.map((postType) => (
          <StateCard
            key={postType.id}
            title={postType.title}
            check={postType.check}
          >
            <App size="laptopL" transform={readFirst(postType.id)} />
          </StateCard>
        ))}
      </Grid>
    </Section>

    <Section title="Search and filters">
      <Grid>
        <StateCard
          title="Suggestions while typing"
          check="Production’s title suggestions; ↑ ↓ to move, Enter to pick."
        >
          <App
            size="laptopL"
            steps={[(root) => type(root, 'vs', 'aside input')]}
          />
        </StateCard>
        <StateCard
          title="Results"
          check="Matches highlighted; “Matched in TLDR / Tag / Source” when the title isn’t it; ?q= in the URL."
        >
          <App size="laptopL" preview={{ query: 'rust' }} />
        </StateCard>
        <StateCard
          title="A chip on"
          check="Bookmarked only; days keep their headers."
        >
          <App size="laptopL" preview={{ kind: 'bookmarked' }} />
        </StateCard>
        <StateCard
          title="No results"
          check="Production’s No results found, with Clear filters. The post side asks you to pick a post."
        >
          <App
            size="laptopL"
            preview={{ query: 'kubernetes operators in cobol' }}
          />
        </StateCard>
      </Grid>
    </Section>

    <Section title="Actions">
      <Grid>
        <StateCard
          title="⋯ menu · free reader"
          check="The selected row’s ⋯ in the history column: Upvote, Downvote, Copy link, then Send in a message, Share post via…, Save to bookmarks, Save to folder with the Plus badge, Remove post."
        >
          <App size="laptopL" steps={[openPostMenu]} />
        </StateCard>
        <StateCard
          title="⋯ menu · Plus member"
          check="The same menu without the Plus badge: folders are already theirs."
        >
          <App size="laptopL" plus steps={[openPostMenu]} />
        </StateCard>
        <StateCard
          title="Save to folder · free reader"
          check="Production’s New Folder modal with the upsell: Level Up with Plus and Upgrade to plus, both to /plus (logged as upgrade subscription, target bookmark folder)."
        >
          <App size="laptopL" steps={saveToFolder} />
        </StateCard>
        <StateCard
          title="Save to folder · Plus member"
          check="The post is saved and Choose a folder opens with their folders, as Change folder does in production."
        >
          <App size="laptopL" plus steps={saveToFolder} />
        </StateCard>
        <StateCard
          title="Share prompt after an upvote"
          check="Once per post, under its row in the history column, stacked to fit: socials and Slack."
        >
          <App size="laptopL" steps={upvoteSelected} />
        </StateCard>
        <StateCard
          title="Bookmarked"
          check="Production’s toast: “Bookmarked! Saved to Quick saves”, Change folder."
        >
          <App size="laptopL" steps={bookmarkSelected} />
        </StateCard>
        <StateCard
          title="Change folder · free reader"
          check="From the bookmark toast, as production: Quick saves only, and New folder leads to the Plus upsell."
        >
          <App
            size="laptopL"
            steps={[
              ...bookmarkSelected,
              (root) => clickText(root, 'Change folder'),
            ]}
          />
        </StateCard>
        <StateCard
          title="Removed"
          check="“Removed from history”, no Undo, as production. The next read is selected, not the top."
        >
          <App
            size="laptopL"
            preview={{ selected: 3 }}
            steps={removeSelected}
          />
        </StateCard>
        <StateCard
          title="Post no longer available"
          check="Its author or source removed it: say so, offer Remove from history."
        >
          <App size="laptopL" preview={{ unavailable: true }} />
        </StateCard>
      </Grid>
    </Section>

    <Section title="Loading and empty">
      <Grid>
        <StateCard
          title="First load"
          check="Production’s skeleton with a date header; the post card mirrors it."
        >
          <App size="laptopL" preview={{ loading: 'initial' }} />
        </StateCard>
        <StateCard
          title="Loading the next page"
          check="Two skeleton rows at the end of the column while the next page loads."
        >
          <App
            size="laptopL"
            preview={{ loading: 'more' }}
            steps={[
              (root) => {
                const list = root.querySelector<HTMLElement>(
                  'nav[aria-label="Reading history"]',
                );
                list?.scrollTo(0, list.scrollHeight);
              },
            ]}
          />
        </StateCard>
        <StateCard
          title="Empty history"
          check="Same layout as No results: production’s “Nothing read yet” with Back to feed in the history column, the post side says your reads will show up there."
        >
          <App size="laptopL" empty />
        </StateCard>
        <StateCard
          title="Logged out"
          check="Never renders: ProtectedPage sends visitors to /onboarding?after_auth=/history, as today."
        >
          <Callout title="Redirect, no page">
            A logged-out visitor on /history goes to sign up and comes back to
            /history after it. Nothing in this design changes that.
          </Callout>
        </StateCard>
      </Grid>
    </Section>
  </DocPage>
);

/* --------------------------------------------------- phone and tablet */

const TouchStatesPage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign"
    title="States · phone and tablet"
    intro={
      <p>
        Below laptop there is no split. Phones follow the shell’s step 3: the
        page block, the bar, the search field above it, toasts at the top and
        the post’s actions in a capsule.
      </p>
    }
  >
    <Section title="Phone · 375">
      <Grid columns={3}>
        <StateCard
          title="The list"
          check="Back square and title, chips under the block, search above the bar, rows on the 16px gutter."
        >
          <App size="phone" />
        </StateCard>
        <StateCard
          title="⋯ on a row"
          check="Production’s menu sheet on phones: the bottom sheet with a grabber over a dimmed page, 48px rows; votes and copy link lead it. Tablets keep the dropdown."
        >
          <App size="phone" steps={[(root) => click(root, rowMenu)]} />
        </StateCard>
        <StateCard
          title="Share prompt"
          check="After Copy link: the prompt under the row, stacked on a phone: the question and close on top, the share buttons and Slack under it."
        >
          <App
            size="phone"
            steps={[
              (root) => click(root, rowMenu),
              (root) => clickText(root, 'Copy link'),
            ]}
          />
        </StateCard>
        <StateCard
          title="Searching"
          check="The field above the bar filters the list in place."
        >
          <App size="phone" preview={{ query: 'rust' }} />
        </StateCard>
        <StateCard
          title="The post, opened"
          check="The post page at phone width, the actions in the capsule above the bar; the URL is the post’s own."
        >
          <App size="phone" steps={[(root) => click(root, firstRow)]} />
        </StateCard>
        <StateCard
          title="Bookmarked from the capsule"
          check="The toast drops in at the top, 16px under the status bar."
        >
          <App
            size="phone"
            steps={[
              (root) => click(root, firstRow),
              (root) =>
                click(
                  root,
                  '.fixed.inset-x-4 [aria-label="Save to bookmarks"]',
                ),
            ]}
          />
        </StateCard>
        <StateCard
          title="First load"
          check="The block paints, then a skeleton shaped like the list."
        >
          <App size="phone" preview={{ loading: 'initial' }} />
        </StateCard>
        <StateCard
          title="Empty history"
          check="CharmEmptyState on the 16px gutter, under the block."
        >
          <App size="phone" empty />
        </StateCard>
        <StateCard
          title="Small phone · 360"
          check="Nothing wider than the screen; chips scroll sideways."
        >
          <App size="phoneS" />
        </StateCard>
      </Grid>
    </Section>
    <Section title="Tablet · 768">
      <Grid>
        <StateCard
          title="The list"
          check="The tablet rail, search and chips on top, full rows with ⋯."
        >
          <App size="tablet" />
        </StateCard>
        <StateCard
          title="The post, opened"
          check="A History back button and the actions in the top row, the post page under it."
        >
          <App size="tablet" steps={[(root) => click(root, firstRow)]} />
        </StateCard>
      </Grid>
    </Section>
  </DocPage>
);

/* ---------------------------------------------------------------- flows */

const Flow = ({
  title,
  lead,
  steps,
}: {
  title: string;
  lead: ReactNode;
  steps: { title: string; node: ReactNode }[];
}): ReactElement => (
  <Section title={title} lead={lead}>
    <div className="grid grid-cols-1 gap-8 laptopL:grid-cols-2">
      {steps.map((step, index) => (
        <StateCard key={step.title} title={`${index + 1}. ${step.title}`}>
          {step.node}
        </StateCard>
      ))}
    </div>
  </Section>
);

const FlowsPage = (): ReactElement => (
  <DocPage
    eyebrow="History · Redesign"
    title="Flows"
    intro={<p>The main journeys, one frozen step per device.</p>}
  >
    <Flow
      title="Find a post again"
      lead="Search by what you remember, pick a suggestion, read it on the right."
      steps={[
        {
          title: 'Type',
          node: (
            <App
              size="laptopL"
              steps={[(root) => type(root, 'vs', 'aside input')]}
            />
          ),
        },
        {
          title: 'Results',
          node: <App size="laptopL" preview={{ query: 'VS Code' }} />,
        },
        {
          title: 'Read it',
          node: (
            <App size="laptopL" preview={{ query: 'VS Code', selected: 1 }} />
          ),
        },
      ]}
    />
    <Flow
      title="Clean up"
      lead="Remove the post you’re on; the next one takes its place, and focus moves with it."
      steps={[
        {
          title: 'On a post',
          node: <App size="laptopL" preview={{ selected: 3 }} />,
        },
        {
          title: 'Removed',
          node: (
            <App
              size="laptopL"
              preview={{ selected: 3 }}
              steps={removeSelected}
            />
          ),
        },
      ]}
    />
    <Flow
      title="Save into a folder · Plus member"
      lead="Bookmark from the row’s ⋯, then move it with Change folder."
      steps={[
        {
          title: 'Save',
          node: <App size="laptopL" plus steps={[...bookmarkSelected]} />,
        },
        {
          title: 'Choose a folder',
          node: (
            <App
              size="laptopL"
              plus
              steps={[
                ...bookmarkSelected,
                (root) => clickText(root, 'Change folder'),
              ]}
            />
          ),
        },
        {
          title: 'Moved',
          node: (
            <App
              size="laptopL"
              plus
              steps={[
                ...bookmarkSelected,
                (root) => clickText(root, 'Change folder'),
                (root) => clickText(root, 'React'),
              ]}
            />
          ),
        },
      ]}
    />
    <Flow
      title="Save into a folder · free reader"
      lead="Folders are a Plus feature: the badge in ⋯ says so, and the step leads into production’s existing upsell."
      steps={[
        {
          title: 'The menu, with the badge',
          node: <App size="laptopL" steps={[openPostMenu]} />,
        },
        {
          title: 'The upsell',
          node: <App size="laptopL" steps={saveToFolder} />,
        },
      ]}
    />
    <Flow
      title="Phone: read and come back"
      lead="Scroll down, tap a row, read, act from the capsule, go back: the list is where you left it, as useScrollRestoration keeps it today."
      steps={[
        {
          title: 'Down the list',
          node: <App size="phone" steps={[scrollDown]} />,
        },
        {
          title: 'The post',
          node: <App size="phone" steps={[scrollDown, tapVisibleRow]} />,
        },
        {
          title: 'Back, same place',
          node: (
            <App
              size="phone"
              steps={[
                scrollDown,
                tapVisibleRow,
                (root) => click(root, '[aria-label="Go back"]'),
              ]}
            />
          ),
        },
      ]}
    />
  </DocPage>
);

export const Overview: Story = {
  name: '1. Overview',
  render: () => <OverviewPage />,
};

export const Responsive: Story = {
  name: '2. Responsive',
  render: () => <ResponsivePage />,
};

export const Navigation: Story = {
  name: '6. Old and new navigation',
  render: () => <NavigationPage />,
};

export const LaptopStates: Story = {
  name: '3. States · laptop',
  render: () => <LaptopStatesPage />,
};

export const TouchStates: Story = {
  name: '4. States · phone and tablet',
  render: () => <TouchStatesPage />,
};

export const Flows: Story = {
  name: '5. Flows',
  render: () => <FlowsPage />,
};
