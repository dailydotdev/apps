import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ProfileTooltipContent } from './ProfileTolltipContent';
import { Author } from '../../graphql/comments';
import {
  UserReadingRankData,
  USER_READING_RANK_QUERY,
} from '../../graphql/users';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultUser = {
  id: '1',
  image: 'test.sample.com',
  username: 'sshanzel',
  name: 'Lee Hansel Solevilla',
  permalink: 'https://app.daily.dev/sshanzel',
  bio: 'Sample bio',
};

const createRankMock = (
  data: UserReadingRankData = {
    userReadingRank: { currentRank: 5 },
  },
  userId: string = defaultUser.id,
): MockedGraphQLResponse<UserReadingRankData> => ({
  request: {
    query: USER_READING_RANK_QUERY,
    variables: { id: userId },
  },
  result: {
    data,
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createRankMock()],
  user: Author = defaultUser,
) => {
  const client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <ProfileTooltipContent user={user} />
    </QueryClientProvider>,
  );
};

describe('ProfileTooltipContent component', () => {
  it('should show username', async () => {
    renderComponent();
    await screen.findByText('@sshanzel');
  });

  it('should show full name', async () => {
    renderComponent();
    await screen.findByText('Lee Hansel Solevilla');
  });

  it('should show bio', async () => {
    renderComponent();
    await screen.findByText('Sample bio');
  });

  it('should show user image', async () => {
    renderComponent();
    await screen.findByAltText(`sshanzel's profile`);
  });

  it('should show user rank', async () => {
    renderComponent();
    await screen.findByTestId('5');
  });
});
