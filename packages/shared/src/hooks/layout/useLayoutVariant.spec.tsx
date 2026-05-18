import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize } from '../useViewSize';
import { LayoutVariant, useLayoutVariant } from './useLayoutVariant';

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
  });

  it('returns v1 when flag is v1', () => {
    mockedUseConditionalFeature.mockReturnValue({ value: LayoutVariant.V1 });

    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.variant).toBe(LayoutVariant.V1);
    expect(result.current.isV1).toBe(true);
    expect(result.current.isControl).toBe(false);
  });

  it('returns control when flag is control', () => {
    mockedUseConditionalFeature.mockReturnValue({
      value: LayoutVariant.Control,
    });

    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.variant).toBe(LayoutVariant.Control);
    expect(result.current.isControl).toBe(true);
    expect(result.current.isV1).toBe(false);
  });

  it('falls back to control for unexpected values', () => {
    mockedUseConditionalFeature.mockReturnValue({ value: 'something-else' });

    const { result } = renderHook(() => useLayoutVariant());

    expect(result.current.variant).toBe(LayoutVariant.Control);
    expect(result.current.isControl).toBe(true);
  });

  it('does not evaluate the flag below tablet', () => {
    mockedUseViewSize.mockReturnValue(false);
    mockedUseConditionalFeature.mockReturnValue({
      value: LayoutVariant.Control,
    });

    renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('does not evaluate the flag before auth is ready', () => {
    mockedUseAuthContext.mockReturnValue({ isAuthReady: false });
    mockedUseConditionalFeature.mockReturnValue({
      value: LayoutVariant.Control,
    });

    renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('evaluates the flag when tablet+ and auth is ready', () => {
    mockedUseConditionalFeature.mockReturnValue({ value: LayoutVariant.V1 });

    renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: true }),
    );
  });
});
