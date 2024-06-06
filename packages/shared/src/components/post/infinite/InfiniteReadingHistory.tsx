import React, { ReactElement, MouseEvent } from 'react';
import { PostItem } from '../../../graphql/posts';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import PostItemCard from '../PostItemCard';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface SelectHistoryItemProps {
  onArticleClick: (e: MouseEvent<HTMLButtonElement>, post: PostItem) => void;
  data: PostItem[];
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export function InfiniteReadingHistory({
  onArticleClick,
  data,
  canFetchMore,
  isFetchingNextPage,
  fetchNextPage,
}: SelectHistoryItemProps): ReactElement {
  return (
    <InfiniteScrolling
      canFetchMore={canFetchMore}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      {data?.map((item) => (
        <button
          key={`${item.post.id}-${item.timestamp}`}
          type="button"
          className="group relative -mx-6 cursor-pointer hover:bg-surface-hover"
          onClick={(e) => onArticleClick(e, item)}
          aria-label="Reading history item"
        >
          <PostItemCard postItem={item} showButtons={false} clickable={false} />
          <ArrowIcon
            size={IconSize.Medium}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rotate-90 group-hover:flex"
          />
        </button>
      ))}
    </InfiniteScrolling>
  );
}
