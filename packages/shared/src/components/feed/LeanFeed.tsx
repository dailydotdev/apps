import React, { ReactElement } from 'react';
import LeanFeedItemComponent from './LeanFeedItemComponent';
import { useActiveFeedContext } from '../../contexts';
import { FeedItem } from '../../hooks/useFeed';

function LeanFeed({ items }: { items: FeedItem[] }): ReactElement {
  const { feedRef } = useActiveFeedContext();

  return (
    <div className="grid grid-cols-2 gap-4" ref={feedRef}>
      {items.map((item, i) => {
        return <LeanFeedItemComponent key={i} item={item} />;
      })}
    </div>
  );
}

export default LeanFeed;
