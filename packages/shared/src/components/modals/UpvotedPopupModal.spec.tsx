import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
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
import OnboardingContext from '../../contexts/OnboardingContext';

const defaultUser = {
  id: 'u1',
  bio: 'Software Engineer in the most amazing company in the globe',
  name: 'Lee Hansel',
  email: 'lee@abc.com',
  image: 'https://daily.dev/lee.png',
  username: 'sshanzel',
  permalink: 'https://daily.dev/lee',
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});
const postId = 'p1';
const upvotedPostQueryAsDefault: UpvotedPopupModalProps = {
  isOpen: true,
  listPlaceholderProps: { placeholderAmount: 1 },
  requestQuery: {
    queryKey: ['postUpvotes', postId],
    query: POST_UPVOTES_BY_ID_QUERY,
    params: { id: postId, first: DEFAULT_UPVOTES_PER_PAGE },
  },
};
const commentId = 'c1';
const upvotedCommentQuery: UpvotedPopupModalProps = {
  isOpen: true,
  listPlaceholderProps: { placeholderAmount: 8 },
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
              user: defaultUser,
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
          user: { ...defaultUser },
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <OnboardingContext.Provider
          value={{
            onboardingStep: 3,
            onboardingReady: true,
            incrementOnboardingStep: jest.fn(),
            trackEngagement: jest.fn(),
            closeReferral: jest.fn(),
            showReferral: false,
          }}
        >
          <UpvotedPopupModal {...upvotedPostQueryAsDefault} {...props} />
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show upvoter list for post', async () => {
  const [key, id] = upvotedPostQueryAsDefault.requestQuery
    .queryKey as unknown[];
  renderComponent();
  screen.getByTestId(`List of ${key} with ID ${id}`);
});

it('should show upvoter list for comment', async () => {
  const [key, id] = upvotedCommentQuery.requestQuery.queryKey as unknown[];
  renderComponent(upvotedCommentQuery);
  screen.getByTestId(`List of ${key} with ID ${id}`);
});

it("should show user's handle", async () => {
  renderComponent();
  await screen.findByText(`@${defaultUser.username}`);
});

it('should show name', async () => {
  renderComponent();
  await screen.findByText(defaultUser.name);
});

it('should show bio', async () => {
  renderComponent();
  await screen.findByText(defaultUser.bio);
});

it('should show permalink', async () => {
  renderComponent();
  expect(await screen.findByRole('link')).toHaveAttribute(
    'href',
    defaultUser.permalink,
  );
});

it('should show avatar', async () => {
  renderComponent();
  await screen.findByAltText(`${defaultUser.username}'s profile`);
});
