import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import NewCommentModal, { NewCommentModalProps } from './NewCommentModal';
import AuthContext from '../../contexts/AuthContext';
import {
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
  RECOMMEND_MENTIONS_QUERY,
  PREVIEW_COMMENT_MUTATION,
} from '../../graphql/comments';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { RecommendedMention } from '../RecommendedMention';
import comment from '../../../__tests__/fixture/comment';
import user from '../../../__tests__/fixture/loggedUser';

const onRequestClose = jest.fn();
const onComment = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const renderComponent = (
  props: Partial<NewCommentModalProps> = {},
  mocks: MockedGraphQLResponse[] = [],
): RenderResult => {
  const defaultProps: NewCommentModalProps = {
    authorImage: 'https://daily.dev/nimrod.png',
    authorName: 'Nimrod',
    publishDate: new Date(2017, 1, 10, 0, 0),
    content: 'This is the main comment',
    contentHtml: '<p>This is the main comment</p>',
    commentId: null,
    post: {
      id: 'p1',
      title: 'Title',
      image: 'https://image.com',
      commentsPermalink: 'https://daily.dev',
    },
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
    onComment,
  };

  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <NewCommentModal {...defaultProps} {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
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
  const el = await screen.findByAltText(`Nimrod's profile`);
  expect(el).toHaveAttribute('src', 'https://daily.dev/nimrod.png');
});

it('should show user profile picture', async () => {
  renderComponent();
  const el = await screen.findByAltText(`${user.username}'s profile`);
  expect(el).toHaveAttribute('src', 'https://daily.dev/ido.png');
});

it('should show content of parent', async () => {
  renderComponent();
  await screen.findByText('This is the main comment');
});

it('should disable submit button when no input', async () => {
  renderComponent();
  const el = await screen.findByText('Comment');
  // eslint-disable-next-line testing-library/no-node-access
  expect(el.parentElement).toBeDisabled();
});

it('should enable submit button when no input', async () => {
  renderComponent();
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = 'My new comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  expect(el.getAttribute('disabled')).toBeFalsy();
});

it('should send commentOnPost mutation', async () => {
  let mutationCalled = false;
  const newComment = {
    __typename: 'Comment',
    id: 'new',
    content: 'comment',
    createdAt: new Date(2017, 1, 10, 0, 1).toISOString(),
    permalink: 'https://daily.dev',
  };
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
            comment: newComment,
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => expect(onComment).toBeCalledWith(newComment, true));
});

it('should send commentOnComment mutation', async () => {
  let mutationCalled = false;
  const newComment = {
    __typename: 'Comment',
    id: 'new',
    content: 'comment',
    createdAt: new Date(2017, 1, 10, 0, 1).toISOString(),
    permalink: 'https://daily.dev',
  };
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
            comment: newComment,
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => expect(onComment).toBeCalledWith(newComment, true));
});

it('should not send comment if the input is spaces only', async () => {
  let mutationCalled = false;
  const newComment = {
    __typename: 'Comment',
    id: 'new',
    content: 'comment',
    createdAt: new Date(2017, 1, 10, 0, 1).toISOString(),
    permalink: 'https://daily.dev',
  };
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
            comment: newComment,
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = '   ';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => expect(onComment).not.toBeCalled());
  expect(mutationCalled).toBeFalsy();
});

it('should show alert in case of an error', async () => {
  let mutationCalled = false;
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
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Comment');
  el.click();
  await waitFor(() => mutationCalled);
  await screen.findByRole('alert');
  expect(onRequestClose).toBeCalledTimes(0);
});

// it('should show content of comment to edit', async () => {
//   renderComponent({ editContent: 'My comment to edit' });
//   await waitFor(async () =>
//     expect(await screen.getByText('My comment to edit')).toBeInTheDocument(),
//   );
// });

it('should send editComment mutation', async () => {
  let mutationCalled = false;
  renderComponent({ editId: 'c1', editContent: 'My comment to edit' }, [
    {
      request: {
        query: EDIT_COMMENT_MUTATION,
        variables: { id: 'c1', content: comment.content },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            comment,
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = comment.content;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = await screen.findByText('Update');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => expect(onComment).toBeCalledWith(comment, false));
});

it('should recommend users previously mentioned', async () => {
  let queryPreviouslyMentioned = false;
  renderComponent({}, [
    {
      request: {
        query: RECOMMEND_MENTIONS_QUERY,
        variables: { postId: 'p1', query: '' },
      },
      result: () => {
        queryPreviouslyMentioned = true;
        return {
          data: {
            recommendedMentions: [
              { name: 'Lee', username: 'sshanzel', image: 'sample.image.com' },
            ],
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = '@';
  Simulate.keyUp(input, { key: '@' });
  await waitForNock();
  expect(queryPreviouslyMentioned).toBeTruthy();
});

it('should recommend users based on query', async () => {
  let queryMatchingNameOrUsername = false;
  renderComponent({}, [
    {
      request: {
        query: RECOMMEND_MENTIONS_QUERY,
        variables: { postId: 'p1', query: '' },
      },
      result: () => {
        return {
          data: {
            recommendedMentions: [
              { name: 'Ido', username: 'idoshamun', image: 'sample.image.com' },
            ],
          },
        };
      },
    },
    {
      request: {
        query: RECOMMEND_MENTIONS_QUERY,
        variables: { postId: 'p1', query: 'l' },
      },
      result: () => {
        queryMatchingNameOrUsername = true;
        return {
          data: {
            recommendedMentions: [
              { name: 'Lee', username: 'sshanzel', image: 'sample.image.com' },
            ],
          },
        };
      },
    },
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = '@';
  Simulate.keyUp(input, { key: '@' });
  await new Promise((resolve) => setTimeout(resolve, 500));
  input.value = '@l';
  Simulate.keyUp(input, { key: 'l' });
  await waitForNock();
  expect(queryMatchingNameOrUsername).toBeTruthy();
});

describe('recommended mention component', () => {
  it('should display name, username and image of the user', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <RecommendedMention
          selected={0}
          users={[
            {
              id: 'u1',
              name: 'Lee',
              username: 'sshanzel',
              image: 'sample.image.com',
              permalink: 'www.test.com/sshanzel',
            },
          ]}
        />
      </QueryClientProvider>,
    );
    await screen.findByText('@sshanzel');
    await screen.findByText('Lee');
    await screen.findByAltText(`sshanzel's profile`);
  });
});

it('should send previewComment query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: PREVIEW_COMMENT_MUTATION,
      variables: { content: '# Test' },
    },
    result: () => {
      queryCalled = true;
      return { data: { preview: '<h1>Test</>' } };
    },
  });
  renderComponent();
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = '# Test';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const preview = await screen.findByText('Preview');
  preview.click();
  await waitFor(() => queryCalled);
});
