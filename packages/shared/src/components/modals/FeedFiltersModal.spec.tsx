import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import FeedFiltersModal from './FeedFiltersModal';
import AuthContext from '../../contexts/AuthContext';
import { LoggedUser } from '../../lib/user';
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

jest.mock('../../lib/user', () => ({
  ...jest.requireActual('../../lib/user'),
  updateProfile: jest.fn(),
}));

const logout = jest.fn();
const onRequestClose = jest.fn();

const defaultUser = {
  id: 'u1',
  username: 'idoshamun',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};
let loggedUser = defaultUser;

const createAllTagCategoriesMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
  },
  loggedIn = !!loggedUser,
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
  loggedUser = defaultUser;
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllTagCategoriesMock()],
  user: Partial<LoggedUser> = {},
): RenderResult => {
  const client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: { ...defaultUser, ...user },
          shouldShowLogin: false,
          showLogin: jest.fn(),
          updateUser: jest.fn(),
          logout,
          tokenRefreshed: true,
        }}
      >
        <FeedFiltersModal
          isOpen
          onRequestClose={onRequestClose}
          ariaHideApp={false}
          feedFilterModalType="v2"
          showIntroModal={false}
          feedFilterOnboardingModalType={''}
          actionToOpenFeedFilters={}
          onIntroClose={}
          onCloseFeedFilterModal={}
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
