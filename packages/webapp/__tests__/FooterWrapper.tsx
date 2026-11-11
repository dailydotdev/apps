import { fireEvent, render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  ActivePostContextProvider,
  useActivePostContext,
} from '@dailydotdev/shared/src/contexts/ActivePostContext';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useMobileAppFooterContext } from '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext';
import { useCommentsTeaser } from '@dailydotdev/shared/src/features/commentsTeaser/useCommentsTeaser';
import FooterWrapper from '../components/footer/FooterWrapper';

jest.mock('@dailydotdev/shared/src/components/ScrollToTopButton', () => ({
  __esModule: true,
  default: () => <button type="button" aria-label="scroll to top" />,
}));

jest.mock('@dailydotdev/shared/src/components/post/PostCapsule', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/components/post/PostCapsule'),
  PostCapsule: ({
    onCommentClick,
  }: {
    onCommentClick: (origin: string) => void;
  }) => (
    <button type="button" onClick={() => onCommentClick('comment button')}>
      Comment
    </button>
  ),
}));

jest.mock(
  '@dailydotdev/shared/src/features/getApp/contexts/MobileAppFooterContext',
  () => ({ useMobileAppFooterContext: jest.fn() }),
);

jest.mock(
  '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter',
  () => ({
    MobileAppFooter: ({ title }: { title: string }) => <p>{title}</p>,
  }),
);

jest.mock(
  '@dailydotdev/shared/src/features/commentsTeaser/useCommentsTeaser',
  () => ({ useCommentsTeaser: jest.fn() }),
);

jest.mock(
  '@dailydotdev/shared/src/features/commentsTeaser/useRevealOnEngagement',
  () => ({ useRevealOnEngagement: (enabled: boolean) => enabled }),
);

const mockAppFooter = jest.mocked(useMobileAppFooterContext);
const mockCommentsTeaser = jest.mocked(useCommentsTeaser);

const post = { id: 'p1', type: PostType.Article } as Post;

const renderFooter = (children: React.ReactNode) =>
  render(
    <AuthContext.Provider
      value={{ isLoggedIn: false } as unknown as AuthContextData}
    >
      {children}
    </AuthContext.Provider>,
  );

beforeEach(() => {
  mockAppFooter.mockReturnValue({});
  mockCommentsTeaser.mockReturnValue({
    isCommentsTeaser: false,
    isPending: false,
  });
});

const ComposerOwner = ({
  onOpenRequest,
}: {
  onOpenRequest: (origin: Origin) => void;
}): null => {
  const { onOpenCommentRequest } = useActivePostContext();

  useEffect(
    () => onOpenCommentRequest?.(onOpenRequest),
    [onOpenCommentRequest, onOpenRequest],
  );

  return null;
};

describe('FooterWrapper', () => {
  it('asks the in-page composer to open instead of mounting its own', async () => {
    const onOpenRequest = jest.fn();
    renderFooter(
      <ActivePostContextProvider post={post}>
        <ComposerOwner onOpenRequest={onOpenRequest} />
        <FooterWrapper post={post} />
      </ActivePostContextProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Comment' }));

    expect(onOpenRequest).toHaveBeenCalledWith('comment button');
  });

  it('renders no floating bar without a post', () => {
    renderFooter(<FooterWrapper />);

    expect(
      screen.queryByRole('button', { name: 'Comment' }),
    ).not.toBeInTheDocument();
  });

  it('swaps the bottom bar for the Charm footer when it is shown', async () => {
    mockAppFooter.mockReturnValue({ title: 'See all posts' });
    renderFooter(<FooterWrapper post={post} />);

    expect(await screen.findByText('See all posts')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Comment' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the scroll to top button clickable inside the click-through wrapper', () => {
    renderFooter(<FooterWrapper />);

    const button = screen.getByRole('button', { name: 'scroll to top' });
    const pointerEventsOwner = button.closest(
      '.pointer-events-auto, .pointer-events-none',
    );

    expect(pointerEventsOwner).toHaveClass('pointer-events-auto');
  });

  it('evaluates the comments teaser only with a post', () => {
    renderFooter(<FooterWrapper />);

    expect(mockCommentsTeaser).toHaveBeenCalledWith(false);
  });

  it('holds the Charm footer while the comments teaser resolves', () => {
    mockAppFooter.mockReturnValue({ title: 'See all posts' });
    mockCommentsTeaser.mockReturnValue({
      isCommentsTeaser: false,
      isPending: true,
    });
    renderFooter(<FooterWrapper post={post} />);

    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();
  });

  it('titles the Charm footer for the comments teaser', async () => {
    mockAppFooter.mockReturnValue({ title: 'See all posts' });
    mockCommentsTeaser.mockReturnValue({
      isCommentsTeaser: true,
      isPending: false,
    });
    renderFooter(<FooterWrapper post={{ ...post, numComments: 3 }} />);

    expect(await screen.findByText('See all the comments')).toBeInTheDocument();
    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();
  });
});
