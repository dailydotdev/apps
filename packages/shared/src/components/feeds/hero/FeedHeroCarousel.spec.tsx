import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Post } from '../../../graphql/posts';
import { FeedHeroCarousel } from './FeedHeroCarousel';
import type { FeedHeroLayout } from './feedHeroShape';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
});

const titles = ['First hero post', 'Second hero post', 'Third hero post'];

const posts: Post[] = titles.map((title, index) => ({
  ...basePost,
  id: `hero-${index}`,
  title,
}));

const renderComponent = (
  carouselPosts: Post[] = posts,
  layout: FeedHeroLayout = 'stacked',
): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <FeedHeroCarousel posts={carouselPosts} layout={layout} />
    </TestBootProvider>,
  );

const getTitle = (title: string) =>
  screen.getByRole('heading', { name: title });

describe('FeedHeroCarousel stacked', () => {
  it('leads with the first post at full width', () => {
    renderComponent();

    expect(getTitle(titles[0])).toBeInTheDocument();
  });

  it('leaves the rest of the posts to the headline list', () => {
    renderComponent();

    expect(
      screen.queryByRole('heading', { name: titles[1] }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: titles[2] }),
    ).not.toBeInTheDocument();
  });

  it('has nothing to page, so no indicators, arrows or autoplay', () => {
    renderComponent();

    expect(
      screen.queryByRole('button', { name: /^Show featured post/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Next:/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('carouselProgress')).not.toBeInTheDocument();
  });

  it('renders nothing without posts', () => {
    const { container } = renderComponent([]);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('FeedHeroCarousel wide', () => {
  it('pages through every post once the section has columns', () => {
    renderComponent(posts, 'wide');

    expect(
      screen.getByRole('button', { name: `Next: ${titles[1]}` }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /^Show featured post/ }),
    ).toHaveLength(titles.length);
  });
});

describe('FeedHeroCarousel split', () => {
  it('pages through every post', () => {
    renderComponent(posts, 'split');

    expect(
      screen.getAllByRole('button', { name: /^Show featured post/ }),
    ).toHaveLength(titles.length);
  });

  // Half a section is about a feed column wide, so the featured post takes the
  // card the feed itself would give it rather than the wide card.
  it('uses the standard card, not the wide one', () => {
    renderComponent(posts, 'split');

    expect(getTitle(titles[0])).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Featured posts' }),
    ).toBeInTheDocument();
  });
});
