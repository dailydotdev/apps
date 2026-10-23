import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { Device } from '../../../history/device';
import { Callout, DocPage, Section } from '../../../history/doc';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../../extension/_providers';
import { HistoryStyles } from '../../../history/kit';
import { DEFAULT_POST_ID, postById, posts } from '../data';
import guide from './IMPLEMENTATION.md?raw';
import { Markdown } from './markdown';
import { kitCss, OpenProvider } from '../kit';
import { PostPageWithFeed } from '../page';
import { AppShell } from '../shell';
import type { Start } from '../page';
import { SeedComments, SettlePending } from '../api';
import type { FeedState, FeedTab } from './KeepReading';
import {
  FOR_YOU,
  HOSTS,
  KeepReading,
  MAX_TAG_TABS,
  tabsFor,
} from './KeepReading';

// Variation A, "Keep reading", chosen for implementation: every breakpoint,
// every post type, every card type, every state, and a Playground. Each
// frame is a window of its own width running production's post page and
// production's components, so its media queries are the real ones.

const meta: Meta = {
  title: 'Experiments/Post page feed/Keep reading (A)',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------- devices */

/**
 * Every width where the page or the feed changes, from styles/media and
 * the Tailwind screens: phones, the list card's row layout (mobileXL), the
 * tablet rail, laptop chrome, laptopL, and the widest.
 */
const SIZES = {
  w320: { width: 320, height: 720, label: '320 · smallest phone' },
  w375: { width: 375, height: 812, label: '375 · phone' },
  w420: { width: 420, height: 880, label: '420 · large phone (mobileL)' },
  w500: {
    width: 500,
    height: 900,
    label: '500 · mobileXL (cards still stacked: too narrow)',
  },
  w600: {
    width: 600,
    height: 960,
    label: '600 · large phone (column wide enough: cards side by side)',
  },
  w844l: {
    width: 844,
    height: 390,
    label:
      '844×390 · phone in landscape (shows tablet here: a desktop frame reports a mouse; a touch phone gets the phone layout)',
  },
  w656: { width: 656, height: 1000, label: '656 · tablet starts' },
  w768: { width: 768, height: 1024, label: '768 · tablet' },
  w1020: {
    width: 1020,
    height: 768,
    label: '1020 · laptop starts (narrow main column, cards stacked)',
  },
  w1140: {
    width: 1140,
    height: 800,
    label: '1140 · main column reaches 554px: cards side by side',
  },
  w1280: { width: 1280, height: 800, label: '1280 · laptop' },
  w1360: {
    width: 1360,
    height: 860,
    label: '1360 · laptop L',
  },
  w1440: { width: 1440, height: 900, label: '1440 · laptop L' },
  w1668: { width: 1668, height: 1000, label: '1668 · laptopXL' },
  w1920: { width: 1920, height: 1080, label: '1920 · desktop' },
  w2560: { width: 2560, height: 1440, label: '2560 · widest' },
} as const;

type Size = keyof typeof SIZES;

const PHONE: Size = 'w375';
const LAPTOP: Size = 'w1440';

/**
 * A device whose page mounts once it nears the screen: dozens of live post
 * pages at once would be slow. Outside a visible tab the observer never
 * fires, so the frame also offers a button.
 */
const Frame = ({
  size,
  note,
  children,
}: {
  size: Size;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const device = SIZES[size];
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node || shown) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShown(true),
      { rootMargin: '600px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <div ref={box} className="relative min-w-0">
      <Device
        width={device.width}
        height={device.height}
        label={device.label}
        note={note}
      >
        {shown ? children : null}
      </Device>
      {!shown && (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-10 bg-surface-float px-3 py-2 font-bold text-text-secondary typo-footnote"
        >
          Load this frame
        </button>
      )}
    </div>
  );
};

/** The whole post page with A under it. */
const Page = ({
  post,
  postId,
  start = 'feed',
  feed = {},
}: {
  post?: Post;
  postId?: string;
  start?: Start;
  feed?: Partial<Parameters<typeof KeepReading>[0]>;
}): ReactElement => (
  <PostPageWithFeed
    variant="none"
    post={post}
    postId={postId}
    start={start}
    renderFeed={(host) => <KeepReading host={host} {...feed} />}
  />
);

/**
 * The feed alone in the app's chrome, under the last line of a post: for
 * the states, where the post above would only push the feed off screen.
 */
const FeedOnly = ({
  host,
  feed = {},
}: {
  host: Post;
  feed?: Partial<Parameters<typeof KeepReading>[0]>;
}): ReactElement => (
  <ExtensionProviders>
    <SeedComments />
    <SettlePending />
    <HistoryStyles />
    <style>{kitCss}</style>
    <OpenProvider value={() => undefined}>
      <AppShell post={host}>
        <div className="m-auto w-full max-w-[69.25rem] px-4 py-6 text-text-quaternary typo-footnote tablet:px-6 laptop:border-x laptop:border-border-subtlest-tertiary laptop:px-8">
          … the end of the post and its comments
        </div>
        <KeepReading host={host} {...feed} />
      </AppShell>
    </OpenProvider>
  </ExtensionProviders>
);

/** A phone and a laptop side by side, the pair every case is checked at. */
const Pair = ({
  phone,
  laptop,
}: {
  phone: ReactNode;
  laptop: ReactNode;
}): ReactElement => (
  <div className="grid items-start gap-8 laptop:grid-cols-[23.4375rem_1fr]">
    <div className="w-[23.4375rem] max-w-full">{phone}</div>
    {laptop}
  </div>
);

/* ------------------------------------------------------------ fixtures */

const article = postById(DEFAULT_POST_ID) as Post;

/** Hosts made up from a real post for the edge cases. */
const EDGE = {
  noTags: { ...article, tags: [] } as Post,
  longTags: {
    ...article,
    tags: [
      'developer-experience',
      'continuous-integration',
      'observability-engineering',
      'career',
    ],
  } as Post,
  emptyTag: {
    ...article,
    tags: ['webassembly-components', ...(article.tags ?? [])],
  } as Post,
  soloSource: {
    ...article,
    source: {
      ...article.source,
      id: 'story-solo-source',
      handle: 'story-solo-source',
      name: 'A source with one post',
    },
  } as Post,
};

type Edge = keyof typeof EDGE | 'none';

const EDGE_LABELS: Record<Edge, string> = {
  none: 'None: the post as it is',
  noTags: 'Post without tags (no tag tabs)',
  longTags: 'Long tag names (tab bar scrolls)',
  emptyTag: 'A tag with no other posts (empty tab)',
  soloSource: 'Source with no other posts (no source tab)',
};

/** One post of every card type, as a For you tab, for the card review. */
const everyCardType = (): FeedTab[] => {
  const pick = (type: PostType, count = 1) =>
    posts.filter((post) => post.type === type).slice(0, count);
  const list = [
    ...pick(PostType.Article, 2),
    ...pick(PostType.VideoYouTube),
    ...pick(PostType.Share),
    ...pick(PostType.Freeform),
    ...pick(PostType.Poll),
    ...pick(PostType.Collection),
    ...pick(PostType.SocialTwitter),
  ];
  // Finite here: the point is one card of each type, not an endless feed.
  return [{ label: FOR_YOU, kind: 'forYou', posts: list, infinite: false }];
};

/* ----------------------------------------------------------------- spec */

const Row = ({ cells }: { cells: ReactNode[] }): ReactElement => (
  <tr className="border-b border-border-subtlest-tertiary align-top">
    {cells.map((cell, index) => (
      <td
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="text-pretty py-3 pr-6 text-text-secondary first:font-bold first:text-text-primary"
      >
        {cell}
      </td>
    ))}
  </tr>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[48rem] border-collapse text-left typo-callout">
      <thead>
        <tr className="border-b border-border-subtlest-tertiary text-text-quaternary typo-footnote">
          {head.map((cell) => (
            <th key={cell} className="py-3 pr-6 font-bold">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={index} cells={cells} />
        ))}
      </tbody>
    </table>
  </div>
);

const code = (text: string): ReactElement => (
  <code className="rounded-4 bg-surface-float px-1 typo-footnote">{text}</code>
);

const SpecPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · A · Keep reading"
    title="Keep reading: the feed under the post"
    intro={
      <>
        <p>
          After the comments, the post page keeps going: a list of posts like
          the one just read, in production’s list cards, with tabs for the
          post’s topics and its source. Click a card and that post opens in
          place, with its own feed under it.
        </p>
        <p>
          Every page here runs production’s post page and production’s
          components at a real window width. The Playground has every control;
          the other pages lay out every breakpoint, post type, card type, state
          and tab case side by side.
        </p>
      </>
    }
  >
    <Section title="What it is made of">
      <Table
        head={['Part', 'Production component', 'Notes']}
        rows={[
          [
            'Tabs, phone',
            <>
              {code('ShellRow')} + {code('Segments')}
            </>,
            <>
              The home feed’s own components (HomeSegments), pinned under the
              page row while the feed scrolls. No visible title at any width:
              like the home feed, the tabs say what the list is (the section
              keeps a heading for screen readers).
            </>,
          ],
          [
            'Tabs, tablet',
            'UnifiedMobileFeedNav’s chips',
            <>
              The home feed’s chip strip below laptop, class for class:{' '}
              {code('rounded-10 px-2.5 py-1.5 typo-callout')}, the active chip
              on {code('bg-surface-float')}, a bottom line. Not pinned: the
              tablet post column keeps its overflow-hidden.
            </>,
          ],
          [
            'Tabs, laptop',
            'The v2 page header + ExploreChipsBar',
            <>
              The home feed’s strip in the new layout ({code('min-h-14')},
              quaternary bottom line) with ExploreChipsBar’s tabs: small
              buttons, the active one Float with a short underline, a fade where
              they overflow.
            </>,
          ],
          [
            'Cards',
            code('PostTypeToListCard'),
            <>
              The list cards the phone feed uses, every type. The feed is{' '}
              {code('posts[id]')}, which useFeedLayout already keeps in list
              layout at every width. Flush with the column: square corners, the
              post’s own inset, dividers edge to edge.
            </>,
          ],
          [
            'Layout',
            'The post’s own columns',
            <>
              No frame of its own: the feed continues the post’s main column
              (same width, same side borders, same inset as the post’s text).
              The side column beside it stays empty: no widgets, the feed is the
              page. The tab bar’s line and every card divider run the full width
              of the column.
            </>,
          ],
          [
            'Paging',
            code('InfiniteScrolling'),
            'A page of posts at a time (seven here), the next as the last card nears the screen.',
          ],
          [
            'Loading',
            code('PlaceholderList'),
            'Three on first load, two while the next page loads.',
          ],
          [
            'For you empty (rare)',
            <>
              {code('CharmEmptyState')} + {code('TagLinks')}
            </>,
            'A brand-new account’s feed: “Your feed is empty for now” and the post’s tags to follow, wrapping. Not SimilarEmptyScreen: its tag row cannot shrink and runs off both edges on phones.',
          ],
          [
            'Empty tab',
            code('CharmEmptyState'),
            'Inline placement; offers For you.',
          ],
          [
            'Error',
            code('CharmEmptyState'),
            'Inline, not Feed’s FeedErrorScreen (a full-page “Production is down”, wrong under a working post). Feed needs an errorScreen prop for it.',
          ],
          [
            'End of a tag or source tab',
            <strong key="new">New</strong>,
            'Production feeds never end, so there is no component. “You’re all caught up”, back to top, go to my feed. For you never shows it: it keeps paging, like the home feed.',
          ],
        ]}
      />
    </Section>

    <Section title="Tabs">
      <Table
        head={['Tab', 'Shows', 'Served by']}
        rows={[
          [
            FOR_YOU,
            'The reader’s own For you feed, the one on the home page. Never ends: it keeps paging as the reader scrolls.',
            'The home feed’s query (FEED_QUERY / FEED_V2_QUERY). Nothing new on the API. (This review approximates it with posts ranked against the post.)',
          ],
          [
            '#tag',
            `One tab for each of the post’s first ${MAX_TAG_TABS} tags.`,
            <>The tag feed ({code('TAG_FEED_QUERY')}), without this post.</>,
          ],
          [
            'Source',
            'More from the post’s source.',
            <>
              The source feed ({code('SOURCE_FEED_QUERY')}), without this post.
              Hidden when the source has nothing else.
            </>,
          ],
        ]}
      />
      <p className="text-text-tertiary typo-callout">
        A post with one tab (no tags, nothing else from its source) shows the
        list alone, right after the comments, without a tab bar.
      </p>
    </Section>

    <Section title="Where it sits, by width">
      <Table
        head={['Width', 'Placement', 'Text inset', 'Card layout']}
        rows={[
          [
            'Phones (< 656)',
            'The post’s column, right after the comments, before the side widgets and the footer.',
            '16px',
            'Stacked below 554px of column, side by side above.',
          ],
          [
            'Tablets (656 – 1019)',
            'The same, beside the tablet rail.',
            '24px',
            'Side by side.',
          ],
          [
            'Laptops (1020 and up)',
            'Under the post, in its main column. The side column beside it stays empty.',
            '32px',
            'Stacked while the main column is under 554px (windows up to about 1130px), side by side above.',
          ],
        ]}
      />
    </Section>

    <Section title="What production needs">
      <div className="grid gap-4 laptop:grid-cols-2">
        <Callout title="A slot after the comments">
          Below laptop the feed has to sit between the comments and the side
          widgets. PostContent needs a prop for it (a {code('belowComments')}{' '}
          next to {code('aboveComments')}); this review places it there from
          outside.
        </Callout>
        <Callout title="Nothing new on the API">
          For you is the reader’s home feed, the tags are the tag feed, the
          source is the source feed. Feed already pages them, logs them, and
          drops the current post ({code('excludedPostIds')}).
        </Callout>
        <Callout title="Logging">
          Feed already logs impressions and clicks with{' '}
          {code("extra.feed = 'posts[id]'")}. New: a tab-switch event.
        </Callout>
        <Callout title="A flag, signed-in readers only" tone="brand">
          {code('post_page_feed')}, default off, evaluated only for signed-in
          readers. Signed-out readers keep today’s page (comments and the
          sign-up footer) and never enter the experiment. Full steps: 0.
          Implementation guide.
        </Callout>
      </div>
    </Section>

    <Section
      title="Found while testing"
      lead="Both are in production components. The feed works around them here; production should fix them at the source."
    >
      <div className="grid gap-4 laptop:grid-cols-2">
        <Callout
          title="List cards switch layout by window, not by space"
          tone="warn"
        >
          From 500px (mobileXL) the list card puts its 240px image beside the
          text, but the text column cannot get narrower than its action bar
          (about 234px: buttons do not shrink). So the card needs about 522px
          for that layout (554px with the post’s 32px inset). Windows 500–521px
          wide scroll sideways by up to 22px, and the post’s main column on a
          1020–1130px laptop is far too narrow. The home feed uses the same card
          at full width on phones, so it likely overflows there too. Fix: switch
          on the card’s own width (a container query), and give it a flush
          variant for this feed. The feed does both here with scoped CSS.
        </Callout>
        <Callout
          title="SimilarEmptyScreen's tags overflow on phones"
          tone="warn"
        >
          Its tag row sits in a second flex row that cannot shrink, so the tags
          stay on one line and run off both edges. Unused today; fix it before
          this feed uses it.
        </Callout>
      </div>
    </Section>
  </DocPage>
);

/**
 * IMPLEMENTATION.md, the guide an engineer or an agent builds from, shown
 * here as is: the page and the file are the same text.
 */
export const ImplementationGuide: Story = {
  name: '0. Implementation guide',
  render: () => (
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto max-w-[60rem]">
        <p className="mb-6 font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
          Post page feed · Keep reading (A) · IMPLEMENTATION.md
        </p>
        <Markdown source={guide} />
      </div>
    </div>
  ),
};

export const Spec: Story = {
  name: '1. Spec',
  render: () => <SpecPage />,
};

/* ----------------------------------------------------------- playground */

const TAB_PICKS = {
  forYou: FOR_YOU,
  tag1: 'First tag',
  tag2: 'Second tag',
  tag3: 'Third tag',
  source: 'Source',
} as const;

type TabPick = keyof typeof TAB_PICKS;

/** The label of the picked tab on this post, if it has one. */
const pickTab = (host: Post, pick: TabPick): string => {
  const tabs = tabsFor(host);
  const tags = tabs.filter((tab) => tab.kind === 'tag');
  const found = {
    forYou: tabs[0],
    tag1: tags[0],
    tag2: tags[1],
    tag3: tags[2],
    source: tabs.find((tab) => tab.kind === 'source'),
  }[pick];
  return found?.label ?? FOR_YOU;
};

interface PlaygroundArgs {
  size: Size;
  post: string;
  edge: Edge;
  tab: TabPick;
  state: FeedState;
  pageSize: number;
  start: Start;
}

const POST_OPTIONS = [
  ...HOSTS.map((host) => host.id),
  ...posts
    .filter((post) => !HOSTS.some((host) => host.id === post.id))
    .map((post) => post.id),
];

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '2. Playground',
  args: {
    size: LAPTOP,
    post: DEFAULT_POST_ID,
    edge: 'none',
    tab: 'forYou',
    state: 'live',
    pageSize: 7,
    start: 'feed',
  },
  argTypes: {
    size: {
      name: 'Window width',
      control: 'select',
      options: Object.keys(SIZES),
      labels: Object.fromEntries(
        Object.entries(SIZES).map(([key, size]) => [key, size.label]),
      ),
    },
    post: {
      name: 'Post',
      control: 'select',
      options: POST_OPTIONS,
      labels: Object.fromEntries(
        posts.map((post) => {
          const host = HOSTS.find((entry) => entry.id === post.id);
          const title = (post.title ?? post.id).slice(0, 56);
          return [post.id, host ? `${host.label}: ${title}` : title];
        }),
      ),
    },
    edge: {
      name: 'Edge case',
      control: 'select',
      options: Object.keys(EDGE_LABELS),
      labels: EDGE_LABELS,
      description: 'Built from the default article; overrides Post.',
    },
    tab: {
      name: 'Opens on tab',
      control: 'select',
      options: Object.keys(TAB_PICKS),
      labels: TAB_PICKS,
      description: 'Falls back to For you when the post has no such tab.',
    },
    state: {
      name: 'State',
      control: 'select',
      options: ['live', 'loading', 'loadingMore', 'end', 'empty', 'error'],
      labels: {
        live: 'Live: scroll to page, click tabs and cards',
        loading: 'First load',
        loadingMore: 'Loading the next page',
        end: 'End of the tab (tag and source tabs; For you never ends)',
        empty: 'Nothing similar',
        error: 'Failed to load',
      },
    },
    pageSize: {
      name: 'Posts per page',
      control: { type: 'range', min: 3, max: 15 },
    },
    start: {
      name: 'Opens at',
      control: 'inline-radio',
      options: ['feed', 'top'],
      labels: { feed: 'The end of the post', top: 'The top' },
    },
  },
  render: ({ size, post, edge, tab, state, pageSize, start }) => {
    const host = edge === 'none' ? postById(post) : EDGE[edge];
    return (
      <div className="min-h-screen bg-background-default p-6">
        <Frame
          key={`${size}-${post}-${edge}-${tab}-${state}-${pageSize}-${start}`}
          size={size}
          note="Scroll inside · click tabs and cards"
        >
          <Page
            post={host}
            start={start}
            feed={{
              initialTab: host ? pickTab(host, tab) : FOR_YOU,
              state,
              pageSize,
            }}
          />
        </Frame>
        <p className="mt-4 max-w-[80ch] text-text-tertiary typo-callout">
          Tabs for this post:{' '}
          {host
            ? tabsFor(host)
                .map((entry) => entry.label)
                .join(' · ')
            : '—'}
        </p>
      </div>
    );
  },
};

/* ---------------------------------------------------------- breakpoints */

const BreakpointsPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · A · Keep reading"
    title="Every breakpoint"
    intro={
      <p>
        The same article at every width where the page or the feed changes. Each
        window opens at the end of the post; scroll inside it to page through
        the feed.
      </p>
    }
  >
    {(
      [
        ['Phones', ['w320', 'w375', 'w420', 'w500', 'w600']],
        ['Phone in landscape', ['w844l']],
        ['Tablets', ['w656', 'w768']],
        ['Laptops', ['w1020', 'w1140', 'w1280', 'w1360', 'w1440']],
        ['Wide screens', ['w1668', 'w1920', 'w2560']],
      ] as [string, Size[]][]
    ).map(([title, sizes]) => (
      <Section key={title} title={title}>
        <div
          className={
            ['Phones', 'Tablets', 'Phone in landscape'].includes(title)
              ? 'flex flex-wrap items-start gap-8'
              : 'grid gap-10'
          }
        >
          {sizes.map((size) => (
            <div
              key={size}
              style={
                SIZES[size].width < 900
                  ? { width: Math.min(SIZES[size].width, 560) }
                  : undefined
              }
            >
              <Frame size={size}>
                <Page />
              </Frame>
            </div>
          ))}
        </div>
      </Section>
    ))}
  </DocPage>
);

export const Breakpoints: Story = {
  name: '3. Breakpoints',
  render: () => <BreakpointsPage />,
};

/* ----------------------------------------------------------- post types */

const PostTypesPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · A · Keep reading"
    title="Under every post type"
    intro={
      <p>
        The feed under each kind of post the post page renders, with that post’s
        own tabs. Phone and laptop, each opening at the end of the post.
      </p>
    }
  >
    {HOSTS.map((host) => (
      <Section
        key={host.id}
        title={host.label}
        lead={
          <>
            {host.post.title} · tabs:{' '}
            {tabsFor(host.post)
              .map((tab) => tab.label)
              .join(' · ')}
          </>
        }
      >
        <Pair
          phone={
            <Frame size={PHONE}>
              <Page postId={host.id} />
            </Frame>
          }
          laptop={
            <Frame size={LAPTOP}>
              <Page postId={host.id} />
            </Frame>
          }
        />
      </Section>
    ))}
  </DocPage>
);

export const PostTypes: Story = {
  name: '4. Post types',
  render: () => <PostTypesPage />,
};

/* ----------------------------------------------------------- card types */

const CardTypesPage = (): ReactElement => {
  const tabs = everyCardType();
  return (
    <DocPage
      eyebrow="Post page feed · A · Keep reading"
      title="Every card type in the feed"
      intro={
        <p>
          The feed can hold any post, so it shows every production list card:{' '}
          {tabs[0].posts.map((post) => post.type).join(', ')}. At the widths
          where the list card changes layout: stacked, side by side, and in the
          laptop frame.
        </p>
      }
    >
      <div className="flex flex-wrap items-start gap-8">
        {(['w375', 'w768'] as Size[]).map((size) => (
          <div key={size} style={{ width: Math.min(SIZES[size].width, 560) }}>
            <Frame size={size}>
              <FeedOnly host={article} feed={{ tabs, pageSize: 20 }} />
            </Frame>
          </div>
        ))}
      </div>
      <Frame size={LAPTOP}>
        <FeedOnly host={article} feed={{ tabs, pageSize: 20 }} />
      </Frame>
    </DocPage>
  );
};

export const CardTypes: Story = {
  name: '5. Card types',
  render: () => <CardTypesPage />,
};

/* --------------------------------------------------------------- states */

const STATES: {
  title: string;
  lead: string;
  host?: Post;
  feed?: Partial<Parameters<typeof KeepReading>[0]>;
}[] = [
  {
    title: 'First load',
    lead: 'Three list placeholders under the tab bar while the first page loads.',
    feed: { state: 'loading' },
  },
  {
    title: 'Loading the next page',
    lead: 'Two placeholders after the last card, as InfiniteScrolling fetches.',
    feed: { state: 'loadingMore', pageSize: 3 },
  },
  {
    title: 'End of a tag or source tab',
    lead: 'Every post shown: the end note, back to top and the way to the feed. For you never gets here.',
    feed: { state: 'end', initialTab: '#github' },
  },
  {
    title: 'A tag with no other posts',
    lead: 'The tab still shows (the post has the tag); its empty state offers For you.',
    host: EDGE.emptyTag,
    feed: { initialTab: '#webassembly-components' },
  },
  {
    title: 'For you is empty (rare)',
    lead: 'A brand-new account’s empty For you: “Your feed is empty for now”, the post’s tags to follow (wrapping). No tab bar.',
    feed: { state: 'empty' },
  },
  {
    title: 'Failed to load',
    lead: 'Inline: the post above is fine, so the message is small and offers a retry. Not Feed’s default FeedErrorScreen, a full-page “Production is down”.',
    feed: { state: 'error' },
  },
  {
    title: 'Post without tags',
    lead: 'For you and the source only.',
    host: EDGE.noTags,
  },
  {
    title: 'Source with no other posts',
    lead: 'No source tab: it would always be empty.',
    host: EDGE.soloSource,
  },
  {
    title: 'One tab only',
    lead: 'No tags and a source with nothing else: the list alone, no tab bar.',
    host: { ...EDGE.soloSource, tags: [] } as Post,
  },
];

const StatesPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · A · Keep reading"
    title="Every state"
    intro={
      <p>
        Each state frozen, at phone and laptop, under the last line of a post.
        The live behaviour of each is in the Playground (State).
      </p>
    }
  >
    {STATES.map((entry) => (
      <Section key={entry.title} title={entry.title} lead={entry.lead}>
        <Pair
          phone={
            <Frame size={PHONE}>
              <FeedOnly host={entry.host ?? article} feed={entry.feed} />
            </Frame>
          }
          laptop={
            <Frame size={LAPTOP}>
              <FeedOnly host={entry.host ?? article} feed={entry.feed} />
            </Frame>
          }
        />
      </Section>
    ))}
  </DocPage>
);

export const States: Story = {
  name: '6. States',
  render: () => <StatesPage />,
};

/* ----------------------------------------------------------------- tabs */

const TabsPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · A · Keep reading"
    title="Tabs"
    intro={
      <p>
        The home feed’s tabs at their tightest: Segments on phones, the chip
        strip on tablets, the page header’s tabs on laptops. Long tag names
        scroll sideways. Each frame opens on a different tab.
      </p>
    }
  >
    {(
      [
        ['Short tags, For you', article, FOR_YOU],
        ['Short tags, a tag tab', article, `#${article.tags?.[1] ?? 'career'}`],
        [
          'Short tags, the source tab',
          article,
          article.source?.name ?? FOR_YOU,
        ],
        [
          'Long tags, the last tag',
          EDGE.longTags,
          '#observability-engineering',
        ],
      ] as [string, Post, string][]
    ).map(([title, host, tab]) => (
      <Section key={title} title={title}>
        <div className="flex flex-wrap items-start gap-8">
          {(['w320', 'w375', 'w768'] as Size[]).map((size) => (
            <div key={size} style={{ width: Math.min(SIZES[size].width, 560) }}>
              <Frame size={size}>
                <FeedOnly host={host} feed={{ initialTab: tab }} />
              </Frame>
            </div>
          ))}
        </div>
        <Frame size="w1280">
          <FeedOnly host={host} feed={{ initialTab: tab }} />
        </Frame>
      </Section>
    ))}
  </DocPage>
);

export const Tabs: Story = {
  name: '7. Tabs',
  render: () => <TabsPage />,
};

/* ------------------------------------------------------------ signed out */

const SignedOutPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · Keep reading (A)"
    title="Signed out: no feed"
    intro={
      <>
        <p>
          The feed is for signed-in readers only. A signed-out reader has no For
          you feed to continue, and their post page already has its job: the
          comments, and the sticky footer that asks them to sign up. So for them
          the page stays exactly as it is today, with or without the flag.
        </p>
        <ul className="list-disc pl-5">
          <li>
            The flag is evaluated for signed-in readers only, so signed-out
            readers never enter the experiment and never count in it.
          </li>
          <li>
            Below: a signed-out reader on the post page, as production renders
            it today. Nothing follows the comments.
          </li>
        </ul>
      </>
    }
  >
    <Pair
      phone={
        <Frame size={PHONE}>
          <PostPageWithFeed variant="none" />
        </Frame>
      }
      laptop={
        <Frame size={LAPTOP}>
          <PostPageWithFeed variant="none" />
        </Frame>
      }
    />
  </DocPage>
);

export const SignedOut: Story = {
  name: '8. Signed out',
  beforeEach: bootAsAnonymous,
  render: () => <SignedOutPage />,
};

/* --------------------------------------------------------------- themes */

/**
 * Pins its frame to one theme, whatever the toolbar says: the frames copy
 * the page's theme class, so this re-applies it if the page changes.
 */
const ThemeLock = ({ theme }: { theme: 'light' | 'dark' }): ReactElement => {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const html = ref.current?.ownerDocument.documentElement;
    if (!html) {
      return undefined;
    }
    const apply = () => {
      if (html.classList.contains(theme) && html.classList.length === 1) {
        return;
      }
      html.className = theme;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);
  return <span ref={ref} hidden />;
};

const ThemesPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · Keep reading (A)"
    title="Light and dark"
    intro={
      <p>
        Every color comes from theme tokens (the post column’s borders, the
        quaternary card dividers in the v2 card, the tab states), so both themes
        follow without a line of theme code. Each frame is pinned to one theme.
      </p>
    }
  >
    {(['light', 'dark'] as const).map((theme) => (
      <Section key={theme} title={theme === 'light' ? 'Light' : 'Dark'}>
        <Pair
          phone={
            <Frame size={PHONE}>
              <ThemeLock theme={theme} />
              <Page />
            </Frame>
          }
          laptop={
            <Frame size={LAPTOP}>
              <ThemeLock theme={theme} />
              <Page />
            </Frame>
          }
        />
        <div className="w-[34rem] max-w-full">
          <Frame size="w768">
            <ThemeLock theme={theme} />
            <Page />
          </Frame>
        </div>
      </Section>
    ))}
  </DocPage>
);

export const Themes: Story = {
  name: '9. Light and dark',
  render: () => <ThemesPage />,
};

/* ---------------------------------------------------------------- flows */

const firstFeedPost = (): Post => tabsFor(article)[0].posts[0];

const FLOW: {
  step: string;
  lead: string;
  page: ReactElement;
}[] = [
  {
    step: '1. The post ends',
    lead: 'The reader finishes the comments: the tabs and the first cards are right there.',
    page: <Page />,
  },
  {
    step: '2. Picks a tab',
    lead: 'A tag tab: the list swaps in place, the tabs stay where they are (pinned on phones and tablets).',
    page: <Page feed={{ initialTab: `#${article.tags?.[0] ?? 'career'}` }} />,
  },
  {
    step: '3. Scrolls on',
    lead: 'The next page loads under the last card (InfiniteScrolling + PlaceholderList). For you never runs out.',
    page: <Page feed={{ state: 'loadingMore', pageSize: 3 }} />,
  },
  {
    step: '4. Opens a post',
    lead: 'The post opens in place (its own URL, a normal page view) at the top...',
    page: <Page postId={firstFeedPost().id} start="top" />,
  },
  {
    step: '5. ...with its own feed',
    lead: '...and under it, a feed ranked for that post. Reading never hits a dead end.',
    page: <Page postId={firstFeedPost().id} />,
  },
];

const FlowsPage = (): ReactElement => (
  <DocPage
    eyebrow="Post page feed · Keep reading (A)"
    title="Flows"
    intro={
      <p>
        The path a reader takes, one frozen step per row, at phone and laptop.
        Every step is live too: the Playground runs the whole flow.
      </p>
    }
  >
    {FLOW.map((entry) => (
      <Section key={entry.step} title={entry.step} lead={entry.lead}>
        <Pair
          phone={<Frame size={PHONE}>{entry.page}</Frame>}
          laptop={<Frame size={LAPTOP}>{entry.page}</Frame>}
        />
      </Section>
    ))}
  </DocPage>
);

export const Flows: Story = {
  name: '10. Flows',
  render: () => <FlowsPage />,
};
