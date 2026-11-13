import { renderHook } from '@testing-library/react';
import { useStreakSoftBreak } from './useStreakSoftBreak';

let mockReady = false;
let mockSettled = false;
let mockFlagValue = false;

jest.mock('../../components/GrowthBookProvider', () => ({
  useFeaturesReadyContext: () => ({
    ready: mockReady,
    settled: mockSettled,
  }),
}));

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: ({
    shouldEvaluate,
  }: {
    shouldEvaluate?: boolean;
  }) => ({
    value: shouldEvaluate !== false && mockReady && mockFlagValue,
    isLoading: !(shouldEvaluate !== false && mockReady),
  }),
}));

const broken = { current: 0, max: 12 };

describe('useStreakSoftBreak', () => {
  beforeEach(() => {
    mockReady = false;
    mockSettled = false;
    mockFlagValue = false;
  });

  it('should wait while GrowthBook has not settled', () => {
    const { result } = renderHook(() => useStreakSoftBreak(broken));

    expect(result.current).toEqual({ isSoftBreak: false, isLoading: true });
  });

  it('should fall back to control when the boot settles without features', () => {
    mockSettled = true;

    const { result } = renderHook(() => useStreakSoftBreak(broken));

    expect(result.current).toEqual({ isSoftBreak: false, isLoading: false });
  });

  it('should return the variant once the features are ready', () => {
    mockReady = true;
    mockSettled = true;
    mockFlagValue = true;

    const { result } = renderHook(() => useStreakSoftBreak(broken));

    expect(result.current).toEqual({ isSoftBreak: true, isLoading: false });
  });

  it('should never wait for a live streak', () => {
    const { result } = renderHook(() =>
      useStreakSoftBreak({ current: 3, max: 12 }),
    );

    expect(result.current).toEqual({ isSoftBreak: false, isLoading: false });
  });
});
