import { renderHook } from '@testing-library/react';
import { useEngagementBarV2 } from './useEngagementBarV2';
import { useConditionalFeature } from './useConditionalFeature';
import { useAuthContext } from '../contexts/AuthContext';
import loggedUser from '../../__tests__/fixture/loggedUser';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.MockedFunction<
  typeof useConditionalFeature
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;

describe('useEngagementBarV2', () => {
  beforeEach(() => {
    mockUseConditionalFeature.mockReset();
    mockUseAuthContext.mockReset();
  });

  // `useConditionalFeature` returns the feature's default value
  // (`false` for engagement_bar_v2) when `shouldEvaluate` is false and
  // the resolved value otherwise. Mimic that behaviour so the spec
  // exercises the real semantics, not just a constant return.
  const setFeature = (value: boolean) => {
    mockUseConditionalFeature.mockImplementation(({ shouldEvaluate }) => ({
      value: shouldEvaluate ? value : false,
      isLoading: false,
    }));
  };

  it('skips the flag evaluation when auth is not ready', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: false,
      user: loggedUser,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useEngagementBarV2());

    expect(result.current).toBe(false);
    const call = mockUseConditionalFeature.mock.calls[0][0];
    expect(call.shouldEvaluate).toBe(false);
  });

  it('skips the flag evaluation for anonymous users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: null,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useEngagementBarV2());

    expect(result.current).toBe(false);
    const call = mockUseConditionalFeature.mock.calls[0][0];
    expect(call.shouldEvaluate).toBe(false);
  });

  it('evaluates and returns true for logged-in users when the flag is enabled', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: loggedUser,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useEngagementBarV2());

    expect(result.current).toBe(true);
    const call = mockUseConditionalFeature.mock.calls[0][0];
    expect(call.shouldEvaluate).toBe(true);
  });

  it('evaluates and returns false for logged-in users when the flag is disabled', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: loggedUser,
    } as never);
    setFeature(false);

    const { result } = renderHook(() => useEngagementBarV2());

    expect(result.current).toBe(false);
    const call = mockUseConditionalFeature.mock.calls[0][0];
    expect(call.shouldEvaluate).toBe(true);
  });
});
