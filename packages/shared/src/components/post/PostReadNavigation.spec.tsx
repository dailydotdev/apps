import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import postFixture, { sharePost } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import { Origin } from '../../lib/log';
import { LazyModal } from '../modals/common/types';
import { PostCardHeader } from '../cards/common/list/PostCardHeader';
import { PostContentRaw } from './PostContent';
import { SquadPostContentRaw } from './SquadPostContent';

const mockOpenModal = jest.fn();
const mockLogEvent = jest.fn();
const mockReaderEligibility = jest.fn();

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
    modal: null,
  }),
}));

jest.mock('./reader/hooks/useReaderModalEligibility', () => ({
  useReaderModalEligibility: () => mockReaderEligibility(),
}));

jest.mock('./SquadPostWidgets', () => ({
  SquadPostWidgets: () => <aside />,
}));

const article: Post = { ...postFixture, domain: 'example.com' };

const renderContent = (post: Post, isPostPage = false, onClose = jest.fn()) => {
  const Content =
    post.type === PostType.Share ? SquadPostContentRaw : PostContentRaw;

  render(
    <TestBootProvider
      client={new QueryClient()}
      log={{ logEvent: mockLogEvent }}
    >
      <Content
        post={post}
        origin={isPostPage ? Origin.ArticlePage : Origin.ArticleModal}
        isPostPage={isPostPage}
        onClose={isPostPage ? undefined : onClose}
      />
    </TestBootProvider>,
  );

  return { onClose };
};

beforeEach(() => {
  jest.clearAllMocks();
  window.getSelection()?.removeAllRanges();
  mockReaderEligibility.mockReturnValue({
    isEligible: true,
    isReaderEnabled: true,
    canShowReaderInstallPrompt: false,
  });
});

afterEach(() => {
  window.getSelection()?.removeAllRanges();
});

describe('article read links', () => {
  it.each([
    { surface: 'modal', isPostPage: false, name: article.title },
    { surface: 'modal', isPostPage: false, name: article.domain },
    { surface: 'page', isPostPage: true, name: article.title },
    { surface: 'page', isPostPage: true, name: article.domain },
    { surface: 'modal', isPostPage: false, name: 'Post cover image' },
    { surface: 'modal', isPostPage: false, name: 'Read post' },
  ])('opens $name in the reader on the $surface', ({ isPostPage, name }) => {
    renderContent(article, isPostPage);

    fireEvent.click(screen.getByRole('link', { name }));

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ReaderPreview,
      props: {
        post: article,
        targetPost: article,
        onCloseParent: isPostPage ? undefined : expect.any(Function),
      },
    });
    expect(mockLogEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'go to link' }),
    );
  });

  it.each([{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }])(
    'preserves modified title clicks: %j',
    (modifiers) => {
      renderContent(article);

      fireEvent.click(
        screen.getByRole('link', { name: article.title }),
        modifiers,
      );

      expect(mockOpenModal).not.toHaveBeenCalled();
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'go to link' }),
      );
    },
  );

  it('preserves middle clicks on the title', () => {
    renderContent(article);

    fireEvent(
      screen.getByRole('link', { name: article.title }),
      new MouseEvent('auxclick', {
        button: 1,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(mockOpenModal).not.toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'go to link' }),
    );
  });

  it('keeps external navigation when the reader is off', () => {
    mockReaderEligibility.mockReturnValue({
      isEligible: true,
      isReaderEnabled: false,
      canShowReaderInstallPrompt: false,
    });
    renderContent(article);

    fireEvent.click(screen.getByRole('link', { name: article.title }));

    expect(mockOpenModal).not.toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'go to link' }),
    );
  });
});

describe('Squad shared article previews', () => {
  it.each([
    { surface: 'modal', isPostPage: false, sourceId: 'tkdodo' },
    { surface: 'modal', isPostPage: false, sourceId: 'unknown' },
    { surface: 'page', isPostPage: true, sourceId: 'tkdodo' },
    { surface: 'page', isPostPage: true, sourceId: 'unknown' },
  ])(
    'opens the shared article from the $surface with source $sourceId',
    ({ isPostPage, sourceId }) => {
      const post: Post = {
        ...sharePost,
        sharedPost: {
          ...sharePost.sharedPost!,
          source: {
            ...sharePost.sharedPost!.source,
            id: sourceId,
          } as Post['source'],
        },
      };
      const { onClose } = renderContent(post, isPostPage);

      fireEvent.click(
        screen.getByRole('link', { name: /Type-safe React Query/ }),
      );

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.ReaderPreview,
        props: {
          post,
          targetPost: post.sharedPost,
          onCloseParent: isPostPage ? undefined : expect.any(Function),
        },
      });
      expect(mockLogEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'go to link' }),
      );
      if (!isPostPage) {
        mockOpenModal.mock.calls[0][0].props.onCloseParent();
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    },
  );

  it('opens the shared video from its title preview', () => {
    const post: Post = {
      ...sharePost,
      sharedPost: {
        ...sharePost.sharedPost!,
        type: PostType.VideoYouTube,
        videoId: 'video-id',
      },
    };
    renderContent(post);

    fireEvent.click(
      screen.getByRole('link', { name: /Type-safe React Query/ }),
    );

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ReaderPreview,
      props: {
        post,
        targetPost: post.sharedPost,
        onCloseParent: expect.any(Function),
      },
    });
  });

  it('keeps shared article navigation when the reader is off', () => {
    mockReaderEligibility.mockReturnValue({
      isEligible: true,
      isReaderEnabled: false,
      canShowReaderInstallPrompt: false,
    });
    renderContent(sharePost);

    const link = screen.getByRole('link', { name: /Type-safe React Query/ });
    expect(link).toHaveAttribute(
      'href',
      sharePost.sharedPost!.commentsPermalink,
    );
    fireEvent.click(link);

    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('preserves modified clicks on shared article previews', () => {
    renderContent(sharePost);

    fireEvent.click(
      screen.getByRole('link', { name: /Type-safe React Query/ }),
      { ctrlKey: true },
    );

    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('does not open the reader when selecting text in a shared article preview', () => {
    renderContent(sharePost);
    const range = document.createRange();
    range.selectNodeContents(
      screen.getByRole('heading', { name: 'Type-safe React Query' }),
    );
    window.getSelection()?.addRange(range);

    fireEvent.click(
      screen.getByRole('link', { name: /Type-safe React Query/ }),
    );

    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('keeps private Squad post links out of the embedded reader', () => {
    const post: Post = {
      ...sharePost,
      sharedPost: {
        ...sharePost.sharedPost!,
        private: true,
        source: {
          ...sharePost.sharedPost!.source,
          type: SourceType.Squad,
        } as Post['source'],
      },
    };
    renderContent(post);

    const link = screen.getByRole('link', { name: 'Read post' });
    expect(link).toHaveAttribute('href', post.sharedPost!.commentsPermalink);
    fireEvent.click(link);

    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});

describe('list-card read actions', () => {
  it.each([article, sharePost])(
    'opens the read target for $type posts',
    (post) => {
      const onReadArticleClick = jest.fn();
      render(
        <TestBootProvider client={new QueryClient()}>
          <PostCardHeader
            post={post}
            postLink={post.permalink}
            readButtonContent="Read post"
            onReadArticleClick={onReadArticleClick}
          />
        </TestBootProvider>,
      );

      fireEvent.click(screen.getByRole('link', { name: 'Read post' }));

      expect(mockOpenModal).toHaveBeenCalledWith({
        type: LazyModal.ReaderPreview,
        props: {
          post,
          targetPost: post.sharedPost ?? post,
          onCloseParent: undefined,
        },
      });
      expect(onReadArticleClick).not.toHaveBeenCalled();
    },
  );
});
