import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { getStaticProps } from '../pages/tags/[tag]';

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

const mockTagRequests = (keyword: Keyword): void => {
  mockRequest
    .mockResolvedValueOnce({ keyword })
    .mockResolvedValueOnce({ page: { edges: [] } })
    .mockResolvedValueOnce({ recommendedTags: { tags: [] } })
    .mockResolvedValueOnce({ topCreatorsByTag: [] });
};

describe('tag page static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should use the custom tag title in the news SEO title', async () => {
    mockTagRequests({
      value: 'javascript',
      occurrences: 1,
      status: 'allow',
      flags: { title: 'JavaScript' },
    });

    const result = await getStaticProps({
      params: { tag: 'javascript' },
    } as never);

    expect(result).toMatchObject({
      props: {
        seo: {
          title: 'JavaScript News & Updates | daily.dev',
        },
      },
    });
  });

  it('should format a tag slug used in the news SEO title', async () => {
    mockTagRequests({
      value: 'machine-learning',
      occurrences: 1,
      status: 'allow',
    });

    const result = await getStaticProps({
      params: { tag: 'machine-learning' },
    } as never);

    expect(result).toMatchObject({
      props: {
        seo: {
          title: 'Machine Learning News & Updates | daily.dev',
        },
      },
    });
  });

  it('should scope company tags to developer news', async () => {
    mockTagRequests({
      value: 'google',
      occurrences: 1,
      status: 'allow',
      flags: { title: 'Google' },
    });

    const result = await getStaticProps({
      params: { tag: 'google' },
    } as never);

    expect(result).toMatchObject({
      props: {
        seo: {
          title: 'Google Developer News & Updates | daily.dev',
        },
      },
    });
  });
});
