import {
  render,
  RenderResult,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import Comment from '../../../../__tests__/fixture/comment';
import { REPORT_COMMENT_MUTATION } from '../../../graphql/comments';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../../contexts/FeaturesContext';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { LazyModalElement } from '../LazyModalElement';
import { ReportCommentModal } from './ReportCommentModal';

const defaultComment = Comment;
let features: IFlags;

const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const squads = [generateTestSquad()];

const renderComponent = (
  loggedIn = true,
  hasSquads = true,
  comment?,
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={features}>
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
            onReport={jest.fn()}
            comment={comment || defaultComment}
            isOpen
            onRequestClose={jest.fn()}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
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

  otherRadio.click();
  await expect(otherRadio).toBeChecked();

  const input = screen.getByTestId('report_comment') as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: 'test note' } });
  input.dispatchEvent(new Event('input', { bubbles: true }));

  expect(input.value).toBe('test note');
  expect(submitButton).toBeEnabled();
  await new Promise(process.nextTick);

  submitButton.click();

  await waitForNock();
  await waitFor(() => expect(queryCalled).toBeTruthy());
});
