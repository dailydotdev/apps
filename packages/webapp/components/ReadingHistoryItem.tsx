import classNames from 'classnames';
import Link from 'next/link';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ReadHistory } from '@dailydotdev/shared/src/graphql/users';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import React, { ReactElement } from 'react';
import classed from '@dailydotdev/shared/src/lib/classed';

export interface ReadingHistoryItemProps {
  className?: string;
  history: ReadHistory;
  onHide?: (postId: string, timestamp: Date) => Promise<unknown>;
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
  return (
    <Link href={post.url}>
      <section
        className={classNames(
          'flex relative flex-row items-center py-3 pr-5 pl-9 hover:bg-theme-hover hover:cursor-pointer',
          className,
        )}
      >
        <LazyImage
          imgSrc={post.image}
          imgAlt={post.title}
          className="w-24 h-16 rounded-16"
        />
        <SourceShadow />
        <LazyImage
          imgSrc={post.source.image}
          imgAlt={`source of ${post.title}`}
          className="left-6 w-6 h-6 rounded-full"
          absolute
        />
        <p className="flex flex-1 mr-6 ml-4 truncate">{post.title}</p>
        {onHide && (
          <Button icon={<XIcon />} onClick={() => onHide(post.id, timestamp)} />
        )}
      </section>
    </Link>
  );
}

export default ReadingHistoryItem;
