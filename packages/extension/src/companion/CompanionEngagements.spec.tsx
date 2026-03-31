import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { CompanionEngagements } from './CompanionEngagements';

const mockUseConditionalFeature = jest.fn();
const mockUseAuthContext = jest.fn();
const mockUseQueryClient = useQueryClient as jest.Mock;

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('@dailydotdev/shared/src/hooks/companion', () => ({
  useRawBackgroundRequest: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

describe('CompanionEngagements', () => {
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
    mockUseQueryClient.mockReturnValue({
      setQueryData: jest.fn(),
    });
  });

  it('does not render below-threshold label in companion', () => {
    const post = {
      id: 'post-id',
      createdAt: new Date().toISOString(),
      numUpvotes: 1,
      numComments: 2,
      userState: {
        vote: UserVote.None,
      },
    } as PostBootData;

    render(<CompanionEngagements post={post} />);

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });
});
