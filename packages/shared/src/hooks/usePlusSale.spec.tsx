import { renderHook } from '@testing-library/react';
import { usePlusSale } from './usePlusSale';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';
import { useAuthContext } from '../contexts/AuthContext';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import { plusSaleCampaign } from '../lib/plus';

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

// The campaign is a shipped constant, so the spec drives its fields directly
// instead of going through the flag payload.
jest.mock('../lib/plus', () => ({
  plusSaleCampaign: {
    discountId: 'dsc_summer',
    code: 'SUMMER50',
    label: '50% off',
    headline: 'Summer sale: 50% off Plus',
    description: 'Code SUMMER50 is already applied. Offer ends August 31.',
    endDate: '2026-09-01T00:00:00.000Z',
  },
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

const campaign = plusSaleCampaign as { discountId: string; endDate: string };
const originalCampaign = { ...campaign };

// Mirrors the real hook: the committed default (off) is returned until
// GrowthBook is both ready and allowed to evaluate.
const setFlag = (enabled: boolean) => {
  mockUseConditionalFeature.mockImplementation(
    ({ shouldEvaluate }) =>
      ({
        value: shouldEvaluate ? enabled : false,
        isLoading: !shouldEvaluate,
      } as never),
  );
};

describe('usePlusSale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(campaign, originalCampaign);
    mockUseAuthContext.mockReturnValue({ isAuthReady: true } as never);
    mockUsePlusSubscription.mockReturnValue({ isPlus: false } as never);
    mockIOSSupportsPlusPurchase.mockReturnValue(false);
    setFlag(true);
  });

  it('is active while the flag is on and exposes the campaign copy', () => {
    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(true);
    expect(result.current.discountId).toBe('dsc_summer');
    expect(result.current.label).toBe('50% off');
    expect(result.current.headline).toBe('Summer sale: 50% off Plus');
  });

  it('is inactive while the flag is off', () => {
    setFlag(false);

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('is inactive without a discount to apply', () => {
    campaign.discountId = '';

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('is inactive once the end date has passed', () => {
    campaign.endDate = new Date(Date.now() - 1000).toISOString();

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
