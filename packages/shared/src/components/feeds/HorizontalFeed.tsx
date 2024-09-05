import classnames from 'classnames';
import React, { ReactElement } from 'react';

import { useFeedLayout } from '../../hooks';
import { OtherFeedPage } from '../../lib/query';
import Feed from '../Feed';
import { useHorizontalScrollHeader } from '../HorizontalScroll/useHorizontalScrollHeader';

interface HorizontalFeedProps<T> {
  feedName: OtherFeedPage;
  feedQueryKey: unknown[];
  query: string;
  variables: T;
  title: ReactElement;
  emptyScreen: ReactElement;
}

export default function HorizontalFeed<T>({
  title,
  ...props
}: HorizontalFeedProps<T>): ReactElement {
  const { ref, Header } = useHorizontalScrollHeader({
    title,
  });
  const { isListMode } = useFeedLayout();

  return (
    <Feed
      {...props}
      header={<Header />}
      disableAds
      allowFetchMore={false}
      pageSize={10}
      isHorizontal
      className={classnames('mx-4 mb-10', isListMode && 'laptop:mx-auto')}
      feedContainerRef={ref}
    />
  );
}
