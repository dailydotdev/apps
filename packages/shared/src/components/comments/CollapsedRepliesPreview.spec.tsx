import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CollapsedRepliesPreview from './CollapsedRepliesPreview';
import type { Edge } from '../../graphql/common';
import type { Comment } from '../../graphql/comments';

const createReply = (
  id: string,
  authorId: string,
  authorUsername: string,
): Edge<Comment> => ({
  node: {
    id,
    contentHtml: '<p>reply content</p>',
    createdAt: new Date().toISOString(),
    permalink: 'https://daily.dev',
    numUpvotes: 0,
    numAwards: 0,
    author: {
      id: authorId,
      username: authorUsername,
      name: `User ${authorUsername}`,
      image: `https://daily.dev/${authorUsername}.png`,
      permalink: `https://app.daily.dev/${authorUsername}`,
    },
  },
  cursor: '',
});

const renderComponent = (
  replies: Edge<Comment>[],
  onExpand: () => void,
  className?: string,
) => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <CollapsedRepliesPreview
        replies={replies}
        onExpand={onExpand}
        className={className}
      />
    </QueryClientProvider>,
  );
};

describe('CollapsedRepliesPreview', () => {
  const onExpand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render single reply text correctly', () => {
    const replies = [createReply('r1', 'u1', 'user1')];
    renderComponent(replies, onExpand);
    expect(screen.getByText('View 1 reply')).toBeInTheDocument();
  });

  it('should render multiple replies text correctly', () => {
    const replies = [
      createReply('r1', 'u1', 'user1'),
      createReply('r2', 'u2', 'user2'),
      createReply('r3', 'u3', 'user3'),
    ];
    renderComponent(replies, onExpand);
    expect(screen.getByText('View 3 replies')).toBeInTheDocument();
  });

  it('should show up to 3 unique author avatars', () => {
    const replies = [
      createReply('r1', 'u1', 'user1'),
      createReply('r2', 'u2', 'user2'),
      createReply('r3', 'u3', 'user3'),
      createReply('r4', 'u4', 'user4'),
    ];
    renderComponent(replies, onExpand);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(3);
  });

  it('should not duplicate avatars for same author', () => {
    const replies = [
      createReply('r1', 'u1', 'user1'),
      createReply('r2', 'u1', 'user1'),
      createReply('r3', 'u2', 'user2'),
    ];
    renderComponent(replies, onExpand);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(2);
  });

  it('should call onExpand when clicked', () => {
    const replies = [createReply('r1', 'u1', 'user1')];
    renderComponent(replies, onExpand);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label for accessibility', () => {
    const replies = [
      createReply('r1', 'u1', 'user1'),
      createReply('r2', 'u2', 'user2'),
    ];
    renderComponent(replies, onExpand);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'View 2 replies');
  });

  it('should be keyboard accessible', () => {
    const replies = [createReply('r1', 'u1', 'user1')];
    renderComponent(replies, onExpand);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(onExpand).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const replies = [createReply('r1', 'u1', 'user1')];
    renderComponent(replies, onExpand, 'custom-class');

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
