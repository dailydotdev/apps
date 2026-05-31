import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAnonymousPostExperience } from './useAnonymousPostExperience';
import loggedUser from '../../../__tests__/fixture/loggedUser';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockUseAuthContext = jest.mocked(useAuthContext);

describe('useAnonymousPostExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the post page experience on even while auth is not ready', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: false,
      user: undefined,
    } as never);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(false);
    expect(result.current.isPostPageExperience).toBe(true);
  });

  it('keeps layout changes on for logged-in users without anonymous CTAs', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: loggedUser,
    } as never);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(false);
    expect(result.current.isPostPageExperience).toBe(true);
  });

  it('returns the anonymous experience for logged-out users by default', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      user: undefined,
    } as never);

    const { result } = renderHook(() => useAnonymousPostExperience());

    expect(result.current.isAnonPostExperience).toBe(true);
    expect(result.current.isPostPageExperience).toBe(true);
  });
});
