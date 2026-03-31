import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';

const mockUseConditionalFeature = jest.fn();
const mockUseAuthContext = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: () => false,
}));

jest.mock('../../lib/user', () => ({
  canViewPostAnalytics: () => false,
}));

describe('PostUpvotesCommentsCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { id: 'user-id' } });
    mockUseConditionalFeature.mockReturnValue({
      value: {
        threshold: 3,
        belowThresholdLabel: 'New',
        newWindowHours: 24,
      },
    });
  });

  it('does not render below-threshold label on post page', () => {
    const post = {
      id: 'post-id',
      createdAt: new Date().toISOString(),
      numUpvotes: 1,
      numComments: 0,
      numAwards: 0,
      numReposts: 0,
      userState: {
        vote: UserVote.None,
      },
    } as Post;

    render(<PostUpvotesCommentsCount post={post} />);

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });
});
