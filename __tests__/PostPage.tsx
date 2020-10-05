import React from 'react';
import {
  findAllByText,
  findByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';

import PostPage, { Props } from '../pages/posts/[id]';
import {
  CANCEL_UPVOTE_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import AuthContext from '../components/AuthContext';
import { POST_COMMENTS_QUERY, PostCommentsData } from '../graphql/comments';
import { LoggedUser } from '../lib/user';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import nock from 'nock';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';

const showLogin = jest.fn();

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
      query: {},
    };
  },
}));

beforeEach(() => {
  nock.cleanAll();
  showLogin.mockReset();
});

const createPostMock = (
  data: Partial<Post> = {},
): MockedGraphQLResponse<PostData> => ({
  request: {
    query: POST_BY_ID_QUERY,
    variables: {
      id: '0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
  result: {
    data: {
      post: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        __typename: 'PostPage',
        title: 'Learn SQL',
        permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        createdAt: '2019-05-16T15:16:05.000Z',
        readTime: 8,
        tags: ['development', 'data-science', 'sql'],
        source: {
          __typename: 'Source',
          name: 'Towards Data Science',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        upvoted: false,
        commented: false,
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
        numUpvotes: 0,
        numComments: 0,
        ...data,
      },
    },
  },
});

const createCommentsMock = (): MockedGraphQLResponse<PostCommentsData> => ({
  request: {
    query: POST_COMMENTS_QUERY,
    variables: {
      postId: '0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
  result: {
    data: {
      postComments: {
        pageInfo: {},
        edges: [],
      },
    },
  },
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
};

const renderPost = (
  props: Partial<Props> = {},
  mocks: MockedGraphQLResponse[] = [createPostMock(), createCommentsMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const defaultProps: Props = {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
  };

  const queryCache = new QueryCache();

  mocks.forEach(mockGraphQL);
  return render(
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
        }}
      >
        <PostPage {...defaultProps} {...props} />
      </AuthContext.Provider>
    </ReactQueryCacheProvider>,
  );
};

it('should show source image', async () => {
  const res = renderPost();
  const el = await res.findByAltText('Towards Data Science');
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  );
});

it('should show source name', async () => {
  const res = renderPost();
  await res.findByText('Towards Data Science');
});

it('should format publication date', async () => {
  const res = renderPost();
  await res.findByText('May 16, 2019');
});

it('should format read time when available', async () => {
  const res = renderPost();
  const el = await res.findByTestId('readTime');
  expect(el).toHaveTextContent('8m read time');
});

it('should hide read time when not available', async () => {
  const res = renderPost({}, [
    createPostMock({ readTime: null }),
    createCommentsMock(),
  ]);
  await res.findByText('May 16, 2019');
  expect(res.queryByTestId('readTime')).toBeNull();
});

it('should set href to the post permalink', async () => {
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = res.getAllByTitle('Go to article')[0];
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});

it('should show post title as heading', async () => {
  const res = renderPost();
  await res.findByText('Learn SQL');
});

it('should show post tags', async () => {
  const res = renderPost();
  await res.findByText('#development #data-science #sql');
});

it('should show post image', async () => {
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = await res.findByAltText('Post cover image');
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
  );
});

it('should show login on upvote click', async () => {
  const res = renderPost({}, [createPostMock(), createCommentsMock()], null);
  const el = await res.findByText('Upvote');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  const res = renderPost({}, [
    createPostMock(),
    createCommentsMock(),
    {
      request: {
        query: UPVOTE_MUTATION,
        variables: { id: '0e4005b2d3cf191f8c44c2718a457a1e' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await res.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  const res = renderPost({}, [
    createPostMock({ upvoted: true }),
    createCommentsMock(),
    {
      request: {
        query: CANCEL_UPVOTE_MUTATION,
        variables: { id: '0e4005b2d3cf191f8c44c2718a457a1e' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await res.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should share article when share api is available', async () => {
  const mock = jest.fn();
  global.navigator.share = mock;
  mock.mockResolvedValue(null);
  const res = renderPost();
  // Wait for GraphQL to return
  await res.findByText('Learn SQL');
  const el = await res.findByText('Share');
  el.click();
  await waitFor(() =>
    expect(mock).toBeCalledWith({
      text: 'Learn SQL',
      url: 'https://localhost:5002/posts/9CuRpr5NiEY5',
    }),
  );
});

it('should open new comment modal and set the correct props', async () => {
  renderPost();
  // Wait for GraphQL to return
  await screen.findByText('Learn SQL');
  const el = await screen.findByText('Comment');
  el.click();
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect((await findAllByText(dialog, 'Towards Data Science')).length).toEqual(
    2,
  );
  await findByText(dialog, 'Learn SQL');
  await findByText(dialog, 'May 16, 2019');
});

it('should not show stats when they are zero', async () => {
  renderPost();
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('');
});

it('should show num upvotes when it is greater than zero', async () => {
  renderPost({}, [createPostMock({ numUpvotes: 15 }), createCommentsMock()]);
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('15 Upvotes');
});

it('should show num comments when it is greater than zero', async () => {
  renderPost({}, [createPostMock({ numComments: 15 }), createCommentsMock()]);
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('15 Comments');
});

it('should show both stats when they are greater than zero', async () => {
  renderPost({}, [
    createPostMock({ numUpvotes: 7, numComments: 15 }),
    createCommentsMock(),
  ]);
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('7 Upvotes15 Comments');
});
