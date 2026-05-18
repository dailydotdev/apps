import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize } from '../useViewSize';
import { useLayoutVariant } from './useLayoutVariant';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../useViewSize', () => {
  const actual = jest.requireActual('../useViewSize');
  return { ...actual, useViewSize: jest.fn() };
});
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockedUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockedUseViewSize = useViewSize as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;

describe('useLayoutVariant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthContext.mockReturnValue({ isAuthReady: true });
    mockedUseViewSize.mockReturnValue(true);
    mockedUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
  });

  it('returns isV2 true when flag is on and user is eligible', () => {
    mockedUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.isV2).toBe(true);
  });

  it('returns isV2 false when flag is off', () => {
    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.isV2).toBe(false);
  });

  it('does not evaluate the flag below tablet', () => {
    mockedUseViewSize.mockReturnValue(false);

    const { result } = renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
    expect(result.current.isV2).toBe(false);
  });

  it('does not evaluate the flag before auth is ready', () => {
    mockedUseAuthContext.mockReturnValue({ isAuthReady: false });

    const { result } = renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
    expect(result.current.isV2).toBe(false);
  });

  it('keeps isV2 false even if flag returns true when user is ineligible', () => {
    mockedUseViewSize.mockReturnValue(false);
    mockedUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.isV2).toBe(false);
  });

  it('evaluates the flag when tablet+ and auth is ready', () => {
    renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: true }),
    );
  });
});
