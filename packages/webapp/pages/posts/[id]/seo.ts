import { Post, PostType } from '@dailydotdev/shared/src/graphql/posts';

export const getSeoDescription = (post: Post): string => {
  if (post?.summary) {
    return post?.summary;
  }
  if (post?.description) {
    return post?.description;
  }
  return `Join us to the discussion about "${post?.title}" on daily.dev ✌️`;
};

export const getSEOJsonLd = (post: Post): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post?.title,
    dateCreated: post?.createdAt,
    datePublished: post?.createdAt,
    dateModified: post?.updatedAt,
    description: getSeoDescription(post),
    author: {
      ...(post?.author
        ? {
            '@type': 'Person',
            name: post?.author?.name ?? post?.author?.username,
            description: post?.author?.bio,
            image: post?.author?.image,
            url: post?.author?.permalink,
            interactionStatistic: {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/EndorseAction',
              userInteractionCount: post?.author?.reputation,
            },
          }
        : {
            '@type': 'Organization',
            name: post?.source?.name,
            logo: post?.source?.image,
            url: post?.source?.permalink,
          }),
    },
    commentCount: post?.numComments,
    discussionUrl: post?.commentsPermalink,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: post?.numUpvotes,
    },
    keywords: post?.tags?.join(','),
    timeRequired: `PT${post?.readTime}M`,
    thumbnailUrl: post?.image,
    ...(post?.type === PostType.VideoYouTube && {
      video: {
        '@type': 'VideoObject',
        name: post?.title,
        description: getSeoDescription(post),
        thumbnailUrl: post?.image,
        uploadDate: post?.createdAt,
        duration: `PT${post?.readTime}M`,
        url: post?.permalink,
      },
    }),
  });
};
