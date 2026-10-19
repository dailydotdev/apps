import type { CSSProperties, ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post, PostType } from '@dailydotdev/shared/src/graphql/posts';
import FeedItemComponent from '@dailydotdev/shared/src/components/FeedItemComponent';
import { FeedItemType } from '@dailydotdev/shared/src/components/cards/common/common';
import type { FeaturedWideColSpan } from '@dailydotdev/shared/src/components/cards/common/featuredWide';
import type { FeedItem } from '@dailydotdev/shared/src/hooks/useFeed';
import FeedContext, {
  FeedLayoutProvider,
} from '@dailydotdev/shared/src/contexts/FeedContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import {
  computePlacements,
  SUPPORTED_WIDE_POST_TYPES,
} from '@dailydotdev/shared/src/lib/feedHighlightColSpan';
import styles from '@dailydotdev/shared/src/components/Feed.module.css';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import productionFlags from './productionFlags.json';
import highlights from './highlights.json';

const heroCards = productionFlags.hero_cards;
const widenableTypes = new Set<PostType>(
  [...SUPPORTED_WIDE_POST_TYPES].filter(
    (type) =>
      heroCards.allowedPostTypes[
        type as keyof typeof heroCards.allowedPostTypes
      ],
  ),
);

const handlers = {
  onPostClick: fn(),
  onReadArticleClick: fn(),
  onShare: fn(),
  onMenuClick: fn(),
  onCopyLinkClick: fn(),
  onCommentClick: fn(),
  toggleUpvote: fn(),
  toggleDownvote: fn(),
  toggleBookmark: fn(),
};

// The grid and card choice the production feed renders (`Feed.tsx` and
// `FeedContainer.tsx`), fed a fixed list of posts: same column count per
// breakpoint, same wide-card placement, same card per post type. A Plus
// account gets no ads, so there is no ad cadence to clamp wide cards.
const TodayGrid = ({ posts }: { posts: Post[] }): ReactElement => {
  const { numCards } = useContext(FeedContext);
  const { user } = useAuthContext();
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const columns = numCards.eco;
  const isList = shouldUseListFeedLayout;
  // The For You feed opens with the "Happening Now" highlights card.
  const items = useMemo<FeedItem[]>(
    () => [
      {
        type: FeedItemType.Highlight,
        highlights: highlights as PostHighlight[],
        feedMeta: null,
        dataUpdatedAt: 0,
      },
      ...posts.map((post, index) => ({
        type: FeedItemType.Post as const,
        post,
        page: 0,
        index,
        dataUpdatedAt: 0,
      })),
    ],
    [posts],
  );
  const placements = useMemo(
    () =>
      computePlacements(items, {
        numCards: columns,
        isMobile: !isLaptop,
        isList,
        isEnabled: heroCards.enabled,
        minSpacing: heroCards.minSpacing,
        startIndex: heroCards.startIndex,
        widenableTypes,
      }),
    [items, columns, isLaptop, isList],
  );

  return (
    <div
      className={classNames('relative mx-auto w-full', styles.feed, {
        [styles.cards]: !isList,
      })}
      style={
        {
          '--num-cards': columns,
          '--feed-gap': isList ? '0rem' : '2rem',
        } as CSSProperties
      }
    >
      <div
        className={classNames(
          'grid',
          isList
            ? 'grid-cols-1'
            : [
                'tablet:px-2 laptop:px-6 tablet:py-2 laptop:py-6',
                '[&_article:hover]:!border-border-subtlest-tertiary [&_article]:!border-border-subtlest-quaternary',
                'gap-8',
                `grid-cols-${columns}`,
              ],
        )}
      >
        {items.map((item, index) => {
          const placement = placements[index];
          const wideColSpan =
            placement.colSpan > 1
              ? (placement.colSpan as FeaturedWideColSpan)
              : undefined;
          const card = (
            <FeedItemComponent
              key={item.type === FeedItemType.Post ? item.post.id : index}
              item={item}
              index={index}
              row={placement.row}
              column={placement.column}
              columns={columns}
              openNewTab
              postMenuIndex={undefined}
              user={user}
              feedName="my-feed"
              virtualizedNumCards={columns}
              wideColSpan={wideColSpan}
              {...handlers}
            />
          );

          if (!wideColSpan) {
            return card;
          }

          return (
            <div
              key={item.type === FeedItemType.Post ? item.post.id : index}
              className="flex h-full w-full [&>*]:h-full [&>*]:w-full"
              style={{ gridColumn: `span ${placement.colSpan}` }}
            >
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const myFeed = { feedName: SharedFeedPage.MyFeed };

export const TodayFeed = ({ posts }: { posts: Post[] }): ReactElement => (
  <ActiveFeedNameContext.Provider value={myFeed}>
    <FeedLayoutProvider>
      <TodayGrid posts={posts} />
    </FeedLayoutProvider>
  </ActiveFeedNameContext.Provider>
);
