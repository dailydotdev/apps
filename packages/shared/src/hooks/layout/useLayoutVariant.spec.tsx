import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { LayoutVariantContext } from '../../contexts/LayoutVariantContext';
import type { LayoutVariant } from '../../lib/layoutVariant';
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

  it('does not evaluate the flag below laptop', () => {
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

  it('evaluates the flag when laptop+ and auth is ready', () => {
    renderHook(() => useLayoutVariant());

    expect(mockedUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: true }),
    );
  });
});

describe('useLayoutVariant with a server-resolved shell', () => {
  const wrapper = (variant: LayoutVariant) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutVariantContext.Provider value={variant}>
        {children}
      </LayoutVariantContext.Provider>
    );
    Wrapper.displayName = 'LayoutVariantWrapper';

    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthContext.mockReturnValue({ isAuthReady: true });
    mockedUseViewSize.mockReturnValue(true);
  });

  it('keeps the painted shell while the flag is still resolving', () => {
    mockedUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useLayoutVariant(), {
      wrapper: wrapper('v2'),
    });

    expect(result.current).toEqual({ isV2: true, isLoading: false });
  });

  it('holds the shell through the first client render', () => {
    mockedUseAuthContext.mockReturnValue({ isAuthReady: false });
    mockedUseViewSize.mockReturnValue(false);
    mockedUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useLayoutVariant(), {
      wrapper: wrapper('v2'),
    });

    expect(result.current.isV2).toBe(true);
  });

  it('drops the shell once the flag resolves against it', () => {
    mockedUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useLayoutVariant(), {
      wrapper: wrapper('v2'),
    });

    expect(result.current.isV2).toBe(false);
  });

  it('keeps the shell when the flag agrees', () => {
    mockedUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useLayoutVariant(), {
      wrapper: wrapper('v2'),
    });

    expect(result.current.isV2).toBe(true);
  });

  it('drops the shell below laptop once auth has resolved', () => {
    mockedUseViewSize.mockReturnValue(false);
    mockedUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: true,
    });

    const { result } = renderHook(() => useLayoutVariant(), {
      wrapper: wrapper('v2'),
    });

    expect(result.current.isV2).toBe(false);
  });
});
