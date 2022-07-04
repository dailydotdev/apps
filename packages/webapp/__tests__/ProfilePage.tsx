import React from 'react';
import {
  Comment,
  USER_COMMENTS_QUERY,
  UserCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { render, RenderResult, screen } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import { Connection } from '@dailydotdev/shared/src/graphql/common';
import {
  AUTHOR_FEED_QUERY,
  FeedData,
  Post,
} from '@dailydotdev/shared/src/graphql/posts';
import {
  USER_READING_HISTORY_QUERY,
  USER_STATS_QUERY,
  UserReadingRankHistory,
  UserStats,
  UserStatsData,
  MostReadTag,
  ProfileReadingData,
} from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RANKS } from '@dailydotdev/shared/src/lib/rank';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import ProfilePage from '../pages/[userId]/index';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultCommentsPage: Connection<Comment> = {
  pageInfo: {
    hasNextPage: true,
    endCursor: '',
  },
  edges: [
    {
      node: {
        permalink: 'https://daily.dev/c1',
        createdAt: '2020-07-26T13:04:35.000Z',
        content: 'My comment',
        numUpvotes: 50,
        id: 'c1',
      },
    },
  ],
};

const createCommentsMock = (
  page = defaultCommentsPage,
): MockedGraphQLResponse<UserCommentsData> => ({
  request: {
    query: USER_COMMENTS_QUERY,
    variables: {
      userId: 'u2',
      first: 3,
    },
  },
  result: {
    data: {
      page,
    },
  },
});

const defaultFeedPage: Connection<Post> = {
  pageInfo: {
    hasNextPage: true,
    endCursor: '',
  },
  edges: [
    {
      node: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        title: 'Learn SQL',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        source: {
          name: 'Towards Data Science',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
        numUpvotes: 60,
        numComments: 17,
        views: 1234,
        isAuthor: 1,
        isScout: 0,
      },
    },
    {
      node: {
        commentsPermalink: 'http://localhost:5002/posts/rzJopfZvN',
        id: 'rzJopfZvN',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/78a6671153b16eae87634459cefe5927',
        numComments: 0,
        numUpvotes: 0,
        source: {
          id: 'newstack',
          name: 'The New Stack',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        title:
          'Krustlet Brings WebAssembly to Kubernetes with a Rust-Based Kubelet – The New Stack',
        views: null,
        isAuthor: 0,
        isScout: 1,
      },
    },
  ],
};

const createFeedMock = (
  page = defaultFeedPage,
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId: 'u2',
      first: 3,
    },
  },
  result: {
    data: {
      page,
    },
  },
});

const defaultStats: UserStats = {
  numPosts: 123,
  numComments: 52,
  numPostUpvotes: null,
  numPostViews: null,
  numCommentUpvotes: null,
};

const createUserStatsMock = (
  stats = defaultStats,
): MockedGraphQLResponse<UserStatsData> => ({
  request: {
    query: USER_STATS_QUERY,
    variables: {
      id: 'u2',
    },
  },
  result: {
    data: {
      userStats: stats,
    },
  },
});

const defaultTopTags: MostReadTag[] = [
  {
    value: 'javascript',
    count: 4,
    percentage: 0.4,
  },
  {
    value: 'golang',
    count: 3,
    percentage: 0.3,
  },
  {
    value: 'c#',
    count: 3,
    percentage: 0.3,
  },
];

const before = startOfTomorrow();
const after = subMonths(subDays(before, 2), 6);

const createReadingHistoryMock = (
  rankHistory: UserReadingRankHistory[] = [
    { rank: 2, count: 5 },
    { rank: 5, count: 3 },
  ],
): MockedGraphQLResponse<ProfileReadingData> => ({
  request: {
    query: USER_READING_HISTORY_QUERY,
    variables: {
      id: 'u2',
      before: before.toISOString(),
      after: after.toISOString(),
      version: 2,
      limit: 6,
    },
  },
  result: {
    data: {
      userReadingRankHistory: rankHistory,
      userReadHistory: [{ date: '2021-02-01', reads: 2 }],
      userMostReadTags: defaultTopTags,
    },
  },
});

const defaultProfile: PublicProfile = {
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/daily.png',
  bio: 'The best company!',
  createdAt: '2020-08-26T13:04:35.000Z',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  portfolio: 'https://daily.dev',
};

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [
    createCommentsMock(),
    createFeedMock(),
    createUserStatsMock(),
    createReadingHistoryMock(),
  ],
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: null,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <ProfilePage profile={{ ...defaultProfile, ...profile }} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show overall post views', async () => {
  renderComponent([
    createCommentsMock(),
    createFeedMock(),
    createUserStatsMock({
      numPosts: 123,
      numComments: 52,
      numPostUpvotes: 2,
      numPostViews: 1789,
      numCommentUpvotes: 999,
    }),
  ]);
  await waitForNock();
  const el = await screen.findByText('1,789');
  expect(el).toBeInTheDocument();
});

it('should show overall upvotes', async () => {
  renderComponent([
    createCommentsMock(),
    createFeedMock(),
    createUserStatsMock({
      numPosts: 123,
      numComments: 52,
      numPostUpvotes: 2,
      numPostViews: 1789,
      numCommentUpvotes: 999,
    }),
  ]);
  await waitForNock();
  const el = await screen.findByText('1,001');
  expect(el).toBeInTheDocument();
});

it('should show the number of upvotes per comment', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('50');
  expect(el).toBeInTheDocument();
});

it('should format creation time of comment', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('Jul 26, 2020');
  expect(el).toBeInTheDocument();
});

it('should add link to the comment', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByLabelText('My comment');
  expect(el).toHaveAttribute('href', 'https://daily.dev/c1');
});

it('should show empty screen when no comments', async () => {
  renderComponent([
    createCommentsMock({
      pageInfo: {
        hasNextPage: true,
        endCursor: '',
      },
      edges: [],
    }),
    createFeedMock(),
    createUserStatsMock(),
  ]);
  await waitForNock();
  const el = await screen.findByTestId('emptyComments');
  expect(el).toBeInTheDocument();
});

it('should show the number of upvotes per post', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('50');
  expect(el).toBeInTheDocument();
});

it('should show the number of comments per post', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('17');
  expect(el).toBeInTheDocument();
});

it('should show the number of views per post', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('1.2K');
  expect(el).toBeInTheDocument();
});

it('should add link to the post', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByLabelText('Learn SQL');
  expect(el).toHaveAttribute(
    'href',
    'https://localhost:5002/posts/9CuRpr5NiEY5',
  );
});

it('should show author badge', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByTestId('post-author-badge');
  expect(el).toBeInTheDocument();
});

it('should show scout badge', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByTestId('post-scout-badge');
  expect(el).toBeInTheDocument();
});

it('should show empty screen when no posts', async () => {
  renderComponent([
    createCommentsMock(),
    createFeedMock({
      pageInfo: {
        hasNextPage: true,
        endCursor: '',
      },
      edges: [],
    }),
    createUserStatsMock(),
  ]);
  await waitForNock();
  const el = await screen.findByTestId('emptyPosts');
  expect(el).toBeInTheDocument();
});

it('should show the total number of posts', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('(123)');
  expect(el).toBeInTheDocument();
});

it('should show the total number of comments', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByText('(52)');
  expect(el).toBeInTheDocument();
});

it('should not show overall stats when not available', async () => {
  renderComponent();
  await waitForNock();
  const el = screen.queryByText('Article views');
  expect(el).not.toBeInTheDocument();
});

it('should show the reading rank history of the user', async () => {
  renderComponent();
  await waitForNock();
  const counts = [0, 5, 0, 0, 3];
  await Promise.all(
    counts.map(async (count, index) => {
      const el = await screen.findByLabelText(`${RANKS[index].name}: ${count}`);
      expect(el).toBeInTheDocument();
    }),
  );
});

it('should show the top reading tags of the user', async () => {
  renderComponent();
  await waitForNock();
  await Promise.all(
    defaultTopTags.map(async ({ value: tag }) => {
      const el = await screen.findByText(`#${tag}`);
      expect(el).toBeInTheDocument();
    }),
  );
});
