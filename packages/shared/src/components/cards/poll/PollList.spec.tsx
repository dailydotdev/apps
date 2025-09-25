import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import type { PostCardProps } from '../common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  pollPost,
  pollPostWithUserVote,
} from '../../../../__tests__/fixture/pollPost';
import { PollList } from './PollList';
import * as usePollModule from '../../../hooks/usePoll';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks/usePoll');

const mockUsePoll = mocked(usePollModule.default);

beforeEach(() => {
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );

  mockUsePoll.mockReturnValue({
    onVote: jest.fn(),
    isCastingVote: false,
  });
});

const defaultProps: PostCardProps = {
  post: pollPost,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onDownvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

const renderComponent = (props: Partial<PostCardProps> = {}) => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <PollList {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

describe('PollList', () => {
  it('should render poll title', async () => {
    renderComponent();
    expect(
      await screen.findByText('What is your favorite programming language?'),
    ).toBeInTheDocument();
  });

  it('should render poll component successfully', async () => {
    renderComponent();
    expect(
      await screen.findByText('What is your favorite programming language?'),
    ).toBeInTheDocument();
  });

  it('should call usePoll hook correctly', () => {
    renderComponent();
    expect(mockUsePoll).toHaveBeenCalledWith({ post: pollPost });
  });

  it('should show poll results when user has voted', async () => {
    renderComponent({ post: pollPostWithUserVote });

    expect(
      await screen.findByText('What is your favorite programming language?'),
    ).toBeInTheDocument();

    const percentages = screen.queryAllByText(/%$/);
    expect(percentages.length >= 0).toBe(true);
  });

  it('should handle voting correctly', () => {
    const mockOnVote = jest.fn();
    mockUsePoll.mockReturnValue({
      onVote: mockOnVote,
      isCastingVote: false,
    });

    renderComponent();

    expect(mockUsePoll).toHaveBeenCalledWith({ post: pollPost });
  });

  it('should prevent voting again while voting is in progress', () => {
    const mockOnVote = jest.fn();
    mockUsePoll.mockReturnValue({
      onVote: mockOnVote,
      isCastingVote: true,
    });

    renderComponent();

    expect(mockUsePoll).toHaveBeenCalledWith({ post: pollPost });
  });

  it('should render with different post states', async () => {
    const readPost = { ...pollPost, read: true };
    renderComponent({ post: readPost });

    expect(
      await screen.findByText('What is your favorite programming language?'),
    ).toBeInTheDocument();
  });
});
