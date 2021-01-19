import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { Post } from '../../graphql/posts';
import { PostCard, PostCardProps } from '../../components/cards/PostCard';

const defaultPost: Post = {
  id: 'e3fd75b62cadd02073a31ee3444975cc',
  title: 'The Prosecutor’s Fallacy',
  permalink: 'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
  createdAt: '2018-06-13T01:20:42.000Z',
  source: {
    id: 'tds',
    name: 'Towards Data Science',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  },
  readTime: 8,
  image:
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
  placeholder:
    'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAOAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwQF/8QAJRAAAQMCBQQDAAAAAAAAAAAAAQIDBBEhAAUSIjEGFEGBExZR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwb/xAAeEQABAwQDAAAAAAAAAAAAAAACAQMRAAQFYSHw8f/aAAwDAQACEQMRAD8AvyKMIOdTJzSURmESVBsPrUXAAq6iQQNHu9L/ALhSiZpIdiMuFDJK0JUSkilx43cYCvt8eT2rMxD6GVDelltPsC4qK+OMaLHUoDDfasuiPpHxha06gmlq7eaYn8hhyuyQphe7pQvH3VUnY1x7X//Z',
  commentsPermalink: 'https://daily.dev',
  author: {
    id: '1',
    name: 'Ido Shamun',
    image: 'https://avatars2.githubusercontent.com/u/1993245?v=4',
    permalink: 'https://app.daily.dev/idoshamun',
  },
};

const defaultProps: PostCardProps = {
  post: defaultPost,
  onLinkClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(<PostCard {...defaultProps} {...props} />);
};

it('should call on link click on component left click', async () => {
  renderComponent();
  const el = await screen.findByRole('link');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultPost),
  );
});

it('should call on link click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findByRole('link');
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultPost),
  );
});

it('should call on upvote click on upvote button click', async () => {
  renderComponent();
  const el = await screen.findByTitle('Upvote');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onUpvoteClick).toBeCalledWith(defaultPost, true),
  );
});

it('should call on comment click on comment button click', async () => {
  renderComponent();
  const el = await screen.findByTitle('Comment');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onCommentClick).toBeCalledWith(defaultPost),
  );
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

it('should hide read time when not available', async () => {
  const post = { ...defaultPost };
  delete post.readTime;
  renderComponent({ post });
  expect(screen.queryByTestId('readTime')).not.toBeInTheDocument();
});
