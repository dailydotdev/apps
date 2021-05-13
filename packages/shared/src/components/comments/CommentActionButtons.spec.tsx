import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthContext from '../../contexts/AuthContext';
import { LoggedUser } from '../../lib/user';
import CommentActionButtons, { Props } from './CommentActionButtons';
import {
  Comment,
  CANCEL_COMMENT_UPVOTE_MUTATION,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { QueryClient, QueryClientProvider } from 'react-query';

const showLogin = jest.fn();
const onComment = jest.fn();
const onDelete = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const loggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
};

const baseComment = {
  id: 'c1',
  content: 'my comment',
  author: {
    image: 'https://daily.dev/ido.png',
    id: 'u1',
    name: 'Ido',
    permalink: 'https://daily.dev/ido',
  },
  createdAt: new Date().toISOString(),
  upvoted: false,
  permalink: 'https://daily.dev',
  numUpvotes: 0,
};

const renderComponent = (
  comment: Partial<Comment> = {},
  user: LoggedUser = null,
  mocks: MockedGraphQLResponse[] = [],
): RenderResult => {
  const props: Props = {
    comment: {
      ...baseComment,
      ...comment,
    },
    parentId: 'c1',
    onComment,
    onDelete,
    onEdit: jest.fn(),
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
  expect(onComment).toBeCalledWith(baseComment, 'c1');
});

it('should call onDelete callback', async () => {
  renderComponent({}, loggedUser);
  const el = await screen.findByLabelText('Delete');
  el.click();
  expect(onDelete).toBeCalledWith(baseComment, 'c1');
});

it('should not show num upvotes when it is zero', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Upvote');
  expect(el).toHaveTextContent('');
});

it('should show num upvotes when it is greater than zero', async () => {
  renderComponent({ numUpvotes: 2 });
  const el = await screen.findByText('2');
  expect(el).toBeInTheDocument();
});
