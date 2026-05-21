import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ArticleFeaturedWideGridCard } from './ArticleFeaturedWideGridCard';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const defaultProps: PostCardProps = {
  post: {
    ...post,
    summary: 'A short summary for the featured wide card.',
  },
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
  onPostAuxClick: jest.fn(),
  onDownvoteClick: jest.fn(),
};

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <ArticleFeaturedWideGridCard {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

it('renders a larger title, description, engagement bar, and column-width image', async () => {
  renderComponent();

  const title = await screen.findByRole('heading', { level: 3 });
  expect(title).toHaveClass('typo-title1');
  expect(title).not.toHaveClass('line-clamp-2', 'line-clamp-3');
  expect(title).toHaveTextContent(post.title ?? '');

  expect(
    screen.getByText('A short summary for the featured wide card.'),
  ).toHaveClass('line-clamp-3');

  const upvoteButton = screen.getByLabelText('More like this');
  expect(upvoteButton).toBeInTheDocument();
  expect(upvoteButton).toHaveClass('h-8', 'w-8');
  expect(screen.getByText('Read post')).toBeInTheDocument();

  const image = screen.getByRole('img', { name: post.title });
  expect(image).toHaveClass('object-cover');
  expect(image.parentElement).toHaveClass('h-full', 'min-w-0', 'rounded-r-16');
  expect(image.parentElement?.parentElement).toHaveClass('grid-cols-2');

  expect(screen.getByText('Breaking news')).toHaveClass(
    'breaking-news-chip-fill',
  );
  const chip = screen.getByText('Breaking news');
  expect(
    title.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(chip.closest('.shrink-0')?.nextElementSibling).toHaveClass(
    'overflow-hidden',
  );
});
