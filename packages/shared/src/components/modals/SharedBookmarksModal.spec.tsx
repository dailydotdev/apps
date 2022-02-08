import {
  fireEvent,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import SharedBookmarksModal from './SharedBookmarksModal';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import {
  BOOKMARK_SHARING_MUTATION,
  BOOKMARK_SHARING_QUERY,
} from '../../graphql/bookmarksSharing';

const onRequestClose = jest.fn();

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const renderComponent = (mocks: MockedGraphQLResponse[] = []): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <SharedBookmarksModal
        isOpen
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </QueryClientProvider>,
  );
};

it('should enable public mode on toggle click', async () => {
  let mutationCalled = false;
  renderComponent([
    {
      request: {
        query: BOOKMARK_SHARING_QUERY,
      },
      result: {
        data: {
          bookmarksSharing: {
            enabled: false,
            slug: '',
            rssUrl: '',
          },
        },
      },
    },
    {
      request: {
        query: BOOKMARK_SHARING_MUTATION,
        variables: { enabled: true },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            bookmarksSharing: {
              enabled: true,
              slug: '619f6044-c02b-486b-8234-9a46ad1bb604',
              rssUrl:
                'http://localhost:4000/rss/b/619f6044-c02b-486b-8234-9a46ad1bb604',
            },
          },
        };
      },
    },
  ]);
  // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
  const checkboxes = await screen.findAllByRole('checkbox');
  const checkbox = checkboxes.find((el) =>
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    queryByText(el.parentElement, 'Public mode'),
  ) as HTMLInputElement;
  fireEvent.click(checkbox);
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  const input = screen.getByDisplayValue(
    'http://localhost:4000/rss/b/619f6044-c02b-486b-8234-9a46ad1bb604',
  );
  await waitFor(() => expect(input).toBeInTheDocument());
});
