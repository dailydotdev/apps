import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { compact, coverOf, titleOf } from './data';

// The vocabulary the five variations share: production's feed cards as
// they are, a few compact tiles built from production atoms where a
// variation needs a shape the feed has no card for, and the paging every
// feed under the post uses.

/* ------------------------------------------------------------- opening */

/** Opens a post from the feed: it becomes the page's post. */
const OpenContext = createContext<(post: Post) => void>(() => undefined);

export const OpenProvider = OpenContext.Provider;

export const useOpen = (): ((post: Post) => void) => useContext(OpenContext);

const noop = (): void => undefined;

/** Production's card handlers, with a click opening the post here. */
const useHandlers = () => {
  const open = useOpen();
  return {
    onPostClick: (post: Post) => open(post),
    onPostAuxClick: noop,
    onReadArticleClick: noop,
    onUpvoteClick: noop,
    onDownvoteClick: noop,
    onCommentClick: (post: Post) => open(post),
    onBookmarkClick: noop,
    onCopyLinkClick: noop,
    onShare: noop,
    onMenuClick: noop,
  };
};

/* --------------------------------------------------------------- cards */

/** Production's grid card for the post's type. */
export const GridCard = ({ post }: { post: Post }): ReactElement => {
  const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;
  return <Card post={post} {...useHandlers()} />;
};

/** Production's list card for the post's type, the phone feed's card. */
export const ListCard = ({ post }: { post: Post }): ReactElement => {
  const Card = PostTypeToListCard[post.type] ?? ArticleList;
  return <Card post={post} {...useHandlers()} />;
};

/** Source avatar, name and the post's quiet numbers on one line. */
export const Byline = ({
  post,
  className,
  stats = 'all',
}: {
  post: Post;
  className?: string;
  /** Narrow tiles keep the upvotes only. */
  stats?: 'all' | 'upvotes';
}): ReactElement => (
  <div
    className={classNames(
      'flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote',
      className,
    )}
  >
    <SourceAvatar
      source={post.source as Source}
      size={ProfileImageSize.XSmall}
      className="!mr-1"
    />
    <span className="min-w-0 flex-1 truncate">{post.source?.name}</span>
    <span className="pp-nums flex items-center gap-2">
      <span className="flex items-center gap-0.5">
        <UpvoteIcon size={IconSize.XSmall} />
        {compact(post.numUpvotes)}
      </span>
      {stats === 'all' && (
        <span className="flex items-center gap-0.5">
          <DiscussIcon size={IconSize.XSmall} />
          {compact(post.numComments)}
        </span>
      )}
    </span>
  </div>
);

/** The post's cover, with a play mark on videos. */
export const Cover = ({
  post,
  className,
  rounded = 'rounded-12',
}: {
  post: Post;
  className?: string;
  rounded?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative overflow-hidden bg-surface-float',
      rounded,
      className,
    )}
  >
    <Image
      src={coverOf(post)}
      alt=""
      loading="lazy"
      type={ImageType.Post}
      className="absolute inset-0 size-full object-cover"
    />
    {post.type === PostType.VideoYouTube && (
      <span
        className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-overlay-primary-pepper"
        style={{ color: '#fff' }}
      >
        <PlayIcon size={IconSize.XSmall} secondary />
      </span>
    )}
  </div>
);

/**
 * A post as a link: the whole thing opens it, the way every feed card
 * does, so a tap anywhere on the tile reads it.
 */
export const PostLink = ({
  post,
  className,
  children,
}: {
  post: Post;
  className?: string;
  children: ReactNode;
}): ReactElement => {
  const open = useOpen();
  return (
    <a
      href={post.commentsPermalink}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey) {
          return;
        }
        event.preventDefault();
        open(post);
      }}
      className={classNames(
        'pp-press group/tile flex min-w-0 flex-col text-text-primary',
        className,
      )}
    >
      {children}
    </a>
  );
};

/** Image on top, title, byline: the compact tile two columns fit on a phone. */
export const Tile = ({
  post,
  className,
  aspect = 'aspect-[16/10]',
  card = false,
}: {
  post: Post;
  className?: string;
  aspect?: string;
  /** Dressed as a feed card: production Card's surface, border and radius. */
  card?: boolean;
}): ReactElement => (
  <PostLink
    post={post}
    className={classNames(
      'gap-2',
      card &&
        'w-full rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-2 pb-3 hover:border-border-subtlest-secondary',
      className,
    )}
  >
    <Cover
      post={post}
      className={classNames('w-full', aspect)}
      rounded={card ? 'rounded-8' : undefined}
    />
    <h3
      className={classNames(
        'line-clamp-3 break-words font-bold typo-callout',
        card ? 'px-1' : 'group-hover/tile:underline',
      )}
    >
      {titleOf(post)}
    </h3>
    <Byline
      post={post}
      stats="upvotes"
      className={card ? 'mt-auto px-1' : undefined}
    />
  </PostLink>
);

/** Title first, small square cover on the right: a dense list row. */
export const Row = ({
  post,
  index,
  meta,
}: {
  post: Post;
  /** Ranked lists print the rank in front. */
  index?: number;
  meta?: ReactNode;
}): ReactElement => (
  <PostLink post={post} className="!flex-row items-start gap-3 py-3">
    {index !== undefined && (
      <span className="pp-nums w-6 shrink-0 font-bold text-text-quaternary typo-title2">
        {index + 1}
      </span>
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <h3 className="line-clamp-2 break-words font-bold typo-callout group-hover/tile:underline">
        {titleOf(post)}
      </h3>
      {meta ?? <Byline post={post} />}
    </div>
    <Cover post={post} className="size-14 shrink-0" rounded="rounded-10" />
  </PostLink>
);

/* -------------------------------------------------------------- chrome */

export const FeedHeader = ({
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-end gap-4', className)}>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {eyebrow && (
        <span className="font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption1">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance font-bold typo-title2">{title}</h2>
      {lead && (
        <p className="text-pretty text-text-tertiary typo-callout">{lead}</p>
      )}
    </div>
    {actions}
  </div>
);

/** Production's filter chips: a horizontal row that scrolls on phones. */
export const Chips = <T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}): ReactElement => (
  <div
    role="tablist"
    className={classNames(
      'pp-noscroll -mx-4 flex gap-2 overflow-x-auto px-4 tablet:mx-0 tablet:px-0',
      className,
    )}
  >
    {items.map((item) => (
      <Button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={item.id === value}
        size={ButtonSize.Small}
        variant={
          item.id === value ? ButtonVariant.Primary : ButtonVariant.Float
        }
        onClick={() => onChange(item.id)}
        className="shrink-0"
      >
        {item.label}
      </Button>
    ))}
  </div>
);

/* -------------------------------------------------------------- paging */

/**
 * The feed's infinite scroll: the next page loads when its sentinel nears
 * the viewport, with the feed's placeholder while it "fetches". A button
 * stands in where IntersectionObserver never fires (a hidden pane).
 */
export const useMore = <T,>(
  list: T[],
  page: number,
): {
  visible: T[];
  hasMore: boolean;
  loading: boolean;
  sentinel: ReactElement | null;
} => {
  const [count, setCount] = useState(page);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasMore = count < list.length;

  useEffect(() => setCount(page), [list, page]);

  const load = () => {
    if (loading || !hasMore) {
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setCount((current) => current + page);
      setLoading(false);
    }, 650);
  };

  useEffect(() => {
    const node = ref.current;
    const view = node?.ownerDocument.defaultView;
    if (!node || !view || !hasMore) {
      return undefined;
    }
    const observer = new view.IntersectionObserver(
      ([entry]) => entry.isIntersecting && load(),
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });

  return {
    visible: list.slice(0, count),
    hasMore,
    loading,
    sentinel: hasMore ? (
      <div ref={ref} className="flex justify-center py-6">
        {!loading && (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={load}
          >
            Show more
          </Button>
        )}
      </div>
    ) : null,
  };
};

/** The feed's loading tile, as many as a page holds. */
export const TilePlaceholder = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-3', className)}>
    <ElementPlaceholder className="aspect-[16/10] w-full rounded-12" />
    <ElementPlaceholder className="h-4 w-4/5 rounded-6" />
    <ElementPlaceholder className="h-4 w-3/5 rounded-6" />
  </div>
);

export const kitCss = `
.pp-nums { font-variant-numeric: tabular-nums; }
.pp-noscroll { scrollbar-width: none; }
.pp-noscroll::-webkit-scrollbar { display: none; }
.pp-press { transition: transform 160ms cubic-bezier(0.2, 0, 0, 1); }
.pp-press:active { transform: scale(0.98); }
.pp-snap { scroll-snap-type: x mandatory; scroll-padding-inline: 1rem; }
.pp-snap > * { scroll-snap-align: start; }
@keyframes ppIn { from { opacity: 0; transform: translateY(0.75rem); } to { opacity: 1; transform: none; } }
.pp-in { animation: ppIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pp-in, .pp-press { animation: none; transition: none; }
}
`;
