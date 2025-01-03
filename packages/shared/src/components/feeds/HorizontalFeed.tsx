import type { ReactElement } from 'react';
import React from 'react';
import classnames from 'classnames';
import Feed from '../Feed';
import type { OtherFeedPage } from '../../lib/query';
import { useHorizontalScrollHeader } from '../HorizontalScroll/useHorizontalScrollHeader';
import { useFeedLayout } from '../../hooks';
import { TypographyType } from '../typography/Typography';
import type { HorizontalScrollTitleProps } from '../HorizontalScroll/HorizontalScrollHeader';

interface HorizontalFeedProps<T> {
  feedName: OtherFeedPage;
  feedQueryKey: unknown[];
  query: string;
  variables: T;
  title: HorizontalScrollTitleProps;
  emptyScreen: ReactElement;
}

export default function HorizontalFeed<T>({
  title,
  ...props
}: HorizontalFeedProps<T>): ReactElement {
  const { ref, header } = useHorizontalScrollHeader({
    title: { ...title, type: TypographyType.Body },
  });
  const { isListMode } = useFeedLayout();

  return (
    <Feed
      {...props}
      header={header}
      disableAds
      allowFetchMore={false}
      pageSize={10}
      isHorizontal
      className={classnames('mx-4 mb-10', isListMode && 'laptop:mx-auto')}
      feedContainerRef={ref}
    />
  );
}
