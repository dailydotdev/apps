import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { isPostRead, isVideoPost } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { Image } from '../image/Image';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getPostPath } from '../../lib/links';
import { Separator } from '../cards/common/common';
import { EditIcon, PlayIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { IconSize } from '../Icon';
import { BookmarkRowOptionsMenu } from './BookmarkRowOptionsMenu';

const isModifiedClick = (event: MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;

interface BookmarkRowProps {
  post: Post;
  onRemove: () => Promise<unknown>;
  // In the laptop column a click selects the post instead of opening it.
  onSelect?: () => void;
  isSelected?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLAnchorElement>) => void;
}

/**
 * One saved post at every width: image, title, source and read time, with
 * the reader's note under them. A read post steps back to the tertiary
 * color; the unread one stays bold.
 */
export function BookmarkRow({
  post,
  onRemove,
  onSelect,
  isSelected = false,
  onKeyDown,
}: BookmarkRowProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const article = post.sharedPost ?? post;
  const title = post.title || post.sharedPost?.title;
  const { source } = post;
  const isUserSource = isSourceUserSource(source);
  const sourceImage =
    isUserSource && post.author?.image ? post.author.image : source?.image;
  const sourceName =
    isUserSource && post.author?.name ? post.author.name : source?.name;
  const isVideo = isVideoPost(post);
  const isRead = isPostRead(post);
  const isColumn = !!onSelect;
  const postPath = getPostPath(post);
  const note = post.bookmark?.note;
  const hasReminder = !!post.bookmark?.remindAt;

  return (
    <div
      data-testid="bookmarkRow"
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
          data-post-id={post.id}
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
              className={classNames(
                'size-full object-cover',
                isRead && 'opacity-64',
              )}
            />
            {isVideo && !!article.readTime && (
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-6 bg-overlay-primary-pepper px-1 font-bold text-white typo-caption2">
                <PlayIcon size={IconSize.XXSmall} />
                {article.readTime}m
              </span>
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={classNames(
                'line-clamp-2 break-words font-bold typo-callout',
                isRead ? 'text-text-tertiary' : 'text-text-primary',
              )}
            >
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
              <span className="ml-1.5 min-w-0 shrink truncate">
                {sourceName}
              </span>
              {!isVideo && !!article.readTime && (
                <>
                  <Separator />
                  <span className="shrink-0">{article.readTime}m read</span>
                </>
              )}
              {hasReminder && (
                <BookmarkReminderIcon
                  size={IconSize.XSmall}
                  className="ml-1.5 shrink-0 text-accent-bun-default"
                  aria-label="Reminder set"
                  secondary
                />
              )}
            </span>
            {note && (
              <span className="flex min-w-0 items-center gap-1 text-action-plus-default typo-footnote">
                <EditIcon size={IconSize.XSmall} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{note}</span>
              </span>
            )}
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
        <BookmarkRowOptionsMenu
          post={post}
          onRemove={onRemove}
          onOpenChange={setIsMenuOpen}
        />
      </div>
    </div>
  );
}
