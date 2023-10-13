import React, { ReactElement, useContext, useMemo } from 'react';
import classNames from 'classnames';
import request from 'graphql-request';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '../../graphql/furtherReading';
import { graphqlUrl } from '../../lib/config';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import {
  Post,
  PostType,
  supportedTypesForPrivateSources,
} from '../../graphql/posts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { AuthTriggers } from '../../lib/auth';
import { AnalyticsEvent } from '../../lib/analytics';
import { FeedData, SOURCE_FEED_QUERY } from '../../graphql/feed';
import { isSourcePublicSquad } from '../../graphql/squads';
import Feed from '../Feed';
import LeanFeed from '../feed/LeanFeed';
import { FeedItem } from '../../hooks/useFeed';
import { ActiveFeedContext, ActiveFeedContextProvider } from '../../contexts';

export type FurtherReadingProps = {
  currentPost: Post;
  className?: string;
};

const transformPosts = (
  posts: Post[],
  id: string,
  update: (oldPost: Post) => Partial<Post>,
): Post[] =>
  posts.map((post) =>
    post.id === id
      ? {
          ...post,
          ...update(post),
        }
      : post,
  );

const updatePost =
  (
    queryClient: QueryClient,
    queryKey: string[],
    update: (oldPost: Post) => Partial<Post>,
  ): ((args: { id: string }) => Promise<() => void>) =>
  async ({ id }) => {
    await queryClient.cancelQueries(queryKey);
    const previousData = queryClient.getQueryData<FurtherReadingData>(queryKey);
    queryClient.setQueryData(queryKey, {
      ...previousData,
      trendingPosts: transformPosts(previousData.trendingPosts, id, update),
      similarPosts: transformPosts(previousData.similarPosts, id, update),
    });
    return () => {
      queryClient.setQueryData(queryKey, previousData);
    };
  };

export default function FurtherReadingSquad({
  currentPost,
  className,
}: FurtherReadingProps): ReactElement {
  const isPublicSquad = isSourcePublicSquad(currentPost.source);
  const postId = currentPost.id;
  const { tags } = currentPost;
  const queryKey = ['furtherReading', postId];
  const { user, showLogin, isLoggedIn } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const queryClient = useQueryClient();
  const queryVariables = useMemo(
    () => ({
      source: currentPost.source.id,
      ranking: 'TIME',
      supportedTypes: supportedTypesForPrivateSources,
    }),
    [currentPost.source.id],
  );
  const {
    data: posts,
    isLoading,
    isFetching,
  } = useQuery<FurtherReadingData>(
    queryKey,
    async () => {
      const squad = currentPost.source;

      const squadPostsResult = await request<FeedData>(
        graphqlUrl,
        SOURCE_FEED_QUERY,
        {
          first: 3,
          loggedIn: isLoggedIn,
          source: squad.id,
          ranking: 'TIME',
          supportedTypes: [PostType.Article, PostType.Share, PostType.Freeform],
        },
      );
      const similarPosts =
        squadPostsResult?.page?.edges
          ?.map((item) => item.node)
          ?.filter((item) => item.id !== currentPost.id) || [];

      return {
        trendingPosts: [],
        similarPosts,
        discussedPosts: [],
      };

      return request(graphqlUrl, FURTHER_READING_QUERY, {
        loggedIn: !!user,
        post: postId,
        trendingFirst: 1,
        similarFirst: 3,
        discussedFirst: 4,
        tags,
      });
    },
    {
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchOnMount: false,
    },
  );

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updatePost(queryClient, queryKey, () => ({
      bookmarked: true,
    })),
    onRemoveBookmarkMutate: updatePost(queryClient, queryKey, () => ({
      bookmarked: false,
    })),
  });

  const similarPosts = useMemo(() => {
    let newItems: FeedItem[] = [];

    if (posts?.similarPosts) {
      newItems = posts.similarPosts.map((post, index) => ({
        type: 'post',
        post,
        page: 0,
        index,
      }));
    }

    if (isFetching) {
      newItems.push(...Array(1).fill({ type: 'placeholder' }));
    }
    return newItems;
  }, [isFetching, posts]);

  const onBookmark = async (post: Post): Promise<void> => {
    if (!user) {
      showLogin(AuthTriggers.Bookmark);
      return;
    }
    const bookmarked = !post.bookmarked;
    trackEvent(
      postAnalyticsEvent(
        bookmarked
          ? AnalyticsEvent.BookmarkPost
          : AnalyticsEvent.RemovePostBookmark,
        post,
        {
          extra: { origin: 'recommendation' },
        },
      ),
    );
    if (bookmarked) {
      await bookmark({ id: post.id });
    } else {
      await removeBookmark({ id: post.id });
    }
  };

  const onClick = (e) => {
    console.log('clicked', e);
  };

  const altOnClick = (e) => {
    console.log('clicked alt', e);
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-theme-overlay-float-avocado">
      <div className="w-full border-b border-b-theme-divider-tertiary">
        <p className="p-4 tablet:px-8 font-bold typo-callout text-theme-label-tertiary">
          More posts from squad_name
        </p>
      </div>
      <div className={classNames(className, 'flex flex-col gap-6')}>
        <ActiveFeedContextProvider items={similarPosts} onClick={onClick}>
          <LeanFeed />
        </ActiveFeedContextProvider>

        <p className="typo-title3">Alternative feed</p>
        <ActiveFeedContextProvider items={similarPosts} onClick={altOnClick}>
          <LeanFeed />
        </ActiveFeedContextProvider>
      </div>
    </div>
  );
}
