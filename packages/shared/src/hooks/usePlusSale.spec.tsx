import { renderHook } from '@testing-library/react';
import { usePlusSale } from './usePlusSale';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';
import { useAuthContext } from '../contexts/AuthContext';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import type { PlusSaleConfig } from '../lib/featureManagement';
import { featurePlusSale } from '../lib/featureManagement';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('./usePlusSubscription', () => ({
  usePlusSubscription: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../lib/ios', () => ({
  iOSSupportsPlusPurchase: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.MockedFunction<
  typeof useConditionalFeature
>;
const mockUsePlusSubscription = usePlusSubscription as jest.MockedFunction<
  typeof usePlusSubscription
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockIOSSupportsPlusPurchase =
  iOSSupportsPlusPurchase as jest.MockedFunction<
    typeof iOSSupportsPlusPurchase
  >;

const runningSale: PlusSaleConfig = {
  enabled: true,
  discountId: 'dsc_summer',
  code: 'SUMMER50',
  label: '50% off',
  headline: 'Summer sale: 50% off Plus',
  description: 'Code SUMMER50 is already applied. Offer ends August 31.',
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mirrors the real hook: the committed default (a disabled sale) is returned
// until GrowthBook is both ready and allowed to evaluate.
const setSale = (config: PlusSaleConfig) => {
  mockUseConditionalFeature.mockImplementation(
    ({ shouldEvaluate }) =>
      ({
        value: shouldEvaluate ? config : featurePlusSale.defaultValue,
        isLoading: !shouldEvaluate,
      } as never),
  );
};

describe('usePlusSale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ isAuthReady: true } as never);
    mockUsePlusSubscription.mockReturnValue({ isPlus: false } as never);
    mockIOSSupportsPlusPurchase.mockReturnValue(false);
    setSale(runningSale);
  });

  it('is active for a running sale and exposes its copy', () => {
    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(true);
    expect(result.current.discountId).toBe('dsc_summer');
    expect(result.current.label).toBe('50% off');
    expect(result.current.headline).toBe('Summer sale: 50% off Plus');
  });

  it('is inactive while the flag is off', () => {
    setSale({ ...runningSale, enabled: false });

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('is inactive without a discount to apply', () => {
    setSale({ ...runningSale, discountId: '' });

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('is inactive once the end date has passed', () => {
    setSale({
      ...runningSale,
      endDate: new Date(Date.now() - 1000).toISOString(),
    });

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('is inactive for Plus members and skips the flag evaluation', () => {
    mockUsePlusSubscription.mockReturnValue({ isPlus: true } as never);

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      false,
    );
  });

  it('is inactive on iOS, where StoreKit cannot apply a Paddle discount', () => {
    mockIOSSupportsPlusPurchase.mockReturnValue(true);

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('skips the flag evaluation until auth is ready', () => {
    mockUseAuthContext.mockReturnValue({ isAuthReady: false } as never);

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
    expect(mockUseConditionalFeature.mock.calls[0][0].shouldEvaluate).toBe(
      false,
    );
  });
});
