import type { Post } from './posts';
import {
  BAN_POST_MUTATION,
  DELETE_POST_MUTATION,
  banPost,
  deletePost,
  getLatestChangelogPost,
  LATEST_CHANGELOG_POST_QUERY,
  PostType,
  isVideoPost,
  getReadPostButtonText,
  isTweetPost,
  isTweetAvailable,
  isTweetProcessing,
  isTweetError,
  getTweetErrorMessage,
} from './posts';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import type { Connection } from './common';

beforeEach(() => {
  jest.clearAllMocks();
});
const id = 'p1';

it('should send banPost query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: BAN_POST_MUTATION,
      variables: { id },
    },
    result: () => {
      queryCalled = true;
      return {
        data: {
          banPost: {
            _: true,
          },
        },
      };
    },
  });
  await banPost(id);
  expect(queryCalled).toBeTruthy();
});

it('should send deletePost query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: DELETE_POST_MUTATION,
      variables: { id },
    },
    result: () => {
      queryCalled = true;
      return {
        data: {
          deletePost: {
            _: true,
          },
        },
      };
    },
  });
  await deletePost(id);
  expect(queryCalled).toBeTruthy();
});

it('should return latest changelog post', async () => {
  interface MockFeedData {
    page: Connection<Pick<Post, 'id'>>;
  }

  let queryCalled = false;
  mockGraphQL<MockFeedData>({
    request: {
      query: LATEST_CHANGELOG_POST_QUERY,
    },
    result: () => {
      queryCalled = true;

      return {
        data: {
          page: {
            edges: [
              {
                node: { id: 'test1' },
              },
            ],
            pageInfo: {},
          },
        },
      };
    },
  });
  const result = await getLatestChangelogPost();

  expect(queryCalled).toBeTruthy();
  expect(result.id).toBe('test1');
});

describe('function isVideoPost', () => {
  it('should return true if post is video', () => {
    const post = {
      type: PostType.VideoYouTube,
    } as Post;

    expect(isVideoPost(post)).toBeTruthy();
  });

  it('should return false if post is not video', () => {
    const post = {
      type: PostType.Article,
    } as Post;

    expect(isVideoPost(post)).toBeFalsy();
  });

  it('should return true if post is shared video', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.VideoYouTube,
      },
    } as Post;

    expect(isVideoPost(post)).toBeTruthy();
  });

  it('should return false if post is shared articled', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.Article,
      },
    } as Post;

    expect(isVideoPost(post)).toBeFalsy();
  });
});

describe('function getReadPostButtonText', () => {
  it('should return "Read post" if post is article', () => {
    const post = {
      type: PostType.Article,
    } as Post;

    expect(getReadPostButtonText(post)).toEqual('Read post');
  });

  it('should return "Read post" if post is shared article', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.Article,
      },
    } as Post;

    expect(getReadPostButtonText(post)).toEqual('Read post');
  });

  it('should return "Watch video" if post is video', () => {
    const post = {
      type: PostType.VideoYouTube,
    } as Post;

    expect(getReadPostButtonText(post)).toEqual('Watch video');
  });

  it('should return "Watch video" if post is shared video', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.VideoYouTube,
      },
    } as Post;

    expect(getReadPostButtonText(post)).toEqual('Watch video');
  });
});

describe('function isTweetPost', () => {
  it('should return true if post is tweet', () => {
    const post = {
      type: PostType.Tweet,
    } as Post;

    expect(isTweetPost(post)).toBeTruthy();
  });

  it('should return false if post is not tweet', () => {
    const post = {
      type: PostType.Article,
    } as Post;

    expect(isTweetPost(post)).toBeFalsy();
  });

  it('should return true if post is shared tweet', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.Tweet,
      },
    } as Post;

    expect(isTweetPost(post)).toBeTruthy();
  });

  it('should return false if post is shared article', () => {
    const post = {
      type: PostType.Share,
      sharedPost: {
        type: PostType.Article,
      },
    } as Post;

    expect(isTweetPost(post)).toBeFalsy();
  });
});

describe('function isTweetAvailable', () => {
  it('should return true if tweet is available', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'available',
    } as Post;

    expect(isTweetAvailable(post)).toBeTruthy();
  });

  it('should return false if tweet is processing', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'processing',
    } as Post;

    expect(isTweetAvailable(post)).toBeFalsy();
  });

  it('should return false if post is not a tweet', () => {
    const post = {
      type: PostType.Article,
      tweetStatus: 'available',
    } as Post;

    expect(isTweetAvailable(post)).toBeFalsy();
  });
});

describe('function isTweetProcessing', () => {
  it('should return true if tweet is processing', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'processing',
    } as Post;

    expect(isTweetProcessing(post)).toBeTruthy();
  });

  it('should return false if tweet is available', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'available',
    } as Post;

    expect(isTweetProcessing(post)).toBeFalsy();
  });

  it('should return false if post is not a tweet', () => {
    const post = {
      type: PostType.Article,
      tweetStatus: 'processing',
    } as Post;

    expect(isTweetProcessing(post)).toBeFalsy();
  });
});

describe('function isTweetError', () => {
  it('should return true if tweet is deleted', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'deleted',
    } as Post;

    expect(isTweetError(post)).toBeTruthy();
  });

  it('should return true if tweet is private', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'private',
    } as Post;

    expect(isTweetError(post)).toBeTruthy();
  });

  it('should return true if tweet is unavailable', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'unavailable',
    } as Post;

    expect(isTweetError(post)).toBeTruthy();
  });

  it('should return true if tweet failed', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'failed',
    } as Post;

    expect(isTweetError(post)).toBeTruthy();
  });

  it('should return false if tweet is available', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'available',
    } as Post;

    expect(isTweetError(post)).toBeFalsy();
  });

  it('should return false if tweet is processing', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'processing',
    } as Post;

    expect(isTweetError(post)).toBeFalsy();
  });

  it('should return false if post is not a tweet', () => {
    const post = {
      type: PostType.Article,
      tweetStatus: 'deleted',
    } as Post;

    expect(isTweetError(post)).toBeFalsy();
  });
});

describe('function getTweetErrorMessage', () => {
  it('should return deleted message for deleted tweet', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'deleted',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual('This tweet has been deleted');
  });

  it('should return private message for private tweet', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'private',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual(
      'This tweet is from a private account',
    );
  });

  it('should return unavailable message for unavailable tweet', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'unavailable',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual(
      'This tweet is no longer available',
    );
  });

  it('should return custom error reason for failed tweet', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'failed',
      tweetErrorReason: 'Rate limited. Please try again later.',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual(
      'Rate limited. Please try again later.',
    );
  });

  it('should return default failed message when no error reason', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'failed',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual('Failed to load this tweet');
  });

  it('should return default message for unknown status', () => {
    const post = {
      type: PostType.Tweet,
      tweetStatus: 'available',
    } as Post;

    expect(getTweetErrorMessage(post)).toEqual('Unable to load this tweet');
  });
});
