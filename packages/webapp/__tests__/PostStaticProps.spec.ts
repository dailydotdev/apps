import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { getStaticProps } from '../pages/posts/[id]/index';
import { shouldNoindexPost } from '../lib/seo';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

const mockRequest = gqlClient.request as jest.Mock;

type TestPost = {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  numUpvotes: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags: string[];
  image?: string;
  noindex?: boolean;
  author?: {
    permalink?: string;
  };
};

const createPost = ({
  type,
  upvotes,
  noindex = false,
}: {
  type: PostType;
  upvotes: number;
  noindex?: boolean;
}): TestPost => ({
  id: `${type}-${upvotes}`,
  type,
  title: `${type} title`,
  slug: `${type}-slug`,
  numUpvotes: upvotes,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-02').toISOString(),
  language: 'en',
  tags: ['seo'],
  image: 'https://example.com/post.png',
  noindex,
  author: {
    permalink: 'https://example.com/@author',
  },
});

describe('post static props seo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it.each([
    [PostType.Brief, 4],
    [PostType.SocialTwitter, 4],
    [PostType.Brief, 99],
    [PostType.SocialTwitter, 42],
  ])(
    'should noindex %s posts regardless of upvotes',
    async (type: PostType, upvotes: number) => {
      mockRequest
        .mockResolvedValueOnce({ post: createPost({ type, upvotes }) })
        .mockResolvedValueOnce({ topComments: [] });

      const result = await getStaticProps({
        params: { id: 'post-id' },
      } as never);

      expect(result).toMatchObject({
        props: {
          seo: {
            noindex: true,
          },
        },
      });
    },
  );

  it('should not noindex other post types based on engagement alone', async () => {
    mockRequest
      .mockResolvedValueOnce({
        post: createPost({ type: PostType.Article, upvotes: 0 }),
      })
      .mockResolvedValueOnce({ topComments: [] });

    const result = await getStaticProps({
      params: { id: 'post-id' },
    } as never);

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: false,
        },
      },
    });
  });

  it('should noindex a post the API flags as noindex', async () => {
    mockRequest
      .mockResolvedValueOnce({
        post: createPost({
          type: PostType.Article,
          upvotes: 10,
          noindex: true,
        }),
      })
      .mockResolvedValueOnce({ topComments: [] });

    const result = await getStaticProps({
      params: { id: 'post-id' },
    } as never);

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: true,
        },
      },
    });
  });

  it.each([
    ['the API flags the post as noindex', { noindex: true }],
    ['the post is private', { private: true }],
    ['the source is not public', { source: { public: false } }],
  ])('should noindex when %s', (_, overrides) => {
    expect(
      shouldNoindexPost({
        ...createPost({ type: PostType.Article, upvotes: 10 }),
        ...overrides,
      } as Post),
    ).toBe(true);
  });

  // The ISR fetch is unauthenticated, so posts in private squads always fail
  // with FORBIDDEN. This fallback used to ship no seo, leaving them indexable.
  it('should noindex the error fallback', async () => {
    mockRequest.mockRejectedValue({
      response: {
        errors: [{ extensions: { code: ApiError.Forbidden, postId: 'p-1' } }],
      },
    });

    const result = await getStaticProps({
      params: { id: 'post-id' },
    } as never);

    expect(result).toMatchObject({
      props: {
        id: 'p-1',
        seo: { noindex: true, nofollow: true },
      },
    });
  });

  // Author reputation is the API's call now, so a post it did not flag stays
  // indexable no matter who wrote it.
  it('should keep a post the API did not flag indexable', () => {
    expect(
      shouldNoindexPost({
        ...createPost({ type: PostType.Article, upvotes: 10 }),
        author: {
          id: 'author-1',
          image: 'https://example.com/author.png',
          name: 'Author',
          permalink: 'https://example.com/@author',
          username: 'author',
        },
      } as Post),
    ).toBe(false);
  });
});
