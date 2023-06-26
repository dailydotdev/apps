import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import ShareModal from './ShareModal';
import Post from '../../../__tests__/fixture/post';
import { getWhatsappShareLink } from '../../lib/share';
import { Origin } from '../../lib/analytics';
import Comment from '../../../__tests__/fixture/comment';
import { getCommentHash } from '../../graphql/comments';
import { AuthContextProvider } from '../../contexts/AuthContext';

const defaultPost = Post;
const defaultComment = Comment;
const onRequestClose = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const renderComponent = (comment?): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider user={null} squads={[]}>
        <ShareModal
          origin={Origin.Feed}
          post={defaultPost}
          comment={comment}
          isOpen
          onRequestClose={onRequestClose}
          ariaHideApp={false}
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should render the article card', async () => {
  renderComponent();
  expect(screen.getByAltText(`${defaultPost.title}`)).toBeInTheDocument();
  expect(
    screen.getByAltText(`Avatar of ${defaultPost.source.handle}`),
  ).toBeInTheDocument();
  expect(screen.getByText(defaultPost.title)).toBeInTheDocument();
});

it('should render the copy link section', async () => {
  renderComponent();
  const btn = await screen.findByTestId('social-share-Copy link');

  btn.click();
  await waitFor(() =>
    expect(window.navigator.clipboard.writeText).toBeCalledWith(
      defaultPost.commentsPermalink,
    ),
  );
});

it('should render the copy link section for comments', async () => {
  renderComponent(defaultComment);
  const btn = await screen.findByTestId('social-share-Copy link');

  btn.click();
  await waitFor(() =>
    expect(window.navigator.clipboard.writeText).toBeCalledWith(
      `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
    ),
  );
});

it('should share with a specific share link', async () => {
  renderComponent();

  expect(screen.getByTestId('social-share-WhatsApp')).toHaveAttribute(
    'href',
    getWhatsappShareLink(defaultPost.commentsPermalink),
  );
});

it('should share with a specific share link for a comment', async () => {
  renderComponent(defaultComment);

  expect(screen.getByTestId('social-share-WhatsApp')).toHaveAttribute(
    'href',
    getWhatsappShareLink(
      `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
    ),
  );
});
