import {
  render,
  RenderResult,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { act } from 'react';
import nock from 'nock';
import Comment from '../../../../__tests__/fixture/comment';
import { REPORT_COMMENT_MUTATION } from '../../../graphql/comments';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { LazyModalElement } from '../LazyModalElement';
import { ReportCommentModal } from './ReportCommentModal';
import Post from '../../../../__tests__/fixture/post';

const defaultPost = Post;
const defaultComment = Comment;

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const squads = [generateTestSquad()];

const onReport = jest.fn();
const onRequestClose = jest.fn();

const renderComponent = (
  loggedIn = true,
  hasSquads = true,
  comment?,
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedIn ? loggedUser : null}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={hasSquads ? squads : []}
      >
        <LazyModalElement />
        <ReportCommentModal
          onReport={onReport}
          comment={comment || defaultComment}
          isOpen
          onRequestClose={onRequestClose}
          post={defaultPost}
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('render the comment', async () => {
  renderComponent();
  expect(screen.getByText('Report comment')).toBeInTheDocument();
});

it('submit the report without text', async () => {
  let queryCalled = false;
  renderComponent();
  const hatefulRadio = screen.getByLabelText('Hateful or offensive content');
  const submitButton = screen.getByText('Submit report');

  mockGraphQL({
    request: {
      query: REPORT_COMMENT_MUTATION,
      variables: {
        commentId: defaultComment.id,
        reason: 'HATEFUL',
      },
    },
    result: () => {
      queryCalled = true;
      return { data: { reportComment: { _: true } } };
    },
  });

  hatefulRadio.click();
  expect(submitButton).toBeEnabled();
  await expect(hatefulRadio).toBeChecked();
  submitButton.click();
  await waitForNock();
  await waitFor(() => expect(queryCalled).toBeTruthy());
  await waitFor(() => expect(onReport).toHaveBeenCalled());
  await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
});

it('submit the report with text', async () => {
  let queryCalled = false;
  renderComponent();
  const otherRadio = screen.getByLabelText('Other');
  const submitButton = screen.getByText('Submit report');

  mockGraphQL({
    request: {
      query: REPORT_COMMENT_MUTATION,
      variables: {
        commentId: defaultComment.id,
        reason: 'OTHER',
        note: 'test note',
      },
    },
    result: () => {
      queryCalled = true;
      return { data: { reportComment: { _: true } } };
    },
  });

  await act(async () => {
    otherRadio.click();
    await expect(otherRadio).toBeChecked();

    const input = screen.getByTestId('report_comment') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'test note' } });
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.value).toBe('test note');
  });

  expect(submitButton).toBeEnabled();
  await new Promise(process.nextTick);

  submitButton.click();

  await waitForNock();
  await waitFor(() => expect(queryCalled).toBeTruthy());
  await waitFor(() => expect(onReport).toHaveBeenCalled());
  await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
});
