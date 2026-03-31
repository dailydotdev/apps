import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { RepostListItem } from './RepostListItem';

const mockUseConditionalFeature = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

describe('RepostListItem', () => {
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

  it('does not render below-threshold label in repost modal items', () => {
    const post = {
      id: 'post-id',
      title: '',
      createdAt: new Date().toISOString(),
      numUpvotes: 1,
      numComments: 2,
      userState: {
        vote: UserVote.None,
      },
    } as Post;

    render(<RepostListItem post={post} />);

    expect(screen.queryByText('New')).not.toBeInTheDocument();
    expect(screen.queryByTestId('repost-upvotes')).not.toBeInTheDocument();
  });
});
