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
import { Origin } from '../lib/log';
import { webappUrl } from '../lib/constants';
import { getPathnameWithQuery } from '../lib';
import { useKeyboardNavigation } from './useKeyboardNavigation';

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
  // special query params to track base pathnames and params for the post modal
  const basePathname = (router.query?.pmp as string) || router.pathname;
  const baseAsPath = (router.query?.pmap as string) || router.asPath;
  const pmid = router.query?.pmid as string;
  const { logEvent } = useContext(LogContext);
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
        const postId = post.slug || post.id;

        await router.push(
          {
            pathname: basePathname,
            query: {
              ...router.query,
              pmid: postId,
              pmp: basePathname,
              pmap: baseAsPath,
            },
          },
          `${webappUrl}posts/${postId}`,
          {
            scroll: false,
          },
        );
      }
      if (post?.type === PostType.Share) {
        const item = getPostItem(index);
        updatePost(item.page, item.index, { ...post, read: true });
      }
    },
    [basePathname, baseAsPath, getPost, getPostItem, router, updatePost],
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

  const result = {
    postPosition: getPostPosition(),
    isFetchingNextPage: false,
    onCloseModal: async () => {
      const searchParams = new URLSearchParams(window.location.search);

      await router.push(
        getPathnameWithQuery(basePathname, searchParams),
        baseAsPath,
        {
          scroll: false,
        },
      );

      window.scrollTo(0, scrollPositionOnFeed.current);

      scrollPositionOnFeed.current = 0;
    },
    onOpenModal,
    onPrevious: () => {
      let index = openedPostIndex - 1;
      // look for the first post before the current one
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
    selectedPostIndex: openedPostIndex,
  };

  const parent = typeof window !== 'undefined' ? window : null;

  useKeyboardNavigation(
    parent,
    [
      ['ArrowLeft', result.onPrevious],
      ['ArrowRight', result.onNext],
      ['j', result.onPrevious],
      ['k', result.onNext],
    ],
    { disableOnTags: ['textarea', 'select', 'input'] },
  );

  return result;
};
