import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { COMMENT_UPVOTES_BY_ID_QUERY } from '../../graphql/comments';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import {
  DEFAULT_UPVOTES_PER_PAGE,
  RequestQuery,
  UpvotesData,
} from '../../graphql/common';
import { POST_UPVOTES_BY_ID_QUERY } from '../../graphql/posts';
import { UpvotedPopupModal, UpvotedPopupModalProps } from './UpvotedPopupModal';
import user from '../../../__tests__/fixture/loggedUser';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});
const postId = 'p1';
const upvotedPostQueryAsDefault: UpvotedPopupModalProps = {
  isOpen: true,
  placeholderAmount: 1,
  requestQuery: {
    queryKey: ['postUpvotes', postId],
    query: POST_UPVOTES_BY_ID_QUERY,
    params: { id: postId, first: DEFAULT_UPVOTES_PER_PAGE },
  },
};
const commentId = 'c1';
const upvotedCommentQuery: UpvotedPopupModalProps = {
  isOpen: true,
  placeholderAmount: 8,
  requestQuery: {
    queryKey: ['commentUpvotes', commentId],
    query: COMMENT_UPVOTES_BY_ID_QUERY,
    params: { id: commentId, first: DEFAULT_UPVOTES_PER_PAGE },
  },
};

const fetchUpvotesMock = ({
  query,
  params,
}: Partial<RequestQuery<UpvotesData>>): MockedGraphQLResponse<UpvotesData> => ({
  request: {
    query,
    variables: params,
  },
  result: {
    data: {
      upvotes: {
        pageInfo: {},
        edges: [
          {
            node: {
              createdAt: new Date(),
              user,
            },
          },
        ],
      },
    },
  },
});

const renderComponent = (
  props: Partial<UpvotedPopupModalProps> = {},
  mocks: MockedGraphQLResponse[] = [
    fetchUpvotesMock({ ...upvotedPostQueryAsDefault.requestQuery }),
  ],
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <UpvotedPopupModal {...upvotedPostQueryAsDefault} {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show upvoter list for post', async () => {
  renderComponent();
  const items = await screen.findAllByRole('link');
  expect(items.length).toEqual(1);
});

it('should show upvoter list for comment', async () => {
  renderComponent(upvotedCommentQuery, [
    fetchUpvotesMock({ ...upvotedCommentQuery.requestQuery }),
  ]);
  const items = await screen.findAllByRole('link');
  expect(items.length).toEqual(1);
});

it("should show user's handle", async () => {
  renderComponent();
  await screen.findByText(`@${user.username}`);
});

it('should show name', async () => {
  renderComponent();
  await screen.findByText(user.name);
});

it('should show bio', async () => {
  renderComponent();
  await screen.findByText(user.bio);
});

it('should show permalink', async () => {
  renderComponent();
  expect(await screen.findByRole('link')).toHaveAttribute(
    'href',
    user.permalink,
  );
});

it('should show avatar', async () => {
  renderComponent();
  await screen.findByAltText(`${user.username}'s profile`);
});
