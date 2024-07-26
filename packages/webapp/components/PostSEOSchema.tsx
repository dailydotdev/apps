import React, { ReactElement } from 'react';
import { Post, PostType } from '@dailydotdev/shared/src/graphql/posts';

export const getSeoDescription = (post: Post): string => {
  if (post?.summary) {
    return post?.summary;
  }
  if (post?.description) {
    return post?.description;
  }

  const postTitle = post?.title || post?.sharedPost?.title;

  if (postTitle) {
    return `Join us to the discussion about "${postTitle}" on daily.dev ✌️`;
  }

  return `Join the discussion on daily.dev ✌️`;
};

export const getSEOJsonLd = (post: Post): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    dateCreated: post.createdAt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    description: getSeoDescription(post),
    image: post.image,
    author: {
      ...(post.author
        ? {
            '@type': post.author?.name ? 'Organization' : 'Person',
            name: post.author?.name ?? post.author?.username,
            description: post.author?.bio,
            image: post.author?.image,
            url: post.author?.permalink,
            ...(post.author?.reputation && {
              interactionStatistic: {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/EndorseAction',
                userInteractionCount: post.author?.reputation,
              },
            }),
          }
        : {
            '@type': 'Organization',
            name: post.source?.name,
            logo: post.source?.image,
            url: post.source?.permalink,
          }),
    },
    commentCount: post.numComments,
    discussionUrl: post.commentsPermalink,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: post.numUpvotes,
    },
    keywords: post.tags?.join(','),
    timeRequired: `PT${post.readTime}M`,
    thumbnailUrl: post.image,
    ...(post.type === PostType.VideoYouTube && {
      video: {
        '@type': 'VideoObject',
        name: post.title,
        description: getSeoDescription(post),
        thumbnailUrl: post.image,
        uploadDate: post.createdAt,
        duration: `PT${post.readTime}M`,
        url: post.permalink,
        embedUrl: `https://www.youtube.com/embed/${post.videoId}`,
      },
    }),
  });
};

export const PostSEOSchema = ({ post }: { post: Post }): ReactElement => {
  if (!post) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: getSEOJsonLd(post),
      }}
    />
  );
};
