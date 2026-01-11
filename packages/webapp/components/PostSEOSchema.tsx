import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import { stripHtmlTags } from '@dailydotdev/shared/src/lib/strings';

// User-generated post types that should use DiscussionForumPosting schema
const USER_GENERATED_POST_TYPES: PostType[] = [
  PostType.Share,
  PostType.Freeform,
  PostType.Welcome,
  PostType.Poll,
];

/**
 * Check if a post is user-generated content (Squad posts)
 * These should use DiscussionForumPosting schema per Google's guidelines
 */
export const isUserGeneratedPost = (post: Post | null | undefined): boolean =>
  post?.type ? USER_GENERATED_POST_TYPES.includes(post.type) : false;

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

/**
 * Get the text content for a post (used in DiscussionForumPosting)
 */
const getPostTextContent = (post: Post): string => {
  // For freeform/welcome posts, use summary or description
  if (post?.summary) {
    return post.summary;
  }

  if (post?.description) {
    return post.description;
  }

  // For share posts, describe what's being shared
  if (post?.sharedPost?.title) {
    return `Shared: ${post.sharedPost.title}`;
  }

  return getSeoDescription(post);
};

/**
 * Build Person schema for an author (reusable for posts and comments)
 */
const getPersonSchema = (author: {
  name?: string;
  username?: string;
  permalink: string;
  image?: string;
  bio?: string;
  companies?: Array<{ name?: string; image?: string }>;
  reputation?: number;
}): Record<string, unknown> => ({
  '@type': 'Person',
  name: author.name ?? author.username,
  url: author.permalink,
  ...(author.image && { image: author.image }),
  ...(author.bio && { description: author.bio }),
  // Author's company/employer
  ...(author.companies?.[0]?.name && {
    worksFor: {
      '@type': 'Organization',
      name: author.companies[0].name,
      ...(author.companies[0].image && {
        logo: author.companies[0].image,
      }),
    },
  }),
  // Reputation for author profile pages
  ...(author.reputation && {
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/EndorseAction',
      userInteractionCount: author.reputation,
    },
  }),
});

/**
 * Build author schema object for a post author
 */
const getAuthorSchema = (post: Post): Record<string, unknown> => {
  if (post.author) {
    return getPersonSchema(post.author);
  }

  return {
    '@type': 'Organization',
    name: post.source?.name || 'daily.dev',
    logo: post.source?.image,
    url: post.source?.permalink || 'https://daily.dev',
  };
};

/**
 * Convert a comment to schema.org Comment format with optional nested children
 */
const commentToSchema = (
  comment: Comment,
  maxDepth = 3,
  currentDepth = 0,
): Record<string, unknown> => ({
  '@type': 'Comment',
  text: stripHtmlTags(comment.contentHtml),
  datePublished: comment.createdAt,
  ...(comment.lastUpdatedAt && { dateModified: comment.lastUpdatedAt }),
  url: comment.permalink,
  // Omit author field entirely if not present (schema.org best practice)
  ...(comment.author && {
    author: getPersonSchema(comment.author),
  }),
  // Interaction statistics for comments (upvotes)
  ...(comment.numUpvotes > 0 && {
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: comment.numUpvotes,
    },
  }),
  // Recursively include nested replies (limit depth for performance)
  ...(comment.children?.edges?.length &&
    currentDepth < maxDepth && {
      comment: comment.children.edges
        .filter((edge) => edge?.node)
        .map((edge) => commentToSchema(edge.node, maxDepth, currentDepth + 1)),
    }),
});

/**
 * Generate DiscussionForumPosting schema for user-generated Squad posts
 * Per Google's guidelines: https://developers.google.com/search/docs/appearance/structured-data/discussion-forum
 */
export const getDiscussionForumPostingSchema = (
  post: Post,
  topComments?: Comment[],
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'DiscussionForumPosting',
  mainEntityOfPage: post.commentsPermalink,
  headline: post.title || post.sharedPost?.title,
  text: getPostTextContent(post),
  url: post.commentsPermalink,
  datePublished: post.createdAt,
  ...(post.updatedAt && { dateModified: post.updatedAt }),
  // Author is required for DiscussionForumPosting
  author: getAuthorSchema(post),
  // Image if available
  ...(post.image && { image: post.image }),
  // Interaction statistics
  interactionStatistic: [
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: post.numUpvotes || 0,
    },
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: post.numComments || 0,
    },
  ],
  // For Share posts, include the shared content reference
  ...(post.type === PostType.Share &&
    post.sharedPost?.permalink && {
      sharedContent: {
        '@type': 'WebPage',
        url: post.sharedPost.permalink,
      },
    }),
  // Include comments directly in the DiscussionForumPosting
  ...(topComments?.length && {
    comment: topComments.map((c) => commentToSchema(c)),
  }),
  // Part of the Squad/Source
  ...(post.source && {
    isPartOf: {
      '@type': 'WebPage',
      url: post.source.permalink,
      name: post.source.name,
    },
  }),
});

/**
 * Generate TechArticle schema for external articles (non-user-generated content)
 */
export const getTechArticleSchema = (post: Post): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: post.title,
  url: post.commentsPermalink,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': post.commentsPermalink,
  },
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
  author: getAuthorSchema(post),
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
  keywords: post.tags?.join(','),
  timeRequired: `PT${post.readTime}M`,
  // Video schema for YouTube posts
  ...(post.type === PostType.VideoYouTube &&
    post.videoId && {
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

/**
 * Get the appropriate JSON-LD schema based on post type
 * - User-generated posts (Squad) → DiscussionForumPosting
 * - External articles → TechArticle
 */
export const getSEOJsonLd = (post: Post, topComments?: Comment[]): string => {
  const schema = isUserGeneratedPost(post)
    ? getDiscussionForumPostingSchema(post, topComments)
    : getTechArticleSchema(post);

  return JSON.stringify(schema);
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
        name: post.title || post.sharedPost?.title || 'Post',
      },
    ],
  });
};

/**
 * Get comments schema as a separate WebPage entity
 * Only used for TechArticle posts (external articles)
 * DiscussionForumPosting includes comments directly in the main schema
 */
export const getCommentsJsonLd = (
  post: Post,
  topComments: Comment[],
): string | null => {
  // Don't output separate comments schema for user-generated posts
  // (comments are embedded in DiscussionForumPosting)
  if (isUserGeneratedPost(post)) {
    return null;
  }

  if (!topComments?.length) {
    return null;
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': post.commentsPermalink,
    comment: topComments.map((c) => commentToSchema(c)),
  });
};

export interface PostSEOSchemaProps {
  post: Post;
  topComments?: Comment[];
}

/**
 * PostSEOSchema component renders structured data for SEO
 * - User-generated posts (Squad) → DiscussionForumPosting with embedded comments
 * - External articles → TechArticle + separate WebPage with comments
 */
export const PostSEOSchema = ({
  post,
  topComments,
}: PostSEOSchemaProps): ReactElement => {
  if (!post) {
    return null;
  }

  // For TechArticle posts, comments are rendered as a separate WebPage schema
  // For DiscussionForumPosting, comments are embedded in the main schema
  const commentsJsonLd =
    topComments?.length && !isUserGeneratedPost(post)
      ? getCommentsJsonLd(post, topComments)
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getSEOJsonLd(post, topComments),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getBreadcrumbJsonLd(post),
        }}
      />
      {commentsJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: commentsJsonLd,
          }}
        />
      )}
    </>
  );
};
