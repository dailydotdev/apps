import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { PostItem } from '../../graphql/posts';
import { isVideoPost } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { Image } from '../image/Image';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getPostPath } from '../../lib/links';
import { largeNumberFormat } from '../../lib/numberFormat';
import { Separator } from '../cards/common/common';
import { PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import { ReadingHistoryOptionsMenu } from './ReadingHistoryOptionsMenu';

export const getReadingHistoryItemKey = ({
  post,
  timestampDb,
  timestamp,
}: PostItem): string =>
  `${post.id}-${new Date(timestampDb ?? timestamp ?? 0).getTime()}`;

const isModifiedClick = (event: MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;

interface ReadingHistoryRowProps {
  item: PostItem;
  onHide: () => Promise<unknown>;
  // In the laptop column a click selects the read instead of opening it.
  onSelect?: () => void;
  isSelected?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLAnchorElement>) => void;
}

export function ReadingHistoryRow({
  item,
  onHide,
  onSelect,
  isSelected = false,
  onKeyDown,
}: ReadingHistoryRowProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { post } = item;
  const article = post.sharedPost ?? post;
  const title = post.title || post.sharedPost?.title;
  const { source } = post;
  const isUserSource = isSourceUserSource(source);
  const sourceImage =
    isUserSource && post.author?.image ? post.author.image : source?.image;
  const sourceName =
    isUserSource && post.author?.name ? post.author.name : source?.name;
  const isVideo = isVideoPost(post);
  const numUpvotes = post.numUpvotes ?? 0;
  const isColumn = !!onSelect;
  const postPath = getPostPath(post);

  return (
    <div
      data-selected={isSelected || undefined}
      className={classNames(
        'group relative flex items-center rounded-16',
        isSelected ? 'bg-surface-float' : 'hover:bg-surface-hover',
      )}
    >
      <Link href={postPath}>
        <a
          href={postPath}
          aria-current={isSelected ? 'true' : undefined}
          data-post-key={getReadingHistoryItemKey(item)}
          title={title ?? undefined}
          onKeyDown={onKeyDown}
          onClick={(event) => {
            if (onSelect && !isModifiedClick(event)) {
              event.preventDefault();
              onSelect();
            }
          }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-16 py-3 pl-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-blueCheese-default"
        >
          <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-12 bg-surface-float">
            <Image
              src={article.image}
              alt=""
              loading="lazy"
              fallbackSrc={cloudinaryPostImageCoverPlaceholder}
              className="size-full object-cover"
            />
            {isVideo && !!article.readTime && (
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-6 bg-overlay-primary-pepper px-1 font-bold text-white typo-caption2">
                <PlayIcon size={IconSize.XXSmall} />
                {article.readTime}m
              </span>
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="line-clamp-2 break-words font-bold text-text-primary typo-callout">
              {title}
            </span>
            <span className="flex min-w-0 items-center text-text-tertiary typo-footnote">
              {sourceImage && (
                <ProfilePicture
                  size={ProfileImageSize.XSmall}
                  rounded={isUserSource ? ProfileImageSize.XSmall : 'full'}
                  user={{ image: sourceImage, username: sourceName ?? '' }}
                  nativeLazyLoading
                />
              )}
              <span className="ml-1.5 min-w-0 shrink truncate">{sourceName}</span>
              {numUpvotes > 0 && (
                <>
                  <Separator />
                  <span className="shrink-0">
                    {largeNumberFormat(numUpvotes)}{' '}
                    {numUpvotes === 1 ? 'upvote' : 'upvotes'}
                  </span>
                </>
              )}
            </span>
          </span>
        </a>
      </Link>
      <div
        className={classNames(
          'shrink-0 px-1',
          isColumn &&
            !isSelected &&
            !isMenuOpen &&
            'laptop:opacity-0 laptop:focus-within:opacity-100 laptop:group-hover:opacity-100',
        )}
      >
        <ReadingHistoryOptionsMenu
          post={post}
          onHide={onHide}
          onOpenChange={setIsMenuOpen}
          withRowActions
        />
      </div>
    </div>
  );
}
