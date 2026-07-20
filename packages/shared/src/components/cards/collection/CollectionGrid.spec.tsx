import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { CollectionGrid } from './CollectionGrid';
import { sharePost as collectionPost } from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import type { Post } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

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

jest.mock('../../../hooks', () => {
  const originalModule = jest.requireActual('../../../hooks');
  return {
    __esModule: true,
    ...originalModule,
    useBookmarkProvider: (): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/posts',
        isReady: true,
        query: {},
      } as unknown as NextRouter),
  );
});

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <CollectionGrid {...defaultProps} {...props} />
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
    post: { ...post, createdAt: undefined },
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

it('should display the collection source stack in the header', async () => {
  renderComponent({
    post: {
      ...post,
      collectionSources: [
        {
          id: 'src1',
          handle: 'src1',
          name: 'Source One',
          image: 'https://daily.dev/src1.png',
          permalink: 'https://daily.dev/sources/src1',
        },
        {
          id: 'src2',
          handle: 'src2',
          name: 'Source Two',
          image: 'https://daily.dev/src2.png',
          permalink: 'https://daily.dev/sources/src2',
        },
      ],
      numCollectionSources: 2,
    } as Post,
  });
  await screen.findByAltText('Avatar of src1');
  await screen.findByAltText('Avatar of src2');
});

it('should show options button on hover when in laptop size', async () => {
  renderComponent();
  const header = await screen.findByLabelText('Options');
  expect(header).toHaveClass('laptop:mouse:invisible');
  expect(header).toHaveClass('laptop:mouse:group-hover:visible');
});
