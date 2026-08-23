import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Post } from '../../../graphql/posts';
import { FeedHeroCarousel } from './FeedHeroCarousel';

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

const renderComponent = (carouselPosts: Post[] = posts): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <FeedHeroCarousel posts={carouselPosts} />
    </TestBootProvider>,
  );

const getTitle = (title: string) =>
  screen.getByRole('heading', { name: title });

describe('FeedHeroCarousel', () => {
  it('renders the first post and both neighbours as navigation labels', () => {
    renderComponent();

    expect(getTitle(titles[0])).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Next: ${titles[1]}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Previous: ${titles[2]}` }),
    ).toBeInTheDocument();
  });

  it('wraps around when paging past the last post', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: `Next: ${titles[1]}` }));
    expect(getTitle(titles[1])).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `Next: ${titles[2]}` }));
    fireEvent.click(screen.getByRole('button', { name: `Next: ${titles[0]}` }));
    expect(getTitle(titles[0])).toBeInTheDocument();
  });

  it('jumps to the post picked from the indicators', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Show featured post 3' }),
    );

    expect(getTitle(titles[2])).toBeInTheDocument();
  });

  it('hides the controls for a single post', () => {
    renderComponent([posts[0]]);

    expect(getTitle(titles[0])).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Show featured post/ }),
    ).not.toBeInTheDocument();
  });
});
