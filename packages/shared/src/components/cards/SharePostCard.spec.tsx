import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SharePostCard } from './SharePostCard';
import { sharePost } from '../../../__tests__/fixture/post';
import { PostCardProps } from './common';
import { PostType } from '../../graphql/posts';

const post = sharePost;
const defaultProps: PostCardProps = {
  post,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onShareClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <SharePostCard {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
};

const videoPostTypeComponentProps = {
  post: {
    ...defaultProps.post,
    sharedPost: {
      ...defaultProps.post?.sharedPost,
      type: PostType.VideoYouTube,
    },
  },
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

it('should call on share click on share button click', async () => {
  renderComponent({});
  const el = await screen.findByLabelText('Share post');
  el.click();
  await waitFor(() => expect(defaultProps.onShareClick).toBeCalled());
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

it('should show author name and squad handle when enableSourceHeader is true', async () => {
  renderComponent({ enableSourceHeader: true });
  await screen.findByText('Lee Hansel Solevilla Jr');
  await screen.findByText('Avengers');
});

it('should show author name and author handle when enableSourceHeader is false', async () => {
  renderComponent({ enableSourceHeader: false });
  await screen.findByText('Lee Hansel Solevilla Jr');
  await screen.findByText('@sshanzel');
});

it('should show options button on hover when in laptop size', async () => {
  renderComponent();
  const header = await screen.findByLabelText('Options');
  expect(header).toHaveClass('inline-flex');
  expect(header).toHaveClass('group-hover:flex laptop:hidden');
});

it('should show cover image with play icon when post is video:youtube type', async () => {
  renderComponent(videoPostTypeComponentProps);
  const image = await screen.findByTestId('playIconVideoPost');
  expect(image).toBeInTheDocument();
});
