import React, { ReactElement } from 'react';
import classnames from 'classnames';
import Feed from '../Feed';
import { OtherFeedPage } from '../../lib/query';
import { useHorizontalScrollHeader } from '../HorizontalScroll/useHorizontalScrollHeader';
import { useFeedLayout } from '../../hooks';
import { TypographyType } from '../typography/Typography';

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
      header={<Header titleType={TypographyType.Body} />}
      disableAds
      allowFetchMore={false}
      pageSize={10}
      isHorizontal
      className={classnames('mx-4 mb-10', isListMode && 'laptop:mx-auto')}
      feedContainerRef={ref}
    />
  );
}
