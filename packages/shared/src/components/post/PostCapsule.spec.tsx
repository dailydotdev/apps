import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCapsule } from './PostCapsule';
import type { Post } from '../../graphql/posts';
import { PostType, UserVote } from '../../graphql/posts';
import { LogEvent, Origin } from '../../lib/log';
import { field, scroll } from '../shell/constants';
import { useShellField } from '../shell/shellFieldStore';
import { revealShell } from '../shell/useShellScroll';

const mockToggleUpvote = jest.fn();
const mockToggleDownvote = jest.fn();
const mockToggleBookmark = jest.fn();
const mockLogEvent = jest.fn();
const mockCopyLink = jest.fn();

jest.mock('../../hooks/vote/useVotePost', () => ({
  useVotePost: () => ({
    toggleUpvote: mockToggleUpvote,
    toggleDownvote: mockToggleDownvote,
  }),
}));

jest.mock('../../hooks/useBookmarkPost', () => ({
  useBookmarkPost: () => ({ toggleBookmark: mockToggleBookmark }),
}));

jest.mock('../../hooks/post/useBlockPostPanel', () => ({
  useBlockPostPanel: () => ({ onClose: jest.fn(), onShowPanel: jest.fn() }),
}));

jest.mock('../../hooks/useBrandSponsorship', () => ({
  useBrandSponsorship: () => ({
    getUpvoteAnimation: () => ({ shouldAnimate: false }),
  }),
}));

jest.mock('../../hooks/useCoresFeature', () => ({
  useCanAwardUser: () => false,
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('../../hooks/useCopyPostLink', () => ({
  useCopyPostLink: () => [false, mockCopyLink],
}));

jest.mock('../../hooks/utils/useGetShortUrl', () => ({
  useGetShortUrl: () => ({ getShortUrl: async (url: string) => url }),
}));

jest.mock('../../hooks/notifications', () => ({
  useBookmarkReminder: () => ({ onRemoveReminder: jest.fn() }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: null, showLogin: jest.fn() }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const post = {
  id: 'p1',
  type: PostType.Article,
  numUpvotes: 12,
  numComments: 3,
  tags: [],
  commentsPermalink: 'https://daily.dev/posts/p1',
  userState: { vote: UserVote.None },
} as unknown as Post;

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

const Presence = () => {
  const { mounted } = useShellField();
  return <output>{`${mounted}`}</output>;
};

const renderCapsule = (onCommentClick = jest.fn()) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PostCapsule post={post} onCommentClick={onCommentClick} />
      <Presence />
    </QueryClientProvider>,
  );

const byId = (id: string) => document.getElementById(id) as HTMLElement;

describe('PostCapsule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scrollTo(0);
    revealShell();
  });

  it('keeps the stable ids and acts with the article page origin', async () => {
    const onCommentClick = jest.fn();
    renderCapsule(onCommentClick);

    fireEvent.click(byId('mobile-upvote-post-btn'));
    expect(mockToggleUpvote).toHaveBeenCalledWith({
      payload: post,
      origin: Origin.ArticlePage,
    });

    fireEvent.click(byId('mobile-downvote-post-btn'));
    expect(mockToggleDownvote).toHaveBeenCalledWith({
      payload: post,
      origin: Origin.ArticlePage,
    });

    fireEvent.click(byId('mobile-bookmark-post-btn'));
    expect(mockToggleBookmark).toHaveBeenCalledWith({
      post,
      origin: Origin.ArticlePage,
    });

    fireEvent.click(byId('mobile-comment-post-btn'));
    expect(onCommentClick).toHaveBeenCalledWith(Origin.PostCommentButton);

    fireEvent.click(byId('mobile-copy-post-btn'));
    await waitFor(() =>
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.SharePost,
          extra: expect.stringContaining(Origin.ArticlePage),
        }),
      ),
    );
    expect(mockCopyLink).toHaveBeenCalledWith({ link: post.commentsPermalink });
  });

  it('takes the bar’s slot at the compact size and drops the counts while reading', () => {
    renderCapsule();
    expect(screen.getByRole('status')).toHaveTextContent('true');
    const surface = byId('mobile-upvote-post-btn').parentElement;
    expect(surface).toHaveStyle({ height: `${field.rest}px` });
    expect(screen.getByText('12')).toBeInTheDocument();

    act(() => {
      scrollTo(scroll.deadZone + scroll.hideTolerance + 40);
    });
    expect(surface).toHaveStyle({ height: `${field.compact}px` });
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });
});
