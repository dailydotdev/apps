import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ProfileTooltipContent } from './ProfileTolltipContent';
import { Author } from '../../graphql/comments';
import {
  UserTooltipContentData,
  USER_TOOLTIP_CONTENT_QUERY,
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

const defaultRankData = { currentRank: 5 };
const defaultTagsData = [
  { value: 'javascript', count: 5 },
  { value: 'ai', count: 4 },
  { value: 'devops', count: 3 },
  { value: 'cloud', count: 2 },
  { value: 'webdev', count: 1 },
];

const createRankMock = (
  { rank = defaultRankData, tags = defaultTagsData } = {},
  userId: string = defaultUser.id,
): MockedGraphQLResponse<UserTooltipContentData> => ({
  request: {
    query: USER_TOOLTIP_CONTENT_QUERY,
    variables: { id: userId },
  },
  result: {
    data: { rank, tags },
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

  it('should show most read tags', async () => {
    renderComponent();
    defaultTagsData.forEach(async (tag) => {
      expect(await screen.findByText(tag.value));
    });
  });
});
