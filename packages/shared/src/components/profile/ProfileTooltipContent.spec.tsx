import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { ProfileTooltipContent } from './ProfileTooltipContent';
import { Author } from '../../graphql/comments';
import { UserTooltipContentData } from '../../hooks/useProfileTooltip';

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

const mockRank = { rank: defaultRankData, tags: defaultTagsData };

const renderComponent = (
  user: Author = defaultUser,
  rank: UserTooltipContentData = mockRank,
) => {
  return render(<ProfileTooltipContent user={user} data={rank} />);
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
