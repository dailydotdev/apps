import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { Post } from '../../graphql/posts';
import defaultFeedPage from '../../../__tests__/fixture/feed';
import SimilarPosts from './SimilarPosts';
import AuthContext from '../../contexts/AuthContext';
import user from '../../../__tests__/fixture/loggedUser';

const onBookmark = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultPosts: Post[] = [
  { ...defaultFeedPage.edges[0].node, trending: 50 },
  defaultFeedPage.edges[2].node,
  defaultFeedPage.edges[3].node,
];

const renderComponent = (
  posts = defaultPosts,
  isLoading = false,
): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user,
        closeLogin: jest.fn(),
        showLogin: jest.fn(),
        isLoggedIn: true,
        shouldShowLogin: false,
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
      }}
    >
      <SimilarPosts
        posts={posts}
        isLoading={isLoading}
        onBookmark={onBookmark}
      />
    </AuthContext.Provider>,
  );
};

it('should show placeholders when loading', async () => {
  renderComponent([], true);
  const elements = await screen.findAllByRole('article');
  elements.map((el) => expect(el).toHaveAttribute('aria-busy'));
});

it('should show up to 3 articles', async () => {
  renderComponent();
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(3);
});

it('should show trending info for trending posts', async () => {
  renderComponent();
  expect(await screen.findByText('Hot')).toBeInTheDocument();
  expect(
    await screen.findByText('50 devs read it last hour'),
  ).toBeInTheDocument();
});

it('should show number of upvotes and comments', async () => {
  renderComponent();
  renderComponent();
  const [element1, element2] = await screen.findAllByTestId(
    'post-engagements-count',
  );
  expect(element1).toHaveTextContent('15 Comments');
  expect(element1).toHaveTextContent('1 Upvotes');
  expect(element2).toHaveTextContent('5 Comments');
  expect(element2).toHaveTextContent('1 Upvotes');
});
