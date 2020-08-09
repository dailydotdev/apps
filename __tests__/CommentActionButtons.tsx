import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthContext from '../components/AuthContext';
import { LoggedUser } from '../lib/user';
import CommentActionButtons, {
  Props,
} from '../components/CommentActionButtons';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  Comment,
  CANCEL_COMMENT_UPVOTE_MUTATION,
  UPVOTE_COMMENT_MUTATION,
} from '../graphql/comments';

const showLogin = jest.fn();

beforeEach(() => {
  showLogin.mockReset();
});

const loggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
};

const renderComponent = (
  comment: Partial<Comment> = {},
  user: LoggedUser = null,
  mocks: MockedResponse[] = [],
): RenderResult => {
  const props: Props = {
    comment: {
      id: 'c1',
      content: 'my comment',
      author: {
        image: 'https://daily.dev/ido.png',
        id: 'u1',
        name: 'Ido',
      },
      createdAt: new Date(),
      upvoted: false,
      permalink: 'https://daily.dev',
      ...comment,
    },
  };

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <AuthContext.Provider value={{ user, shouldShowLogin: false, showLogin }}>
        <CommentActionButtons {...props} />
      </AuthContext.Provider>
    </MockedProvider>,
  );
};

it('should not show menu when user is not the author', async () => {
  const res = renderComponent();
  expect(res.queryByTitle('Open menu')).toBeNull();
});

it('should show menu when user is not the author', async () => {
  const res = renderComponent(
    {},
    {
      id: 'u1',
      image: 'https://daily.dev/ido.png',
      providers: ['github'],
    },
  );
  expect(res.getByTitle('Open menu')).toBeDefined();
});

it('should show login on upvote click', async () => {
  renderComponent();
  const el = await screen.findByTitle('Upvote');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  const res = renderComponent({}, loggedUser, [
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
  const el = await res.findByTitle('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  const res = renderComponent({ upvoted: true }, loggedUser, [
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
  const el = await res.findByTitle('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});
