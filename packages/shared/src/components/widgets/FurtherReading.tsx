import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import type { FurtherReadingData } from '../../graphql/furtherReading';
import { FURTHER_READING_QUERY } from '../../graphql/furtherReading';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { SimilarPostsProps } from './SimilarPosts';
import SimilarPosts from './SimilarPosts';
import BestDiscussions from './BestDiscussions';
import PostToc from './PostToc';
import type { FeedData } from '../../graphql/feed';
import { SOURCE_FEED_QUERY } from '../../graphql/feed';
import { isSourcePublicSquad } from '../../graphql/squads';
import { SquadPostListItem } from '../squads/SquadPostListItem';
import { disabledRefetch } from '../../lib/func';
import { gqlClient } from '../../graphql/common';

export type FurtherReadingProps = {
  currentPost: Post;
  className?: string;
  /** Ad templates drop the ToC so the rail's vertical space goes to ad slots. */
  hideToc?: boolean;
  /** Rendered between the similar posts and the discussions section. */
  betweenSections?: ReactNode;
};

export default function FurtherReading({
  currentPost,
  className,
  hideToc = false,
  betweenSections,
}: FurtherReadingProps): ReactElement {
  const isPublicSquad =
    !!currentPost.source && isSourcePublicSquad(currentPost.source);
  const postId = currentPost.id;
  const { tags } = currentPost;
  const queryKey = ['furtherReading', postId];
  const { user, isLoggedIn } = useContext(AuthContext);
  const max = 3;
  const { data: posts, isLoading } = useQuery<FurtherReadingData>({
    queryKey,
    queryFn: async () => {
      const squad = currentPost.source;

      if (isPublicSquad) {
        const squadPostsResult = await gqlClient.request<FeedData>(
          SOURCE_FEED_QUERY,
          {
            first: max,
            loggedIn: isLoggedIn,
            source: squad?.id,
            ranking: 'TIME',
            supportedTypes: [
              PostType.Article,
              PostType.Share,
              PostType.Freeform,
              PostType.SocialTwitter,
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

      return gqlClient.request(FURTHER_READING_QUERY, {
        loggedIn: !!user,
        post: postId,
        trendingFirst: 1,
        similarFirst: max,
        discussedFirst: 4,
        withDiscussedPosts: true,
        tags,
      });
    },

    ...disabledRefetch,
  });

  if (!posts?.similarPosts && !isLoading) {
    return <></>;
  }

  const similarPosts = posts?.similarPosts
    ? [
        ...posts.trendingPosts,
        ...posts.similarPosts.slice(
          0,
          Math.min(posts.similarPosts.length, max - posts.trendingPosts.length),
        ),
      ]
    : [];

  const showToc = !hideToc && (currentPost.toc?.length ?? 0) > 0;

  const publicSquadProps: Partial<SimilarPostsProps> = {
    title: `More posts from ${currentPost.source?.name}`,
    moreButtonProps: {
      href: currentPost.source?.permalink,
      text: 'Show more',
    },
    ListItem: SquadPostListItem,
  };

  return (
    <div className={classNames(className, 'flex flex-col gap-2')}>
      {showToc && <PostToc post={currentPost} className="hidden laptop:flex" />}
      {(isLoading || similarPosts?.length > 0) && (
        <SimilarPosts
          posts={similarPosts}
          isLoading={isLoading}
          {...(isPublicSquad && publicSquadProps)}
        />
      )}
      {betweenSections}
      {(isLoading || (posts?.discussedPosts?.length ?? 0) > 0) && (
        <BestDiscussions
          posts={posts?.discussedPosts ?? null}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
