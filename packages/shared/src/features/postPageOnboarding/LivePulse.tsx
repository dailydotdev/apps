import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useSubscription from '../../hooks/useSubscription';
import { gqlClient } from '../../graphql/common';
import type { Post, PostsEngaged } from '../../graphql/posts';
import {
  POSTS_ENGAGED_SUBSCRIPTION,
  POST_UPVOTES_BY_ID_QUERY,
} from '../../graphql/posts';
import type { UserImageProps } from '../../components/ProfilePicture';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';

interface UpvotesData {
  upvotes: {
    edges: Array<{ node: { user: UserImageProps } }>;
  };
}

const AVATAR_LIMIT = 5;

/**
 * Makes the article feel alive with REAL data: upvote/comment counts tick up
 * in real time via the posts-engaged subscription (no-ops gracefully when the
 * socket isn't connected), alongside the faces of developers who recently
 * upvoted. No fabricated "reading now" numbers.
 */
export const LivePulse = ({ post }: { post: Post }): ReactElement | null => {
  const [counts, setCounts] = useState({
    upvotes: post?.numUpvotes ?? 0,
    comments: post?.numComments ?? 0,
  });

  useSubscription(
    () => ({ query: POSTS_ENGAGED_SUBSCRIPTION }),
    {
      next: (data: PostsEngaged) => {
        if (data?.postsEngaged?.id === post?.id) {
          setCounts({
            upvotes: data.postsEngaged.numUpvotes,
            comments: data.postsEngaged.numComments,
          });
        }
      },
    },
    [post?.id],
  );

  const { data } = useQuery({
    queryKey: ['livePulseUpvoters', post?.id],
    queryFn: () =>
      gqlClient.request<UpvotesData>(POST_UPVOTES_BY_ID_QUERY, {
        id: post.id,
        first: AVATAR_LIMIT,
      }),
    enabled: !!post?.id && (post?.numUpvotes ?? 0) > 0,
    staleTime: 5 * 60 * 1000,
  });

  const avatars =
    data?.upvotes?.edges?.map((edge) => edge.node.user).filter(Boolean) ?? [];

  if (counts.upvotes === 0 && counts.comments === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex size-2" aria-hidden>
        <span className="opacity-75 absolute inline-flex size-full animate-ping rounded-full bg-accent-avocado-default" />
        <span className="relative inline-flex size-2 rounded-full bg-accent-avocado-default" />
      </span>
      {avatars.length > 0 && (
        <div className="flex -space-x-1.5">
          {avatars.map((user) => (
            <ProfilePicture
              key={user.id ?? user.username ?? user.name}
              user={user}
              size={ProfileImageSize.Small}
              className="border-2 border-background-default"
            />
          ))}
        </div>
      )}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {counts.upvotes} upvotes · {counts.comments} discussing
      </Typography>
    </div>
  );
};
