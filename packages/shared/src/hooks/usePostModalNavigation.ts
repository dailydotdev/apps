import { useContext, useEffect, useMemo, useState } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import { FeedItem, PostItem } from './useFeed';
import { useKeyboardNavigation } from './useKeyboardNavigation';

interface UsePostModalNavigation {
  onPrevious: () => void;
  onNext: () => Promise<void>;
  onOpenModal: (index: number) => void;
  onCloseModal: () => void;
  isFetchingNextPage?: boolean;
  selectedPost: Post | null;
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

        const current = items[openedPostIndex] as PostItem;
        trackEvent(
          postAnalyticsEvent('navigate previous', current.post, {
            extra: { origin: 'article modal' },
          }),
        );
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

        const current = items[openedPostIndex] as PostItem;
        setIsFetchingNextPage(false);
        trackEvent(
          postAnalyticsEvent('navigate next', current.post, {
            extra: { origin: 'article modal' },
          }),
        );
        setOpenedPostIndex(index);
      },
      selectedPost:
        openedPostIndex !== null && items[openedPostIndex].type === 'post'
          ? (items[openedPostIndex] as PostItem).post
          : null,
    }),
    [items, openedPostIndex, isFetchingNextPage],
  );

  useKeyboardNavigation(
    window,
    [
      ['ArrowLeft', ret.onPrevious],
      ['ArrowRight', ret.onNext],
      ['j', ret.onPrevious],
      ['k', ret.onNext],
    ],
    { disableOnTags: ['textarea', 'select', 'input'] },
  );

  useEffect(() => {
    if (openedPostIndex !== null && isFetchingNextPage) {
      ret.onNext();
    }
  }, [items, openedPostIndex, isFetchingNextPage]);

  return ret;
};
