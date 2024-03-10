import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import request from 'graphql-request';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '../../graphql/furtherReading';
import { graphqlUrl } from '../../lib/config';
import {
  UseBookmarkPostRollback,
  useBookmarkPost,
} from '../../hooks/useBookmarkPost';
import { Post, PostType } from '../../graphql/posts';
import SimilarPosts from './SimilarPosts';
import BestDiscussions from './BestDiscussions';
import PostToc from './PostToc';
import { Origin } from '../../lib/analytics';
import { FeedData, SOURCE_FEED_QUERY } from '../../graphql/feed';
import { isSourcePublicSquad } from '../../graphql/squads';
import { SquadPostListItem } from '../squads/SquadPostListItem';
import { disabledRefetch } from '../../lib/func';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostPageOnboarding } from '../../lib/featureValues';

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

const updateFurtherReadingPost =
  (
    queryClient: QueryClient,
    queryKey: string[],
    update: (oldPost: Post) => Partial<Post>,
  ): ((args: { id: string }) => Promise<UseBookmarkPostRollback>) =>
  async ({ id }) => {
    await queryClient.cancelQueries(queryKey);
    const previousData = queryClient.getQueryData<FurtherReadingData>(queryKey);
    queryClient.setQueryData(queryKey, {
      ...previousData,
      trendingPosts: transformPosts(previousData.trendingPosts, id, update),
      similarPosts: transformPosts(previousData.similarPosts, id, update),
    });
    return () => queryClient.setQueryData(queryKey, previousData);
  };

export default function FurtherReading({
  currentPost,
  className,
}: FurtherReadingProps): ReactElement {
  const postPageOnboarding = useFeature(feature.postPageOnboarding);
  const isV4 = true;
  const isPublicSquad = isSourcePublicSquad(currentPost.source);
  const postId = currentPost.id;
  const { tags } = currentPost;
  const queryKey = ['furtherReading', postId];
  const { user, isLoggedIn } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery<FurtherReadingData>(
    queryKey,
    async () => {
      const squad = currentPost.source;

      if (isPublicSquad) {
        const squadPostsResult = await request<FeedData>(
          graphqlUrl,
          SOURCE_FEED_QUERY,
          {
            first: isV4 ? 12 : 3,
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
        similarFirst: isV4 ? 5 : 3,
        discussedFirst: isV4 ? 6 : 4,
        tags,
      });
    },
    { ...disabledRefetch },
  );

  const { toggleBookmark } = useBookmarkPost({
    onMutate: ({ id }) => {
      const updatedPost = updateFurtherReadingPost(
        queryClient,
        queryKey,
        (post) => ({
          bookmarked: !post.bookmarked,
        }),
      );

      return updatedPost({ id });
    },
  });

  if (!posts?.similarPosts && !isLoading) {
    return <></>;
  }

  const max = isV4 ? 12 : 3;
  const similarPosts = posts?.similarPosts
    ? [
        ...posts.trendingPosts,
        ...posts.similarPosts.slice(
          0,
          Math.min(posts.similarPosts.length, max - posts.trendingPosts.length),
        ),
      ]
    : [];

  const onToggleBookmark = async (post) => {
    toggleBookmark({ post, origin: 'recommendation' as Origin });
  };

  const showToc = currentPost.toc?.length > 0;
  return (
    <div className={classNames(className, 'flex flex-col gap-6')}>
      {showToc && <PostToc post={currentPost} className="hidden laptop:flex" />}
      {(isLoading || similarPosts?.length > 0) && (
        <SimilarPosts
          posts={similarPosts}
          isLoading={isLoading}
          onBookmark={onToggleBookmark}
          title={
            isPublicSquad
              ? `More posts from ${currentPost.source.name}`
              : undefined
          }
          moreButtonProps={{
            href: isPublicSquad ? currentPost.source.permalink : undefined,
            text: isPublicSquad ? 'Show more' : undefined,
          }}
          ListItem={isPublicSquad ? SquadPostListItem : undefined}
        />
      )}
      {(isLoading || posts?.discussedPosts?.length > 0) && (
        <BestDiscussions posts={posts?.discussedPosts} isLoading={isLoading} />
      )}
    </div>
  );
}
