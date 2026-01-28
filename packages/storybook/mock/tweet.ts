import type { Post, TweetMedia } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';

/**
 * Mock tweet data for Storybook stories
 */

export const mockAuthor = {
  username: 'dailydotdev',
  name: 'daily.dev',
  avatar: 'https://pbs.twimg.com/profile_images/1234567890/avatar_normal.jpg',
  verified: true,
};

export const mockAuthorUnverified = {
  username: 'developer123',
  name: 'Developer',
  avatar: 'https://pbs.twimg.com/profile_images/1111111111/avatar_normal.jpg',
  verified: false,
};

export const mockTweetMedia: TweetMedia[] = [
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example1.jpg',
    width: 1200,
    height: 800,
    previewUrl: 'https://pbs.twimg.com/media/example1.jpg:small',
  },
];

export const mockTweetMediaTwo: TweetMedia[] = [
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example1.jpg',
    width: 1200,
    height: 800,
    previewUrl: 'https://pbs.twimg.com/media/example1.jpg:small',
  },
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example2.jpg',
    width: 800,
    height: 1200,
    previewUrl: 'https://pbs.twimg.com/media/example2.jpg:small',
  },
];

export const mockTweetMediaThree: TweetMedia[] = [
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example1.jpg',
    width: 1200,
    height: 800,
  },
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example2.jpg',
    width: 800,
    height: 1200,
  },
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example3.jpg',
    width: 1000,
    height: 1000,
  },
];

export const mockTweetMediaFour: TweetMedia[] = [
  ...mockTweetMediaThree,
  {
    type: 'photo',
    url: 'https://pbs.twimg.com/media/example4.jpg',
    width: 1600,
    height: 900,
  },
];

export const mockVideoMedia: TweetMedia[] = [
  {
    type: 'video',
    url: 'https://video.twimg.com/ext_tw_video/example.mp4',
    previewUrl: 'https://pbs.twimg.com/ext_tw_video_thumb/example.jpg',
    width: 1920,
    height: 1080,
    durationMs: 30000,
  },
];

export const mockGifMedia: TweetMedia[] = [
  {
    type: 'animated_gif',
    url: 'https://video.twimg.com/tweet_video/example.mp4',
    previewUrl: 'https://pbs.twimg.com/tweet_video_thumb/example.jpg',
    width: 480,
    height: 270,
  },
];

export const mockTweetPost: Partial<Post> = {
  id: 'tweet-123',
  title: 'Check out our latest feature release! We have been working hard on this for months.',
  type: PostType.Tweet,
  tweetId: '1234567890123456789',
  tweetAuthorUsername: mockAuthor.username,
  tweetAuthorName: mockAuthor.name,
  tweetAuthorAvatar: mockAuthor.avatar,
  tweetAuthorVerified: mockAuthor.verified,
  tweetContent: 'Check out our latest feature release! 🚀\n\nWe have been working hard on this for months and we are finally ready to share it with you.\n\n#opensource #devtools',
  tweetContentHtml: 'Check out our latest feature release! 🚀<br><br>We have been working hard on this for months and we are finally ready to share it with you.<br><br><a href="https://twitter.com/hashtag/opensource">#opensource</a> <a href="https://twitter.com/hashtag/devtools">#devtools</a>',
  tweetCreatedAt: new Date('2026-01-13T10:00:00Z'),
  tweetLikeCount: 1234,
  tweetRetweetCount: 567,
  tweetReplyCount: 89,
  tweetMedia: [],
  isThread: false,
  createdAt: new Date('2026-01-13T10:00:00Z').toISOString(),
  source: {
    id: 'twitter',
    name: 'Twitter',
    handle: 'twitter',
    image: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
    type: 'machine',
  },
};

export const mockTweetWithImages: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-with-images',
  tweetMedia: mockTweetMediaTwo,
};

export const mockTweetWithVideo: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-with-video',
  tweetMedia: mockVideoMedia,
};

export const mockTweetWithGif: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-with-gif',
  tweetMedia: mockGifMedia,
};

export const mockLongTweet: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-long',
  tweetContent: `This is a really long tweet that demonstrates how text wrapping works in our tweet display component.

We support multi-paragraph tweets, and this one has several paragraphs to show how they are formatted.

The component should handle long text gracefully, showing proper line breaks and maintaining readability throughout the entire tweet.

Let's add even more content to really test the limits of the component and see how it handles very long tweets with multiple paragraphs and various types of content.

#longtweettest #developer #coding #programming #webdev #frontend #react #typescript`,
  tweetContentHtml: `This is a really long tweet that demonstrates how text wrapping works in our tweet display component.<br><br>We support multi-paragraph tweets, and this one has several paragraphs to show how they are formatted.<br><br>The component should handle long text gracefully, showing proper line breaks and maintaining readability throughout the entire tweet.<br><br>Let's add even more content to really test the limits of the component and see how it handles very long tweets with multiple paragraphs and various types of content.<br><br>#longtweettest #developer #coding #programming #webdev #frontend #react #typescript`,
};

export const mockThreadTweet: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-thread',
  isThread: true,
  threadSize: 5,
  threadTweets: [
    {
      tweetId: '1234567890123456790',
      content: 'This is the second tweet in the thread. It continues the discussion from the first tweet.',
      contentHtml: 'This is the second tweet in the thread. It continues the discussion from the first tweet.',
      createdAt: new Date('2026-01-13T10:01:00Z'),
      media: [],
      likeCount: 234,
      retweetCount: 45,
      replyCount: 12,
    },
    {
      tweetId: '1234567890123456791',
      content: 'Third tweet in the thread. Adding more context and details here.',
      contentHtml: 'Third tweet in the thread. Adding more context and details here.',
      createdAt: new Date('2026-01-13T10:02:00Z'),
      media: mockTweetMedia,
      likeCount: 189,
      retweetCount: 34,
      replyCount: 8,
    },
    {
      tweetId: '1234567890123456792',
      content: 'Fourth tweet continues the narrative.',
      contentHtml: 'Fourth tweet continues the narrative.',
      createdAt: new Date('2026-01-13T10:03:00Z'),
      media: [],
      likeCount: 156,
      retweetCount: 28,
      replyCount: 5,
    },
    {
      tweetId: '1234567890123456793',
      content: 'Final tweet in this thread. Thanks for reading! 🙏',
      contentHtml: 'Final tweet in this thread. Thanks for reading! 🙏',
      createdAt: new Date('2026-01-13T10:04:00Z'),
      media: [],
      likeCount: 445,
      retweetCount: 89,
      replyCount: 34,
    },
  ],
};

export const mockUnverifiedTweet: Partial<Post> = {
  ...mockTweetPost,
  id: 'tweet-unverified',
  tweetAuthorUsername: mockAuthorUnverified.username,
  tweetAuthorName: mockAuthorUnverified.name,
  tweetAuthorAvatar: mockAuthorUnverified.avatar,
  tweetAuthorVerified: mockAuthorUnverified.verified,
  tweetContent: 'Just shared my first open source project! Check it out on GitHub.',
};
