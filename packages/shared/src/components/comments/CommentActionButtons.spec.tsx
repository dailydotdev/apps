import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import { LoggedUser } from '../../lib/user';
import CommentActionButtons, { Props } from './CommentActionButtons';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import comment from '../../../__tests__/fixture/comment';
import post from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/analytics';

const showLogin = jest.fn();
const onComment = jest.fn();
const onDelete = jest.fn();
const onEdit = jest.fn();
const onShowUpvotes = jest.fn();

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
        <CommentActionButtons {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should not show delete button when user is not the author', async () => {
  renderComponent();
  expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
});

it('should show delete button when user is the author', async () => {
  renderComponent(
    {},
    {
      id: 'u1',
      name: 'Ido Shamun',
      providers: ['github'],
      email: 'ido@acme.com',
      image: 'https://daily.dev/ido.png',
      createdAt: '',
    },
  );
  expect(screen.getByLabelText('Delete')).toBeInTheDocument();
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
        query: UPVOTE_COMMENT_MUTATION,
        variables: { id: 'c1' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent({ upvoted: true }, loggedUser, [
    {
      request: {
        query: CANCEL_COMMENT_UPVOTE_MUTATION,
        variables: { id: 'c1' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const el = await screen.findByLabelText('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should call onComment callback', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Comment');
  el.click();
  expect(onComment).toBeCalledWith(comment, 'c1');
});

it('should call onDelete callback', async () => {
  renderComponent({}, loggedUser);
  const el = await screen.findByLabelText('Delete');
  el.click();
  expect(onDelete).toBeCalledWith(comment, 'c1');
});

it('should call onEdit callback', async () => {
  renderComponent({}, loggedUser);
  const el = await screen.findByLabelText('Edit');
  el.click();
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
