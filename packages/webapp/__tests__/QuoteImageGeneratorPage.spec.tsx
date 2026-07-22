import React from 'react';
import { render, screen } from '@testing-library/react';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import QuoteImagePage, {
  getStaticProps,
} from '../pages/image-generator/quote/[id]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return { ...actual, gqlClient: { request: jest.fn() } };
});

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

const mockRequest = gqlClient.request as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

const post = {
  id: 'post-1',
  title: 'How to ship fast',
  source: { name: 'daily.dev' },
  author: { name: 'Ido Shamun' },
};

beforeEach(() => {
  jest.clearAllMocks();
  useRouterMock.mockReturnValue({ query: { text: 'a quote worth sharing' } });
});

describe('quote image generator getStaticProps', () => {
  it('returns the post attribution and a large-image twitter card', async () => {
    mockRequest.mockResolvedValue({ post });

    const result = await getStaticProps({ params: { id: 'post-1' } });
    const { props } = result as unknown as {
      props: {
        id: string;
        seo: { openGraph: { images: { url: string }[] } };
      };
    };

    expect(props).toMatchObject({
      id: 'post-1',
      title: 'How to ship fast',
      sourceName: 'daily.dev',
      authorName: 'Ido Shamun',
    });
    expect(props.seo).toMatchObject({
      twitter: { cardType: 'summary_large_image' },
    });
    expect(props.seo.openGraph.images[0].url).toContain('post-1');
  });

  it('404s when the post is missing', async () => {
    mockRequest.mockRejectedValue(new Error('not found'));

    const result = await getStaticProps({ params: { id: 'nope' } });

    expect(result).toMatchObject({ notFound: true });
  });
});

describe('quote image generator page', () => {
  it('renders the screenshot wrapper around the quote', () => {
    render(
      <QuoteImagePage
        authorName="Ido Shamun"
        id="post-1"
        seo={{}}
        sourceName="daily.dev"
        title="How to ship fast"
      />,
    );

    // The screenshot service targets this exact id.
    expect(screen.getByTestId('screenshot_wrapper')).toHaveAttribute(
      'id',
      'screenshot_wrapper',
    );
    expect(screen.getByText('a quote worth sharing')).toBeInTheDocument();
    expect(screen.getByText('How to ship fast')).toBeInTheDocument();
    expect(screen.getByText('Ido Shamun · daily.dev')).toBeInTheDocument();
  });
});
