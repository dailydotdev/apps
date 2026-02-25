import { gqlClient, gqlRequest } from './common';

interface PostNode {
  id: string;
  commentsPermalink: string;
  title: string | null;
}

interface FeedResponse {
  page: {
    edges: Array<{
      node: PostNode;
    }>;
  };
}

interface ModalResponse {
  modal: {
    title: string | null;
  };
}

describe('gqlRequest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fallback null post title to empty string', async () => {
    jest.spyOn(gqlClient, 'request').mockResolvedValue({
      page: {
        edges: [
          {
            node: {
              id: 'post-id',
              commentsPermalink: '/posts/post-id',
              title: null,
            },
          },
        ],
      },
    } as never);

    const result = await gqlRequest<FeedResponse>('query Test { _ }');
    const firstPost = result.page.edges[0].node;

    expect(firstPost.title).toBe('');
  });

  it('should keep non-post title fields unchanged', async () => {
    jest.spyOn(gqlClient, 'request').mockResolvedValue({
      modal: { title: null },
    } as never);

    const result = await gqlRequest<ModalResponse>('query Test { _ }');

    expect(result.modal.title).toBeNull();
  });
});
