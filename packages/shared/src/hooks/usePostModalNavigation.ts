import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import LogContext from '../contexts/LogContext';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import { postLogEvent } from '../lib/feed';
import type { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { Origin } from '../lib/log';
import { checkIsExtension } from '../lib/func';
import { isTesting, webappUrl } from '../lib/constants';
import { getPathnameWithQuery } from '../lib';

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
  selectedPostIndex: number;
}

export const usePostModalNavigation = (
  items: FeedItem[],
  fetchPage: () => Promise<unknown>,
  updatePost: UpdateFeedPost,
  canFetchMore: boolean,
): UsePostModalNavigation => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<string>();
  const isExtension = checkIsExtension();
  const [openedPostIndex, setOpenedPostIndex] = useState<number>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { logEvent } = useContext(LogContext);
  const scrollPositionOnFeed = useRef(0);

  const changeHistory = useCallback(
    (data: unknown, title: string, url: string) => {
      if (!isExtension) {
        window.history.pushState(data, title, url);
      }
    },
    [isExtension],
  );

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
      changeHistory({}, `Post: ${post.id}`, `/posts/${post.slug}`);
    }
    if (post?.type === PostType.Share) {
      const item = getPostItem(index);
      updatePost(item.page, item.index, { ...post, read: true });
    }
  };

  const onOpenModal = (index: number, fromPopState = false) => {
    if (!currentPage) {
      scrollPositionOnFeed.current = window.scrollY;

      setCurrentPage(window.location.pathname);
    }
    onChangeSelected(index, fromPopState);
  };

  const onCloseModal = useCallback(
    (fromPopState = false) => {
      setOpenedPostIndex(null);
      setCurrentPage(undefined);
      if (!fromPopState) {
        window.scrollTo(0, scrollPositionOnFeed.current);

        changeHistory({}, `Feed`, currentPage);
      }

      scrollPositionOnFeed.current = 0;
    },
    [changeHistory, currentPage],
  );

  useEffect(() => {
    if (isTesting) {
      return undefined;
    }

    const routeHandler = () => {
      onCloseModal(true);
    };
    router.events.on('routeChangeStart', routeHandler);

    return () => {
      router.events.off('routeChangeStart', routeHandler);
    };
  }, [onCloseModal, router.events]);

  useEffect(() => {
    if (isExtension) {
      return undefined;
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

        return item.post.id === postId || item.post.slug === postId;
      });

      if (index === -1) {
        return;
      }

      onOpenModal(index, true);
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const getPostPosition = () => {
    const isPost = (item: FeedItem) => item.type === 'post';
    const firstPost = items.findIndex(isPost);
    const isLast = items.length - 1 === openedPostIndex;
    if (firstPost === openedPostIndex) {
      return items.length - 1 === openedPostIndex
        ? PostPosition.Only
        : PostPosition.First;
    }
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
        // eslint-disable-next-line no-empty
        for (; index > 0 && items[index].type !== 'post'; index -= 1) {}
        const item = items[index];
        if (!item || item.type !== 'post') {
          return;
        }

        const current = items[openedPostIndex] as PostItem;
        logEvent(
          postLogEvent('navigate previous', current.post, {
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
          index += 1 // eslint-disable-next-line no-empty
        ) {}
        const item = items[index];

        if (index === items.length && canFetchMore) {
          if (isFetchingNextPage) {
            return;
          }

          await fetchPage();
          setIsFetchingNextPage(true);
          return;
        }

        if (!item) {
          return;
        }

        if (item.type !== 'post') {
          return;
        }

        const current = items[openedPostIndex] as PostItem;

        if (!current) {
          return;
        }

        setIsFetchingNextPage(false);
        logEvent(
          postLogEvent('navigate next', current.post, {
            extra: { origin: Origin.ArticleModal },
          }),
        );
        onChangeSelected(index);
      },
      selectedPost: getPost(openedPostIndex),
      selectedPostIndex: openedPostIndex,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, openedPostIndex, isFetchingNextPage]);

  return ret;
};

export const useNewPostModalNavigation = (
  items: FeedItem[],
  fetchPage: () => Promise<unknown>,
  updatePost: UpdateFeedPost,
  canFetchMore: boolean,
  baseUrl = `${webappUrl}posts`, // Default base URL for post navigation for backwards compatibility
): UsePostModalNavigation => {
  const router = useRouter();
  const { logEvent } = useContext(LogContext);
  const pmid = router.query.pmid as string;
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const scrollPositionOnFeed = useRef(0);

  const openedPostIndex = useMemo(() => {
    if (!items) {
      return undefined;
    }

    if (!pmid) {
      return undefined;
    }

    const foundIndex = items.findIndex((item) => {
      if (item.type === 'post') {
        return item.post.slug === pmid || item.post.id === pmid;
      }

      return false;
    });

    if (foundIndex === -1) {
      return undefined;
    }

    return foundIndex;
  }, [items, pmid]);

  const getPostItem = useCallback(
    (index: number) =>
      index !== null && items[index]?.type === 'post'
        ? (items[index] as PostItem)
        : null,
    [items],
  );

  const getPost = useCallback(
    (index: number) => getPostItem(index)?.post || null,
    [getPostItem],
  );

  const onChangeSelected = useCallback(
    async (index: number) => {
      const post = getPost(index);

      if (post) {
        await router.push(
          {
            pathname: baseUrl,
            query: {
              ...router.query,
              pmid: post.slug,
            },
          },
          `${webappUrl}posts/${post.slug}`,
        );
      }
      if (post?.type === PostType.Share) {
        const item = getPostItem(index);
        updatePost(item.page, item.index, { ...post, read: true });
      }
    },
    [baseUrl, getPost, getPostItem, router, updatePost],
  );

  const onOpenModal = (index: number) => {
    if (!pmid) {
      scrollPositionOnFeed.current = window.scrollY;
    }

    onChangeSelected(index);
  };

  const getPostPosition = () => {
    const isPost = (item: FeedItem) => item.type === 'post';
    const firstPost = items.findIndex(isPost);
    const isLast = items.length - 1 === openedPostIndex;
    if (firstPost === openedPostIndex) {
      return items.length - 1 === openedPostIndex
        ? PostPosition.Only
        : PostPosition.First;
    }
    return (!canFetchMore || isFetchingNextPage) && isLast
      ? PostPosition.Last
      : PostPosition.Middle;
  };

  useEffect(() => {
    if (!items) {
      return;
    }

    if (!pmid) {
      return;
    }

    if (typeof openedPostIndex !== 'undefined') {
      return;
    }

    const indexFromQuery = items.findIndex((item) => {
      if (item.type === 'post') {
        return item.post.slug === pmid || item.post.id === pmid;
      }

      return false;
    });

    if (indexFromQuery !== -1) {
      onChangeSelected(indexFromQuery);
    }
  }, [openedPostIndex, pmid, items, onChangeSelected]);

  return {
    postPosition: getPostPosition(),
    isFetchingNextPage: false,
    onCloseModal: async () => {
      const searchParams = new URLSearchParams(window.location.search);

      await router.push(getPathnameWithQuery(router.pathname, searchParams));

      window.scrollTo(0, scrollPositionOnFeed.current);

      scrollPositionOnFeed.current = 0;
    },
    onOpenModal,
    onPrevious: () => {
      let index = openedPostIndex - 1;
      // eslint-disable-next-line no-empty
      for (; index > 0 && items[index].type !== 'post'; index -= 1) {}
      const item = items[index];
      if (!item || item.type !== 'post') {
        return;
      }
      const current = items[openedPostIndex] as PostItem;
      logEvent(
        postLogEvent('navigate previous', current.post, {
          extra: { origin: Origin.ArticleModal },
        }),
      );
      onChangeSelected(index);
    },
    onNext: async () => {
      let index = openedPostIndex + 1;
      for (
        ;
        index < items.length && items[index].type !== 'post';
        index += 1 // eslint-disable-next-line no-empty
      ) {}
      const item = items[index];
      if (index === items.length && canFetchMore) {
        if (isFetchingNextPage) {
          return;
        }
        await fetchPage();
        setIsFetchingNextPage(true);
        return;
      }
      if (!item) {
        return;
      }
      if (item.type !== 'post') {
        return;
      }
      const current = items[openedPostIndex] as PostItem;
      if (!current) {
        return;
      }
      setIsFetchingNextPage(false);
      logEvent(
        postLogEvent('navigate next', current.post, {
          extra: { origin: Origin.ArticleModal },
        }),
      );
      onChangeSelected(index);
    },
    selectedPost: getPost(openedPostIndex),
    selectedPostIndex: 0,
  };
};
