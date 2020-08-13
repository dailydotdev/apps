import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import NewCommentModal, { Props } from '../components/NewCommentModal';
import { LoggedUser } from '../lib/user';
import AuthContext from '../components/AuthContext';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
} from '../graphql/comments';

const defaultUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
};

const onRequestClose = jest.fn();

beforeEach(() => {
  onRequestClose.mockReset();
});

const renderComponent = (
  props: Partial<Props> = {},
  mocks: MockedResponse[] = [],
  user: Partial<LoggedUser> = {},
): RenderResult => {
  const defaultProps: Props = {
    authorName: 'Nimrod',
    authorImage: 'https://daily.dev/nimrod.png',
    publishDate: new Date(2017, 1, 10, 0, 0),
    content: 'This is the main comment',
    commentId: null,
    postId: 'p1',
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
  };

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <AuthContext.Provider
        value={{
          user: { ...defaultUser, ...user },
          shouldShowLogin: false,
          showLogin: jest.fn(),
        }}
      >
        <NewCommentModal {...defaultProps} {...props} />
      </AuthContext.Provider>
    </MockedProvider>,
  );
};

it('should show twice the author name as title and in reply to', async () => {
  renderComponent();
  expect((await screen.findAllByText('Nimrod')).length).toEqual(2);
});

it('should show formatted date of publication', async () => {
  renderComponent();
  await screen.findByText('Feb 10, 2017');
});

it('should show author profile picture', async () => {
  renderComponent();
  const el = await screen.findByAltText(`Nimrod's profile image`);
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/nimrod.png');
});

it('should show user profile picture', async () => {
  renderComponent();
  const el = await screen.findByAltText('Your profile image');
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});

it('should show content of parent', async () => {
  renderComponent();
  await screen.findByText('This is the main comment');
});

it('should close modal on cancel', async () => {
  renderComponent();
  const el = await screen.findByText('Cancel');
  el.click();
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should disable submit button when no input', async () => {
  renderComponent();
  const el = await screen.findByText('Comment');
  expect(el.parentElement).toBeDisabled();
});

it('should enable submit button when no input', async () => {
  renderComponent();
  const input = await screen.findByRole('textbox');
  input.innerText = 'My new comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  expect(el.getAttribute('disabled')).toBeFalsy();
});

it('should send commentOnPost mutation', async () => {
  let mutationCalled = true;
  renderComponent({}, [
    {
      request: {
        query: COMMENT_ON_POST_MUTATION,
        variables: { id: 'p1', content: 'comment' },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            comment: {
              __typename: 'Comment',
              id: 'new',
              content: 'comment',
              createdAt: new Date(2017, 1, 10, 0, 1),
              permalink: 'https://daily.dev',
            },
          },
        };
      },
    },
  ]);
  const input = await screen.findByRole('textbox');
  input.innerText = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => onRequestClose.mock.calls.length === 1);
});

it('should send commentOnComment mutation', async () => {
  let mutationCalled = true;
  renderComponent({ commentId: 'c1' }, [
    {
      request: {
        query: COMMENT_ON_COMMENT_MUTATION,
        variables: { id: 'c1', content: 'comment' },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            comment: {
              __typename: 'Comment',
              id: 'new',
              content: 'comment',
              createdAt: new Date(2017, 1, 10, 0, 1),
              permalink: 'https://daily.dev',
            },
          },
        };
      },
    },
  ]);
  const input = await screen.findByRole('textbox');
  input.innerText = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => onRequestClose.mock.calls.length === 1);
});

it('should show alert in case of an error', async () => {
  let mutationCalled = true;
  renderComponent({ commentId: 'c1' }, [
    {
      request: {
        query: COMMENT_ON_COMMENT_MUTATION,
        variables: { id: 'c1', content: 'comment' },
      },
      result: () => {
        mutationCalled = true;
        return { errors: [] };
      },
    },
  ]);
  const input = await screen.findByRole('textbox');
  input.innerText = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await screen.findByRole('alert');
  expect(onRequestClose).toBeCalledTimes(0);
});
