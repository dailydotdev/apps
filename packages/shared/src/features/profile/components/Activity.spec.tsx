import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { Activity } from './Activity';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PublicProfile } from '../../../lib/user';

jest.mock('next/router');
jest.mock('../../../contexts/AuthContext');

jest.mock('./ActivityPostsTab', () => ({
  ActivityPostsTab: ({
    isSameUser,
    onTabClick,
  }: {
    isSameUser: boolean;
    onTabClick: (label: string) => void;
  }) => (
    <div data-testid="posts-tab">
      {isSameUser ? 'owner' : 'visitor'}
      <button type="button" onClick={() => onTabClick('Replies')}>
        Replies
      </button>
    </div>
  ),
}));
jest.mock('./ActivityRepliesTab', () => ({
  ActivityRepliesTab: ({ isPreviewMode }: { isPreviewMode: boolean }) => (
    <div data-testid="replies-tab">{isPreviewMode ? 'preview' : 'live'}</div>
  ),
}));
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

  it('tells the replies tab when the profile is being previewed', () => {
    renderActivity({ preview: 'true' });
    fireEvent.click(screen.getByRole('button', { name: 'Replies' }));

    expect(screen.getByTestId('replies-tab')).toHaveTextContent('preview');
  });

  it('leaves the replies tab live outside preview mode', () => {
    renderActivity({});
    fireEvent.click(screen.getByRole('button', { name: 'Replies' }));

    expect(screen.getByTestId('replies-tab')).toHaveTextContent('live');
  });
});
