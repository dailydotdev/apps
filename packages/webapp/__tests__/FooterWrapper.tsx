import { fireEvent, render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  ActivePostContextProvider,
  useActivePostContext,
} from '@dailydotdev/shared/src/contexts/ActivePostContext';
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

const post = { id: 'p1', type: PostType.Article } as Post;

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
    render(
      <ActivePostContextProvider post={post}>
        <ComposerOwner onOpenRequest={onOpenRequest} />
        <FooterWrapper post={post} />
      </ActivePostContextProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Comment' }));

    expect(onOpenRequest).toHaveBeenCalledWith('comment button');
  });

  it('renders no floating bar without a post', () => {
    render(<FooterWrapper />);

    expect(
      screen.queryByRole('button', { name: 'Comment' }),
    ).not.toBeInTheDocument();
  });
});
