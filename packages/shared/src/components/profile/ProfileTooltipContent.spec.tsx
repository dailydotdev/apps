import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { ProfileTooltipContent } from './ProfileTooltipContent';
import { UserTooltipContentData } from '../../hooks/useProfileTooltip';
import user from '../../../__tests__/fixture/loggedUser';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultRankData = { currentRank: 5 };
const defaultTagsData = [
  { value: 'javascript', count: 5 },
  { value: 'ai', count: 4 },
  { value: 'devops', count: 3 },
  { value: 'cloud', count: 2 },
  { value: 'webdev', count: 1 },
];

const mockRank = { rank: defaultRankData, tags: defaultTagsData };

const renderComponent = (rank: UserTooltipContentData = mockRank) => {
  return render(<ProfileTooltipContent user={user} data={rank} />);
};

describe('ProfileTooltipContent component', () => {
  it('should show username', async () => {
    renderComponent();
    await screen.findByText(`@${user.username}`);
  });

  it('should show full name', async () => {
    renderComponent();
    await screen.findByText(user.name);
  });

  it('should show bio', async () => {
    renderComponent();
    await screen.findByText(user.bio);
  });

  it('should show user image', async () => {
    renderComponent();
    await screen.findByAltText(`${user.username}'s profile`);
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
