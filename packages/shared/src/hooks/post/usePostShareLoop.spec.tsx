import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePostShareLoop } from './usePostShareLoop';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { UseMutationSubscriptionProps } from '../mutationSubscription';
import { useMutationSubscription } from '../mutationSubscription';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { getShortLinkProps } from '../utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../lib';

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
const client = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedUser}
        updateUser={jest.fn()}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        {children}
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

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
    const { result } = renderHook(() => usePostShareLoop(post), { wrapper });

    act(() => {
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

  it('should show social share options when link is copied', () => {
    const { queryKey } = getShortLinkProps(
      post?.commentsPermalink,
      ReferralCampaignKey.SharePost,
      loggedUser,
    );
    client.setQueryData(queryKey, {
      getShortUrl: 'https://short.url',
    });

    const { result } = renderHook(() => usePostShareLoop(post), { wrapper });
    expect(result.current.currentInteraction).toBe('copy');
  });

  // Regression test for https://dailydotdev.atlassian.net/browse/MI-281
  it('should set shouldShowOverlay to false when downvoting', () => {
    const { result } = renderHook(() => usePostShareLoop(post), { wrapper });

    act(() => {
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
    const { result } = renderHook(() => usePostShareLoop(post), { wrapper });

    act(() => {
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
