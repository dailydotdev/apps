import type { Post, TweetMedia } from '../../src/graphql/posts';
import { PostType } from '../../src/graphql/posts';

export const tweetMedia: TweetMedia[] = [
  {
    type: 'image',
    url: 'https://pbs.twimg.com/media/example1.jpg',
    width: 1200,
    height: 800,
  },
];

export const tweetPost: Post = {
  id: 'tweet-test-123',
  title: 'Check out our latest feature release!',
  permalink: 'https://x.com/dailydotdev/status/1234567890123456789',
  createdAt: '2026-01-13T10:00:00.000Z',
  source: {
    id: 'twitter',
    handle: 'twitter',
    name: 'Twitter',
    image: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
  },
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/tweet-placeholder',
  commentsPermalink: 'https://daily.dev/posts/tweet-test-123',
  type: PostType.Tweet,
  tweetId: '1234567890123456789',
  tweetAuthorUsername: 'dailydotdev',
  tweetAuthorName: 'daily.dev',
  tweetAuthorAvatar:
    'https://pbs.twimg.com/profile_images/1234567890/avatar_normal.jpg',
  tweetAuthorVerified: true,
  tweetContent:
    'Check out our latest feature release! 🚀 We have been working hard on this for months.',
  tweetContentHtml:
    'Check out our latest feature release! 🚀 We have been working hard on this for months.',
  tweetCreatedAt: new Date('2026-01-13T10:00:00Z'),
  tweetLikeCount: 1234,
  tweetRetweetCount: 567,
  tweetReplyCount: 89,
  tweetMedia: [],
  isThread: false,
  tweetStatus: 'available',
  tags: ['opensource', 'devtools'],
};

export const tweetPostWithMedia: Post = {
  ...tweetPost,
  id: 'tweet-test-with-media',
  tweetMedia,
};

export const tweetPostThread: Post = {
  ...tweetPost,
  id: 'tweet-test-thread',
  isThread: true,
  threadSize: 3,
  threadTweets: [
    {
      tweetId: '1234567890123456790',
      content: 'This is the second tweet in the thread.',
      contentHtml: 'This is the second tweet in the thread.',
      createdAt: new Date('2026-01-13T10:01:00Z'),
      media: [],
      likeCount: 234,
      retweetCount: 45,
      replyCount: 12,
    },
    {
      tweetId: '1234567890123456791',
      content: 'Third and final tweet.',
      contentHtml: 'Third and final tweet.',
      createdAt: new Date('2026-01-13T10:02:00Z'),
      media: tweetMedia,
      likeCount: 189,
      retweetCount: 34,
      replyCount: 8,
    },
  ],
};

export const tweetPostProcessing: Post = {
  ...tweetPost,
  id: 'tweet-test-processing',
  tweetStatus: 'processing',
  tweetContent: undefined,
  tweetContentHtml: undefined,
};

export const tweetPostDeleted: Post = {
  ...tweetPost,
  id: 'tweet-test-deleted',
  tweetStatus: 'deleted',
};

export const tweetPostPrivate: Post = {
  ...tweetPost,
  id: 'tweet-test-private',
  tweetStatus: 'private',
};

export const tweetPostFailed: Post = {
  ...tweetPost,
  id: 'tweet-test-failed',
  tweetStatus: 'failed',
  tweetErrorReason: 'Rate limited. Please try again later.',
};

export const tweetPostUnverified: Post = {
  ...tweetPost,
  id: 'tweet-test-unverified',
  tweetAuthorUsername: 'developer123',
  tweetAuthorName: 'Developer',
  tweetAuthorVerified: false,
};

export default tweetPost;
