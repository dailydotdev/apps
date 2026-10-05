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
import FooterWrapper from '../components/footer/FooterWrapper';

jest.mock('@dailydotdev/shared/src/components/ScrollToTopButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  '@dailydotdev/shared/src/components/post/MobilePostFloatingBar',
  () => ({
    MobilePostFloatingBar: ({
      onCommentClick,
    }: {
      onCommentClick: (origin: string) => void;
    }) => (
      <button type="button" onClick={() => onCommentClick('comment button')}>
        Comment
      </button>
    ),
  }),
);

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

const mockAppFooter = jest.mocked(useMobileAppFooterContext);

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
  mockAppFooter.mockReturnValue({ isRevealed: false });
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
    mockAppFooter.mockReturnValue({
      moment: { title: 'See all comments' },
      isRevealed: true,
    });
    renderFooter(<FooterWrapper post={post} />);

    expect(await screen.findByText('See all comments')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Comment' }),
    ).not.toBeInTheDocument();
  });
});
