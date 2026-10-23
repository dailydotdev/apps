import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import {
  Segments,
  ShellRow,
} from '@dailydotdev/shared/src/components/shell/ShellRow';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { PlaceholderList } from '@dailydotdev/shared/src/components/cards/placeholder/PlaceholderList';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import {
  cloudinaryCharmNoPosts,
  cloudinaryCharmSearchNoResults,
} from '@dailydotdev/shared/src/lib/image';
import { TagLinks } from '@dailydotdev/shared/src/components/TagLinks';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { posts as allPosts, rankFor } from '../data';
import { ListCard } from '../kit';

// Variation A, "Keep reading", as it would ship: the feed under the post.
//
// Built from production parts only, so it reads like the rest of the app:
// the home feed's title and tabs at each width (see FeedHeader), production
// list cards (PostTypeToListCard, the `posts[id]` feed is
// already list-only in useFeedLayout), PlaceholderList while loading,
// InfiniteScrolling to page, SimilarEmptyScreen's content when nothing is
// similar, and CharmEmptyState for an empty tab. For you never ends, like
// the home feed; a tag or source tab can, and its end note is the one new
// piece: production feeds have no end.
//
// No frame of its own: it continues the post's columns. Below laptop the
// post page is one column, so the feed sits right after the comments
// (production needs a slot there, see the Spec); from laptop up it sits in
// the post's main column, and the side column beside it stays empty.

/**
 * The cards, flush with the column: production list cards are padded for a
 * page gutter of 16px and rounded for a feed; here they take the post's own
 * inset and run edge to edge, so their dividers meet the column's borders.
 * Production would give ListCard a flush variant.
 *
 * And their layout follows their own width. Production switches the list
 * card to side by side by WINDOW width (mobileXL, 500px), which breaks in a
 * narrow column: on a 1020–1133px laptop the post's column is narrower than
 * the side-by-side card needs (240px image, 16px gap, a text column that
 * cannot shrink below its ~234px action bar, the gutters), and on a phone
 * 500–521px wide the page scrolls sideways. Stacked below 554px of column,
 * side by side above: the container query a production fix would use.
 */
const feedCss = `
[data-testid="postPageFeed"] .pp-list { container: pp-list / inline-size; }
[data-testid="postPageFeed"] .pp-list article {
  border-radius: 0;
  padding-left: var(--pp-gutter);
  padding-right: var(--pp-gutter);
}
/* Tablet and laptop: the tab strip's own bottom line is the first divider.
   Phones have no strip line (HomeSegments), so the card keeps its own. */
/* styles/media.ts's tablet query: a touch phone in landscape stays a phone. */
@media (min-width: 656px) and (pointer: fine), (min-width: 656px) and (pointer: none), (min-width: 656px) and (min-height: 500.02px), (min-width: 960px) {
  [data-testid="postPageFeed"] .pp-list-tabbed > div > article:first-child { border-top-color: transparent; }
}
/* No tabs: the section's own top line is the first divider. */
[data-testid="postPageFeed"] .pp-list-untabbed > div > article:first-child { border-top-color: transparent; }
@container pp-list (max-width: 553px) {
  [data-testid="postPageFeed"] article .mobileXL\\:flex-row { flex-direction: column; }
  [data-testid="postPageFeed"] article :is(.mobileXL\\:w-40, .mobileXL\\:w-60, .mobileXXL\\:w-56) { width: 100%; }
  [data-testid="postPageFeed"] article :is(.mobileXL\\:max-h-40, .mobileXXL\\:max-h-56) { max-height: 12.5rem; }
  [data-testid="postPageFeed"] article .mobileXL\\:mt-0 { margin-top: 1rem; }
  [data-testid="postPageFeed"] article :is(.mobileXL\\:self-start, .mobileXXL\\:self-start) { align-self: auto; }
}
`;

export const FOR_YOU = 'For you';

export type TabKind = 'forYou' | 'tag' | 'source';

export interface FeedTab {
  label: string;
  kind: TabKind;
  posts: Post[];
  /**
   * Keeps paging past the last post, as For you does in production: the
   * feed is the reader's own, so it never runs out. Defaults to For you.
   */
  infinite?: boolean;
}

const isInfinite = (tab: FeedTab): boolean =>
  tab.infinite ?? tab.kind === 'forYou';

/** How many of the post's tags get a tab of their own. */
export const MAX_TAG_TABS = 3;

/**
 * The tabs a post gets: For you, then up to three of its tags, then its
 * source. Each tab maps to a feed production can already serve, except For
 * you (see the Spec): a tag tab is the tag feed, the source tab the source
 * feed, both without this post.
 */
export const tabsFor = (host: Post): FeedTab[] => {
  const others = rankFor(host).map(({ post }) => post);
  const tabs: FeedTab[] = [{ label: FOR_YOU, kind: 'forYou', posts: others }];
  (host.tags ?? []).slice(0, MAX_TAG_TABS).forEach((tag) => {
    tabs.push({
      label: `#${tag}`,
      kind: 'tag',
      posts: others.filter((post) => post.tags?.includes(tag)),
    });
  });
  const fromSource = others.filter(
    (post) => post.source?.id === host.source?.id,
  );
  // No tab for a source with nothing else to show: a guaranteed empty tab
  // is a dead click.
  if (host.source?.name && fromSource.length) {
    tabs.push({ label: host.source.name, kind: 'source', posts: fromSource });
  }
  return tabs;
};

/** What the feed shows. `live` pages for real; the rest freeze one state. */
export type FeedState =
  | 'live'
  | 'loading'
  | 'loadingMore'
  | 'end'
  | 'empty'
  | 'error';

export interface KeepReadingProps {
  host: Post;
  /** The tab it opens on. */
  initialTab?: string;
  state?: FeedState;
  /** Posts per page. */
  pageSize?: number;
  /** Reports the active tab, for the Playground. */
  onTabChange?: (label: string) => void;
  /** Tabs made up for a review case, in place of the post's own. */
  tabs?: FeedTab[];
}

const scrollToTop = (node: HTMLElement | null): void =>
  node?.ownerDocument.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });

/** The end of a tag or source tab. New: production feeds never end. */
const EndOfFeed = ({
  tab,
  onTop,
}: {
  tab: FeedTab;
  onTop: () => void;
}): ReactElement => (
  <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-10 text-center">
    <strong className="typo-title3">You’re all caught up</strong>
    <p className="text-pretty text-text-tertiary typo-callout">
      That’s every {tab.label} post for now.
    </p>
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<ArrowIcon />}
        onClick={onTop}
      >
        Back to top
      </Button>
      <Button
        tag="a"
        href={webappUrl}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
      >
        Go to my feed
      </Button>
    </div>
  </div>
);

/**
 * SimilarEmptyScreen's content, rebuilt from the same parts: as shipped, its
 * tag row sits in a second flex row that cannot shrink (flex-shrink is 0
 * app-wide), so on a phone the tags run off both edges. Here they wrap.
 */
const NothingSimilar = ({ host }: { host: Post }): ReactElement => (
  <div className="flex w-full flex-col items-center py-6">
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Inline}
      image={cloudinaryCharmSearchNoResults}
      imageAlt="daily.dev charm searching with a magnifying glass"
      title="No similar posts yet"
      description={
        host.title
          ? `Nothing close to "${host.title}" has been posted yet.`
          : 'Nothing close to this post has been posted yet.'
      }
    />
    {!!host.tags?.length && (
      <div className="mt-6 w-full px-4">
        <TagLinks
          tags={host.tags}
          className={{ container: 'justify-center gap-3' }}
          buttonProps={{ size: ButtonSize.Large }}
        />
      </div>
    )}
  </div>
);

const Placeholders = ({ count }: { count: number }): ReactElement => (
  <>
    {Array.from({ length: count }, (_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <PlaceholderList key={index} />
    ))}
  </>
);

/** One tab's list: production list cards, paged by InfiniteScrolling. */
const TabFeed = ({
  host,
  tab,
  state,
  pageSize,
  onTop,
  onShowForYou,
}: {
  host: Post;
  tab: FeedTab;
  state: FeedState;
  pageSize: number;
  onTop: () => void;
  onShowForYou: () => void;
}): ReactElement => {
  const [count, setCount] = useState(
    state === 'end' ? tab.posts.length : pageSize,
  );
  const [fetching, setFetching] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const fetchNextPage = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setFetching(true);
        timer.current = window.setTimeout(() => {
          setCount((current) => current + pageSize);
          setFetching(false);
          resolve();
        }, 700);
      }),
    [pageSize],
  );

  if (state === 'loading') {
    return <Placeholders count={3} />;
  }

  if (state === 'error') {
    // Not Feed's FeedErrorScreen: that is a full-page "Production is down",
    // wrong under a post that loaded fine. Production needs Feed to accept
    // this as its error screen (see the guide).
    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        image={cloudinaryCharmNoPosts}
        imageAlt="daily.dev charm with an empty feed"
        title="We couldn’t load more posts"
        description="Your post is fine. The posts under it didn’t load."
        action={{ label: 'Try again', onClick: () => undefined }}
        className="py-10"
      />
    );
  }

  if (state === 'empty' || (tab.kind === 'forYou' && !tab.posts.length)) {
    return <NothingSimilar host={host} />;
  }

  if (!tab.posts.length) {
    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Inline}
        image={cloudinaryCharmNoPosts}
        imageAlt="daily.dev charm with an empty feed"
        title={`No other ${tab.label} posts yet`}
        description="New posts on this topic will show up here."
        action={{ label: 'Show posts for you', onClick: onShowForYou }}
        className="py-10"
      />
    );
  }

  // An infinite tab keeps paging through its posts; in production each page
  // is a new page of the reader's feed.
  const infinite = isInfinite(tab);
  const total = tab.posts.length;
  const visible = (
    infinite
      ? Array.from({ length: count }, (_, index) => ({
          post: tab.posts[index % total],
          key: `${tab.posts[index % total].id}-${Math.floor(index / total)}`,
        }))
      : tab.posts.slice(0, count).map((post) => ({ post, key: post.id }))
  ) as { post: Post; key: string }[];
  const ended = !infinite && state !== 'loadingMore' && count >= total;

  return (
    <>
      <InfiniteScrolling
        canFetchMore={state === 'live' && !fetching && !ended}
        isFetchingNextPage={state === 'loadingMore' || fetching}
        fetchNextPage={fetchNextPage}
        placeholder={<Placeholders count={2} />}
      >
        {visible.map(({ post, key }) => (
          <ActivePostContextProvider key={key} post={post}>
            <ListCard post={post} />
          </ActivePostContextProvider>
        ))}
      </InfiniteScrolling>
      {ended && <EndOfFeed tab={tab} onTop={onTop} />}
    </>
  );
};

const tabChip = (active: boolean): string =>
  classNames(
    'shell-press shrink-0 rounded-10 border px-2.5 py-1.5 font-bold typo-callout',
    active
      ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary hover:bg-surface-hover'
      : 'border-transparent text-text-tertiary hover:text-text-primary',
  );

/**
 * The tabs, in the home feed's own recipe at each width, and no visible
 * title: like the home feed, the tabs say what the list is (its heading is
 * for screen readers only).
 *
 * - phone: HomeSegments, the real ShellRow and Segments, staying under the
 *   page row while the feed scrolls;
 * - tablet: UnifiedMobileFeedNav's chip strip (FeedNav, below laptop),
 *   sticky at the top as on the home feed;
 * - laptop: the v2 page header strip (PageHeader, min-h-14, quaternary
 *   line) with ExploreChipsBar's tabs: small buttons, the active one Float
 *   with a short underline, a fade where they overflow.
 */
const FeedHeader = ({
  tabs,
  active,
  showTabs,
  onSelect,
}: {
  tabs: FeedTab[];
  active: string;
  showTabs: boolean;
  onSelect: (label: string) => void;
}): ReactElement => (
  <>
    <h2 id="keep-reading-title" className="sr-only">
      Keep reading
    </h2>
    {showTabs && (
      <div className="sticky top-[3.25rem] z-1 bg-background-default tablet:hidden">
        <ShellRow>
          <Segments
            items={tabs.map((tab) => ({
              key: tab.label,
              label: tab.label,
              active: tab.label === active,
              onClick: () => onSelect(tab.label),
            }))}
          />
        </ShellRow>
      </div>
    )}
    {showTabs && (
      <div className="sticky top-0 z-1 hidden w-full items-stretch border-b border-border-subtlest-tertiary bg-background-default tablet:flex laptop:hidden">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto bg-background-default px-3 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              aria-pressed={tab.label === active}
              onClick={() => onSelect(tab.label)}
              className={tabChip(tab.label === active)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Laptop: the page header strip; the first label lines up with the
        post's text (a small button's 12px in from the gutter). */}
    {showTabs && (
      <header className="hidden min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-[calc(var(--pp-gutter)-0.75rem)] laptop:flex">
        <div className="relative min-w-0 flex-1">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12">
            {tabs.map((tab) => {
              const isActive = tab.label === active;
              return (
                <span
                  key={tab.label}
                  className="relative flex shrink-0 items-center py-3"
                >
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    pressed={isActive}
                    variant={
                      isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                    }
                    onClick={() => onSelect(tab.label)}
                  >
                    {tab.label}
                  </Button>
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 mx-auto w-1/2 border-b-2 border-text-primary"
                    />
                  )}
                </span>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default" />
        </div>
      </header>
    )}
  </>
);

export const KeepReading = ({
  host,
  initialTab = FOR_YOU,
  state = 'live',
  pageSize = 7,
  onTabChange,
  tabs: tabsOverride,
}: KeepReadingProps): ReactElement => {
  const tabs = useMemo(
    () => tabsOverride ?? tabsFor(host),
    [host, tabsOverride],
  );
  const [active, setActive] = useState(() =>
    tabs.some((tab) => tab.label === initialTab) ? initialTab : FOR_YOU,
  );
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    setActive(
      tabs.some((tab) => tab.label === initialTab) ? initialTab : FOR_YOU,
    );
  }, [initialTab, tabs]);

  const select = (label: string) => {
    setActive(label);
    onTabChange?.(label);
  };
  const onTop = () => scrollToTop(root.current);
  // A single tab needs no bar: the title says what the list is.
  const showTabs = tabs.length > 1 && state !== 'empty';

  const current = tabs.find((tab) => tab.label === active) ?? tabs[0];
  const list = (tab: FeedTab): ReactNode => (
    <div
      className={classNames(
        // Inside the v2 card, feed dividers are the quaternary line.
        'pp-list flex flex-col laptop:[&_article]:!border-border-subtlest-quaternary',
        showTabs ? 'pp-list-tabbed' : 'pp-list-untabbed',
      )}
    >
      <TabFeed
        key={`${tab.label}-${state}`}
        host={host}
        tab={tab}
        state={state}
        pageSize={pageSize}
        onTop={onTop}
        onShowForYou={() => select(FOR_YOU)}
      />
    </div>
  );

  return (
    <section
      ref={root}
      aria-labelledby="keep-reading-title"
      data-testid="postPageFeed"
      className="m-auto flex w-full max-w-[69.25rem] flex-col border-t border-border-subtlest-tertiary pb-[8.25rem] [--pp-gutter:1rem] tablet:pb-12 tablet:[--pp-gutter:1.5rem] laptop:flex-row laptop:border-x laptop:pb-0 laptop:[--pp-gutter:2rem]"
    >
      <style>{feedCss}</style>
      {/* The post's main column, continued: same width and edges, the
          post's own inset for text, every divider edge to edge. */}
      <div className="flex min-w-0 flex-1 flex-col laptop:border-r laptop:border-border-subtlest-tertiary laptop:pt-0">
        <FeedHeader
          tabs={tabs}
          active={current.label}
          showTabs={showTabs}
          onSelect={select}
        />
        <React.Fragment key={current.label}>{list(current)}</React.Fragment>
      </div>
      {/* The post's side column continues, empty: the feed is the page. */}
      <div aria-hidden className="hidden w-[21.25rem] shrink-0 laptop:block" />
    </section>
  );
};

/* ------------------------------------------------------------ fixtures */

const byType = (type: PostType): Post | undefined =>
  allPosts.find((post) => post.type === type && post.title);

/** One real post of each type the post page renders, for the host. */
export const HOSTS: { id: string; label: string; post: Post }[] = [
  { label: 'Article', type: PostType.Article },
  { label: 'Video', type: PostType.VideoYouTube },
  { label: 'Share', type: PostType.Share },
  { label: 'Post (freeform)', type: PostType.Freeform },
  { label: 'Poll', type: PostType.Poll },
  { label: 'Collection', type: PostType.Collection },
  { label: 'X post', type: PostType.SocialTwitter },
]
  .map(({ label, type }) => ({ label, post: byType(type) }))
  .filter((entry): entry is { label: string; post: Post } => !!entry.post)
  .map((entry) => ({ ...entry, id: entry.post.id }));
