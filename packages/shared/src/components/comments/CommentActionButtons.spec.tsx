import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { LoggedUser, Roles } from '../../lib/user';
import CommentActionButtons, { Props } from './CommentActionButtons';
import { Comment } from '../../graphql/comments';
import {
  completeActionMock,
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import comment from '../../../__tests__/fixture/comment';
import post from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import { VOTE_MUTATION } from '../../graphql/users';
import { UserVoteEntity } from '../../hooks';
import { UserVote } from '../../graphql/posts';
import LogContext from '../../contexts/LogContext';
import { ActionType } from '../../graphql/actions';

const showLogin = jest.fn();
const onComment = jest.fn();
const onDelete = jest.fn();
const onEdit = jest.fn();
const onShowUpvotes = jest.fn();
const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  commentUpdate: Partial<Comment> = {},
  user: LoggedUser = null,
  mocks: MockedGraphQLResponse[] = [],
): RenderResult => {
  const props: Props = {
    post,
    comment: {
      ...comment,
      ...commentUpdate,
    },
    origin: Origin.Feed,
    parentId: 'c1',
    onComment,
    onDelete,
    onEdit,
    onShowUpvotes,
  };

  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
        }}
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <CommentActionButtons {...props} />
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show options button with edit option when user is the author', async () => {
  renderComponent({}, {
    id: 'u1',
    name: 'Ido Shamun',
    providers: ['github'],
    email: 'ido@acme.com',
    image: 'https://daily.dev/ido.png',
    createdAt: '',
  } as unknown as LoggedUser);
  const el = await screen.findByLabelText('Options');
  expect(el).toBeInTheDocument();
  el.click();
  const editItem = await screen.findByText('Edit comment');
  expect(editItem).toBeInTheDocument();
});

it('should show options button with report option when user is not the author', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Options');
  expect(el).toBeInTheDocument();
  el.click();
  const reportItem = await screen.findByText('Report comment');
  expect(reportItem).toBeInTheDocument();
});

it('should show login on upvote click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent({}, loggedUser, [
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: 'c1',
          entity: UserVoteEntity.Comment,
          vote: UserVote.Up,
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
  el.click();
  await waitFor(() => mutationCalled);

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'upvote comment',
    extra: JSON.stringify({ origin: 'feed', commentId: 'c1' }),
    feed_item_image:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
    feed_item_target_url:
      'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
    feed_item_title: 'The Prosecutor’s Fallacy',
    post_author_id: 'u1',
    post_created_at: '2018-06-13T01:20:42.000Z',
    post_read_time: 8,
    post_source_id: 'tds',
    post_tags: ['webdev', 'javascript'],
    post_type: 'article',
    target_id: 'e3fd75b62cadd02073a31ee3444975cc',
    target_type: 'post',
  });
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent(
    {
      userState: {
        vote: UserVote.Up,
      },
    },
    loggedUser,
    [
      {
        request: {
          query: VOTE_MUTATION,
          variables: {
            id: 'c1',
            entity: UserVoteEntity.Comment,
            vote: UserVote.None,
          },
        },
        result: () => {
          mutationCalled = true;
          return { data: { _: true } };
        },
      },
      completeActionMock({ action: ActionType.VotePost }),
    ],
  );
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'remove comment upvote',
    extra: JSON.stringify({ origin: 'feed', commentId: 'c1' }),
    feed_item_image:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
    feed_item_target_url:
      'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
    feed_item_title: 'The Prosecutor’s Fallacy',
    post_author_id: 'u1',
    post_created_at: '2018-06-13T01:20:42.000Z',
    post_read_time: 8,
    post_source_id: 'tds',
    post_tags: ['webdev', 'javascript'],
    post_type: 'article',
    target_id: 'e3fd75b62cadd02073a31ee3444975cc',
    target_type: 'post',
  });
});

it('should call onComment callback', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Reply');
  el.click();
  expect(onComment).toBeCalledWith(comment, 'c1');
});

it('should call onDelete callback', async () => {
  renderComponent({}, loggedUser);
  const el = await screen.findByLabelText('Options');
  el.click();
  const [, remove] = await screen.findAllByRole('menuitem');
  remove.click();
  expect(onDelete).toBeCalledWith(comment, 'c1');
});

it('should allow delete for moderators', async () => {
  const user: LoggedUser = {
    ...loggedUser,
    id: 'other user',
    roles: [Roles.Moderator],
  };
  renderComponent({}, user);
  const el = await screen.findByLabelText('Options');
  el.click();
  const [remove] = await screen.findAllByRole('menuitem');
  remove.click();
  expect(onDelete).toBeCalledWith(comment, 'c1');
});

it('should call onEdit callback', async () => {
  renderComponent({}, loggedUser);
  const el = await screen.findByLabelText('Options');
  el.click();
  const [edit] = await screen.findAllByRole('menuitem');
  edit.click();
  expect(onEdit).toBeCalledWith(comment);
});

it('should call onShowUpvotes callback', async () => {
  const numUpvotes = 1;
  renderComponent({ numUpvotes }, loggedUser);
  const el = await screen.findByLabelText('See who upvoted');
  el.click();
  expect(onShowUpvotes).toBeCalledWith(comment.id, numUpvotes);
});

it('should not show num upvotes when it is zero', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  expect(el).toHaveTextContent('');
});

it('should show num upvotes when it is greater than zero', async () => {
  renderComponent({ numUpvotes: 2 });
  const el = await screen.findByText('2 upvotes');
  expect(el).toBeInTheDocument();
});

it('should show login on downvote click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Downvote');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should send downvote mutation', async () => {
  let mutationCalled = false;
  renderComponent({}, loggedUser, [
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: 'c1',
          entity: UserVoteEntity.Comment,
          vote: UserVote.Down,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await screen.findByLabelText('Downvote');
  el.click();
  await waitFor(() => mutationCalled);

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'downvote comment',
    extra: JSON.stringify({ origin: 'feed', commentId: 'c1' }),
    feed_item_image:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
    feed_item_target_url:
      'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
    feed_item_title: 'The Prosecutor’s Fallacy',
    post_author_id: 'u1',
    post_created_at: '2018-06-13T01:20:42.000Z',
    post_read_time: 8,
    post_source_id: 'tds',
    post_tags: ['webdev', 'javascript'],
    post_type: 'article',
    target_id: 'e3fd75b62cadd02073a31ee3444975cc',
    target_type: 'post',
  });
});

it('should send cancel downvote mutation', async () => {
  let mutationCalled = false;
  renderComponent(
    {
      userState: {
        vote: UserVote.Down,
      },
    },
    loggedUser,
    [
      {
        request: {
          query: VOTE_MUTATION,
          variables: {
            id: 'c1',
            entity: UserVoteEntity.Comment,
            vote: UserVote.None,
          },
        },
        result: () => {
          mutationCalled = true;
          return { data: { _: true } };
        },
      },
    ],
  );
  const el = await screen.findByLabelText('Downvote');
  el.click();
  await waitFor(() => mutationCalled);

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith({
    event_name: 'remove comment downvote',
    extra: JSON.stringify({ origin: 'feed', commentId: 'c1' }),
    feed_item_image:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
    feed_item_target_url:
      'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
    feed_item_title: 'The Prosecutor’s Fallacy',
    post_author_id: 'u1',
    post_created_at: '2018-06-13T01:20:42.000Z',
    post_read_time: 8,
    post_source_id: 'tds',
    post_tags: ['webdev', 'javascript'],
    post_type: 'article',
    target_id: 'e3fd75b62cadd02073a31ee3444975cc',
    target_type: 'post',
  });
});
