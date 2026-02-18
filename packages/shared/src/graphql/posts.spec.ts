import type { Post } from './posts';
import {
  BAN_POST_MUTATION,
  DELETE_POST_MUTATION,
  banPost,
  deletePost,
  getSocialTwitterPostType,
  getLatestChangelogPost,
  LATEST_CHANGELOG_POST_QUERY,
  PostType,
  isShareLikePost,
  isSocialTwitterShareLike,
  isVideoPost,
  getReadPostButtonText,
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

describe('social twitter helpers', () => {
  it('should map social twitter quote to share type', () => {
    const post = {
      type: PostType.SocialTwitter,
      subType: 'quote',
      sharedPost: {
        id: 'shared-post',
      },
    } as Post;

    expect(getSocialTwitterPostType(post)).toBe(PostType.Share);
    expect(isSocialTwitterShareLike(post)).toBeTruthy();
    expect(isShareLikePost(post)).toBeTruthy();
  });

  it('should map social twitter repost to share type', () => {
    const post = {
      type: PostType.SocialTwitter,
      subType: 'repost',
      sharedPost: {
        id: 'shared-post',
      },
    } as Post;

    expect(getSocialTwitterPostType(post)).toBe(PostType.Share);
    expect(isSocialTwitterShareLike(post)).toBeTruthy();
    expect(isShareLikePost(post)).toBeTruthy();
  });

  it('should map social twitter tweet to freeform type', () => {
    const post = {
      type: PostType.SocialTwitter,
      subType: 'tweet',
      sharedPost: null,
    } as Post;

    expect(getSocialTwitterPostType(post)).toBe(PostType.Freeform);
    expect(isSocialTwitterShareLike(post)).toBeFalsy();
    expect(isShareLikePost(post)).toBeFalsy();
  });

  it('should map social twitter thread to freeform type', () => {
    const post = {
      type: PostType.SocialTwitter,
      subType: 'thread',
      sharedPost: null,
    } as Post;

    expect(getSocialTwitterPostType(post)).toBe(PostType.Freeform);
    expect(isSocialTwitterShareLike(post)).toBeFalsy();
    expect(isShareLikePost(post)).toBeFalsy();
  });

  it('should treat regular shares as share-like', () => {
    const post = {
      type: PostType.Share,
    } as Post;

    expect(getSocialTwitterPostType(post)).toBe(PostType.Share);
    expect(isSocialTwitterShareLike(post)).toBeFalsy();
    expect(isShareLikePost(post)).toBeTruthy();
  });
});
