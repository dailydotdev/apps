import React, { ReactElement, MouseEvent } from 'react';
import { PostItem } from '../../../graphql/posts';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import PostItemCard from '../PostItemCard';
import ArrowIcon from '../../icons/Arrow';
import { IconSize } from '../../Icon';

interface SelectHistoryItemProps {
  onArticleClick: (e: MouseEvent<HTMLButtonElement>, post: PostItem) => void;
  data: PostItem[];
  canFetchMore?: boolean;
  isFetchingNextPage?: boolean;
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
          key={item.post.id}
          type="button"
          className="group relative -mx-6 hover:bg-theme-hover cursor-pointer"
          onClick={(e) => onArticleClick(e, item)}
        >
          <PostItemCard postItem={item} showButtons={false} clickable={false} />
          <ArrowIcon
            size={IconSize.Medium}
            className="hidden group-hover:flex absolute top-1/2 right-3 rotate-90 -translate-y-1/2"
          />
        </button>
      ))}
    </InfiniteScrolling>
  );
}
