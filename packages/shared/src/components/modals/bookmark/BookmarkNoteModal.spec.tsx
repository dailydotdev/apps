import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookmarkNoteModal } from './BookmarkNoteModal';
import type { Post } from '../../../graphql/posts';
import post from '../../../../__tests__/fixture/post';

const mockOnSetNote = jest.fn();
const mockPlus = { isPlus: false, logSubscriptionEvent: jest.fn() };

jest.mock('../../../hooks/bookmark/useBookmarkState', () => ({
  useBookmarkState: () => ({
    onSetNote: (...args: unknown[]) => mockOnSetNote(...args),
    onToggleRead: jest.fn(),
    onToggleArchived: jest.fn(),
  }),
}));

jest.mock('../../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: () => mockPlus,
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: { full: 'Upgrade to Plus' } }),
}));

const bookmarkedPost: Post = {
  ...post,
  bookmarked: true,
  bookmark: { createdAt: new Date(), note: 'Read before the retro' },
};

const renderModal = (target: Post = bookmarkedPost) => {
  const client = new QueryClient();
  const onRequestClose = jest.fn();

  render(
    <QueryClientProvider client={client}>
      <BookmarkNoteModal post={target} isOpen onRequestClose={onRequestClose} />
    </QueryClientProvider>,
  );

  return { onRequestClose };
};

describe('BookmarkNoteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlus.isPlus = false;
    mockOnSetNote.mockResolvedValue(true);
  });

  it('locks the field behind the upgrade link for free users', () => {
    renderModal();

    expect(screen.getByLabelText('Why did you save this?')).toHaveAttribute(
      'readonly',
    );
    // Inline copy link plus the primary button, both to the Plus page
    const links = screen.getAllByRole('link', { name: /Upgrade to plus/i });
    expect(links).toHaveLength(2);
    links.forEach((link) =>
      expect(link).toHaveAttribute('href', expect.stringContaining('plus')),
    );
    expect(
      screen.queryByRole('button', { name: 'Save note' }),
    ).not.toBeInTheDocument();
  });

  it('saves the trimmed note and closes for Plus users', async () => {
    mockPlus.isPlus = true;
    const { onRequestClose } = renderModal();

    const field = screen.getByLabelText('Why did you save this?');
    fireEvent.input(field, { target: { value: '  Try for the tooltip  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() =>
      expect(mockOnSetNote).toHaveBeenCalledWith(
        bookmarkedPost,
        'Try for the tooltip',
      ),
    );
    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
  });

  it('keeps the modal open when the save fails', async () => {
    mockPlus.isPlus = true;
    mockOnSetNote.mockResolvedValue(false);
    const { onRequestClose } = renderModal();

    fireEvent.input(screen.getByLabelText('Why did you save this?'), {
      target: { value: 'Changed' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() => expect(mockOnSetNote).toHaveBeenCalled());
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Why did you save this?')).toHaveValue(
      'Changed',
    );
  });

  it('removes an existing note', async () => {
    mockPlus.isPlus = true;
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Remove note' }));

    await waitFor(() =>
      expect(mockOnSetNote).toHaveBeenCalledWith(bookmarkedPost, null),
    );
  });
});
