import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import CreateMyFeedModal from './CreateMyFeedModal';
import AuthContext from '../../contexts/AuthContext';
import {
  AllTagCategoriesData,
  FeedSettings,
  FEED_SETTINGS_QUERY,
  TagCategory,
} from '../../graphql/feedSettings';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import user from '../../../__tests__/fixture/loggedUser';

const logout = jest.fn();
const onRequestClose = jest.fn();

const createAllTagCategoriesMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
  },
  loggedIn = true,
  tagsCategories: TagCategory[] = [
    {
      id: 'BE',
      title: 'Backend',
      tags: ['nodejs', 'sql', 'backend', 'golang'],
      emoji: '☁️',
    },
  ],
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn } },
  result: {
    data: {
      feedSettings,
      tagsCategories,
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllTagCategoriesMock()],
): RenderResult => {
  const client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          updateUser: jest.fn(),
          logout,
          tokenRefreshed: true,
        }}
      >
        <CreateMyFeedModal
          isOpen
          onRequestClose={onRequestClose}
          ariaHideApp={false}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show create feed button', async () => {
  renderComponent();
  const el = await screen.findByText('Create');
  expect(el).toBeVisible();
});

it('should show tag categories', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Backend');

  expect(summary).toBeInTheDocument();
});
