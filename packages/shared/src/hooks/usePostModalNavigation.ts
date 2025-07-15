import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter as useRouterNext } from 'next/router';
import LogContext from '../contexts/LogContext';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import { postLogEvent } from '../lib/feed';
import type { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { isBoostedPostAd } from './useFeed';
import { Origin, LogEvent } from '../lib/log';
import { webappUrl } from '../lib/constants';
import { getPathnameWithQuery, objectToQueryParams } from '../lib';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { isExtension } from '../lib/func';
import type { UseRouterMemory as UsePostModalRouter } from './useRouterMemory';
import { useRouterMemory } from './useRouterMemory';

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
  selectedPostIsAd: boolean;
}

export type UsePostModalNavigationProps = {
  items: FeedItem[];
  fetchPage: () => Promise<unknown>;
  updatePost: UpdateFeedPost;
  canFetchMore: boolean;
  feedName: string;
};

// for extension we use in memory router
const useRouter: () => UsePostModalRouter = isExtension
  ? useRouterMemory
  : useRouterNext;

export const usePostModalNavigation = ({
  items,
  fetchPage,
  updatePost,
  canFetchMore,
  feedName,
}: UsePostModalNavigationProps): UsePostModalNavigation => {
  const isPostItem = (item: FeedItem) =>
    item.type === 'post' || isBoostedPostAd(item);
  const router = useRouter();
  // special query params to track base pathnames and params for the post modal
  const activeFeedName = router.query?.pmcid as string;
  const basePathname = (router.query?.pmp as string) || router.pathname;
  const baseAsPath = (router.query?.pmap as string) || router.asPath;
  const pmid = router.query?.pmid as string;
  const { logEvent } = useContext(LogContext);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const scrollPositionOnFeed = useRef(0);

  // if multiple feeds/hooks are rendered prevent effects from running while other modal is open
  const isNavigationActive = feedName === activeFeedName;

  const openedPostIndex = useMemo(() => {
    if (!isNavigationActive) {
      return undefined;
    }

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
      if (isBoostedPostAd(item)) {
        return item.ad.data.post.slug === pmid || item.ad.data.post.id === pmid;
      }

      return false;
    });

    if (foundIndex === -1) {
      return undefined;
    }

    return foundIndex;
  }, [items, pmid, isNavigationActive]);

  const getPostItem = useCallback(
    (index: number) => {
      if (index === null || !items[index]) {
        return null;
      }

      const item = items[index];
      if (item.type === 'post') {
        return item as PostItem;
      }
      if (isBoostedPostAd(item)) {
        // For Post Ads, we need to create a PostItem-like structure
        // Note: AdItem doesn't have a page property, so we'll use -1 as default
        return {
          post: item.ad.data.post,
          page: -1,
          index: item.index,
        } as PostItem;
      }

      return null;
    },
    [items],
  );

  const getPost = useCallback(
    (index: number) => {
      if (index === null || !items[index]) {
        return null;
      }

      const item = items[index];
      if (item.type === 'post') {
        return item.post;
      }
      if (isBoostedPostAd(item)) {
        return item.ad.data.post;
      }

      return null;
    },
    [items],
  );

  const onChangeSelected = useCallback(
    async (index: number) => {
      const post = getPost(index);

      if (post) {
        const postId = post.slug || post.id;

        const newPathname = getPathnameWithQuery(
          basePathname,
          objectToQueryParams({
            ...router.query,
            pmid: postId,
            pmp: basePathname,
            pmap: baseAsPath,
            pmcid: feedName,
          }),
        );

        await router.push(newPathname, `${webappUrl}posts/${postId}`, {
          scroll: false,
        });
      }
      if (post?.type === PostType.Share) {
        const item = getPostItem(index);
        updatePost(item.page, item.index, { ...post, read: true });
      }
    },
    [
      basePathname,
      baseAsPath,
      getPost,
      getPostItem,
      router,
      updatePost,
      feedName,
    ],
  );

  const onOpenModal = (index: number) => {
    if (!pmid) {
      scrollPositionOnFeed.current = window.scrollY;
    }

    onChangeSelected(index);
  };

  const getPostPosition = () => {
    const firstPost = items.findIndex(isPostItem);
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
    if (!isNavigationActive) {
      return;
    }

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
      if (isBoostedPostAd(item)) {
        return item.ad.data.post.slug === pmid || item.ad.data.post.id === pmid;
      }

      return false;
    });

    if (indexFromQuery !== -1) {
      onChangeSelected(indexFromQuery);
    }
  }, [openedPostIndex, pmid, items, onChangeSelected, isNavigationActive]);

  const selectedPostIsAd = isBoostedPostAd(items[openedPostIndex]);
  const result = {
    postPosition: getPostPosition(),
    isFetchingNextPage: false,
    selectedPostIsAd,
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
      while (index > 0 && !isPostItem(items[index])) {
        index -= 1;
      }
      const item = items[index];
      if (!item || !isPostItem(item)) {
        return;
      }
      const current = getPost(openedPostIndex);
      if (current) {
        logEvent(
          postLogEvent(LogEvent.NavigatePrevious, current, {
            extra: { origin: Origin.ArticleModal },
            is_ad: selectedPostIsAd,
          }),
        );
      }
      onChangeSelected(index);
    },
    onNext: async () => {
      let index = openedPostIndex + 1;
      // eslint-disable-next-line no-empty
      for (; index < items.length && !isPostItem(items[index]); index += 1) {}
      const item = items[index];
      if (index === items.length && canFetchMore) {
        if (isFetchingNextPage) {
          return;
        }
        await fetchPage();
        setIsFetchingNextPage(true);
        return;
      }
      if (!item || !isPostItem(item)) {
        return;
      }
      const current = getPost(openedPostIndex);
      if (!current) {
        return;
      }
      setIsFetchingNextPage(false);
      logEvent(
        postLogEvent(LogEvent.NavigateNext, current, {
          extra: { origin: Origin.ArticleModal },
          is_ad: selectedPostIsAd,
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
