import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { HideReadHistoryProps } from '../../graphql/users';
import { ReadHistory } from '../../graphql/posts';
import XIcon from '../../../icons/x.svg';
import MenuIcon from '../../../icons/menu.svg';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import { LazyImage } from '../LazyImage';
import PostMetadataReadingHistory from '../cards/PostMetadataReadingHistory';

interface ReadingHistoryItemProps {
  className?: string;
  history: ReadHistory;
  onHide?: (params: HideReadHistoryProps) => Promise<unknown>;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 rounded-full bg-theme-bg-primary',
);

function ReadingHistoryItem({
  history: { timestamp, post },
  onHide,
  className,
}: ReadingHistoryItemProps): ReactElement {
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    onHide({ postId: post.id, timestamp });
  };

  return (
    <Link href={post.commentsPermalink}>
      <article
        className={classNames(
          'flex relative flex-row items-center py-3 pr-5 pl-9 hover:bg-theme-hover hover:cursor-pointer',
          className,
        )}
      >
        <LazyImage
          imgSrc={post.image}
          imgAlt={post.title}
          className="w-16 laptop:w-24 h-16 rounded-16"
        />
        <SourceShadow />
        <LazyImage
          imgSrc={post.source?.image}
          imgAlt={`source of ${post.title}`}
          className="left-6 w-6 h-6 rounded-full"
          absolute
        />
        <h3 className="flex flex-wrap mr-6 ml-4 flex-1 line-clamp-3 typo-callout">
          {post.title}
          <PostMetadataReadingHistory
            post={post}
            typoClassName="typo-callout"
          />
        </h3>
        {onHide && (
          <Button
            className="btn-tertiary"
            icon={<XIcon />}
            onClick={onHideClick}
          />
        )}
        <Button
          className="btn-tertiary"
          icon={<MenuIcon />}
          onClick={onHideClick}
        />
      </article>
    </Link>
  );
}

export default ReadingHistoryItem;
