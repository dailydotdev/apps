import nock from 'nock';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import type { LoggedUser } from '../../lib/user';
import type { Post } from '../../graphql/posts';
import type { FurtherReadingData } from '../../graphql/furtherReading';
import { FURTHER_READING_QUERY } from '../../graphql/furtherReading';
import defaultFeedPage from '../../../__tests__/fixture/feed';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import FurtherReading from './FurtherReading';
import type { MockedGraphQLResponse } from '../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import post from '../../../__tests__/fixture/post';

const showLogin = jest.fn();

jest.mock('../../hooks', () => {
  const originalModule = jest.requireActual('../../hooks');
  return {
    __esModule: true,
    ...originalModule,
  };
});

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
});

const createFeedMock = (
  trendingPosts: Post[] = [{ ...defaultFeedPage.edges[0].node, trending: 50 }],
  similarPosts: Post[] = [
    defaultFeedPage.edges[2].node,
    defaultFeedPage.edges[3].node,
    defaultFeedPage.edges[4].node,
  ],
  discussedPosts: Post[] = [
    defaultFeedPage.edges[1].node,
    defaultFeedPage.edges[5].node,
    defaultFeedPage.edges[6].node,
  ],
  variables: unknown = {
    post: post.id,
    loggedIn: true,
    trendingFirst: 1,
    similarFirst: 3,
    discussedFirst: 4,
    tags: post.tags,
    withDiscussedPosts: true,
  },
): MockedGraphQLResponse<FurtherReadingData> => ({
  request: {
    query: FURTHER_READING_QUERY,
    variables,
  },
  result: {
    data: {
      trendingPosts,
      similarPosts,
      discussedPosts,
    },
  },
});

let queryClient: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
  postUpdate?: Post,
): RenderResult => {
  queryClient = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <FurtherReading currentPost={{ ...post, ...postUpdate }} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('further reading', () => {
  it('should show placeholders when loading', async () => {
    renderComponent();
    const elements = await screen.findAllByRole('article');
    elements.map((el) => expect(el).toHaveAttribute('aria-busy'));
  });

  it('should show available articles', async () => {
    renderComponent();
    await waitForNock();
    const [el] = await screen.findAllByRole('article');
    await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
    expect(await screen.findAllByRole('article')).toHaveLength(5);
  });

  it('should show articles even when there are no trending articles', async () => {
    renderComponent();
    await waitForNock();
    const [el] = await screen.findAllByRole('article');
    await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
    expect(await screen.findAllByRole('article')).toHaveLength(5);
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
    const [element1, element2] = await screen.findAllByTestId(
      'post-engagements-count',
    );
    expect(element1).toHaveTextContent('15 Comments');
    expect(element1).toHaveTextContent('1 Upvotes');
    expect(element2).toHaveTextContent('1 Upvotes');
  });

  it('should not show table of contents when it does not exist', async () => {
    renderComponent();
    expect(screen.queryByText('Table of contents')).not.toBeInTheDocument();
  });

  it('should show table of contents when it exists', async () => {
    renderComponent([createFeedMock()], defaultUser, {
      ...post,
      toc: [{ text: 'Toc Item' }],
    });
    expect(screen.queryByText('Table of contents')).toBeInTheDocument();
  });
});
