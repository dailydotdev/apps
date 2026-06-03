import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MoveBookmarkModal from './MoveBookmarkModal';
import Toast from '../../notifications/Toast';
import type { BookmarkFolder } from '../../../graphql/bookmarks';

const mockMoveBookmarkToFolder = jest.fn();
const mockUseBookmarkFolderList = jest.fn();

jest.mock('../../../hooks/bookmark/useMoveBookmarkToFolder', () => ({
  useMoveBookmarkToFolder: () => ({
    isPending: false,
    moveBookmarkToFolder: (...args: unknown[]) =>
      mockMoveBookmarkToFolder(...args),
  }),
}));

jest.mock('../../../hooks/bookmark', () => ({
  useBookmarkFolderList: () => mockUseBookmarkFolderList(),
  useCreateBookmarkFolder: () => ({
    isPending: false,
    createFolder: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
    modal: null,
  }),
}));

const folderA: BookmarkFolder = {
  id: 'folder-a',
  name: 'Folder A',
  icon: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const folderB: BookmarkFolder = {
  id: 'folder-b',
  name: 'Folder B',
  icon: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const renderModal = (listId?: string) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MoveBookmarkModal
        postId="post-1"
        listId={listId}
        isOpen
        onRequestClose={jest.fn()}
        ariaHideApp={false}
      />
      <Toast />
    </QueryClientProvider>,
  );
};

describe('MoveBookmarkModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="__next"></div>';
    mockMoveBookmarkToFolder.mockResolvedValue({ _: true });
    mockUseBookmarkFolderList.mockReturnValue({
      isPending: false,
      isSuccess: true,
      folders: [folderA, folderB],
    });
  });

  it('shows "Moved to Quick saves" when moving to Quick saves from a folder', async () => {
    renderModal(folderA.id);

    fireEvent.click(screen.getByRole('radio', { name: /Quick saves/ }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Quick saves',
      ),
    );
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('undo restores back to "Quick saves" when the post originated from Quick saves', async () => {
    renderModal(undefined);

    fireEvent.click(screen.getByRole('radio', { name: /Folder B/ }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Folder B',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Quick saves',
      ),
    );
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    expect(mockMoveBookmarkToFolder).toHaveBeenLastCalledWith({
      postId: 'post-1',
      listId: undefined,
    });
  });

  it('undo restores back to the originating folder by name', async () => {
    renderModal(folderA.id);

    fireEvent.click(screen.getByRole('radio', { name: /Folder B/ }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Folder B',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Folder A',
      ),
    );
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    expect(mockMoveBookmarkToFolder).toHaveBeenLastCalledWith({
      postId: 'post-1',
      listId: folderA.id,
    });
  });

  it('falls back to generic copy when the originating folder is missing', async () => {
    renderModal('folder-deleted');

    fireEvent.click(screen.getByRole('radio', { name: /Folder B/ }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '✅ Moved to Folder B',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('✅ Bookmark moved'),
    );
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});
