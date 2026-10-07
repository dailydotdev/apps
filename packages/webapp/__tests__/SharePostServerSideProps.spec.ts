import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { getServerSideProps } from '../pages/posts/[id]/share';

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

const createPost = (noindex: boolean) => ({
  id: 'p-1',
  type: PostType.Article,
  title: 'Post title',
  slug: 'post-title-p-1',
  numUpvotes: 10,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-02').toISOString(),
  language: 'en',
  tags: ['seo'],
  noindex,
});

const runGssp = () =>
  getServerSideProps({
    params: { id: 'p-1' },
    query: { userid: 'u-1', cid: 'share_post' },
    res: { setHeader: jest.fn() },
  } as never);

// `/posts/[id]?userid=` is rewritten here, so a post the API flags as noindex
// must come out noindex on this route too, not only on `/posts/[id]`.
describe('share post page getServerSideProps seo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should noindex a post the API flags as noindex', async () => {
    mockRequest
      .mockResolvedValueOnce({ post: createPost(true) })
      .mockResolvedValueOnce({ user: { id: 'u-1', name: 'Sharer' } })
      .mockResolvedValueOnce({ topComments: [] });

    const result = await runGssp();

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: true,
          canonical: 'https://daily.dev/posts/post-title-p-1',
          additionalLinkTags: undefined,
        },
      },
    });
  });

  it('should keep an indexable post indexable with its markdown alternate', async () => {
    mockRequest
      .mockResolvedValueOnce({ post: createPost(false) })
      .mockResolvedValueOnce({ user: { id: 'u-1', name: 'Sharer' } })
      .mockResolvedValueOnce({ topComments: [] });

    const result = await runGssp();

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: false,
          canonical: 'https://daily.dev/posts/post-title-p-1',
          additionalLinkTags: [
            {
              rel: 'alternate',
              type: 'text/markdown',
              href: 'https://daily.dev/posts/post-title-p-1.md',
            },
          ],
        },
      },
    });
  });

  it('should noindex the error fallback', async () => {
    mockRequest.mockRejectedValue({
      response: {
        errors: [{ extensions: { code: ApiError.Forbidden, postId: 'p-1' } }],
      },
    });

    const result = await runGssp();

    expect(result).toMatchObject({
      props: {
        id: 'p-1',
        error: ApiError.Forbidden,
        seo: { noindex: true, nofollow: true },
      },
    });
  });
});
