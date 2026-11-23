import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { iOSSupportsReview } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import { useBoot } from './useBoot';
import type { MarketingCta } from '../components/marketing/cta/common';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { useAppStoreReviewPrompt } from './useAppStoreReviewPrompt';

jest.mock('../contexts/AuthContext', () => ({ useAuthContext: jest.fn() }));
jest.mock('../components/GrowthBookProvider', () => ({
  useFeature: jest.fn(),
}));
jest.mock('../lib/ios', () => ({
  ...jest.requireActual('../lib/ios'),
  iOSSupportsReview: jest.fn(),
}));
jest.mock('../lib/func', () => ({
  ...jest.requireActual('../lib/func'),
  isIOSNative: jest.fn(),
}));
jest.mock('./useBoot', () => ({ useBoot: jest.fn() }));

const marketingCta: MarketingCta = {
  campaignId: 'review-heavy-week',
  createdAt: new Date('2026-11-10T00:00:00.000Z'),
  variant: MarketingCtaVariant.AppStoreReview,
  flags: { title: '', ctaUrl: '', ctaText: '' },
};

const plusCta: MarketingCta = {
  ...marketingCta,
  campaignId: 'review-plus-renewal',
  variant: MarketingCtaVariant.AppStoreReviewPlus,
};

const clearMarketingCta = jest.fn();

const mockCtas = (ctas: MarketingCta[]) =>
  jest.mocked(useBoot).mockReturnValue({
    getMarketingCta: (variant: MarketingCtaVariant) =>
      ctas.find((cta) => cta.variant === variant) ?? null,
    clearMarketingCta,
  } as unknown as ReturnType<typeof useBoot>);

const mockUser = (user: typeof loggedUser | null) =>
  jest.mocked(useAuthContext).mockReturnValue({
    user,
  } as unknown as ReturnType<typeof useAuthContext>);

describe('useAppStoreReviewPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser(loggedUser);
    jest.mocked(useFeature).mockReturnValue(true);
    jest.mocked(iOSSupportsReview).mockReturnValue(true);
    jest.mocked(isIOSNative).mockReturnValue(true);
    mockCtas([marketingCta]);
  });

  it('returns the scheduled ask right away, with no navigation needed', () => {
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBe(marketingCta);
    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('returns the Plus thank-you for a member', () => {
    mockCtas([plusCta]);
    mockUser({ ...loggedUser, isPlus: true });
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBe(plusCta);
  });

  it('clears a Plus thank-you aimed at someone without Plus', () => {
    mockCtas([plusCta]);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
    expect(clearMarketingCta).toHaveBeenCalledWith(plusCta.campaignId);
  });

  it('returns nothing without a scheduled ask', () => {
    mockCtas([]);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
  });

  it('clears the ask in an iOS app without the review bridge', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
    expect(clearMarketingCta).toHaveBeenCalledTimes(1);
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
  });

  it('clears a Plus thank-you in an iOS app without the review bridge', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    mockUser({ ...loggedUser, isPlus: true });
    mockCtas([plusCta]);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
    expect(clearMarketingCta).toHaveBeenCalledTimes(1);
    expect(clearMarketingCta).toHaveBeenCalledWith(plusCta.campaignId);
  });

  it('keeps the ask outside the iOS app without showing it', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    jest.mocked(isIOSNative).mockReturnValue(false);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('keeps the ask in an old iOS app while logged out', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    mockUser(null);
    renderHook(() => useAppStoreReviewPrompt());

    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('returns nothing when the feature is off', () => {
    jest.mocked(useFeature).mockReturnValue(false);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
  });

  it('returns nothing when logged out', () => {
    mockUser(null);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeNull();
  });
});
