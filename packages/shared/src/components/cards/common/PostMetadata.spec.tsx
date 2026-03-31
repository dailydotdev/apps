import React from 'react';
import { render, screen } from '@testing-library/react';
import PostMetadata from './PostMetadata';

const mockUseConditionalFeature = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

describe('PostMetadata upvote label visibility', () => {
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

  it('renders below-threshold label by default', () => {
    render(
      <PostMetadata
        createdAt={new Date().toISOString()}
        numUpvotes={1}
        readTime={1}
      />,
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('does not render below-threshold label when disabled for non-card surfaces', () => {
    render(
      <PostMetadata
        createdAt={new Date().toISOString()}
        numUpvotes={1}
        readTime={1}
        showBelowThresholdLabel={false}
      />,
    );

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });

  it('does not render below-threshold label when upvote count is not provided', () => {
    render(<PostMetadata createdAt={new Date().toISOString()} readTime={1} />);

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });
});
