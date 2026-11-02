import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { isPostRead, isVideoPost } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { Image } from '../image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getPostPath } from '../../lib/links';
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
 * One saved post at every width, in the history row's shape: title, source
 * and read time, the image at the end, and the reader's note on a line of
 * its own. A read post steps back to the tertiary color; the unread one
 * stays bold.
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
  const sourceName =
    isSourceUserSource(source) && post.author?.name
      ? post.author.name
      : source?.name;
  const isVideo = isVideoPost(post);
  const readTime = article.readTime
    ? `${article.readTime}m ${isVideo ? 'watch' : 'read'}`
    : undefined;
  const meta = [sourceName, readTime].filter(Boolean).join(' · ');
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
        'group relative flex items-start rounded-12 transition-colors duration-150 motion-reduce:transition-none',
        isSelected ? 'bg-surface-float' : 'hover:bg-surface-hover',
        isColumn && 'pr-2',
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
          className="flex min-h-16 min-w-0 flex-1 items-start gap-2.5 rounded-12 py-1.5 pl-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-blueCheese-default"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={classNames(
                'line-clamp-2 break-words font-bold typo-subhead',
                isRead ? 'text-text-tertiary' : 'text-text-primary',
              )}
            >
              {title}
            </span>
            {(meta || hasReminder) && (
              <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-caption1">
                {hasReminder && (
                  <BookmarkReminderIcon
                    size={IconSize.XSmall}
                    className="shrink-0 text-accent-bun-default"
                    aria-label="Reminder set"
                    secondary
                  />
                )}
                <span className="truncate">{meta}</span>
              </span>
            )}
            {note && (
              <span className="flex min-w-0 items-center gap-1 text-action-plus-default typo-caption1">
                <EditIcon size={IconSize.XSmall} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{note}</span>
              </span>
            )}
          </span>
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-10 bg-surface-float">
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
            {isVideo && (
              <PlayIcon
                secondary
                size={IconSize.Small}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              />
            )}
          </span>
        </a>
      </Link>
      <div
        className={classNames(
          'shrink-0 self-center',
          isColumn &&
            'overflow-hidden transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none',
          isColumn &&
            !isMenuOpen &&
            'group-hover:max-w-10 group-hover:opacity-100 group-has-[:focus-visible]:max-w-10 group-has-[:focus-visible]:opacity-100 mouse:max-w-0 mouse:opacity-0',
        )}
      >
        <div className={isColumn ? 'pl-1' : 'px-1'}>
          <BookmarkRowOptionsMenu
            post={post}
            onRemove={onRemove}
            onOpenChange={setIsMenuOpen}
          />
        </div>
      </div>
    </div>
  );
}
