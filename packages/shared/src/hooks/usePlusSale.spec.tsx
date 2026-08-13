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

jest.mock('../lib/plus', () => ({
  plusSaleCampaign: {
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

const campaign = plusSaleCampaign as { endDate: string };
const originalEndDate = campaign.endDate;

// Mirrors the real hook: the committed default (no discount) is returned until
// GrowthBook is both ready and allowed to evaluate.
const setFlag = (discountId: string) => {
  mockUseConditionalFeature.mockImplementation(
    ({ shouldEvaluate }) =>
      ({
        value: shouldEvaluate ? discountId : '',
        isLoading: !shouldEvaluate,
      } as never),
  );
};

describe('usePlusSale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    campaign.endDate = originalEndDate;
    mockUseAuthContext.mockReturnValue({ isAuthReady: true } as never);
    mockUsePlusSubscription.mockReturnValue({ isPlus: false } as never);
    mockIOSSupportsPlusPurchase.mockReturnValue(false);
    setFlag('dsc_summer');
  });

  it('is active with a discount from the flag and exposes the campaign copy', () => {
    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(true);
    expect(result.current.discountId).toBe('dsc_summer');
    expect(result.current.label).toBe('50% off');
    expect(result.current.headline).toBe('Summer sale: 50% off Plus');
  });

  it('is inactive while the flag holds no discount', () => {
    setFlag('');

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.isActive).toBe(false);
  });

  it('withholds the discount whenever the sale is not active', () => {
    mockIOSSupportsPlusPurchase.mockReturnValue(true);

    const { result } = renderHook(() => usePlusSale());

    expect(result.current.discountId).toBeUndefined();
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
