import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { useAnonymousPostExperience } from './useAnonymousPostExperience';
import loggedUser from '../../../__tests__/fixture/loggedUser';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockUseAuthContext = jest.mocked(useAuthContext);
const mockUseConditionalFeature = jest.mocked(useConditionalFeature);

describe('useAnonymousPostExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setFeature = (value: boolean): void => {
    mockUseConditionalFeature.mockImplementation(({ shouldEvaluate }) => ({
      value: shouldEvaluate ? value : false,
      isLoading: false,
    }));
  };

  it('skips evaluation when auth is not ready', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: false,
      user: undefined,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(false);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      false,
    );
  });

  it('skips evaluation for logged-in users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: loggedUser,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(false);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      false,
    );
  });

  it('returns true for anonymous users when the flag is enabled', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: undefined,
    } as never);
    setFeature(true);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(true);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      true,
    );
  });

  it('returns false for anonymous users when the flag is disabled', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: undefined,
    } as never);
    setFeature(false);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(false);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      true,
    );
  });
});
