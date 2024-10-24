import React, { ReactElement, useMemo } from 'react';
import classnames from 'classnames';
import Feed from '../Feed';
import { OtherFeedPage } from '../../lib/query';
import { useHorizontalScrollHeader } from '../HorizontalScroll/useHorizontalScrollHeader';
import { useFeedLayout } from '../../hooks';
import { TypographyType } from '../typography/Typography';
import { HorizontalScrollTitleProps } from '../HorizontalScroll/HorizontalScrollHeader';

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
  const memoizedTitle = useMemo(
    () => ({ ...title, type: TypographyType.Body }),
    [title],
  );
  const { ref, header } = useHorizontalScrollHeader({ title: memoizedTitle });
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
