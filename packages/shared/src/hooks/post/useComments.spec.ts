import { act, renderHook } from '@testing-library/react';
import { sharePost } from '../../../__tests__/fixture/post';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useActiveFeedContext } from '../../contexts';
import { useComments } from './useComments';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedContext: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseActiveFeedContext = useActiveFeedContext as jest.Mock;

describe('useComments', () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      user: { username: 'current-user' },
      showLogin: jest.fn(),
    });
    mockUseLogContext.mockReturnValue({ logEvent: jest.fn() });
    mockUseActiveFeedContext.mockReturnValue({ logOpts: null });
  });

  it('should prefill reply mention with a non-breaking trailing space', () => {
    const { result } = renderHook(() => useComments(sharePost));

    act(() => {
      result.current.onReplyTo({
        commentId: 'comment-id',
        parentCommentId: 'parent-id',
        username: 'target-user',
      });
    });

    expect(result.current.inputProps).toMatchObject({
      parentCommentId: 'parent-id',
      replyTo: 'target-user',
      initialContent: '@target-user\u00a0',
    });
  });
});
