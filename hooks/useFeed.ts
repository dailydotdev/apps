import {
  DependencyList,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import request from 'graphql-request';
import {
  Ad,
  FeedData,
  Post,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import useSubscription from './useSubscription';

export type PostItem = { type: 'post'; post: Post };
export type AdItem = { type: 'ad'; ad: Ad };
export type PlaceholderItem = { type: 'placeholder' };
export type FeedItem = PostItem | AdItem | PlaceholderItem;

export type FeedReturnType = {
  items: FeedItem[];
  fetchPage: () => Promise<void>;
  updateItem: (index: number, item: FeedItem) => void;
  updatePost: (index: number, post: Post) => void;
  isLoading: boolean;
  canFetchMore: boolean;
  emptyFeed: boolean;
};

export default function useFeed<T>(
  pageSize: number,
  adSpot: number,
  placeholdersPerPage: number,
  query?: string,
  variables?: T,
  dep?: DependencyList,
): FeedReturnType {
  const [emptyFeed, setEmptyFeed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedItems, setLoadedItems] = useState<FeedItem[]>([]);
  const [lastPage, setLastPage] = useState<FeedData>(null);
  const [lastAd, setLastAd] = useState<Ad>(null);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [postIds, setPostIds] = useState<string[]>([]);
  const items = useMemo(() => {
    if (isLoading) {
      return [
        ...loadedItems,
        ...Array(placeholdersPerPage).fill({ type: 'placeholder' }),
      ];
    }
    return loadedItems;
  }, [loadedItems, isLoading]);

  const resetFeed = (): void => {
    setLoadedItems([]);
    setLastPage(null);
    setLastAd(null);
  };

  const updateItem = (index: number, item: FeedItem): void =>
    setLoadedItems([
      ...loadedItems.slice(0, index),
      item,
      ...loadedItems.slice(index + 1),
    ]);

  const updatePost = (index: number, post: Post): void => {
    const item = loadedItems[index];
    if (item.type === 'post') {
      updateItem(index, {
        ...(item as PostItem),
        post,
      });
    }
  };

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: postIds,
      },
    }),
    {
      next: (data: PostsEngaged) => {
        const index = loadedItems.findIndex(
          (item) =>
            item.type === 'post' && item.post.id === data.postsEngaged.id,
        );
        if (index > -1) {
          updatePost(index, {
            ...(loadedItems[index] as PostItem).post,
            ...data.postsEngaged,
          });
        }
      },
    },
    [postIds],
  );

  const fetchPage = async (lastPageParam: FeedData = lastPage) => {
    if (isLoading && lastPageParam) {
      return;
    }
    setIsLoading(true);
    const adPromise = fetch(`${apiUrl}/v1/a`);
    const res = await request<FeedData>(`${apiUrl}/graphql`, query, {
      ...variables,
      first: pageSize,
      after: lastPageParam?.page.pageInfo.endCursor,
      loggedIn: !!user,
    });
    if (!lastPageParam && !res.page.edges.length) {
      setEmptyFeed(true);
    } else if (emptyFeed) {
      setEmptyFeed(false);
    }
    setLastPage(res);
    setIsLoading(false);
    try {
      const adRes = await adPromise;
      const ads: Ad[] = await adRes.json();
      setLastAd(ads?.[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshFeed = async (): Promise<void> => {
    resetFeed();
    await fetchPage(null);
  };

  // First page fetch
  useEffect(() => {
    if (query && tokenRefreshed) {
      refreshFeed();
    }
  }, [query, tokenRefreshed, variables, ...(dep ?? [])]);

  // Add new posts to feed with a placeholder for the ad
  useEffect(() => {
    if (lastPage) {
      const newItems: FeedItem[] = lastPage.page.edges.map(
        ({ node }): PostItem => ({ type: 'post', post: node }),
      );
      newItems.splice(adSpot, 0, { type: 'placeholder' });
      setLoadedItems([...loadedItems, ...newItems]);
      setPostIds([
        ...postIds,
        ...lastPage.page.edges.map(({ node }): string => node.id),
      ]);
    } else {
      setPostIds([]);
    }
  }, [lastPage]);

  // Replace ad placeholder with an actual ad
  useEffect(() => {
    if (lastAd) {
      let i;
      for (
        i = loadedItems.length - 1;
        i >= 0 && loadedItems[i].type !== 'placeholder';
        i -= 1
      );
      if (i >= 0 && i < loadedItems.length) {
        updateItem(i, { type: 'ad', ad: lastAd });
      }
    }
  }, [lastAd]);

  return {
    items,
    fetchPage,
    updateItem,
    updatePost,
    isLoading,
    canFetchMore: lastPage?.page.pageInfo.hasNextPage,
    emptyFeed,
  };
}
