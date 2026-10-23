import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { laptopQuery, phoneQuery, useMediaQueryIn } from '../../history/device';
import type { Ranked } from './data';
import {
  compact,
  coverOf,
  rankFor,
  reasonCopy,
  shelvesFor,
  titleOf,
} from './data';
import {
  Byline,
  Chips,
  Cover,
  FeedHeader,
  GridCard,
  ListCard,
  PostLink,
  Row,
  Tile,
  TilePlaceholder,
  useMore,
  useOpen,
} from './kit';

// The five feeds under the post. Each one answers the same question, "what
// now?", with a different bet on why a reader is still on the page:
//
// A  List      they want more of the same, in the shape they already know
// B  Grid      they are done with this post and want their feed back
// C  Shelves   they want to choose a direction: topic, source, format
// D  Up next   they are in a reading mood, so keep them reading
// E  Edition   they want a short, finished set, not an endless one

interface FeedProps {
  host: Post;
}

/** The post page's frame: same width and side borders as the post above. */
const Frame = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'm-auto w-full max-w-[69.25rem] border-t border-border-subtlest-tertiary laptop:border-x',
      className,
    )}
  >
    {children}
  </div>
);

const useScreen = () => {
  const ref = useRef<HTMLDivElement>(null);
  const laptop = useMediaQueryIn(ref, laptopQuery);
  const phone = useMediaQueryIn(ref, phoneQuery);
  return { ref, laptop, phone, ready: laptop !== undefined };
};

const scrollTop = (node: HTMLElement | null): void =>
  node?.ownerDocument.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });

const BackToTop = ({ className }: { className?: string }): ReactElement => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Button
      ref={ref}
      type="button"
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      icon={<ArrowIcon />}
      onClick={() => scrollTop(ref.current)}
      className={className}
    >
      Back to top
    </Button>
  );
};

/* ================================================================= A */

type ListFilter = 'all' | `tag:${string}` | 'source';

const ListFeed = ({ host }: FeedProps): ReactElement => {
  const ranked = useMemo(() => rankFor(host), [host]);
  const [filter, setFilter] = useState<ListFilter>('all');
  const tags = (host.tags ?? []).slice(0, 3);
  const list = useMemo(() => {
    if (filter === 'source') {
      return ranked.filter((r) => r.post.source?.id === host.source?.id);
    }
    if (filter.startsWith('tag:')) {
      const tag = filter.slice(4);
      return ranked.filter((r) => r.post.tags?.includes(tag));
    }
    return ranked;
  }, [filter, host, ranked]);
  const { visible, sentinel, loading } = useMore(list, 8);
  const filters: { id: ListFilter; label: string }[] = [
    { id: 'all', label: 'For you' },
    ...tags.map((tag) => ({
      id: `tag:${tag}` as ListFilter,
      label: `#${tag}`,
    })),
    { id: 'source', label: host.source?.name ?? 'Source' },
  ];

  return (
    <Frame className="pb-24 tablet:pb-12">
      <div className="flex flex-col laptopL:flex-row">
        <section className="flex min-w-0 flex-1 flex-col laptopL:border-r laptopL:border-border-subtlest-tertiary">
          <div className="flex flex-col gap-4 px-4 pb-2 pt-8 tablet:px-6 laptop:px-8">
            <FeedHeader
              eyebrow="Keep reading"
              title="More posts like this one"
              lead="Your feed, filtered to what you just read. Change the filter to steer it."
            />
            <Chips items={filters} value={filter} onChange={setFilter} />
          </div>
          <div className="flex flex-col tablet:px-2 laptop:px-4">
            {visible.map(({ post }) => (
              <div key={post.id} className="pp-in">
                <ListCard post={post} />
              </div>
            ))}
            {loading &&
              [0, 1].map((key) => (
                <div key={key} className="flex gap-4 px-4 py-4">
                  <TilePlaceholder className="flex-1" />
                </div>
              ))}
            {!list.length && (
              <p className="px-4 py-10 text-center text-text-tertiary typo-callout">
                Nothing else here yet. Try another filter.
              </p>
            )}
          </div>
          {sentinel}
        </section>
        <aside className="hidden w-[21.25rem] shrink-0 px-4 pt-8 laptopL:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
              <span className="font-bold typo-callout">Why these posts</span>
              <p className="text-text-tertiary typo-footnote">
                They share a topic or a source with the post above, ranked by
                how much developers engaged with them.
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-8 bg-surface-float px-2 py-1 text-text-secondary typo-footnote"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <BackToTop className="self-start" />
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ================================================================= B */

/** Where the post ends: a quiet line that hands the page to the feed. */
const EndOfPost = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex items-center gap-4 py-8 text-text-quaternary typo-footnote">
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    <span className="flex items-center gap-2">{children}</span>
    <span className="h-px flex-1 bg-border-subtlest-tertiary" />
  </div>
);

const GridFeed = ({ host }: FeedProps): ReactElement => {
  const ranked = useMemo(() => rankFor(host), [host]);
  const { ref, laptop, phone, ready } = useScreen();
  const { visible, sentinel, loading } = useMore(ranked, laptop ? 12 : 8);

  return (
    <section
      ref={ref}
      className="w-full border-t border-border-subtlest-tertiary bg-background-default px-4 pb-24 tablet:px-6 tablet:pb-12 laptop:px-10"
    >
      <EndOfPost>
        <SparkleIcon size={IconSize.XSmall} />
        You finished this post
      </EndOfPost>
      <FeedHeader
        title="Your feed, right here"
        lead="No need to go back. Pick up your feed where you left it."
        actions={<BackToTop className="hidden tablet:flex" />}
        className="mb-6"
      />
      {ready && (
        <div
          className={classNames(
            'grid',
            laptop
              ? 'grid-cols-[repeat(auto-fill,minmax(17.5rem,1fr))] gap-8'
              : 'gap-x-3 gap-y-6',
            !laptop && (phone ? 'grid-cols-2' : 'grid-cols-3 gap-x-4'),
          )}
        >
          {visible.map(({ post }) => (
            <div key={post.id} className="pp-in grid min-w-0">
              {laptop ? <GridCard post={post} /> : <Tile post={post} card />}
            </div>
          ))}
          {loading && [0, 1, 2].map((key) => <TilePlaceholder key={key} />)}
        </div>
      )}
      {sentinel}
    </section>
  );
};

/* ================================================================= C */

const Shelf = ({
  title,
  lead,
  posts,
  first,
}: {
  title: string;
  lead: string;
  posts: Post[];
  first?: boolean;
}): ReactElement => {
  const row = useRef<HTMLDivElement>(null);
  const { ref, laptop, phone } = useScreen();
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = () => {
    const node = row.current;
    if (!node) {
      return;
    }
    setEdges({
      start: node.scrollLeft < 8,
      end: node.scrollLeft + node.clientWidth > node.scrollWidth - 8,
    });
  };

  const page = (direction: 1 | -1) =>
    row.current?.scrollBy({
      left: direction * row.current.clientWidth * 0.9,
      behavior: 'smooth',
    });

  return (
    <section
      ref={ref}
      className={classNames(
        'flex flex-col gap-4 py-6',
        !first && 'border-t border-border-subtlest-tertiary',
      )}
    >
      <div className="flex items-end gap-4 px-4 tablet:px-6 laptop:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate font-bold typo-title3">{title}</h2>
          <p className="truncate text-text-tertiary typo-footnote">{lead}</p>
        </div>
        {laptop && (
          <div className="flex gap-2">
            <Button
              type="button"
              aria-label="Previous"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="-rotate-90" />}
              disabled={edges.start}
              onClick={() => page(-1)}
            />
            <Button
              type="button"
              aria-label="Next"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-90" />}
              disabled={edges.end}
              onClick={() => page(1)}
            />
          </div>
        )}
      </div>
      <div
        ref={row}
        onScroll={sync}
        className="pp-noscroll pp-snap flex gap-4 overflow-x-auto px-4 tablet:px-6 laptop:gap-6 laptop:px-8"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className={classNames(
              'grid shrink-0',
              phone ? 'w-[68%]' : 'w-[17.5rem]',
            )}
          >
            {laptop ? (
              <GridCard post={post} />
            ) : (
              <Tile post={post} className="w-full" />
            )}
          </div>
        ))}
        <div
          className={classNames(
            'flex shrink-0 flex-col items-center justify-center gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-6 text-center',
            phone ? 'w-[45%]' : 'w-[12rem]',
          )}
        >
          <span className="font-bold typo-callout">See all</span>
          <span className="text-text-tertiary typo-footnote">
            Open this shelf as a feed
          </span>
          <Button
            type="button"
            aria-label={`See all: ${title}`}
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-90" />}
          />
        </div>
      </div>
    </section>
  );
};

const ShelvesFeed = ({ host }: FeedProps): ReactElement => {
  const shelves = useMemo(() => shelvesFor(host), [host]);
  return (
    <Frame className="pb-24 tablet:pb-12">
      <div className="px-4 pt-8 tablet:px-6 laptop:px-8">
        <FeedHeader
          eyebrow="Where to next"
          title="Pick a direction"
          lead="Each row is one reason to keep reading. Scroll sideways inside a row, down to change direction."
        />
      </div>
      {shelves.map((shelf, index) => (
        <Shelf
          key={shelf.id}
          title={shelf.title}
          lead={shelf.lead}
          posts={shelf.posts}
          first={index === 0}
        />
      ))}
    </Frame>
  );
};

/* ================================================================= D */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** The next post, as its own page would open: the reading continues. */
const NextPost = ({
  item,
  index,
  total,
  onSkip,
  skipped,
}: {
  item: Ranked;
  index: number;
  total: number;
  onSkip: () => void;
  skipped: boolean;
}): ReactElement => {
  const { post, reason } = item;
  const open = useOpen();
  const [expanded, setExpanded] = useState(false);
  const summary = post.summary || post.sharedPost?.summary;

  if (skipped) {
    return (
      <div className="border-t border-border-subtlest-tertiary px-4 tablet:px-6 laptop:px-8">
        <Row
          post={post}
          meta={
            <span className="text-text-quaternary typo-footnote">
              Skipped · {reasonCopy(reason)}
            </span>
          }
        />
      </div>
    );
  }

  return (
    <article
      id={`next-${index}`}
      className="pp-in flex scroll-mt-20 flex-col border-t border-border-subtlest-tertiary px-4 py-8 tablet:px-6 laptop:px-8"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="pp-nums rounded-8 bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption1">
          Up next · {index + 1} of {total}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {reasonCopy(reason)}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <SourceAvatar
          source={post.source as Source}
          size={ProfileImageSize.Medium}
          className="!mr-0"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-footnote">
            {post.source?.name}
          </span>
          <span className="pp-nums text-text-tertiary typo-footnote">
            {post.createdAt && formatDate(post.createdAt)}
            {post.readTime ? ` · ${post.readTime}m read` : ''}
          </span>
        </div>
      </div>
      <h2 className="mb-4 text-balance break-words font-bold typo-title1">
        {titleOf(post)}
      </h2>
      {summary && (
        <div className="mb-5 rounded-16 border border-border-subtlest-tertiary p-4">
          <p
            className={classNames(
              'text-pretty text-text-secondary typo-callout',
              !expanded && 'line-clamp-4',
            )}
          >
            <strong className="text-text-primary">TL;DR </strong>
            {summary}
          </p>
          {!expanded && summary.length > 280 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 font-bold text-text-link typo-footnote"
            >
              Show more
            </button>
          )}
        </div>
      )}
      {coverOf(post) && (
        <PostLink post={post} className="mb-5">
          <Cover
            post={post}
            className="aspect-[2/1] w-full"
            rounded="rounded-16"
          />
        </PostLink>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={() => open(post)}
        >
          {post.type === PostType.VideoYouTube
            ? 'Watch the video'
            : 'Read this post'}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={onSkip}
        >
          Not now
        </Button>
        <span className="pp-nums ml-auto flex items-center gap-3 text-text-tertiary typo-footnote">
          <span>{compact(post.numUpvotes)} upvotes</span>
          <span>{compact(post.numComments)} comments</span>
        </span>
      </div>
    </article>
  );
};

/** Floats above the fold once the post is done: what is next, one tap away. */
const UpNextPill = ({
  next,
  anchor,
}: {
  next?: Post;
  anchor: React.RefObject<HTMLElement>;
}): ReactElement | null => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = anchor.current;
    const view = node?.ownerDocument.defaultView;
    if (!node || !view) {
      return undefined;
    }
    const sync = () => {
      const { top } = node.getBoundingClientRect();
      // From the last screen of the post until the first next post is up.
      setShown(top < view.innerHeight * 2 && top > view.innerHeight * 0.8);
    };
    sync();
    view.addEventListener('scroll', sync, { passive: true });
    view.addEventListener('resize', sync);
    return () => {
      view.removeEventListener('scroll', sync);
      view.removeEventListener('resize', sync);
    };
  }, [anchor]);

  if (!next) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() =>
        anchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={classNames(
        'fixed bottom-24 left-1/2 z-postNavigation flex w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 pr-3 text-left shadow-2 transition-[opacity,transform] duration-300 tablet:bottom-8 laptop:left-[calc(50%+7.5rem)]',
        shown ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <Cover post={next} className="size-10 shrink-0" rounded="rounded-10" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-tertiary typo-caption1">
          Up next
        </span>
        <span className="truncate font-bold typo-footnote">
          {titleOf(next)}
        </span>
      </span>
      <ArrowIcon className="rotate-180 text-text-secondary" />
    </button>
  );
};

const NextFeed = ({ host }: FeedProps): ReactElement => {
  const ranked = useMemo(() => rankFor(host).slice(0, 12), [host]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const { visible, sentinel } = useMore(ranked, 3);
  const anchor = useRef<HTMLDivElement>(null);
  const next = ranked.find(({ post }) => !skipped.has(post.id))?.post;

  const skip = (index: number, id: string) => {
    setSkipped((current) => new Set(current).add(id));
    const view = anchor.current?.ownerDocument;
    view?.getElementById(`next-${index + 1}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Frame className="pb-24 tablet:pb-12">
      <div ref={anchor} className="flex flex-col laptopL:flex-row">
        <div className="flex min-w-0 flex-1 flex-col laptopL:border-r laptopL:border-border-subtlest-tertiary">
          {visible.map((item, index) => (
            <NextPost
              key={item.post.id}
              item={item}
              index={index}
              total={ranked.length}
              skipped={skipped.has(item.post.id)}
              onSkip={() => skip(index, item.post.id)}
            />
          ))}
          {sentinel}
        </div>
        <aside className="hidden w-[21.25rem] shrink-0 px-4 pt-8 laptopL:block">
          <div className="sticky top-24 flex flex-col gap-1">
            <span className="mb-2 font-bold typo-callout">
              Your reading queue
            </span>
            {ranked.slice(0, 6).map(({ post }, index) => (
              <Row
                key={post.id}
                post={post}
                index={index}
                meta={
                  <span className="pp-nums flex items-center gap-1 text-text-tertiary typo-footnote">
                    <TimerIcon size={IconSize.XSmall} />
                    {skipped.has(post.id)
                      ? 'Skipped'
                      : `${post.readTime ?? 3}m read`}
                  </span>
                }
              />
            ))}
          </div>
        </aside>
      </div>
      <UpNextPill next={next} anchor={anchor} />
    </Frame>
  );
};

/* ================================================================= E */

const onImage = { color: '#fff' };
const scrim = {
  backgroundImage:
    'linear-gradient(to top, rgba(14,17,22,0.92), rgba(14,17,22,0.55) 45%, rgba(14,17,22,0) 75%)',
};

/** The edition's lead story: the cover is the card. */
const Hero = ({ item }: { item: Ranked }): ReactElement => (
  <PostLink
    post={item.post}
    className="relative overflow-hidden rounded-20 bg-surface-float"
  >
    <div className="relative aspect-[4/3] w-full laptop:aspect-auto laptop:min-h-[26rem] laptop:flex-1">
      <Image
        src={coverOf(item.post)}
        alt=""
        loading="lazy"
        type={ImageType.Post}
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/tile:scale-[1.03]"
      />
      <div className="absolute inset-0" style={scrim} />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 laptop:p-6"
        style={onImage}
      >
        <span className="self-start rounded-8 bg-overlay-primary-pepper px-2 py-0.5 font-bold typo-caption1">
          {reasonCopy(item.reason)}
        </span>
        <h3 className="text-balance break-words font-bold typo-title2 laptop:typo-title1">
          {titleOf(item.post)}
        </h3>
        <span className="flex items-center gap-1 opacity-[0.84] typo-footnote">
          <SourceAvatar
            source={item.post.source as Source}
            size={ProfileImageSize.XSmall}
            className="!mr-1"
          />
          {item.post.source?.name} · {compact(item.post.numUpvotes)} upvotes
        </span>
      </div>
    </div>
  </PostLink>
);

/** Image beside text: the edition's second tier. */
const Feature = ({ post }: { post: Post }): ReactElement => (
  <PostLink post={post} className="!flex-row gap-4">
    <Cover post={post} className="aspect-[4/3] w-2/5 shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
      <h3 className="line-clamp-3 break-words font-bold typo-body group-hover/tile:underline">
        {titleOf(post)}
      </h3>
      <p className="line-clamp-2 text-text-tertiary typo-footnote">
        {post.summary}
      </p>
      <Byline post={post} className="mt-auto" />
    </div>
  </PostLink>
);

const Column = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-w-0 flex-col">
    <span className="mb-1 flex items-center gap-2 border-b border-border-subtlest-tertiary pb-2 font-bold uppercase tracking-[0.08em] text-text-tertiary typo-caption1">
      {icon}
      {title}
    </span>
    <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
      {children}
    </div>
  </div>
);

/** Ten posts as one finished page: lead, two features, three short lists. */
const Edition = ({
  items,
  number,
}: {
  items: Ranked[];
  number: number;
}): ReactElement | null => {
  const { ref, laptop, phone } = useScreen();
  const [hero, a, b, ...rest] = items;
  const discussed = [...rest]
    .sort((x, y) => (y.post.numComments ?? 0) - (x.post.numComments ?? 0))
    .slice(0, 3);
  const others = rest.filter((item) => !discussed.includes(item));
  const video = others.find((item) => item.post.type === PostType.VideoYouTube);
  const quick = others
    .filter((item) => item !== video)
    .sort((x, y) => (x.post.readTime ?? 9) - (y.post.readTime ?? 9))
    .slice(0, 3);

  if (!hero) {
    return null;
  }

  return (
    <div ref={ref} className="pp-in flex flex-col gap-8">
      {number > 1 && (
        <div className="flex items-center gap-4 text-text-quaternary typo-footnote">
          <span className="font-bold uppercase tracking-[0.12em]">
            Part {number}
          </span>
          <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        </div>
      )}
      <div
        className={classNames(
          'grid gap-6',
          laptop && 'grid-cols-12',
          !laptop && !phone && 'grid-cols-2',
        )}
      >
        <div
          className={classNames(
            'flex flex-col',
            laptop ? 'col-span-7' : !phone && 'col-span-2',
          )}
        >
          <Hero item={hero} />
        </div>
        <div
          className={classNames(
            'flex flex-col gap-6',
            laptop ? 'col-span-5' : !phone && 'col-span-2',
          )}
        >
          {[a, b]
            .filter(Boolean)
            .map((item) =>
              phone ? (
                <Row key={item.post.id} post={item.post} />
              ) : (
                <Feature key={item.post.id} post={item.post} />
              ),
            )}
        </div>
      </div>
      <div
        className={classNames(
          'grid gap-8',
          laptop && 'grid-cols-3',
          !laptop && !phone && 'grid-cols-2',
        )}
      >
        <Column
          title="Most discussed"
          icon={<DiscussIcon size={IconSize.XSmall} />}
        >
          {discussed.map((item, index) => (
            <Row
              key={item.post.id}
              post={item.post}
              index={index}
              meta={
                <span className="pp-nums text-text-tertiary typo-footnote">
                  {compact(item.post.numComments)} comments
                </span>
              }
            />
          ))}
        </Column>
        <Column title="Quick reads" icon={<TimerIcon size={IconSize.XSmall} />}>
          {quick.map((item) => (
            <Row
              key={item.post.id}
              post={item.post}
              meta={
                <span className="pp-nums text-text-tertiary typo-footnote">
                  {item.post.readTime ?? 2} min · {item.post.source?.name}
                </span>
              }
            />
          ))}
        </Column>
        {video && (
          <div className={classNames(!laptop && !phone && 'col-span-2')}>
            <Column title="Watch" icon={<PlayIcon size={IconSize.XSmall} />}>
              <div className="pt-3">
                <Tile post={video.post} aspect="aspect-video" />
              </div>
            </Column>
          </div>
        )}
      </div>
    </div>
  );
};

const EditionFeed = ({ host }: FeedProps): ReactElement => {
  const ranked = useMemo(() => rankFor(host), [host]);
  const editions = useMemo(() => {
    const pages: Ranked[][] = [];
    // A cover for every lead story: a hero without one reads as broken.
    const pool = [...ranked];
    while (pool.length >= 6) {
      const heroIndex = pool.findIndex((item) => !!coverOf(item.post));
      const [hero] = pool.splice(Math.max(0, heroIndex), 1);
      pages.push([hero, ...pool.splice(0, 9)]);
    }
    return pages;
  }, [ranked]);
  const [count, setCount] = useState(1);
  const today = new Date(2026, 9, 21).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Frame className="pb-24 tablet:pb-12">
      <div className="flex flex-col gap-8 px-4 pt-10 tablet:px-6 laptop:px-8">
        <FeedHeader
          eyebrow={`Your edition · ${today}`}
          title="Ten posts picked after this read"
          lead="A finished set, not an endless scroll. Read what you like, and you are done."
        />
        {editions.slice(0, count).map((items, index) => (
          <Edition key={items[0].post.id} items={items} number={index + 1} />
        ))}
        <div className="flex flex-col items-center gap-3 rounded-20 border border-border-subtlest-tertiary p-6 text-center">
          <span className="font-bold typo-title3">
            {count < editions.length
              ? 'That is the edition'
              : 'You are all caught up'}
          </span>
          <span className="text-pretty text-text-tertiary typo-callout">
            {count < editions.length
              ? 'Want more? The next part is picked the same way.'
              : 'Your feed has everything else.'}
          </span>
          {count < editions.length ? (
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={() => setCount((current) => current + 1)}
            >
              Read part {count + 1}
            </Button>
          ) : (
            <BackToTop />
          )}
        </div>
      </div>
    </Frame>
  );
};

/* ========================================================== registry */

export type VariantId = 'list' | 'grid' | 'shelves' | 'next' | 'edition';

export interface Variant {
  letter: string;
  name: string;
  /** One line: what the reader sees. */
  what: string;
  /** Why it could win. */
  bet: string;
  /** What could go wrong, and what to watch. */
  risk: string;
  /** The number that would decide it. */
  metric: string;
  Feed: ComponentType<FeedProps>;
}

export const VARIANTS: Record<VariantId, Variant> = {
  list: {
    letter: 'A',
    name: 'Keep reading',
    what: 'Production list cards under the comments at every width, the phone feed’s shape, with filter chips for the post’s tags and source.',
    bet: 'Zero learning: it is the card readers already scroll every day, and the chips let them steer without leaving the page.',
    risk: 'On a laptop a single column under a two-column page can feel like a footnote. Watch how deep people scroll it.',
    metric: 'Posts opened from the post page per visit',
    Feed: ListFeed,
  },
  grid: {
    letter: 'B',
    name: 'Feed continues',
    what: 'The page turns into the feed after the post: the real grid cards edge to edge on laptops, two-up tiles on phones.',
    bet: 'Readers who land on a post from search or a share may never have seen the feed. Handing it to them could turn a one-post visit into a session.',
    risk: 'The tinted break has to read as “this is your feed now”, or it looks like the page lost its layout.',
    metric: 'Sessions with 2+ posts that start on a post page',
    Feed: GridFeed,
  },
  shelves: {
    letter: 'C',
    name: 'Pick a direction',
    what: 'Rows that scroll sideways, each one a reason: the same topic, the same source, what is being discussed, videos.',
    bet: 'Every row says why it is there, so the reader chooses a direction instead of being handed one. Good for logged-out visitors we know little about.',
    risk: 'Sideways rows hide most of their content. Watch whether anything past the third card is ever seen.',
    metric: 'Clicks per row, and which reasons win',
    Feed: ShelvesFeed,
  },
  next: {
    letter: 'D',
    name: 'Up next',
    what: 'The next post starts right where this one ends: its TL;DR and cover in the reading column, with a queue on the side and an “Up next” pill.',
    bet: 'Someone who reached the end is in a reading mood. Keep the page a page, not a grid, and they read the next one too.',
    risk: 'It decides for the reader. If the next pick is off, “Not now” has to be fast, or they leave.',
    metric: 'Second post read rate (open plus 30s)',
    Feed: NextFeed,
  },
  edition: {
    letter: 'E',
    name: 'Your edition',
    what: 'A magazine page of ten posts: a lead story, two features, then short lists for the most discussed, quick reads and one video.',
    bet: 'A finished set feels respectful. It has an end, so it sells the next visit, not an endless scroll.',
    risk: 'More editorial, less daily.dev feed. Needs strong covers, and the lead story carries the whole block.',
    metric: 'Clicks per edition, return visits next day',
    Feed: EditionFeed,
  },
};

export const VARIANT_IDS = Object.keys(VARIANTS) as VariantId[];
