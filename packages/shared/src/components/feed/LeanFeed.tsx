import React, { ReactElement, useContext } from 'react';
import LeanFeedItemComponent from './LeanFeedItemComponent';
import { useActiveFeedContext } from '../../contexts';

function LeanFeed(): ReactElement {
  const { items, feedRef } = useActiveFeedContext();

  return (
    <div className="grid grid-cols-2 gap-4" ref={feedRef}>
      {items.map((item, i) => {
        return <LeanFeedItemComponent key={i} item={item} />;
      })}
    </div>
  );
}

export default LeanFeed;
