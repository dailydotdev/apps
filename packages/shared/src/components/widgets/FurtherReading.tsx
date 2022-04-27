import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import request from 'graphql-request';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '../../graphql/furtherReading';
import { apiUrl } from '../../lib/config';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import { Post } from '../../graphql/posts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import SimilarPosts from './SimilarPosts';
import BestDiscussions from './BestDiscussions';
import PostToc from './PostToc';
import { postEventName } from '../utilities';

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

export default function FurtherReading({
  currentPost,
  className,
}: FurtherReadingProps): ReactElement {
  const postId = currentPost.id;
  const { tags } = currentPost;
  const queryKey = ['furtherReading', postId];
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery<FurtherReadingData>(
    queryKey,
    () =>
      request(`${apiUrl}/graphql`, FURTHER_READING_QUERY, {
        loggedIn: !!user,
        post: postId,
        trendingFirst: 1,
        similarFirst: 3,
        discussedFirst: 4,
        tags,
      }),
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
      showLogin('bookmark');
      return;
    }
    const bookmarked = !post.bookmarked;
    trackEvent(
      postAnalyticsEvent(postEventName({ bookmarked }), post, {
        extra: { origin: 'recommendation' },
      }),
    );
    if (bookmarked) {
      await bookmark({ id: post.id });
    } else {
      await removeBookmark({ id: post.id });
    }
  };

  const showToc = currentPost.toc?.length > 0;
  return (
    <div className={classNames(className, 'flex flex-col gap-6')}>
      {showToc && <PostToc post={currentPost} className="hidden laptop:flex" />}
      {(isLoading || similarPosts?.length > 0) && (
        <SimilarPosts
          posts={similarPosts}
          isLoading={isLoading}
          onBookmark={onBookmark}
        />
      )}
      {(isLoading || posts?.discussedPosts?.length > 0) && (
        <BestDiscussions posts={posts?.discussedPosts} isLoading={isLoading} />
      )}
    </div>
  );
}
