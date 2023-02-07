import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Post, PostType } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { Origin } from '../lib/analytics';

export enum PostPosition {
  First = 'first',
  Only = 'only',
  Middle = 'middle',
  Last = 'last',
}

interface UsePostModalNavigation {
  postPosition: PostPosition;
  onPrevious: () => void;
  onNext: () => Promise<void>;
  onOpenModal: (index: number, fromPopState?: boolean) => void;
  onCloseModal: (fromPopState?: boolean) => void;
  isFetchingNextPage?: boolean;
  selectedPost: Post | null;
}

export const usePostModalNavigation = (
  items: FeedItem[],
  fetchPage: () => Promise<unknown>,
  updatePost: UpdateFeedPost,
  canFetchMore: boolean,
): UsePostModalNavigation => {
  const [currentPage, setCurrentPage] = useState<string>();
  const isExtension = !!process.env.TARGET_BROWSER;
  const [openedPostIndex, setOpenedPostIndex] = useState<number>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { trackEvent } = useContext(AnalyticsContext);
  const router = useRouter();

  const changeHistory = (data: unknown, title: string, url: string) => {
    if (!isExtension) {
      window.history.pushState(data, title, url);
    }
  };

  const getPostItem = (index: number) =>
    index !== null && items[index].type === 'post'
      ? (items[index] as PostItem)
      : null;
  const getPost = (index: number) =>
    index !== null && items[index].type === 'post'
      ? (items[index] as PostItem).post
      : null;

  const onChangeSelected = (index: number, fromPopState = false) => {
    setOpenedPostIndex(index);
    const post = !fromPopState && getPost(index);
    if (post) {
      changeHistory({}, `Post: ${post.id}`, `/posts/${post.id}`);
    }
    if (post?.type === PostType.Share) {
      const item = getPostItem(index);
      updatePost(item.page, item.index, { ...post, read: true });
    }
  };

  const onOpenModal = (index: number, fromPopState = false) => {
    if (!currentPage) {
      setCurrentPage(window.location.pathname);
    }
    onChangeSelected(index, fromPopState);
  };

  const onCloseModal = (fromPopState = false) => {
    setOpenedPostIndex(null);
    setCurrentPage(undefined);
    if (!fromPopState) {
      changeHistory({}, `Feed`, currentPage);
    }
  };

  useEffect(() => {
    if (isExtension) {
      return null;
    }

    const onPopState = () => {
      const url = new URL(window.location.href);
      if (url.pathname.indexOf('/posts/') !== 0) {
        onCloseModal(true);
        return;
      }

      const [, , postId] = url.pathname.split('/');
      const index = items.findIndex((item) => {
        if (item.type !== 'post') {
          return false;
        }

        return item.post.id === postId;
      });

      if (index === -1) {
        router.reload();
        return;
      }

      onOpenModal(index, true);
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [items]);

  const getPostPosition = () => {
    const isPost = (item: FeedItem) => item.type === 'post';
    const firstPost = items.findIndex(isPost);
    const isLast = items.length - 1 === openedPostIndex;
    if (firstPost === openedPostIndex)
      return items.length - 1 === openedPostIndex
        ? PostPosition.Only
        : PostPosition.First;
    return (!canFetchMore || isFetchingNextPage) && isLast
      ? PostPosition.Last
      : PostPosition.Middle;
  };
  const ret = useMemo<UsePostModalNavigation>(
    () => ({
      postPosition: getPostPosition(),
      isFetchingNextPage,
      onCloseModal,
      onOpenModal,
      onPrevious() {
        let index = openedPostIndex - 1;
        for (; index > 0 && items[index].type !== 'post'; index -= 1);
        const item = items[index];
        if (!item || item.type !== 'post') {
          return;
        }

        const current = items[openedPostIndex] as PostItem;
        trackEvent(
          postAnalyticsEvent('navigate previous', current.post, {
            extra: { origin: Origin.ArticleModal },
          }),
        );
        onChangeSelected(index);
      },
      async onNext() {
        let index = openedPostIndex + 1;
        for (
          ;
          index < items.length && items[index].type !== 'post';
          index += 1
        );
        const item = items[index];

        if (index === items.length && canFetchMore) {
          if (isFetchingNextPage) {
            return;
          }

          await fetchPage();
          setIsFetchingNextPage(true);
          return;
        }

        if (!item) return;

        if (item.type !== 'post') {
          return;
        }

        const current = items[openedPostIndex] as PostItem;
        setIsFetchingNextPage(false);
        trackEvent(
          postAnalyticsEvent('navigate next', current.post, {
            extra: { origin: Origin.ArticleModal },
          }),
        );
        onChangeSelected(index);
      },
      selectedPost: getPost(openedPostIndex),
    }),
    [items, openedPostIndex, isFetchingNextPage],
  );

  const parent = typeof window !== 'undefined' ? window : null;

  useKeyboardNavigation(
    parent,
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
