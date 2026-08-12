import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { PostEngagementCounts } from '@dailydotdev/shared/src/components/cards/SimilarPosts/PostEngagementCounts';
import { ListItemPlaceholder } from '@dailydotdev/shared/src/components/widgets/ListItemPlaceholder';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldSelectedDistrict } from './worldState';
import { useWorldDistrictFeed } from './useWorldDistrictFeed';

interface WorldDistrictFeedProps {
  userId: string;
  /** Whose upvotes these are, for the title on somebody else's world. */
  userName: string;
  isOwn: boolean;
  district: WorldSelectedDistrict;
  onClose: () => void;
}

/* The right rail on laptop, a sheet along the bottom below it. Never full
   screen on a phone: the district you clicked is the thing the list is about,
   and a panel that covers the town covers the reason you opened it. */
const PANEL =
  'pointer-events-auto absolute inset-x-0 bottom-0 z-2 flex max-h-[60%] flex-col rounded-t-16 border-t border-border-subtlest-tertiary bg-background-default laptop:inset-y-0 laptop:left-auto laptop:right-0 laptop:w-80 laptop:max-h-none laptop:rounded-none laptop:border-l laptop:border-t-0';

/**
 * The reading behind a district: every post its owner upvoted in that niche.
 *
 * A district is a count, how much of a topic somebody read, and the count is
 * the one thing the map cannot show you the substance of. This is that
 * substance, and upvotes rather than reads on purpose: a read is a click, an
 * upvote is a verdict, so the list is a recommendation instead of a log.
 *
 * Rows open in a NEW TAB. Following a link out of here tears down the WebGL
 * context and rebuilds the whole world on the way back (camera reframed, the
 * realm you had walked into closed), which is a steep price for reading one
 * article out of a list of twenty.
 */
export function WorldDistrictFeed({
  userId,
  userName,
  isOwn,
  district,
  onClose,
}: WorldDistrictFeedProps): ReactElement {
  const {
    posts,
    isPending,
    isError,
    canFetchMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useWorldDistrictFeed(userId, district.slug);

  return (
    <aside data-world-overlay className={PANEL}>
      <header className="flex flex-none items-start gap-2 border-b border-border-subtlest-tertiary p-4">
        <i
          className="mt-1.5 h-2 w-2 flex-none rounded-2"
          style={{ background: district.color }}
        />
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Callout}
          className="min-w-0 flex-1 break-words"
          bold
        >
          {isOwn ? 'Your' : `${userName}'s`} upvotes in {district.name}
        </Typography>
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          onClick={onClose}
          aria-label="Close district"
        />
      </header>

      {/* The rows carry their own horizontal padding so the hover fill runs the
          full width of the panel rather than stopping inside a gutter. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
        {isPending && (
          <>
            <ListItemPlaceholder />
            <ListItemPlaceholder />
            <ListItemPlaceholder />
          </>
        )}

        {!isPending && !!posts.length && (
          <InfiniteScrolling
            canFetchMore={canFetchMore}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            placeholder={<ListItemPlaceholder />}
          >
            {posts.map((post) => {
              /* A share carries its title on the post it shares, not on itself. */
              const title = post.title || post.sharedPost?.title;

              return (
                <Link key={post.id} href={post.commentsPermalink} passHref>
                  <a
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={title}
                  >
                    <LazyImage
                      imgSrc={post.source?.image ?? ''}
                      imgAlt={post.source?.name ?? ''}
                      className="mt-0.5 h-7 w-7 rounded-full"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Callout}
                        className="line-clamp-3 break-words"
                      >
                        {title}
                      </Typography>
                      <PostEngagementCounts
                        upvotes={post.numUpvotes ?? 0}
                        comments={post.numComments ?? 0}
                        className="text-text-tertiary"
                      />
                    </div>
                  </a>
                </Link>
              );
            })}
          </InfiniteScrolling>
        )}

        {/* Centred in what is left of the panel rather than tucked under the
            header: on laptop this is a full-height column, and a line of grey
            text at the top of it reads as a list that failed to arrive. */}
        {!isPending && !posts.length && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <UpvoteIcon
              size={IconSize.XXLarge}
              className="text-text-disabled"
            />
            <Typography type={TypographyType.Callout} bold>
              {isError
                ? 'These upvotes could not be loaded'
                : 'Nothing upvoted yet'}
            </Typography>
          </div>
        )}
      </div>
    </aside>
  );
}
