import { useContextMenu } from '@dailydotdev/react-contexify';
import React, { useState } from 'react';
import { PostItem } from '../graphql/posts';
import { QueryIndexes } from './useReadingHistory';

export default function useReadingHistoryContextMenu(): {
  readingHistoryContextItem;
  setReadingHistoryContextItem;
  onReadingHistoryContextOptions;
  queryIndexes;
} {
  const [readingHistoryContextItem, setReadingHistoryContextItem] =
    useState<PostItem>();
  const [queryIndexes, setQueryIndexes] = useState<QueryIndexes>({
    page: -1,
    edge: -1,
  });
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'reading-history-options-context',
  });
  const onReadingHistoryContextOptions = (
    event: React.MouseEvent,
    readingHistory: PostItem,
    indexes: QueryIndexes,
  ): void => {
    setReadingHistoryContextItem(readingHistory);
    setQueryIndexes(indexes);
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showTagOptionsMenu(event, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return {
    readingHistoryContextItem,
    setReadingHistoryContextItem,
    onReadingHistoryContextOptions,
    queryIndexes,
  };
}
