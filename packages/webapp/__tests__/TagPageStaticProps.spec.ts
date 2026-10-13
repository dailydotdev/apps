import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { getStaticProps } from '../pages/tags/[tag]';
import { getStaticProps as getMonthlyArchiveStaticProps } from '../pages/tags/[tag]/best-of/[year]/[month]';

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

  it('should 404 an unknown tag instead of serving an empty page', async () => {
    mockRequest
      .mockResolvedValueOnce({ keyword: null })
      .mockResolvedValueOnce({ page: { edges: [] } })
      .mockResolvedValueOnce({ recommendedTags: { tags: [] } })
      .mockResolvedValueOnce({ topCreatorsByTag: [] });

    const result = await getStaticProps({
      params: { tag: 'not-a-real-tag' },
    } as never);

    expect(result).toEqual({ notFound: true, revalidate: 3600 });
  });

  it('should 404 when the keyword request fails', async () => {
    mockRequest.mockRejectedValue(new Error('nope'));

    const result = await getStaticProps({
      params: { tag: 'javascript' },
    } as never);

    expect(result).toEqual({ notFound: true, revalidate: 3600 });
  });

  it('should permanently redirect a tag to its lowercase URL', async () => {
    const result = await getStaticProps({
      params: { tag: 'React' },
    } as never);

    expect(result).toEqual({
      redirect: { destination: '/tags/react', permanent: true },
    });
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should keep the archive period when redirecting a tag', async () => {
    const result = await getMonthlyArchiveStaticProps({
      params: { tag: 'C#', year: '2025', month: '06' },
    } as never);

    expect(result).toEqual({
      redirect: { destination: '/tags/c%23/best-of/2025/06', permanent: true },
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
