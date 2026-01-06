import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';

// Helper to strip HTML tags for plain text schema fields
const stripHtml = (html: string): string => {
  return html?.replace(/<[^>]*>/g, '').trim() || '';
};

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
          name: post.source?.name || 'daily.dev',
          logo: post.source?.image,
          url: post.source?.permalink || 'https://daily.dev',
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

// Convert a comment to schema.org Comment format
const commentToSchema = (comment: Comment) => ({
  '@type': 'Comment',
  text: stripHtml(comment.contentHtml),
  dateCreated: comment.createdAt,
  ...(comment.lastUpdatedAt && { dateModified: comment.lastUpdatedAt }),
  url: comment.permalink,
  upvoteCount: comment.numUpvotes,
  author: comment.author
    ? {
        '@type': 'Person',
        name: comment.author.name || comment.author.username,
        url: comment.author.permalink,
        ...(comment.author.image && { image: comment.author.image }),
      }
    : undefined,
});

// Get comments schema for the article
export const getCommentsJsonLd = (
  post: Post,
  topComments: Comment[],
): string | null => {
  if (!topComments?.length) {
    return null;
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': post.commentsPermalink,
    comment: topComments.map(commentToSchema),
  });
};

// Check if post title indicates a question
const isQuestionPost = (post: Post): boolean => {
  const title = post?.title?.trim()?.toLowerCase();
  if (!title) {
    return false;
  }

  return (
    title.endsWith('?') ||
    title.startsWith('how to ') ||
    title.startsWith('how do ') ||
    title.startsWith('what is ') ||
    title.startsWith('what are ') ||
    title.startsWith('why ') ||
    title.startsWith('when ') ||
    title.startsWith('where ')
  );
};

// Get Q&A schema for question-style posts
export const getQAJsonLd = (
  post: Post,
  topComments: Comment[],
): string | null => {
  if (!isQuestionPost(post) || !topComments?.length) {
    return null;
  }

  const [acceptedAnswer, ...suggestedAnswers] = topComments;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: post.title,
      text: getSeoDescription(post),
      dateCreated: post.createdAt,
      answerCount: post.numComments,
      upvoteCount: post.numUpvotes,
      author: post.author
        ? {
            '@type': 'Person',
            name: post.author.name ?? post.author.username,
            url: post.author.permalink,
          }
        : {
            '@type': 'Organization',
            name: post.source?.name,
            url: post.source?.permalink,
          },
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(acceptedAnswer.contentHtml),
        dateCreated: acceptedAnswer.createdAt,
        url: acceptedAnswer.permalink,
        upvoteCount: acceptedAnswer.numUpvotes,
        author: acceptedAnswer.author
          ? {
              '@type': 'Person',
              name:
                acceptedAnswer.author.name || acceptedAnswer.author.username,
              url: acceptedAnswer.author.permalink,
            }
          : undefined,
      },
      ...(suggestedAnswers.length > 0 && {
        suggestedAnswer: suggestedAnswers.map((comment) => ({
          '@type': 'Answer',
          text: stripHtml(comment.contentHtml),
          dateCreated: comment.createdAt,
          url: comment.permalink,
          upvoteCount: comment.numUpvotes,
          author: comment.author
            ? {
                '@type': 'Person',
                name: comment.author.name || comment.author.username,
                url: comment.author.permalink,
              }
            : undefined,
        })),
      }),
    },
  });
};

export interface PostSEOSchemaProps {
  post: Post;
  topComments?: Comment[];
}

export const PostSEOSchema = ({
  post,
  topComments,
}: PostSEOSchemaProps): ReactElement => {
  if (!post) {
    return null;
  }

  const isQuestion = isQuestionPost(post);
  const commentsJsonLd =
    !isQuestion && topComments?.length
      ? getCommentsJsonLd(post, topComments)
      : null;
  const qaJsonLd =
    isQuestion && topComments?.length ? getQAJsonLd(post, topComments) : null;

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
      {commentsJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: commentsJsonLd,
          }}
        />
      )}
      {qaJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: qaJsonLd,
          }}
        />
      )}
    </>
  );
};
