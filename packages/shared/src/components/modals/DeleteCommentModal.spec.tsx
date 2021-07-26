import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import DeleteCommentModal, { Props } from './DeleteCommentModal';
import { DELETE_COMMENT_MUTATION } from '../../graphql/comments';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';

const onRequestClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  props: Partial<Props> = {},
  mocks: MockedGraphQLResponse[] = [],
): RenderResult => {
  const defaultProps: Props = {
    parentId: 'c1',
    commentId: 'c2',
    postId: 'p1',
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
  };

  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <DeleteCommentModal {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
};

it('should close modal on cancel', async () => {
  renderComponent();
  const el = await screen.findByText('Cancel');
  el.click();
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should send deleteComment mutation', async () => {
  let mutationCalled = false;
  renderComponent({}, [
    {
      request: {
        query: DELETE_COMMENT_MUTATION,
        variables: { id: 'c2' },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            deleteComment: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Delete');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => onRequestClose.mock.calls.length === 1);
});
