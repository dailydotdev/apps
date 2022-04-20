import { useContext, useEffect, useMemo, useState } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Post } from '../graphql/posts';
import { FeedItem, PostItem } from './useFeed';

interface UsePostModalNavigation {
  onPrevious: () => void;
  onNext: () => Promise<void>;
  onOpenModal: (index: number) => void;
  onCloseModal: () => void;
  isFetchingNextPage?: boolean;
  article: Post | null;
}

export const usePostModalNavigation = (
  items: FeedItem[],
  fetchPage: () => Promise<unknown>,
): UsePostModalNavigation => {
  const [openedPostIndex, setOpenedPostIndex] = useState<number>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { trackEvent } = useContext(AnalyticsContext);

  const ret = useMemo<UsePostModalNavigation>(
    () => ({
      isFetchingNextPage,
      onCloseModal: () => setOpenedPostIndex(null),
      onOpenModal: (index) => setOpenedPostIndex(index),
      onPrevious() {
        let index = openedPostIndex - 1;
        for (; index > 0 && items[index].type !== 'post'; index -= 1);
        const item = items[index];
        if (item.type !== 'post') {
          return;
        }

        trackEvent({
          origin: 'article modal',
          event_name: 'navigate previous',
          target_id: item.post.id,
        });
        setOpenedPostIndex(index);
      },
      async onNext() {
        let index = openedPostIndex + 1;
        for (
          ;
          index < items.length && items[index].type !== 'post';
          index += 1
        );
        const item = items[index];

        if (index === items.length) {
          if (isFetchingNextPage) {
            return;
          }

          await fetchPage();
          setIsFetchingNextPage(true);
          return;
        }

        if (item.type !== 'post') {
          return;
        }

        setIsFetchingNextPage(false);
        trackEvent({
          origin: 'article modal',
          event_name: 'navigate next',
          target_id: item.post.id,
        });
        setOpenedPostIndex(index);
      },
      article:
        openedPostIndex !== null && items[openedPostIndex].type === 'post'
          ? (items[openedPostIndex] as PostItem).post
          : null,
    }),
    [items, openedPostIndex, isFetchingNextPage],
  );

  useEffect(() => {
    if (openedPostIndex !== null && isFetchingNextPage) {
      ret.onNext();
    }
  }, [items, openedPostIndex, isFetchingNextPage]);

  return ret;
};
