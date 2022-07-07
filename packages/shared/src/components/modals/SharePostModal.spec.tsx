import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import SharePostModal from './SharePostModal';
import Post from '../../../__tests__/fixture/post';
import { getWhatsappShareLink } from '../../lib/share';

const defaultPost = Post;
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

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <SharePostModal
        post={defaultPost}
        isOpen
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </QueryClientProvider>,
  );
};

it('should render the article card', async () => {
  renderComponent();
  expect(screen.getByAltText(defaultPost.title)).toBeInTheDocument();
  expect(
    screen.getByAltText(`source of ${defaultPost.title}'s profile`),
  ).toBeInTheDocument();
  expect(screen.getByText(defaultPost.title)).toBeInTheDocument();
});

it('should render the copy link section', async () => {
  renderComponent();
  expect(
    screen.getByDisplayValue(defaultPost.commentsPermalink),
  ).toBeInTheDocument();

  const btn = await screen.findByTestId('textfield-action-icon');
  btn.click();
  await waitFor(() =>
    expect(window.navigator.clipboard.writeText).toBeCalledWith(
      defaultPost.commentsPermalink,
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
