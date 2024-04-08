import { renderHook, act } from '@testing-library/react-hooks';
import { usePostShareLoop } from './usePostShareLoop';
import { Post, UserVote } from '../../graphql/posts';
import {
  UseMutationSubscriptionProps,
  useMutationSubscription,
} from '../mutationSubscription';

const post = { id: '1' } as Post;
const feedName = 'testFeed';

// Mock the useActiveFeedNameContext hook to return the mock feedName
jest.mock('../../contexts', () => {
  const original = jest.requireActual('../../contexts');
  return {
    ...original,
    useActiveFeedNameContext: jest.fn().mockReturnValue({ feedName }),
  };
});

// Mock the useMutationSubscription hook
jest.mock('../mutationSubscription', () => ({
  useMutationSubscription: jest.fn(),
}));

const mockUseMutationSubscription =
  useMutationSubscription as jest.MockedFunction<
    typeof useMutationSubscription
  >;

describe('usePostShareLoop', () => {
  let callback: UseMutationSubscriptionProps['callback'] = null;

  beforeEach(() => {
    callback = null;
    jest.clearAllMocks();

    mockUseMutationSubscription.mockImplementationOnce(
      (props: UseMutationSubscriptionProps) => {
        callback = props.callback;
      },
    );
  });

  it('should set shouldShowOverlay to true when justUpvoted is true and hasInteracted is false', () => {
    const { result } = renderHook(() => usePostShareLoop(post));

    act(() => {
      expect(mockUseMutationSubscription).toHaveBeenCalledTimes(1);

      // Simulate a successful vote mutation with the same post id and vote type as Up
      callback({
        variables: { id: post.id, vote: UserVote.Up },
        status: null,
        mutation: null,
        queryClient: null,
      });
    });

    expect(result.current.shouldShowOverlay).toBe(true);
  });

  // Regression test for https://dailydotdev.atlassian.net/browse/MI-281
  it('should set shouldShowOverlay to false when downvoting', () => {
    const { result } = renderHook(() => usePostShareLoop(post));

    act(() => {
      expect(mockUseMutationSubscription).toHaveBeenCalledTimes(1);

      // Simulate a successful vote mutation with the same post id and vote type as Up
      callback({
        variables: { id: post.id, vote: UserVote.Down },
        status: null,
        mutation: null,
        queryClient: null,
      });
    });

    expect(result.current.shouldShowOverlay).toBe(false);
  });

  it('should set shouldShowOverlay to false when onInteract is called', () => {
    const { result } = renderHook(() => usePostShareLoop(post));

    act(() => {
      expect(mockUseMutationSubscription).toHaveBeenCalledTimes(1);

      // Simulate a successful vote mutation with the same post id and vote type as Up
      callback({
        variables: { id: post.id, vote: UserVote.Up },
        status: null,
        mutation: null,
        queryClient: null,
      });
    });

    act(() => {
      result.current.onInteract();
    });

    expect(result.current.shouldShowOverlay).toBe(false);
  });
});
