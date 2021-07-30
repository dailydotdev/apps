import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BanPostModal, { Props } from './BanPostModal';
import { BAN_POST_MUTATION } from '../../graphql/posts';
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
    postId: 'p1',
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
  };

  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <BanPostModal {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
};

it('should close modal on cancel', async () => {
  renderComponent();
  const el = await screen.findByText('Cancel');
  el.click();
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should send banPost mutation', async () => {
  let mutationCalled = false;
  renderComponent({}, [
    {
      request: {
        query: BAN_POST_MUTATION,
        variables: { id: 'p1' },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            deletePost: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Ban');
  el.click();
  await waitFor(() => mutationCalled);
  await waitFor(() => onRequestClose.mock.calls.length === 1);
});
