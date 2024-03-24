import React, { useState } from 'react';
import useContextMenu from './useContextMenu';
import { PostItem } from '../graphql/posts';
import { QueryIndexes } from './useReadingHistory';
import { ContextMenu } from './constants';

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
  const { onMenuClick: showTagOptionsMenu } = useContextMenu({
    id: ContextMenu.PostReadingHistoryContext,
  });
  const onReadingHistoryContextOptions = (
    event: React.MouseEvent,
    readingHistory: PostItem,
    indexes: QueryIndexes,
  ): void => {
    setReadingHistoryContextItem(readingHistory);
    setQueryIndexes(indexes);
    showTagOptionsMenu(event);
  };

  return {
    readingHistoryContextItem,
    setReadingHistoryContextItem,
    onReadingHistoryContextOptions,
    queryIndexes,
  };
}
