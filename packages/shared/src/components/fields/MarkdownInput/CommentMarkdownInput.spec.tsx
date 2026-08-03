import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { WriteCommentContext } from '../../../contexts/WriteCommentContext';
import { CommentMarkdownInput } from './CommentMarkdownInput';

const mockRichTextProps = jest.fn();

jest.mock('../RichTextInput', () => {
  const react = jest.requireActual('react') as typeof React;

  return {
    __esModule: true,
    default: react.forwardRef((props: Record<string, unknown>) => {
      mockRichTextProps(props);
      return <div data-testid="rich-text-input" />;
    }),
  };
});

const post = {
  id: 'post-1',
  author: { username: 'ido' },
  source: { id: 'source-1', handle: 'webdev' },
} as Post;

const renderComposer = (
  props: Partial<React.ComponentProps<typeof CommentMarkdownInput>> = {},
) =>
  render(
    <WriteCommentContext.Provider
      value={{
        mutateComment: {
          mutateComment: jest.fn(),
          isLoading: false,
          isSuccess: false,
        } as never,
      }}
    >
      <CommentMarkdownInput post={post} {...props} />
    </WriteCommentContext.Provider>,
  );

const setViewportHeight = (height: number) => {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: {
      height,
      width: 375,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  });
};

describe('CommentMarkdownInput', () => {
  beforeEach(() => {
    mockRichTextProps.mockClear();
  });

  it('caps its height to the visible viewport so the keyboard cannot hide it', () => {
    setViewportHeight(360);
    renderComposer();

    expect(screen.getByRole('form')).toHaveStyle({ maxHeight: '288px' });
  });

  it('keeps a workable floor when the visible viewport is tiny', () => {
    setViewportHeight(120);
    renderComposer();

    expect(screen.getByRole('form')).toHaveStyle({ maxHeight: '224px' });
  });

  it('does not grow past its cap on a tall desktop viewport', () => {
    setViewportHeight(1200);
    renderComposer();

    expect(screen.getByRole('form')).toHaveStyle({ maxHeight: '512px' });
  });

  it('moves the actions into a pinned bottom bar instead of the footer', () => {
    setViewportHeight(800);
    renderComposer();

    expect(mockRichTextProps).toHaveBeenCalledWith(
      expect.objectContaining({ toolbarPosition: 'bottom', hideFooter: true }),
    );
  });

  // The header is handed to RichTextInput as a node, so it is rendered on its
  // own here. Tooltip reaches for the query client, hence the provider.
  const renderHeader = () => {
    const [{ header }] = mockRichTextProps.mock.calls.at(-1);

    return render(
      <QueryClientProvider client={new QueryClient()}>
        <div>{header}</div>
      </QueryClientProvider>,
    );
  };

  it('names the comment author being replied to', () => {
    setViewportHeight(800);
    renderComposer({ parentCommentId: 'comment-1', replyTo: 'AmirMushich' });
    renderHeader();

    expect(screen.getByText(/Replying to/)).toBeInTheDocument();
    expect(screen.getByText('@AmirMushich')).toBeInTheDocument();
  });

  it('falls back to the post author on a top-level comment', () => {
    setViewportHeight(800);
    renderComposer();
    renderHeader();

    expect(screen.getByText('@ido')).toBeInTheDocument();
  });

  it('falls back to the source when the post has no author', () => {
    setViewportHeight(800);
    renderComposer({ post: { ...post, author: undefined } as Post });
    renderHeader();

    expect(screen.getByText('@webdev')).toBeInTheDocument();
  });

  it('says it is an edit rather than naming someone to reply to', () => {
    setViewportHeight(800);
    renderComposer({ editCommentId: 'comment-1' });
    renderHeader();

    expect(screen.getByText('Editing your comment')).toBeInTheDocument();
    expect(screen.queryByText(/Replying to/)).not.toBeInTheDocument();
  });

  it('puts the cancel action in the header, not the toolbar', () => {
    setViewportHeight(800);
    renderComposer({ onClose: jest.fn() });

    const [{ toolbarRightActions }] = mockRichTextProps.mock.calls.at(-1);
    expect(toolbarRightActions).toBeUndefined();

    renderHeader();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('keeps the markdown toggle in the header rather than the toolbar', () => {
    setViewportHeight(800);
    renderComposer();

    expect(mockRichTextProps).toHaveBeenCalledWith(
      expect.objectContaining({ hideMarkdownToggle: true }),
    );

    renderHeader();
    expect(
      screen.getByRole('button', { name: 'Switch to Markdown' }),
    ).toBeInTheDocument();
  });

  it.each([
    [{}, 'Comment'],
    [{ parentCommentId: 'comment-1' }, 'Reply'],
    [{ editCommentId: 'comment-1' }, 'Update'],
  ])('labels the submit action for the context %o', (props, expected) => {
    setViewportHeight(800);
    renderComposer(props);

    expect(mockRichTextProps).toHaveBeenCalledWith(
      expect.objectContaining({ submitCopy: expected }),
    );
  });

  it('fills its container in the drawer instead of capping against the viewport', () => {
    setViewportHeight(360);
    renderComposer({ fills: true });

    const form = screen.getByRole('form');
    expect(form).not.toHaveStyle({ maxHeight: '288px' });
    expect(form).toHaveClass('flex-1');
    const [{ className }] = mockRichTextProps.mock.calls.at(-1);
    expect(className.container).not.toContain('border');
  });
});
