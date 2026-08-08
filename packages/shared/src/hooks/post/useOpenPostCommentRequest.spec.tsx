import { render } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import React from 'react';
import type { NewCommentRef } from '../../components/post/NewComment';
import { Origin } from '../../lib/log';
import { requestOpenPostComment } from '../../lib/postComment';
import { useOpenPostCommentRequest } from './useOpenPostCommentRequest';

const Listener = ({
  postId,
  commentRef,
}: {
  postId: string;
  commentRef: MutableRefObject<NewCommentRef>;
}): null => {
  useOpenPostCommentRequest(postId, commentRef);
  return null;
};

describe('useOpenPostCommentRequest', () => {
  it('opens the composer only for its own post', () => {
    const onShowInput = jest.fn();
    const commentRef = { current: { onShowInput } };
    render(<Listener postId="p1" commentRef={commentRef} />);

    requestOpenPostComment({
      postId: 'another-post',
      origin: Origin.PostCommentButton,
    });
    expect(onShowInput).not.toHaveBeenCalled();

    requestOpenPostComment({
      postId: 'p1',
      origin: Origin.PostCommentButton,
    });
    expect(onShowInput).toHaveBeenCalledWith(Origin.PostCommentButton);
  });

  it('stops listening after unmount', () => {
    const onShowInput = jest.fn();
    const commentRef = { current: { onShowInput } };
    const { unmount } = render(
      <Listener postId="p1" commentRef={commentRef} />,
    );

    unmount();
    requestOpenPostComment({
      postId: 'p1',
      origin: Origin.PostCommentButton,
    });

    expect(onShowInput).not.toHaveBeenCalled();
  });
});
