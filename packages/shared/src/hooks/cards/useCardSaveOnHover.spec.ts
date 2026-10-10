import { renderHook } from '@testing-library/react';
import { useCardSaveOnHover } from './useCardSaveOnHover';
import { useConditionalFeature } from '../useConditionalFeature';
import { useAuthContext } from '../../contexts/AuthContext';
import { featureCardSaveOnHover } from '../../lib/featureManagement';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const setUser = (loggedIn: boolean) =>
  jest.mocked(useAuthContext).mockReturnValue({
    isAuthReady: true,
    user: loggedIn ? { id: 'u1' } : undefined,
  } as unknown as ReturnType<typeof useAuthContext>);

const evaluated = () =>
  jest.mocked(useConditionalFeature).mock.calls.at(-1)?.[0].shouldEvaluate;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useConditionalFeature).mockReturnValue({
    value: true,
    isLoading: false,
  });
});

describe('useCardSaveOnHover', () => {
  it('evaluates the flag for a logged-in user', () => {
    setUser(true);
    const { result } = renderHook(() => useCardSaveOnHover());

    expect(evaluated()).toBe(true);
    expect(jest.mocked(useConditionalFeature)).toHaveBeenCalledWith(
      expect.objectContaining({ feature: featureCardSaveOnHover }),
    );
    expect(result.current).toBe(true);
  });

  it('never evaluates for anonymous visitors', () => {
    setUser(false);
    renderHook(() => useCardSaveOnHover());

    expect(evaluated()).toBe(false);
  });

  it('does not evaluate where the caller says it cannot matter', () => {
    setUser(true);
    renderHook(() => useCardSaveOnHover({ shouldEvaluate: false }));

    expect(evaluated()).toBe(false);
  });
});
