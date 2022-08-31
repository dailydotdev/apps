import React from 'react';
import {
  findAllByText,
  findByText,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';

import {
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  PostsEngaged,
  REMOVE_BOOKMARK_MUTATION,
  UPVOTE_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { OperationOptions } from 'subscriptions-transport-ws';
import { SubscriptionCallbacks } from '@dailydotdev/shared/src/hooks/useSubscription';
import { FeaturesContextProvider } from '@dailydotdev/shared/src/contexts/FeaturesContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import PostPage, { getSeoDescription, Props } from '../pages/posts/[id]';

const showLogin = jest.fn();
let nextCallback: (value: PostsEngaged) => unknown = null;

jest.mock('@dailydotdev/shared/src/hooks/useSubscription', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (
        request: () => OperationOptions,
        { next }: SubscriptionCallbacks<PostsEngaged>,
      ): void => {
        nextCallback = next;
      },
    ),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: {},
      } as unknown as NextRouter),
  );
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
        bookmarked: false,
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

let client: QueryClient;

const renderPost = (
  props: Partial<Props> = {},
  mocks: MockedGraphQLResponse[] = [createPostMock(), createCommentsMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const defaultProps: Props = {
    id: '0e4005b2d3cf191f8c44c2718a457a1e',
  };

  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={{}}>
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
          <PostPage {...defaultProps} {...props} />
        </AuthContext.Provider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

it('should show source image', async () => {
  renderPost();
  const el = await screen.findByAltText('Towards Data Science');
  expect(el).toHaveAttribute(
    'data-src',
    'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  );
});

it('should show source name', async () => {
  renderPost();
  await screen.findByText('Towards Data Science');
});

it('should format publication date', async () => {
  renderPost();
  await screen.findByText('May 16, 2019');
});

it('should format read time when available', async () => {
  renderPost();
  const el = await screen.findByTestId('readTime');
  expect(el).toHaveTextContent('8m read time');
});

it('should hide read time when not available', async () => {
  renderPost({}, [createPostMock({ readTime: null }), createCommentsMock()]);
  await screen.findByText('May 16, 2019');
  expect(screen.queryByTestId('readTime')).not.toBeInTheDocument();
});

it('should set href to the post permalink', async () => {
  renderPost();
  // Wait for GraphQL to return
  await screen.findByText('Learn SQL');
  const el = screen.getAllByTitle('Go to article')[0];
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});

it('should show post title as heading', async () => {
  renderPost();
  await screen.findByText('Learn SQL');
});

it('should show post tags', async () => {
  renderPost();
  await screen.findByText('#development');
  await screen.findByText('#data-science');
  await screen.findByText('#sql');
});

it('should show post image', async () => {
  renderPost();
  // Wait for GraphQL to return
  await screen.findByText('Learn SQL');
  const el = await screen.findByAltText('Post cover image');
  expect(el).toHaveAttribute(
    'src',
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
  );
});

it('should show login on upvote click', async () => {
  renderPost({}, [createPostMock(), createCommentsMock()], null);
  const el = await screen.findByText('Upvote');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should check meta tag with only summary', async () => {
  const seo = getSeoDescription(
    createPostMock({
      summary: 'Test summary',
    }).result.data.post,
  );
  expect(seo).toEqual('Test summary');
});

it('should check meta tag with only description', async () => {
  const seo = getSeoDescription(
    createPostMock({
      description: 'Test description',
    }).result.data.post,
  );
  expect(seo).toEqual('Test description');
});

it('should check meta tag with no description and no summary', async () => {
  const seo = getSeoDescription(createPostMock({}).result.data.post);
  expect(seo).toEqual(
    'Join us to the discussion about "Learn SQL" on daily.dev ✌️',
  );
});

it('should check meta tag with both summary and description', async () => {
  const seo = getSeoDescription(
    createPostMock({
      description: 'Test description',
      summary: 'Test summary',
    }).result.data.post,
  );
  expect(seo).toEqual('Test summary');
});

it('should check meta tag with empty summary and description', async () => {
  const seo = getSeoDescription(
    createPostMock({
      description: 'Test description',
      summary: '',
    }).result.data.post,
  );
  expect(seo).toEqual('Test description');
});

it('should check meta tag with empty summary and empty description', async () => {
  const seo = getSeoDescription(
    createPostMock({
      description: '',
      summary: '',
    }).result.data.post,
  );
  expect(seo).toEqual(
    'Join us to the discussion about "Learn SQL" on daily.dev ✌️',
  );
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
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
  const el = await screen.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
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
  const el = await screen.findByText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

// it('should share article when share api is available', async () => {
//   const mock = jest.fn();
//   global.navigator.share = mock;
//   mock.mockResolvedValue(null);
//   renderPost();
//   // Wait for GraphQL to return
//   await screen.findByText('Learn SQL');
//   const el = await screen.findByText('Share');
//   el.click();
//   await waitFor(() =>
//     expect(mock).toBeCalledWith({
//       text: 'Learn SQL',
//       url: 'https://localhost:5002/posts/9CuRpr5NiEY5',
//     }),
//   );
// });

it('should open new comment modal and set the correct props', async () => {
  renderPost();
  // Wait for GraphQL to return
  await screen.findByText('Learn SQL');
  const el = await screen.findByText('Comment');
  el.click();
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toBeInTheDocument();
  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect((await findAllByText(dialog, 'Towards Data Science')).length).toEqual(
    2,
  );
  // eslint-disable-next-line testing-library/prefer-screen-queries
  await findByText(dialog, 'Learn SQL');
  // eslint-disable-next-line testing-library/prefer-screen-queries
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

it('should show views when it is greater than zero', async () => {
  renderPost({}, [createPostMock({ views: 15 }), createCommentsMock()]);
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('15 Views');
});

it('should not show author link when author is null', async () => {
  renderPost();
  const el = screen.queryByTestId('authorLink');
  expect(el).not.toBeInTheDocument();
});

it('should show author link when author is defined', async () => {
  renderPost({}, [
    createPostMock({
      author: {
        id: 'u1',
        name: 'Ido Shamun',
        image: 'https://daily.dev/ido.jpg',
        permalink: 'https://daily.dev/idoshamun',
        username: 'idoshamun',
      },
    }),
    createCommentsMock(),
  ]);
  const el = await screen.findByTestId('authorLink');
  expect(el).toBeInTheDocument();
});

it('should not show author onboarding by default', () => {
  renderPost();
  const el = screen.queryByTestId('authorOnboarding');
  expect(el).not.toBeInTheDocument();
});

it('should show author onboarding when the query param is set', async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: { author: 'true' },
      } as unknown as NextRouter),
  );
  renderPost();
  const el = await screen.findByTestId('authorOnboarding');
  expect(el).toBeInTheDocument();
});

it('should update post on subscription message', async () => {
  renderPost();
  await waitFor(async () => {
    const data = await client.getQueryData([
      'post',
      '0e4005b2d3cf191f8c44c2718a457a1e',
    ]);
    expect(data).toBeTruthy();
  });
  nextCallback({
    postsEngaged: {
      id: '0e4005b2d3cf191f8c44c2718a457a1e',
      numUpvotes: 15,
      numComments: 0,
    },
  });
  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('15 Upvotes');
});

it('should not update post on subscription message when id is not the same', async () => {
  renderPost();
  await waitFor(async () => {
    const data = await client.getQueryData([
      'post',
      '0e4005b2d3cf191f8c44c2718a457a1e',
    ]);
    expect(data).toBeTruthy();
  });
  nextCallback({
    postsEngaged: {
      id: 'asd',
      numUpvotes: 15,
      numComments: 0,
    },
  });
  const el = await screen.findByTestId('statsBar');
  expect(el).not.toHaveTextContent('15 Upvotes');
});

it('should send bookmark mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
    createPostMock(),
    createCommentsMock(),
    {
      request: {
        query: ADD_BOOKMARKS_MUTATION,
        variables: { data: { postIds: ['0e4005b2d3cf191f8c44c2718a457a1e'] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await screen.findByText('Bookmark');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
    createPostMock({ bookmarked: true }),
    createCommentsMock(),
    {
      request: {
        query: REMOVE_BOOKMARK_MUTATION,
        variables: { id: '0e4005b2d3cf191f8c44c2718a457a1e' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await screen.findByText('Bookmark');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should not show TLDR when there is no summary', async () => {
  renderPost();
  const el = screen.queryByText('TLDR');
  expect(el).not.toBeInTheDocument();
});

it('should show TLDR when there is a summary', async () => {
  renderPost({}, [createPostMock({ summary: 'test summary' })]);
  const el = await screen.findByText('TLDR');
  expect(el).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
  const link = queryByText(el.parentElement, 'Show more');
  expect(link).not.toBeInTheDocument();
});

it('should toggle TLDR on click', async () => {
  renderPost({}, [
    createPostMock({
      summary:
        "Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book type specimen book type specimen book type specimen book type.Ipsum is simply dummy text of the printing and typesetting industry.",
    }),
  ]);
  const el = await screen.findByText('TLDR');
  expect(el).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
  const showMoreLink = queryByText(el.parentElement, 'Show more');
  expect(showMoreLink).toBeInTheDocument();
  showMoreLink.click();
  const showLessLink = await screen.findByText('Show less');
  expect(showLessLink).toBeInTheDocument();
});

it('should not show Show more link when there is a summary without reaching threshold', async () => {
  renderPost({}, [
    createPostMock({
      summary:
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores',
    }),
  ]);
  const el = await screen.findByText('TLDR');
  expect(el).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
  const link = queryByText(el.parentElement, 'Show more');
  expect(link).not.toBeInTheDocument();
});

it('should not cut summary when there is a summary without reaching threshold', async () => {
  const summaryText =
    'In Node.js, errors and exceptions are different in JavaScript. There are two types of errors, programmer and operational. We use the phrase “error” to describe both, but they are quite different in reality because of their root causes. Let’s take a look at what we’ll cover to better understand how we can handle errors.';
  renderPost({}, [
    createPostMock({
      summary: summaryText,
    }),
  ]);
  const el = await screen.findByText('TLDR');
  expect(el).toBeInTheDocument();
  const fullSummary = await screen.findByText(summaryText);
  expect(fullSummary).toBeInTheDocument();
});
