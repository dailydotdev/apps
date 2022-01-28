import { useContextMenu } from '@dailydotdev/react-contexify';
import React, { useState } from 'react';
import { ReadHistoryPost } from '../graphql/posts';

export default function useReadingHistoryContextMenu(): {
  readingHistoryContextItem;
  setReadingHistoryContextItem;
  onReadingHistoryContextOptions;
} {
  const [readingHistoryContextItem, setReadingHistoryContextItem] =
    useState<ReadHistoryPost>();
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'reading-history-options-context',
  });
  const onReadingHistoryContextOptions = (
    event: React.MouseEvent,
    readingHistory: ReadHistoryPost,
  ): void => {
    setReadingHistoryContextItem(readingHistory);
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showTagOptionsMenu(event, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return {
    readingHistoryContextItem,
    setReadingHistoryContextItem,
    onReadingHistoryContextOptions,
  };
}
