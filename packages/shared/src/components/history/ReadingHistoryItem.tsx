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
import PostMetadata from '../cards/PostMetadata';
interface ReadingHistoryItemProps {
  className?: string;
  history: ReadHistory;
  onHide?: (params: HideReadHistoryProps) => Promise<unknown>;
  onContextMenu?: (
    event: React.MouseEvent,
    readHistoryPost: ReadHistory,
  ) => void;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 rounded-full bg-theme-bg-primary',
);

export default function ReadingHistoryItem({
  history,
  onHide,
  className,
  onContextMenu,
}: ReadingHistoryItemProps): ReactElement {
  const { timestampDb, post } = history;
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    onHide({ postId: post.id, timestamp: timestampDb });
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
          fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
        />
        <SourceShadow />
        <LazyImage
          imgSrc={post.source?.image}
          imgAlt={`source of ${post.title}`}
          className="left-6 w-6 h-6 rounded-full"
          absolute
        />
        <h3 className="flex flex-wrap flex-1 mr-6 ml-4 line-clamp-3 typo-callout">
          {post.title}
          <PostMetadata
            readTime={post.readTime}
            numUpvotes={post.numUpvotes}
            typoClassName="typo-callout"
          />
        </h3>

        {onHide && (
          <Button
            className="hidden laptop:flex btn-tertiary"
            icon={<XIcon />}
            onClick={onHideClick}
          />
        )}
        <Button
          className="btn-tertiary"
          data-testId={`history-${post.id}`}
          icon={<MenuIcon />}
          onClick={(event) => {
            event.stopPropagation();
            onContextMenu(event, history);
          }}
          buttonSize="small"
        />
      </article>
    </Link>
  );
}
