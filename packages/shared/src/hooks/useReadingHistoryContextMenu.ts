import React, { Dispatch, useCallback, useState } from 'react';
import useContextMenu from './useContextMenu';
import { PostItem } from '../graphql/posts';
import { QueryIndexes } from './useReadingHistory';
import { ContextMenu } from './constants';

type ReadingOptionsFunc = (
  event: React.MouseEvent,
  readingHistory: PostItem,
  indexes: QueryIndexes,
) => void;

interface UseReadingHistoryContextMenu {
  readingHistoryContextItem: PostItem;
  setReadingHistoryContextItem: Dispatch<PostItem>;
  onReadingHistoryContextOptions: ReadingOptionsFunc;
  queryIndexes: QueryIndexes;
}

export default function useReadingHistoryContextMenu(): UseReadingHistoryContextMenu {
  const [readingHistoryContextItem, setReadingHistoryContextItem] =
    useState<PostItem>();
  const [queryIndexes, setQueryIndexes] = useState<QueryIndexes>({
    page: -1,
    edge: -1,
  });
  const { onMenuClick: showTagOptionsMenu } = useContextMenu({
    id: ContextMenu.PostReadingHistoryContext,
  });
  const onReadingHistoryContextOptions: ReadingOptionsFunc = useCallback(
    (event, readingHistory, indexes): void => {
      setReadingHistoryContextItem(readingHistory);
      setQueryIndexes(indexes);
      showTagOptionsMenu(event);
    },
    [showTagOptionsMenu],
  );

  return {
    readingHistoryContextItem,
    setReadingHistoryContextItem,
    onReadingHistoryContextOptions,
    queryIndexes,
  };
}
