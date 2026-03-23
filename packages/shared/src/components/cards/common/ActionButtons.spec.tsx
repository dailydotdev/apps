import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultPost from '../../../../__tests__/fixture/post';
import ActionButtons from './ActionButtons';

jest.mock('../../../hooks', () => ({
  useFeedPreviewMode: jest.fn(() => false),
  useConditionalFeature: jest.fn(() => ({ value: false })),
}));

jest.mock('../../../hooks/cards/useCardActions', () => ({
  useCardActions: jest.fn(() => ({
    isUpvoteActive: false,
    isDownvoteActive: false,
    showTagsPanel: false,
    onToggleUpvote: jest.fn(),
    onToggleDownvote: jest.fn(),
    onToggleBookmark: jest.fn(),
    onCopyLink: jest.fn(),
  })),
}));

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ActionButtons>> = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ActionButtons post={defaultPost as Post} {...props} />
    </TestBootProvider>,
  );

describe('ActionButtons', () => {
  it('should link signal comment button to the post page', async () => {
    const onCommentClick = jest.fn();
    renderComponent({
      variant: 'signal',
      onCommentClick,
    });

    const commentLink = screen.getByRole('link', { name: /comment/i });

    expect(commentLink).toHaveAttribute('href', defaultPost.commentsPermalink);

    await userEvent.click(commentLink);

    expect(onCommentClick).toHaveBeenCalledWith(defaultPost);
  });
});
