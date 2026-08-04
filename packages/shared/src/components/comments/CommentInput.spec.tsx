import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { useViewSize } from '../../hooks';
import CommentInput from './CommentInput';

const mockComposerProps = jest.fn();
const mockDrawerProps = jest.fn();

jest.mock('../../hooks', () => {
  const actual = jest.requireActual('../../hooks');

  return {
    ...actual,
    useViewSize: jest.fn(),
  };
});

jest.mock('../../hooks/post/useMutateComment', () => ({
  useMutateComment: () => ({
    mutateComment: jest.fn(),
    isLoading: false,
    isSuccess: false,
  }),
}));

jest.mock('../fields/MarkdownInput/CommentMarkdownInput', () => ({
  CommentMarkdownInput: (props: Record<string, unknown>) => {
    mockComposerProps(props);
    return <div>composer</div>;
  },
}));

jest.mock('../drawers/Drawer', () => {
  const actual = jest.requireActual('../drawers/Drawer');

  return {
    ...actual,
    Drawer: ({ children, ...props }: React.PropsWithChildren) => {
      mockDrawerProps(props);
      return <div>{children}</div>;
    },
  };
});

const post = { id: 'post-1', source: { id: 'source-1' } } as Post;

describe('CommentInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens as a full-screen drawer on mobile, focused and filling it', () => {
    jest.mocked(useViewSize).mockReturnValue(false);
    render(<CommentInput post={post} onClose={jest.fn()} />);

    expect(screen.getByText('composer')).toBeInTheDocument();
    expect(mockDrawerProps).toHaveBeenCalledWith(
      expect.objectContaining({
        isFullScreen: true,
        // Animated ancestors trap position:fixed, so the drawer must portal.
        appendOnRoot: true,
      }),
    );
    expect(mockComposerProps).toHaveBeenCalledWith(
      expect.objectContaining({ fills: true, autoFocus: true }),
    );
  });

  it('drops the drawer default padding so content is not padded twice', () => {
    // Including the bottom: the composer's action bar carries the safe area.
    jest.mocked(useViewSize).mockReturnValue(false);
    render(<CommentInput post={post} onClose={jest.fn()} />);

    const { className } = mockDrawerProps.mock.calls[0][0];
    expect(className.wrapper).toContain('!p-0');
  });

  it('stays inline on desktop', () => {
    jest.mocked(useViewSize).mockReturnValue(true);
    render(<CommentInput post={post} onClose={jest.fn()} />);

    expect(screen.getByText('composer')).toBeInTheDocument();
    expect(mockDrawerProps).not.toHaveBeenCalled();
    expect(mockComposerProps).toHaveBeenCalledWith(
      expect.objectContaining({ fills: false }),
    );
  });
});
