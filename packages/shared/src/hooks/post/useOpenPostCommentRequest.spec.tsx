import { render } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import React from 'react';
import type { NewCommentRef } from '../../components/post/NewComment';
import type { Post } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import {
  ActivePostContextProvider,
  useActivePostContext,
} from '../../contexts/ActivePostContext';
import { useOpenPostCommentRequest } from './useOpenPostCommentRequest';

const post = { id: 'p1' } as Post;

let requestOpenComment: (origin: Origin) => void;

const Requester = (): null => {
  const context = useActivePostContext();
  requestOpenComment = (origin) => context.requestOpenComment?.(origin);
  return null;
};

const Listener = ({
  commentRef,
}: {
  commentRef: MutableRefObject<NewCommentRef>;
}): null => {
  useOpenPostCommentRequest(commentRef);
  return null;
};

describe('useOpenPostCommentRequest', () => {
  it('opens the composer when the provider receives a request', () => {
    const onShowInput = jest.fn();
    const commentRef = { current: { onShowInput } };
    render(
      <ActivePostContextProvider post={post}>
        <Requester />
        <Listener commentRef={commentRef} />
      </ActivePostContextProvider>,
    );

    requestOpenComment(Origin.PostCommentButton);
    expect(onShowInput).toHaveBeenCalledWith(Origin.PostCommentButton);
  });

  it('stops listening after unmount', () => {
    const onShowInput = jest.fn();
    const commentRef = { current: { onShowInput } };
    const { rerender } = render(
      <ActivePostContextProvider post={post}>
        <Requester />
        <Listener commentRef={commentRef} />
      </ActivePostContextProvider>,
    );

    rerender(
      <ActivePostContextProvider post={post}>
        <Requester />
      </ActivePostContextProvider>,
    );
    requestOpenComment(Origin.PostCommentButton);

    expect(onShowInput).not.toHaveBeenCalled();
  });

  it('is inert without a provider', () => {
    const onShowInput = jest.fn();
    const commentRef = { current: { onShowInput } };

    expect(() => render(<Listener commentRef={commentRef} />)).not.toThrow();
    expect(onShowInput).not.toHaveBeenCalled();
  });
});
