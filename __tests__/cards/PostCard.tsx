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
  featuredComments: [
    {
      permalink: 'https://app.daily.dev/c1',
      content: 'My featured comment',
      author: {
        name: 'Nimrod',
        image: 'https://daily.dev/nimrod.jpg',
        id: 'u2',
        permalink: 'https://app.daily.dev/nimrod',
      },
      id: 'c1',
      createdAt: new Date().toISOString(),
      numUpvotes: 0,
    },
  ],
};

const defaultProps: PostCardProps = {
  post: defaultPost,
  onLinkClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(<PostCard {...defaultProps} {...props} />);
};

it('should call on link click on component left click', async () => {
  renderComponent();
  const el = await screen.findAllByRole('link');
  el[0].click();
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultPost),
  );
});

it('should call on link click on component middle mouse up', async () => {
  renderComponent();
  const el = await screen.findAllByRole('link');
  el[0].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 1 }));
  await waitFor(() =>
    expect(defaultProps.onLinkClick).toBeCalledWith(defaultPost),
  );
});

it('should call on upvote click on upvote button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onUpvoteClick).toBeCalledWith(defaultPost, true),
  );
});

it('should call on comment click on comment button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Comments');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onCommentClick).toBeCalledWith(defaultPost),
  );
});

it('should call on bookmark click on bookmark button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Bookmark');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onBookmarkClick).toBeCalledWith(defaultPost, true),
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

it('should show author name when available', async () => {
  renderComponent();
  const el = await screen.findByText('Ido Shamun');
  expect(el).toBeInTheDocument();
});

it('should show featured comments authors profile image', async () => {
  renderComponent();
  const el = await screen.findByAltText(`Nimrod's profile image`);
  expect(el).toBeInTheDocument();
});

it('should show featured comment when clicking on the profile image', async () => {
  renderComponent();
  const btn = await screen.findByAltText(`Nimrod's profile image`);
  btn.click();
  const el = await screen.findByText('My featured comment');
  expect(el).toBeInTheDocument();
});

it('should return back to normal card form when clicking the back button', async () => {
  renderComponent();
  const btn = await screen.findByAltText(`Nimrod's profile image`);
  btn.click();
  await screen.findByText('My featured comment');
  const back = await screen.findByLabelText('Back');
  back.click();
  const el = await screen.findByText('The Prosecutor’s Fallacy');
  expect(el).toBeInTheDocument();
});

it('should show trending flag', async () => {
  const post = { ...defaultPost, trending: 20 };
  renderComponent({ post });
  expect(
    await screen.findByText('20 devs read it last hour'),
  ).toBeInTheDocument();
});
