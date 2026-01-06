import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';

export const getSeoDescription = (post: Post): string => {
  if (post?.summary) {
    return post?.summary;
  }

  if (post?.sharedPost?.summary) {
    return post.sharedPost.summary;
  }

  if (post?.description) {
    return post?.description;
  }

  const postTitle = post?.title || post?.sharedPost?.title;

  if (postTitle) {
    return `Discussion about "${postTitle}" on daily.dev - join the developer community`;
  }

  return `Join the discussion on daily.dev - the developer community`;
};

export const getSEOJsonLd = (post: Post): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    url: post.commentsPermalink,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.commentsPermalink,
    },
    dateCreated: post.createdAt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    description: getSeoDescription(post),
    image: post.image,
    thumbnailUrl: post.image,
    // Google News properties
    isAccessibleForFree: true,
    articleSection: post.source?.name || post.tags?.[0],
    inLanguage: post.language || 'en',
    // Publisher (required for Article rich results)
    publisher: {
      '@type': 'Organization',
      name: 'daily.dev',
      url: 'https://daily.dev',
      logo: {
        '@type': 'ImageObject',
        url: 'https://daily.dev/apple-touch-icon.png',
        width: 180,
        height: 180,
      },
    },
    // Author - Person for user authors, Organization for source-only
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name ?? post.author.username,
          description: post.author.bio,
          image: post.author.image,
          url: post.author.permalink,
          // Author's company/employer
          ...(post.author.companies?.[0]?.name && {
            worksFor: {
              '@type': 'Organization',
              name: post.author.companies[0].name,
              ...(post.author.companies[0].image && {
                logo: post.author.companies[0].image,
              }),
            },
          }),
          ...(post.author.reputation && {
            interactionStatistic: {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/EndorseAction',
              userInteractionCount: post.author.reputation,
            },
          }),
        }
      : {
          '@type': 'Organization',
          name: post.source?.name,
          logo: post.source?.image,
          url: post.source?.permalink,
        },
    // Engagement metrics
    commentCount: post.numComments,
    discussionUrl: post.commentsPermalink,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.numUpvotes,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.numComments,
      },
    ],
    // Aggregate rating based on upvotes (helps with rich snippets)
    ...(post.numUpvotes > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.min(5, 3 + (post.numUpvotes / 100) * 2).toFixed(1),
        bestRating: 5,
        worstRating: 1,
        ratingCount: post.numUpvotes,
      },
    }),
    keywords: post.tags?.join(','),
    timeRequired: `PT${post.readTime}M`,
    // Video schema for YouTube posts
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

export const getBreadcrumbJsonLd = (post: Post): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://app.daily.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.source?.name || 'Posts',
        item: post.source?.permalink || 'https://app.daily.dev',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: post.commentsPermalink,
      },
    ],
  });
};

export const PostSEOSchema = ({ post }: { post: Post }): ReactElement => {
  if (!post) {
    return null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getSEOJsonLd(post),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getBreadcrumbJsonLd(post),
        }}
      />
    </>
  );
};
