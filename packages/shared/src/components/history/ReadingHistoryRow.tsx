import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { PostItem } from '../../graphql/posts';
import { isVideoPost } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { Image } from '../image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getPostPath } from '../../lib/links';
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
  const sourceName =
    isSourceUserSource(source) && post.author?.name
      ? post.author.name
      : source?.name;
  const isVideo = isVideoPost(post);
  const readTime = article.readTime
    ? `${article.readTime}m ${isVideo ? 'watch' : 'read'}`
    : undefined;
  const meta = [sourceName, readTime].filter(Boolean).join(' · ');
  const isColumn = !!onSelect;
  const postPath = getPostPath(post);

  return (
    <div
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
          data-post-key={getReadingHistoryItemKey(item)}
          title={title ?? undefined}
          onKeyDown={onKeyDown}
          onClick={(event) => {
            if (onSelect && !isModifiedClick(event)) {
              event.preventDefault();
              onSelect();
            }
          }}
          className="flex h-16 min-w-0 flex-1 items-start gap-2.5 rounded-12 py-1.5 pl-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-blueCheese-default"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 break-words font-bold text-text-primary typo-subhead">
              {title}
            </span>
            {meta && (
              <span className="truncate text-text-tertiary typo-caption1">
                {meta}
              </span>
            )}
          </span>
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-10 bg-surface-float">
            <Image
              src={article.image}
              alt=""
              loading="lazy"
              fallbackSrc={cloudinaryPostImageCoverPlaceholder}
              className="size-full object-cover"
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
          <ReadingHistoryOptionsMenu
            post={post}
            onHide={onHide}
            onOpenChange={setIsMenuOpen}
            withRowActions
          />
        </div>
      </div>
    </div>
  );
}
