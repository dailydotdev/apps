import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import post from '../../../../__tests__/fixture/post';
import { PostCardProps, visibleOnGroupHover } from '../common/common';
import { PostType } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ArticleGrid } from './ArticleGrid';

const defaultProps: PostCardProps = {
  post,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <ArticleGrid {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

const videoPostTypeComponentProps = {
  post: { ...defaultProps.post, type: PostType.VideoYouTube },
};

it('should call on link click on component left click', async () => {
  renderComponent();
  const el = await screen.findByTitle('The Prosecutor’s Fallacy');
  el.click();
  await waitFor(() => expect(defaultProps.onPostClick).toBeCalled());
});

it('should call on read post link click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findByText('Read post');
  el.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onReadArticleClick).toBeCalledTimes(1),
  );
});

it('should call on watch video link click on component middle mouse up', async () => {
  renderComponent(videoPostTypeComponentProps);
  const el = await screen.findByText('Watch video');
  el.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onReadArticleClick).toBeCalledTimes(1),
  );
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
  const el = await screen.findByText('Jun 13, 2018');
  expect(el).toBeInTheDocument();
});

it('should format read time when available', async () => {
  renderComponent();
  const el = await screen.findByTestId('readTime');
  expect(el).toHaveTextContent('8m read time');
});

it('should change text to watch time when post type is video:youtube ', async () => {
  renderComponent(videoPostTypeComponentProps);
  const el = await screen.findByTestId('readTime');
  expect(el).toHaveTextContent('8m watch time');
});

it('should hide read time when not available', async () => {
  const usePost = { ...post };
  delete usePost.readTime;
  renderComponent({ post: usePost });
  expect(screen.queryByTestId('readTime')).not.toBeInTheDocument();
});

it('should show author image when available', async () => {
  renderComponent();
  const el = await screen.findByAltText("ido's profile");
  expect(el).toBeInTheDocument();
});

it('should show trending flag', async () => {
  const usePost = { ...post, trending: 20 };
  renderComponent({ post: usePost });
  expect(
    await screen.findByText('20 devs read it last hour'),
  ).toBeInTheDocument();
});

it('should open the article when clicking the read post button', async () => {
  renderComponent();
  const read = await screen.findByText('Read post');
  fireEvent.click(read);
  expect(defaultProps.onReadArticleClick).toBeCalledTimes(1);
});

it('should open the video when clicking the watch video button', async () => {
  renderComponent(videoPostTypeComponentProps);
  const read = await screen.findByText('Watch video');
  fireEvent.click(read);
  expect(defaultProps.onReadArticleClick).toBeCalledTimes(1);
});

it('should show read post button on hover when in laptop size', async () => {
  renderComponent();
  const header = await screen.findByTestId('cardHeaderActions');
  expect(header).toHaveClass('flex');
  expect(header).toHaveClass(visibleOnGroupHover);
});

it('should show cover image when available', async () => {
  renderComponent();
  const image = await screen.findByAltText('Post Cover image');
  expect(image).toBeInTheDocument();
});

it('should show cover image with play icon when post is video:youtube type', async () => {
  renderComponent(videoPostTypeComponentProps);
  const image = await screen.findByTestId('playIconVideoPost');
  expect(image).toBeInTheDocument();
});
