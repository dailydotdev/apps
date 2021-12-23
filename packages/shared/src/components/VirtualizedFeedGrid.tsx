import React, { ReactElement } from 'react';
import { VirtualItem } from 'react-virtual';
import classNames from 'classnames';
import styles from './Feed.module.css';
import { FeedItem } from '../hooks/useFeed';

export type VirtualizedFeedGridProps = {
  items: FeedItem[];
  hasHeader: boolean;
  virtualizer: { virtualItems: VirtualItem[]; totalSize: number };
  virtualizedNumCards: number;
  getNthChild: (index: number, column: number, row: number) => ReactElement;
};

export default function VirtualizedFeedGrid({
  items,
  hasHeader,
  virtualizer,
  virtualizedNumCards,
  getNthChild,
}: VirtualizedFeedGridProps): ReactElement {
  return (
    <>
      {virtualizer.virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.index}
          ref={virtualItem.measureRef}
          className={classNames(
            'absolute grid left-0 w-full last:pb-0',
            hasHeader ? 'top-[18]' : 'top-0',
            styles.feedRow,
          )}
          style={{
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {[
            ...new Array(
              Math.min(
                virtualizedNumCards,
                items.length - virtualItem.index * virtualizedNumCards,
              ),
            ),
          ].map((_, i) =>
            getNthChild(
              virtualItem.index * virtualizedNumCards + i,
              i,
              virtualItem.index,
            ),
          )}
        </div>
      ))}
    </>
  );
}
