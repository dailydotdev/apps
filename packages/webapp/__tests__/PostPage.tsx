import React from 'react';
import {
  act,
  fireEvent,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  ADD_BOOKMARKS_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  REMOVE_BOOKMARK_MUTATION,
  PostType,
  UserVote,
  VIEW_POST_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import {
  Action,
  ActionType,
  COMPLETE_ACTION_MUTATION,
  COMPLETED_USER_ACTIONS,
} from '@dailydotdev/shared/src/graphql/actions';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  completeActionMock,
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { createTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  AllTagCategoriesData,
  FEED_SETTINGS_QUERY,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import { UserVoteEntity } from '@dailydotdev/shared/src/hooks';
import { VOTE_MUTATION } from '@dailydotdev/shared/src/graphql/users';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import PostPage, { Props } from '../pages/posts/[id]';
import { getSeoDescription } from '../components/PostSEOSchema';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';

const showLogin = jest.fn();
// let nextCallback: (value: PostsEngaged) => unknown = null;
//
// jest.mock('@dailydotdev/shared/src/hooks/useSubscription', () => ({
//   __esModule: true,
//   default: jest
//     .fn()
//     .mockImplementation(
//       (
//         request: () => OperationOptions,
//         { next }: SubscriptionCallbacks<PostsEngaged>,
//       ): void => {
//         nextCallback = next;
//       },
//     ),
// }));

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
        isReady: true,
        query: {},
      } as unknown as NextRouter),
  );
});

const defaultPost = {
  id: '0e4005b2d3cf191f8c44c2718a457a1e',
  title: 'Learn SQL',
  type: PostType.Article,
  permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
  image:
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
  createdAt: '2019-05-16T15:16:05.000Z',
  readTime: 8,
  tags: ['development', 'data-science', 'sql'],
  source: {
    __typename: 'Source',
    id: 's',
    handle: 's',
    permalink: 'permalink/s',
    name: 'Towards Data Science',
    type: SourceType.Machine,
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
    public: false,
  },
  upvoted: false,
  downvoted: false,
  commented: false,
  bookmarked: false,
  commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
  numUpvotes: 0,
  numComments: 0,
};

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
        ...(defaultPost as Post),
        ...data,
      },
    },
  },
});

const createActionsMock = (): MockedGraphQLResponse<{ actions: Action[] }> => ({
  request: { query: COMPLETED_USER_ACTIONS },
  result: {
    data: { actions: [] },
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
const logEvent = jest.fn();

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
    <TestBootProvider
      client={client}
      auth={{
        user,
        shouldShowLogin: false,
        showLogin,
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
      }}
      settings={createTestSettings()}
    >
      <LogContext.Provider
        value={{
          logEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        {getMainLayout(<PostPage {...defaultProps} {...props} />)}
      </LogContext.Provider>
    </TestBootProvider>,
  );
};

it('should show source image', async () => {
  renderPost();
  const el = await screen.findByAltText('Towards Data Science');
  expect(el).toHaveAttribute(
    'src',
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
  const el = screen.getAllByTitle('Go to post')[0];
  expect(el).toHaveAttribute('href', 'http://localhost:4000/r/9CuRpr5NiEY5');
});

it('should display the "read post" link on mobile resolutions', async () => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes('420'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  renderPost();

  const container = await screen.findByTestId('postContainer');
  const el = await within(container).findByTestId('postActionsRead');

  expect(el).toBeInTheDocument();
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
  const el = await screen.findByLabelText('Upvote');
  fireEvent.click(el);
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

it('should check meta tag with no description, summary of shared post', async () => {
  const seo = getSeoDescription(
    createPostMock({
      title: null,
      description: null,
      summary: null,
      sharedPost: {
        id: 'sp1',
        image: null,
        permalink: 'https://daily.dev',
        commentsPermalink: 'https://daily.dev',
        type: PostType.Article,
        title: 'GitHub is down',
      },
    }).result.data.post,
  );
  expect(seo).toEqual(
    'Join us to the discussion about "GitHub is down" on daily.dev ✌️',
  );
});

it('should check meta tag with no description, summary or title', async () => {
  const seo = getSeoDescription(
    createPostMock({
      title: null,
      description: null,
      summary: null,
    }).result.data.post,
  );
  expect(seo).toEqual('Join the discussion on daily.dev ✌️');
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
    createPostMock(),
    createCommentsMock(),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '0e4005b2d3cf191f8c44c2718a457a1e',
          vote: UserVote.Up,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
  ]);
  const el = await screen.findByLabelText('Upvote');
  fireEvent.click(el);
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderPost({}, [
    createPostMock({
      userState: {
        vote: UserVote.Up,
      },
    }),
    createCommentsMock(),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '0e4005b2d3cf191f8c44c2718a457a1e',
          vote: UserVote.None,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
  ]);
  const el = await screen.findByLabelText('Upvote');
  fireEvent.click(el);
  await waitFor(() => mutationCalled);
});

it('should open new comment modal and set the correct props', async () => {
  renderPost();
  // Wait for GraphQL to return
  await screen.findByText('Learn SQL');
  const el = await screen.findByText('Comment');
  fireEvent.click(el);
  const [commentBox] = await screen.findAllByRole('textbox');
  expect(commentBox).toBeInTheDocument();
});

it('should not show stats when they are zero', async () => {
  renderPost();
  const el = screen.queryByTestId('statsBar');
  expect(el).not.toBeInTheDocument();
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

/**
 * TODO: Flaky test should be refactored
it('should update post on subscription message', async () => {
  renderPost();
  await waitFor(async () => {
    const data = await client.getQueryData([
      'post',
      '0e4005b2d3cf191f8c44c2718a457a1e',
    ]);
    expect(data).toBeTruthy();
  });
  await act(async () => {
    nextCallback({
      postsEngaged: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        numUpvotes: 15,
        numComments: 0,
      },
    });
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
  const el = screen.queryByTestId('statsBar');
  expect(el).not.toBeInTheDocument();
});
 */

it('should send bookmark mutation from bookmark action', async () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

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

  await new Promise((resolve) => setTimeout(resolve, 100));

  const [el] = await screen.findAllByLabelText('Bookmark');
  fireEvent.click(el);

  await waitFor(() => mutationCalled);
});

it('should send remove bookmark mutation from remove bookmark action', async () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
  mockGraphQL({
    request: {
      query: COMPLETE_ACTION_MUTATION,
      variables: { type: 'bookmark_promote_mobile' },
    },
    result: () => {
      return { data: {} };
    },
  });

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
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const [el] = await screen.findAllByLabelText('Remove bookmark');
  fireEvent.click(el);

  await waitFor(() => mutationCalled);
});

it('should not show TLDR when there is no summary', async () => {
  renderPost();
  const el = screen.queryByText('TLDR');
  expect(el).not.toBeInTheDocument();
});

it('should show TLDR when there is a summary', async () => {
  renderPost({}, [
    createPostMock({ summary: 'test summary' }),
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
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
        "Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book type specimen book type specimen book type specimen book type.Ipsum is simply dummy text of the printing and typesetting industry. book type.Ipsum is simply dummy text of the printing and typesetting industry.",
    }),
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
  const el = await screen.findByText('TLDR');
  expect(el).toBeInTheDocument();
  // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
  const showMoreLink = queryByText(el.parentElement, 'Show more');
  expect(showMoreLink).toBeInTheDocument();
  fireEvent.click(showMoreLink);
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

it('should show login on downvote click', async () => {
  renderPost({}, [createPostMock(), createCommentsMock()], null);

  const el = await screen.findByLabelText('Downvote');
  fireEvent.click(el);
  expect(showLogin).toBeCalledTimes(1);
});

it('should send downvote mutation', async () => {
  let mutationCalled = false;

  renderPost({}, [
    createPostMock(),
    createCommentsMock(),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '0e4005b2d3cf191f8c44c2718a457a1e',
          vote: UserVote.Down,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
  ]);

  const el = await screen.findByLabelText('Downvote');
  fireEvent.click(el);
  await waitFor(() => mutationCalled);
});

it('should send cancel downvote mutation', async () => {
  let mutationCalled = false;

  renderPost({}, [
    createPostMock({
      userState: {
        vote: UserVote.Down,
      },
    }),
    createCommentsMock(),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '0e4005b2d3cf191f8c44c2718a457a1e',
          vote: UserVote.None,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
  ]);

  const el = await screen.findByLabelText('Downvote');
  fireEvent.click(el);
  await waitFor(() => mutationCalled);
});

it('should decrement number of upvotes if downvoting post that was upvoted', async () => {
  let mutationCalled = false;
  renderPost({}, [
    createPostMock({
      userState: {
        vote: UserVote.Up,
      },
      numUpvotes: 15,
    }),
    createCommentsMock(),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '0e4005b2d3cf191f8c44c2718a457a1e',
          vote: UserVote.Down,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
  ]);

  const downvote = await screen.findByLabelText('Downvote');
  fireEvent.click(downvote);
  await new Promise(process.nextTick);
  await waitFor(() => mutationCalled);

  const el = await screen.findByTestId('statsBar');
  expect(el).toHaveTextContent('14 Upvotes');
});

describe('downvote flow', () => {
  const createAllTagCategoriesMock = (
    onSuccess?: () => void,
  ): MockedGraphQLResponse<AllTagCategoriesData> => ({
    request: { query: FEED_SETTINGS_QUERY },
    result: () => {
      if (onSuccess) {
        onSuccess();
      }
      return {
        data: {
          feedSettings: {
            includeTags: ['react', 'golang'],
            blockedTags: [],
            excludeSources: [],
            advancedSettings: [],
          },
        },
      };
    },
  });

  const prepareDownvote = async () => {
    let queryCalled = false;
    renderPost({}, [
      createActionsMock(),
      createPostMock({
        userState: {
          vote: UserVote.Up,
        },
        numUpvotes: 15,
      }),
      createAllTagCategoriesMock(() => {
        queryCalled = true;
      }),
      createCommentsMock(),
      {
        request: {
          query: VOTE_MUTATION,
          variables: {
            id: '0e4005b2d3cf191f8c44c2718a457a1e',
            vote: UserVote.Down,
            entity: UserVoteEntity.Post,
          },
        },
        result: () => ({ data: { _: true } }),
      },
      completeActionMock({ action: ActionType.VotePost }),
    ]);
    const downvote = await screen.findByLabelText('Downvote');
    fireEvent.click(downvote);
    await new Promise(process.nextTick);
    await act(async () => {
      await waitFor(() => expect(queryCalled).toBeTruthy());
    });
  };

  it('should display the tags to block panel', async () => {
    await prepareDownvote();
    await screen.findByText("Don't show me posts from...");
  });

  it('should display the option to never see the selection again if blocked no tags', async () => {
    await prepareDownvote();
    const items = await screen.findAllByTestId('blockTagButton');
    const allUnselected = items.every((el) =>
      el.classList.contains('btn-tertiaryFloat'),
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    expect(allUnselected).toBeTruthy();
    const block = await screen.findByText('Block');
    fireEvent.click(block);
    await screen.findByText('No topics were blocked');
    let mutationCalled = false;
    mockGraphQL({
      request: {
        query: COMPLETE_ACTION_MUTATION,
        variables: { type: ActionType.HideBlockPanel },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    });
    const dontAskAgain = await screen.findByText("Don't ask again");
    fireEvent.click(dontAskAgain);
    await waitFor(() => expect(mutationCalled).toBeTruthy());
  });

  it('should display the correct blocked tags count and update filters', async () => {
    await prepareDownvote();
    const [, tag] = await screen.findAllByTestId('blockTagButton');
    fireEvent.click(tag);
    let mutationCalled = false;
    const label = tag.textContent.substring(1);
    mockGraphQL({
      request: {
        query: ADD_FILTERS_TO_FEED_MUTATION,
        variables: { filters: { blockedTags: [label] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { feedSettings: { id: defaultUser.id } } };
      },
    });
    const block = await screen.findByText('Block');
    fireEvent.click(block);
    await waitFor(() => expect(mutationCalled).toBeTruthy());
    await screen.findByText('1 topic was blocked');
    let undoMutationCalled = true;
    mockGraphQL({
      request: {
        query: REMOVE_FILTERS_FROM_FEED_MUTATION,
        variables: { filters: { blockedTags: [label] } },
      },
      result: () => {
        undoMutationCalled = true;
        return { data: { _: true } };
      },
    });
    const undo = await screen.findByText('Undo');
    fireEvent.click(undo);
    await waitFor(() => expect(undoMutationCalled).toBeTruthy());
  });
});

describe('collection', () => {
  let viewPostMutationCalled = false;

  it('should log post view', async () => {
    renderPost(
      {},
      [
        createPostMock({
          type: PostType.Collection,
        }),
        createCommentsMock(),
        {
          request: {
            query: VIEW_POST_MUTATION,
            variables: {
              id: '0e4005b2d3cf191f8c44c2718a457a1e',
            },
          },
          result: () => {
            viewPostMutationCalled = true;

            return {
              data: {
                viewPost: {
                  _: true,
                },
              },
            };
          },
        },
      ],
      defaultUser,
    );

    await waitFor(() => {
      expect(viewPostMutationCalled).toBe(true);
    });
  });
});

describe('article', () => {
  it('should log page view on initial load', async () => {
    renderPost({
      initialData: {
        post: defaultPost as Post,
      },
    });
    expect(logEvent).toBeCalledTimes(1);
    expect(logEvent).toBeCalledWith(
      expect.objectContaining({
        event_name: 'article page view',
      }),
    );
  });
});
