import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { Post } from '../../graphql/posts';
import defaultFeedPage from '../../../__tests__/fixture/feed';
import BestDiscussions from './BestDiscussions';

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultPosts: Post[] = [
  defaultFeedPage.edges[0].node,
  defaultFeedPage.edges[2].node,
  defaultFeedPage.edges[3].node,
  defaultFeedPage.edges[6].node,
];

const renderComponent = (
  posts = defaultPosts,
  isLoading = false,
): RenderResult => {
  return render(<BestDiscussions posts={posts} isLoading={isLoading} />);
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

it('should show number comments', async () => {
  renderComponent();
  expect(await screen.findByText('15 Comments')).toBeInTheDocument();
  expect(await screen.findByText('5 Comments')).toBeInTheDocument();
  expect(await screen.findByText('1 Comments')).toBeInTheDocument();
});

it('should set feeling lucky link to the first post', async () => {
  renderComponent();
  const el = await screen.findByText(`I'm feeling lucky`);
  // eslint-disable-next-line testing-library/no-node-access
  expect(el).toHaveAttribute('href', defaultPosts[0].commentsPermalink);
});
