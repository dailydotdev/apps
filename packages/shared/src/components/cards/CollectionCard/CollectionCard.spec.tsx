import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { CollectionCard } from './CollectionCard';
import { sharePost as collectionPost } from '../../../../__tests__/fixture/post';
import { PostCardProps } from '../common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';

const post = collectionPost;
const defaultProps: PostCardProps = {
  post,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

jest.mock('../../../hooks/useBookmarkProvider', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation((): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <CollectionCard {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

it('should call on link click on component left click', async () => {
  renderComponent();
  const el = await screen.findByTitle('Good read about react-query');
  el.click();
  await waitFor(() => expect(defaultProps.onPostClick).toBeCalled());
});

it('should call on upvote click on upvote button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() => expect(defaultProps.onUpvoteClick).toBeCalledWith(post));
});

it('should call on comment click on comment button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Comments');
  el.click();
  await waitFor(() => expect(defaultProps.onCommentClick).toBeCalledWith(post));
});

it('should call on share click on copy link button click', async () => {
  renderComponent({});
  const el = await screen.findByLabelText('Copy link');
  el.click();
  await waitFor(() => expect(defaultProps.onCopyLinkClick).toBeCalled());
});

it('should not display publication date createdAt is empty', async () => {
  renderComponent({
    ...defaultProps,
    post: { ...post, createdAt: null },
  });
  const el = screen.queryByText('Jun 13, 2018');
  expect(el).not.toBeInTheDocument();
});

it('should format publication date', async () => {
  renderComponent();
  const el = await screen.findByText('Feb 09, 2023');
  expect(el).toBeInTheDocument();
});

it('should hide read time when not available', async () => {
  const usePost = { ...post };
  delete usePost.readTime;
  renderComponent({ post: usePost });
  expect(screen.queryByTestId('readTime')).not.toBeInTheDocument();
});

it('should display the `collection` pill in the header', async () => {
  renderComponent();
  await screen.findByText('Collection');
});

it('should show options button on hover when in laptop size', async () => {
  renderComponent();
  const header = await screen.findByLabelText('Options');
  expect(header).toHaveClass('inline-flex');
  expect(header).toHaveClass('group-hover:flex laptop:hidden');
});
