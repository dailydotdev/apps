import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import { HideReadHistoryProps, ReadHistory } from '../../graphql/users';
import XIcon from '../../../icons/x.svg';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import { LazyImage } from '../LazyImage';

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
    <a
      className={classNames(
        'flex relative flex-row items-center py-3 pr-5 pl-9 hover:bg-theme-hover hover:cursor-pointer',
        className,
      )}
      href={post.url}
      target="_blank"
    >
      <LazyImage
        imgSrc={post.image}
        imgAlt={post.title}
        className="w-16 laptop:w-24 h-16 rounded-16"
      />
      <SourceShadow />
      <LazyImage
        imgSrc={post.source.image}
        imgAlt={`source of ${post.title}`}
        className="left-6 w-6 h-6 rounded-full"
        absolute
      />
      <p className="flex flex-wrap flex-1 mr-6 ml-4 line-clamp-3 typo-callout">
        {post.title}
      </p>
      {onHide && (
        <Button
          role="button"
          className="btn-tertiary"
          icon={<XIcon />}
          onClick={onHideClick}
        />
      )}
    </a>
  );
}

export default ReadingHistoryItem;
