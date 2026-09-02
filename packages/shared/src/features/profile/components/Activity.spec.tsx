import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { Activity } from './Activity';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PublicProfile } from '../../../lib/user';

jest.mock('next/router');
jest.mock('../../../contexts/AuthContext');

jest.mock('./ActivityPostsTab', () => ({
  ActivityPostsTab: ({ isSameUser }: { isSameUser: boolean }) => (
    <div data-testid="posts-tab">{isSameUser ? 'owner' : 'visitor'}</div>
  ),
}));
jest.mock('./ActivityRepliesTab', () => ({ ActivityRepliesTab: () => null }));
jest.mock('./ActivityUpvotedTab', () => ({ ActivityUpvotedTab: () => null }));

const mockUseRouter = jest.mocked(useRouter);
const mockUseAuthContext = jest.mocked(useAuthContext);

const user: PublicProfile = {
  id: 'u1',
  name: 'Test User',
  username: 'testuser',
  image: 'https://daily.dev/user.png',
  permalink: 'https://daily.dev/testuser',
  reputation: 100,
  createdAt: '2020-01-01T00:00:00.000Z',
  premium: false,
};

const renderActivity = (query: Record<string, string>) => {
  mockUseRouter.mockReturnValue({
    pathname: '/[userId]',
    query,
    replace: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  mockUseAuthContext.mockReturnValue({
    user,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return render(<Activity user={user} />);
};

describe('Activity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('treats the logged in user as the owner of their own activity', () => {
    renderActivity({});

    expect(screen.getByTestId('posts-tab')).toHaveTextContent('owner');
  });

  it('treats the profile owner as a visitor in preview mode', () => {
    renderActivity({ preview: 'true' });

    expect(screen.getByTestId('posts-tab')).toHaveTextContent('visitor');
  });
});
