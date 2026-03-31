import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { getStaticProps } from '../pages/posts/[id]/index';

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
  author?: {
    reputation: number;
    permalink?: string;
  };
};

const createPost = ({
  type,
  upvotes,
  reputation = 11,
}: {
  type: PostType;
  upvotes: number;
  reputation?: number;
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
  author: {
    reputation,
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
  ])(
    'should noindex %s posts with fewer than 5 upvotes',
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

  it.each([
    [PostType.Brief, 5],
    [PostType.SocialTwitter, 8],
  ])(
    'should keep %s posts indexable with sufficient engagement',
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
            noindex: false,
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
});
