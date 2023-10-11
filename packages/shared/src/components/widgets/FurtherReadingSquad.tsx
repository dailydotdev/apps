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
import SimilarPosts from './SimilarPosts';
import { AuthTriggers } from '../../lib/auth';
import { AnalyticsEvent } from '../../lib/analytics';
import { FeedData, SOURCE_FEED_QUERY } from '../../graphql/feed';
import { isSourcePublicSquad } from '../../graphql/squads';
import { SquadPostListItem } from '../squads/SquadPostListItem';
import FeedItemComponent, { getFeedItemKey } from '../FeedItemComponent';
import Feed from '../Feed';

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
  const { data: posts, isLoading } = useQuery<FurtherReadingData>(
    queryKey,
    async () => {
      const squad = currentPost.source;

      if (isPublicSquad) {
        const squadPostsResult = await request<FeedData>(
          graphqlUrl,
          SOURCE_FEED_QUERY,
          {
            first: 3,
            loggedIn: isLoggedIn,
            source: squad.id,
            ranking: 'TIME',
            supportedTypes: [
              PostType.Article,
              PostType.Share,
              PostType.Freeform,
            ],
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
      }

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

  if (!posts?.similarPosts && !isLoading) {
    return <></>;
  }

  const similarPosts = posts?.similarPosts
    ? [
        ...posts.trendingPosts,
        ...posts.similarPosts.slice(
          0,
          Math.min(posts.similarPosts.length, 3 - posts.trendingPosts.length),
        ),
      ]
    : [];

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

  return (
    <div className="flex flex-col flex-1 w-full bg-theme-overlay-float-avocado">
      <div className="w-full border-b border-b-theme-divider-tertiary">
        <p className="p-4 tablet:px-8 font-bold typo-callout text-theme-label-tertiary">
          More posts from squad_name
        </p>
      </div>
      <div className={classNames(className, 'flex flex-col gap-6')}>
        <Feed
          className="px-6 pt-14 laptop:pt-10"
          feedName="squad"
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          forceCardMode
          showSearch={false}
          emptyScreen={<div />}
          allowPin
        />
      </div>
    </div>
  );
}
