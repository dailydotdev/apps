import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PostComments } from './PostComments';
import { usePostComments } from '../../hooks/comments/usePostComments';
import { Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';

jest.mock('../../hooks/comments/usePostComments', () => ({
  usePostComments: jest.fn(),
}));

jest.mock('../../hooks/comments/useDeleteComment', () => ({
  useDeleteComment: () => ({ deleteComment: jest.fn() }),
}));

jest.mock('./useCommentContentPreferenceMutationSubscription', () => ({
  useCommentContentPreferenceMutationSubscription: jest.fn(),
}));

jest.mock('../comments/MainComment', () => ({
  __esModule: true,
  default: ({
    comment,
    commentHash,
    commentRef,
    repliesLocked,
  }: {
    comment: { id: string };
    commentHash: string;
    commentRef: React.MutableRefObject<HTMLElement>;
    repliesLocked?: boolean;
  }) => (
    <article
      data-testid="comment"
      data-locked={String(!!repliesLocked)}
      ref={commentHash === `#c-${comment.id}` ? commentRef : undefined}
    >
      {comment.id}
    </article>
  ),
}));

const mockUsePostComments = jest.mocked(usePostComments);

const post = { id: 'p1', numComments: 0 } as Post;

const setComments = (count: number): void => {
  const edges = Array.from({ length: count }, (_, index) => ({
    node: { id: `c${index}` },
  }));
  mockUsePostComments.mockReturnValue({
    queryKey: ['post-comments', post.id],
    comments: { postComments: { edges } },
    isLoading: false,
    commentsCount: count,
  } as unknown as ReturnType<typeof usePostComments>);
};

const renderThread = (count: number) => {
  setComments(count);
  return render(
    <PostComments
      post={post}
      origin={Origin.ArticlePage}
      interleaveEvery={5}
      renderInterleaved={() => <div data-testid="interleaved" />}
    />,
  );
};

describe('PostComments interleaving', () => {
  it('leaves a short thread untouched', () => {
    renderThread(4);

    expect(screen.getAllByTestId('comment')).toHaveLength(4);
    expect(screen.queryByTestId('interleaved')).not.toBeInTheDocument();
  });

  it('breaks a long thread up on the interval', () => {
    renderThread(11);

    expect(screen.getAllByTestId('interleaved')).toHaveLength(2);
  });

  it('never renders after the last comment, where the block below already sits', () => {
    renderThread(10);

    expect(screen.getAllByTestId('interleaved')).toHaveLength(1);
  });

  it('renders no interleaved node without the props', () => {
    setComments(11);
    render(<PostComments post={post} origin={Origin.ArticlePage} />);

    expect(screen.queryByTestId('interleaved')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('comment')).toHaveLength(11);
  });
});

describe('PostComments hash scrolling', () => {
  let scrollIntoView: jest.Mock;
  let targetTop: number;

  const advanceFrames = (count = 1) =>
    act(() => jest.advanceTimersByTime(16 * count));

  beforeEach(() => {
    jest.useFakeTimers();
    window.history.replaceState({}, '', '/posts/p1#c-c1');
    targetTop = 1200;
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => ({ top: targetTop, height: 100 } as DOMRect));
    scrollIntoView = jest.fn(() => {
      targetTop = 300;
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    window.history.replaceState({}, '', '/');
  });

  it('waits for comments to load even beyond the settling budget', () => {
    setComments(0);
    mockUsePostComments.mockReturnValue({
      ...mockUsePostComments({ postId: post.id }),
      isLoading: true,
    } as ReturnType<typeof usePostComments>);
    const { rerender } = render(
      <PostComments post={post} origin={Origin.ArticlePage} />,
    );
    advanceFrames(200);
    expect(scrollIntoView).not.toHaveBeenCalled();

    setComments(2);
    rerender(<PostComments post={post} origin={Origin.ArticlePage} />);
    advanceFrames();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
      inline: 'nearest',
    });
    expect(scrollIntoView.mock.instances[0]).toBe(screen.getByText('c1'));
  });

  it('corrects a late layout shift above the comment', () => {
    renderThread(2);
    advanceFrames(60);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    targetTop += 700;
    advanceFrames();

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(screen.getByText('c1').getBoundingClientRect().top).toBe(300);
  });

  it.each(['wheel', 'touchmove', 'keydown', 'mousedown'])(
    'stops correcting after %s, including on refetch',
    (event) => {
      const { rerender } = renderThread(2);
      advanceFrames();
      fireEvent(window, new Event(event));
      targetTop += 700;
      setComments(3);
      rerender(<PostComments post={post} origin={Origin.ArticlePage} />);
      advanceFrames(200);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(targetTop).toBe(1000);
    },
  );

  it('leaves an absent target alone and exhausts its frame budget', () => {
    window.history.replaceState({}, '', '/posts/p1#c-missing');
    renderThread(2);
    advanceFrames(200);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('re-arms when the hash changes while the post stays mounted', () => {
    renderThread(2);
    advanceFrames(200);
    window.history.replaceState({}, '', '/posts/p1#c-c0');
    fireEvent(window, new HashChangeEvent('hashchange'));
    advanceFrames();

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView.mock.instances[1]).toBe(screen.getByText('c0'));
  });

  it('reads the live hash on a client navigation render without hashchange', () => {
    const { rerender } = renderThread(2);
    advanceFrames(200);
    window.history.pushState({}, '', '/posts/p1#c-c0');
    rerender(<PostComments post={post} origin={Origin.ArticlePage} />);
    advanceFrames();

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView.mock.instances[1]).toBe(screen.getByText('c0'));
  });
});

describe('PostComments teaser (logged out)', () => {
  const renderTeaser = (count: number, onTeaserSignup = jest.fn()) => {
    setComments(count);
    return render(
      <PostComments
        post={post}
        origin={Origin.ArticlePage}
        teaser
        onTeaserSignup={onTeaserSignup}
      />,
    );
  };

  it('shows only the first three comments, replies locked', () => {
    renderTeaser(5);

    const shown = screen.getAllByTestId('comment');
    expect(shown.map((node) => node.textContent)).toEqual(['c0', 'c1', 'c2']);
    shown.forEach((node) =>
      expect(node).toHaveAttribute('data-locked', 'true'),
    );
  });

  it('shows skeletons instead of the empty state, and asks on a tap', () => {
    const onTeaserSignup = jest.fn();
    const { container } = renderTeaser(0, onTeaserSignup);

    expect(screen.queryByText('No comments yet')).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const skeleton = container.querySelector('[data-comments-teaser] > button');
    fireEvent.click(skeleton as HTMLButtonElement);
    expect(onTeaserSignup).toHaveBeenCalledTimes(1);
  });

  it('counts only the visible comments for interleaved ads', () => {
    const reply = { node: { id: 'r' } };
    const edges = Array.from({ length: 3 }, (_, index) => ({
      node: { id: `c${index}`, children: { edges: [reply, reply] } },
    }));
    mockUsePostComments.mockReturnValue({
      queryKey: ['post-comments', post.id],
      comments: { postComments: { edges } },
      isLoading: false,
      commentsCount: 3,
    } as unknown as ReturnType<typeof usePostComments>);
    render(
      <PostComments
        post={post}
        origin={Origin.ArticlePage}
        teaser
        interleaveEvery={2}
        renderInterleaved={() => <div data-testid="interleaved" />}
      />,
    );

    expect(screen.getAllByTestId('interleaved')).toHaveLength(1);
  });

  describe('a linked comment', () => {
    afterEach(() => window.history.replaceState({}, '', '/'));

    const renderLinked = (hash: string) => {
      window.history.replaceState({}, '', `/posts/p1${hash}`);
      const edges = Array.from({ length: 6 }, (_, index) => ({
        node: {
          id: `c${index}`,
          children: { edges: [{ node: { id: `r${index}` } }] },
        },
      }));
      mockUsePostComments.mockReturnValue({
        queryKey: ['post-comments', post.id],
        comments: { postComments: { edges } },
        isLoading: false,
        commentsCount: 6,
      } as unknown as ReturnType<typeof usePostComments>);
      render(<PostComments post={post} origin={Origin.ArticlePage} teaser />);
    };

    it('shows a linked comment past the first three', () => {
      renderLinked('#c-c4');
      const shown = screen.getAllByTestId('comment');

      expect(shown.map((node) => node.textContent)).toEqual([
        'c0',
        'c1',
        'c2',
        'c3',
        'c4',
      ]);
      expect(shown[4]).toHaveAttribute('data-locked', 'false');
      expect(shown[3]).toHaveAttribute('data-locked', 'true');
    });

    it('unlocks the thread of a linked reply', () => {
      renderLinked('#c-r5');
      const shown = screen.getAllByTestId('comment');

      expect(shown).toHaveLength(6);
      expect(shown[5]).toHaveAttribute('data-locked', 'false');
      expect(shown[0]).toHaveAttribute('data-locked', 'true');
    });

    it('keeps three when the linked comment is among them', () => {
      renderLinked('#c-c1');
      const shown = screen.getAllByTestId('comment');

      expect(shown).toHaveLength(3);
      expect(shown[1]).toHaveAttribute('data-locked', 'false');
    });
  });

  it('leaves replies unlocked without the teaser', () => {
    renderThread(2);

    screen
      .getAllByTestId('comment')
      .forEach((node) => expect(node).toHaveAttribute('data-locked', 'false'));
  });
});
