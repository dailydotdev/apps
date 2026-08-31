import { act, renderHook } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { PostType } from '../graphql/posts';
import type { Post } from '../graphql/posts';
import { LazyModal } from '../components/modals/common/types';
import { useReaderInstallPromptGate } from './useReaderInstallPromptGate';

const mockOpenModal = jest.fn();
const mockUpdateFlag = jest.fn();
const mockUseReaderModalEligibility = jest.fn();

jest.mock('./useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({ updateFlag: mockUpdateFlag }),
}));

jest.mock('../components/post/reader/hooks/useReaderModalEligibility', () => ({
  useReaderModalEligibility: () => mockUseReaderModalEligibility(),
}));

const article = {
  id: 'article-id',
  image: 'https://example.com/article.png',
  commentsPermalink: '/posts/article-id',
  permalink: 'https://example.com/article',
  type: PostType.Article,
} as Post;

const sharedPost = {
  id: 'share-id',
  image: 'https://example.com/share.png',
  commentsPermalink: '/posts/share-id',
  type: PostType.Share,
  sharedPost: article,
} as Post;

const createClickEvent = (): MouseEvent =>
  ({
    button: 0,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as MouseEvent);

describe('useReaderInstallPromptGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReaderModalEligibility.mockReturnValue({
      isReaderEnabled: true,
      canShowReaderInstallPrompt: false,
    });
  });

  it('opens the shared article in the reader instead of following its external link', () => {
    const { result } = renderHook(() => useReaderInstallPromptGate(sharedPost));
    const event = createClickEvent();

    act(() => {
      expect(result.current.onReadClick(event)).toBe(true);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ReaderPreview,
      props: {
        post: sharedPost,
        targetPost: article,
        onCloseParent: undefined,
      },
    });
  });
});
