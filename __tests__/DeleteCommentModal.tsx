import DeleteCommentModal, { Props } from '../components/DeleteCommentModal';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { DELETE_COMMENT_MUTATION } from '../graphql/comments';

const onRequestClose = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

const renderComponent = (
  props: Partial<Props> = {},
  mocks: MockedResponse[] = [],
): RenderResult => {
  const defaultProps: Props = {
    parentId: 'c1',
    commentId: 'c2',
    postId: 'p1',
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
  };

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <DeleteCommentModal {...defaultProps} {...props} />
    </MockedProvider>,
  );
};

it('should close modal on cancel', async () => {
  renderComponent();
  const el = await screen.findByText('Cancel');
  el.click();
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should send deleteComment mutation', async () => {
  let mutationCalled = true;
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
