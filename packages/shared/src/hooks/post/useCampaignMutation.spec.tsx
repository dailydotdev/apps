import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nock from 'nock';
import { useCampaignMutation } from './useCampaignMutation';
import {
  BOOST_ESTIMATED_REACH,
  BOOST_ESTIMATED_REACH_DAILY,
  START_CAMPAIGN,
  STOP_CAMPAIGN,
} from '../../graphql/post/boost';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { useTransactionError } from '../useTransactionError';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey, updatePostCache } from '../../lib/query';

// Mock the hooks
jest.mock('../useTransactionError');
jest.mock('../useToastNotification');
jest.mock('../../lib/query', () => ({
  ...(jest.requireActual('../../lib/query') as unknown as Record<
    string,
    unknown
  >),
  updatePostCache: jest.fn(),
}));

const mockUseTransactionError = useTransactionError as jest.MockedFunction<
  typeof useTransactionError
>;
const mockUseToastNotification = useToastNotification as jest.MockedFunction<
  typeof useToastNotification
>;
const mockUpdatePostCache = updatePostCache as jest.MockedFunction<
  typeof updatePostCache
>;

describe('usePostBoostMutation hook', () => {
  let queryClient: QueryClient;
  const mockDisplayToast = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockTransactionError = jest.fn();
  const user = { ...loggedUser, balance: { amount: 1000 } };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={user}
        squads={[]}
        getRedirectUri={jest.fn()}
        updateUser={mockUpdateUser}
        tokenRefreshed
      >
        {children}
      </AuthContextProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();
    nock.cleanAll();

    mockUseToastNotification.mockReturnValue({
      displayToast: mockDisplayToast,
    } as any);

    mockUseTransactionError.mockReturnValue(mockTransactionError);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return default values when initialized without toEstimate', () => {
    const { result } = renderHook(() => useCampaignMutation(), {
      wrapper: Wrapper,
    });

    expect(result.current.estimatedReach).toEqual({ min: 0, max: 0 });
    expect(result.current.isLoadingEstimate).toBe(false);
    expect(result.current.isLoadingCancel).toBe(false);
    expect(typeof result.current.onBoostPost).toBe('function');
    expect(typeof result.current.onCancelBoost).toBe('function');
  });

  it('should fetch estimated reach when toEstimate is provided', async () => {
    const toEstimate = { id: 'post1' };
    const estimatedReach = { min: 100, max: 500 };

    // Add delay to the mock to test loading state
    nock('http://localhost:3000')
      .post('/graphql', {
        query: BOOST_ESTIMATED_REACH,
        variables: { postId: 'post1' },
      })
      .delay(100)
      .reply(200, {
        data: {
          boostEstimatedReach: estimatedReach,
        },
      });

    const { result } = renderHook(() => useCampaignMutation({ toEstimate }), {
      wrapper: Wrapper,
    });

    // Should be loading initially
    expect(result.current.isLoadingEstimate).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEstimate).toBe(false);
    });

    expect(result.current.estimatedReach).toEqual(estimatedReach);
  });

  it('should fetch daily estimated reach when toEstimate has budget', async () => {
    const toEstimate = { id: 'post1', budget: 100, duration: 7 };
    const estimatedReach = { min: 200, max: 800 };

    // Add delay to the mock to test loading state
    nock('http://localhost:3000')
      .post('/graphql', {
        query: BOOST_ESTIMATED_REACH_DAILY,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      })
      .delay(100)
      .reply(200, {
        data: {
          boostEstimatedReachDaily: estimatedReach,
        },
      });

    const { result } = renderHook(() => useCampaignMutation({ toEstimate }), {
      wrapper: Wrapper,
    });

    // Should be loading initially
    expect(result.current.isLoadingEstimate).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEstimate).toBe(false);
    });

    expect(result.current.estimatedReach).toEqual(estimatedReach);
  });

  it('should handle boost post success with referenceId', async () => {
    const onBoostSuccess = jest.fn();
    const boostData = {
      transactionId: 'tx123',
      referenceId: 'ref456',
      balance: { amount: 900 },
    };

    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        data: {
          startPostBoost: boostData,
        },
      },
    });

    const { result } = renderHook(
      () => useCampaignMutation({ onBoostSuccess }),
      { wrapper: Wrapper },
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    await result.current.onBoostPost({
      id: 'post1',
      budget: 100,
      duration: 7,
    });

    await waitForNock();

    // Check user balance update
    expect(mockUpdateUser).toHaveBeenCalledWith({
      ...user,
      balance: { amount: 900 },
    });

    // Check query invalidation
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: generateQueryKey(RequestKey.Transactions, user),
      exact: false,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: generateQueryKey(RequestKey.PostCampaigns, user),
      exact: false,
    });

    // Check post cache update
    expect(mockUpdatePostCache).toHaveBeenCalledWith(
      queryClient,
      'post1',
      expect.any(Function),
    );

    // Check success callback
    expect(onBoostSuccess).toHaveBeenCalled();
  });

  it('should handle boost post success without referenceId', async () => {
    const onBoostSuccess = jest.fn();
    const boostData = {
      transactionId: 'tx123',
      balance: { amount: 900 },
    };

    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        data: {
          startPostBoost: boostData,
        },
      },
    });

    const { result } = renderHook(
      () => useCampaignMutation({ onBoostSuccess }),
      { wrapper: Wrapper },
    );

    await result.current.onBoostPost({
      id: 'post1',
      budget: 100,
      duration: 7,
    });

    await waitForNock();

    // Post cache should not be updated without referenceId
    expect(mockUpdatePostCache).not.toHaveBeenCalled();
    expect(onBoostSuccess).toHaveBeenCalled();
  });

  it('should not update user when boost post success has no transactionId', async () => {
    const onBoostSuccess = jest.fn();
    const boostData = {};

    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        data: {
          startPostBoost: boostData,
        },
      },
    });

    const { result } = renderHook(
      () => useCampaignMutation({ onBoostSuccess }),
      { wrapper: Wrapper },
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    await result.current.onBoostPost({
      id: 'post1',
      budget: 100,
      duration: 7,
    });

    await waitForNock();

    // Should not update user or invalidate queries without transactionId
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(mockUpdatePostCache).not.toHaveBeenCalled();
    expect(onBoostSuccess).not.toHaveBeenCalled();
  });

  it('should handle boost post error', async () => {
    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        errors: [{ message: 'Insufficient balance' }],
      },
    });

    const { result } = renderHook(() => useCampaignMutation(), {
      wrapper: Wrapper,
    });

    await expect(
      result.current.onBoostPost({
        id: 'post1',
        budget: 100,
        duration: 7,
      }),
    ).rejects.toThrow();

    await waitForNock();

    expect(mockTransactionError).toHaveBeenCalled();
  });

  it('should handle cancel boost success', async () => {
    const onCancelSuccess = jest.fn();
    const cancelData = {
      transactionId: 'tx456',
      balance: { amount: 1100 },
    };

    mockGraphQL({
      request: {
        query: STOP_CAMPAIGN,
        variables: { postId: 'post1' },
      },
      result: {
        data: {
          cancelPostBoost: cancelData,
        },
      },
    });

    const { result } = renderHook(
      () => useCampaignMutation({ onCancelSuccess }),
      { wrapper: Wrapper },
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    expect(result.current.isLoadingCancel).toBe(false);

    await result.current.onCancelBoost('post1');

    await waitForNock();

    // Check user balance update
    expect(mockUpdateUser).toHaveBeenCalledWith({
      ...user,
      balance: { amount: 1100 },
    });

    // Check query invalidation
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: generateQueryKey(RequestKey.Transactions, user),
      exact: false,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: generateQueryKey(RequestKey.PostCampaigns, user),
      exact: false,
    });

    // Check toast notification
    expect(mockDisplayToast).toHaveBeenCalledWith('Post boost canceled!');

    // Check success callback
    expect(onCancelSuccess).toHaveBeenCalled();
  });

  it('should not update user when cancel boost success has no transactionId', async () => {
    const onCancelSuccess = jest.fn();
    const cancelData = {};

    mockGraphQL({
      request: {
        query: STOP_CAMPAIGN,
        variables: { postId: 'post1' },
      },
      result: {
        data: {
          cancelPostBoost: cancelData,
        },
      },
    });

    const { result } = renderHook(
      () => useCampaignMutation({ onCancelSuccess }),
      { wrapper: Wrapper },
    );

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    await result.current.onCancelBoost('post1');

    await waitForNock();

    // Should not update user or invalidate queries without transactionId
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(mockDisplayToast).not.toHaveBeenCalled();
    expect(onCancelSuccess).not.toHaveBeenCalled();
  });

  it('should update post cache correctly when boost post succeeds', async () => {
    const boostData = {
      transactionId: 'tx123',
      referenceId: 'campaign456',
      balance: { amount: 900 },
    };

    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        data: {
          startPostBoost: boostData,
        },
      },
    });

    const { result } = renderHook(() => useCampaignMutation(), {
      wrapper: Wrapper,
    });

    await result.current.onBoostPost({
      id: 'post1',
      budget: 100,
      duration: 7,
    });

    await waitForNock();

    expect(mockUpdatePostCache).toHaveBeenCalledWith(
      queryClient,
      'post1',
      expect.any(Function),
    );

    // Test the cache update function
    const updateFunction = mockUpdatePostCache.mock.calls[0][2] as (
      post: any,
    ) => any;
    const mockPost = { flags: { someFlag: true } };
    const updatedPost = updateFunction(mockPost);

    expect(updatedPost).toEqual({
      flags: { ...mockPost.flags, campaignId: 'campaign456' },
    });
  });

  it('should handle null balance in boost post success', async () => {
    const boostData = {
      transactionId: 'tx123',
      referenceId: 'ref456',
      balance: null,
    };

    mockGraphQL({
      request: {
        query: START_CAMPAIGN,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      },
      result: {
        data: {
          startPostBoost: boostData,
        },
      },
    });

    const { result } = renderHook(() => useCampaignMutation(), {
      wrapper: Wrapper,
    });

    await result.current.onBoostPost({
      id: 'post1',
      budget: 100,
      duration: 7,
    });

    await waitForNock();

    // Should not update user when balance is null
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should handle undefined balance in cancel boost success', async () => {
    const cancelData = {
      transactionId: 'tx456',
      balance: undefined,
    };

    mockGraphQL({
      request: {
        query: STOP_CAMPAIGN,
        variables: { postId: 'post1' },
      },
      result: {
        data: {
          cancelPostBoost: cancelData,
        },
      },
    });

    const { result } = renderHook(() => useCampaignMutation(), {
      wrapper: Wrapper,
    });

    await result.current.onCancelBoost('post1');

    await waitForNock();

    // Should not update user when balance is undefined
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should use correct query key for estimated reach', async () => {
    const toEstimate = { id: 'post1' };
    const estimatedReach = { min: 100, max: 500 };

    // Mock the GraphQL request
    nock('http://localhost:3000')
      .post('/graphql', {
        query: BOOST_ESTIMATED_REACH,
        variables: { postId: 'post1' },
      })
      .reply(200, {
        data: {
          boostEstimatedReach: estimatedReach,
        },
      });

    const { result } = renderHook(() => useCampaignMutation({ toEstimate }), {
      wrapper: Wrapper,
    });

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoadingEstimate).toBe(false);
    });

    // Verify the estimated reach was fetched correctly
    expect(result.current.estimatedReach).toEqual(estimatedReach);
  });

  it('should use correct query key for estimated reach with budget', async () => {
    const toEstimate = { id: 'post1', budget: 100, duration: 7 };
    const estimatedReach = { min: 300, max: 900 };

    // Mock the GraphQL request for daily estimated reach
    nock('http://localhost:3000')
      .post('/graphql', {
        query: BOOST_ESTIMATED_REACH_DAILY,
        variables: { postId: 'post1', budget: 100, duration: 7 },
      })
      .reply(200, {
        data: {
          boostEstimatedReachDaily: estimatedReach,
        },
      });

    const { result } = renderHook(() => useCampaignMutation({ toEstimate }), {
      wrapper: Wrapper,
    });

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoadingEstimate).toBe(false);
    });

    // Verify the estimated reach was fetched correctly using the daily endpoint
    expect(result.current.estimatedReach).toEqual(estimatedReach);
  });
});
