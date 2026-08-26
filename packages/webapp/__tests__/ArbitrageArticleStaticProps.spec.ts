import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import { getStaticProps } from '../pages/articles/[id]';

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

const createPost = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 'post-id',
    type: PostType.Article,
    title: 'Programmatic ad article',
    slug: 'programmatic-ad-article',
    summary: 'A concise summary for the programmatic ad article.',
    contentHtml: '',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString(),
    language: 'en',
    tags: ['ads'],
    image: 'https://example.com/post.png',
    source: {
      name: 'daily.dev',
      public: true,
    },
    author: {
      reputation: 11,
      permalink: 'https://example.com/@author',
    },
    ...overrides,
  } as Post);

describe('arbitrage article static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('keeps the article ad route noindex and avoids comment data fetches', async () => {
    mockRequest.mockResolvedValueOnce({ post: createPost() });

    const result = await getStaticProps({
      params: { id: 'post-id' },
    } as never);

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(POST_BY_ID_STATIC_FIELDS_QUERY, {
      id: 'post-id',
    });
    expect(result).toMatchObject({
      props: {
        id: 'post-id',
        seo: {
          title: 'Programmatic ad article | daily.dev',
          description: 'A concise summary for the programmatic ad article.',
          nofollow: true,
          noindex: true,
        },
      },
    });
    expect(
      (result as { props: { seo: { canonical?: string } } }).props.seo
        .canonical,
    ).toBeUndefined();
  });

  it('does not generate article ad pages for unsupported post types', async () => {
    mockRequest.mockResolvedValueOnce({
      post: createPost({ type: PostType.Share }),
    });

    const result = await getStaticProps({
      params: { id: 'post-id' },
    } as never);

    expect(result).toMatchObject({ notFound: true });
  });

  it('keeps the API-error fallback noindex and nofollow', async () => {
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
});
