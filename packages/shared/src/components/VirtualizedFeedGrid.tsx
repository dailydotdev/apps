import React, { ReactElement } from 'react';
import { VirtualItem } from 'react-virtual';
import styles from './Feed.module.css';
import { FeedItem } from '../hooks/useFeed';

export type VirtualizedFeedGridProps = {
  items: FeedItem[];
  virtualizer: { virtualItems: VirtualItem[]; totalSize: number };
  virtualizedNumCards: number;
  getNthChild: (index: number, column: number, row: number) => ReactElement;
};

export default function VirtualizedFeedGrid({
  items,
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
          className={`absolute grid top-0 left-0 w-full last:pb-0 ${styles.feedRow}`}
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
