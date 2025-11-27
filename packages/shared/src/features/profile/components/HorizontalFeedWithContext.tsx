import type { ReactElement, Ref } from 'react';
import React, { useContext, useMemo } from 'react';
import type { FeedProps } from '../../../components/Feed';
import Feed from '../../../components/Feed';
import FeedContext from '../../../contexts/FeedContext';
import { HORIZONTAL_FEED_CLASSES } from './Activity.helpers';

export const HorizontalFeedWithContext = ({
  feedProps,
  feedRef,
}: {
  feedProps: FeedProps<unknown>;
  feedRef: Ref<HTMLDivElement>;
}): ReactElement => {
  const currentFeedSettings = useContext(FeedContext);

  const feedContextValue = useMemo(() => {
    const numCards = 3;

    return {
      ...currentFeedSettings,
      numCards: {
        eco: numCards,
        roomy: numCards,
        cozy: numCards,
      },
    };
  }, [currentFeedSettings]);

  return (
    <FeedContext.Provider value={feedContextValue}>
      <Feed
        {...feedProps}
        className={HORIZONTAL_FEED_CLASSES}
        feedContainerRef={feedRef}
      />
    </FeedContext.Provider>
  );
};
