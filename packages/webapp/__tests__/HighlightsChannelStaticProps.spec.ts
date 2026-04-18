import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  HIGHLIGHTS_PAGE_QUERY,
  POST_HIGHLIGHTS_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/highlights';
import { getStaticProps } from '../pages/highlights/[channel]';

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

describe('highlights channel static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should resolve the agentic route alias to the vibes channel', async () => {
    mockRequest.mockImplementation((query: string, variables?: object) => {
      if (query === HIGHLIGHTS_PAGE_QUERY) {
        return Promise.resolve({
          majorHeadlines: {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
          channelConfigurations: [
            {
              channel: 'vibes',
              displayName: 'Agentic',
            },
          ],
        });
      }

      if (query === POST_HIGHLIGHTS_FEED_QUERY) {
        expect(variables).toEqual({ channel: 'vibes' });

        return Promise.resolve({
          postHighlights: [],
        });
      }

      return Promise.reject(new Error('Unexpected query'));
    });

    const result = await getStaticProps({
      params: { channel: 'agentic' },
    } as never);

    expect(result).toMatchObject({
      props: {
        dehydratedState: expect.any(Object),
      },
      revalidate: 60,
    });
  });
});
