import { renderHook } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { iOSSupportsReview } from '../lib/ios';
import { isIOSNative } from '../lib/func';
import { useBoot } from './useBoot';
import { useLazyModal } from './useLazyModal';
import { useIsBootPopupsPaused } from '../lib/bootPopupsPause';
import { LazyModal } from '../components/modals/common/types';
import type { MarketingCta } from '../components/marketing/cta/common';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { isPostUrl, useAppStoreReviewPrompt } from './useAppStoreReviewPrompt';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
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
jest.mock('./useLazyModal', () => ({ useLazyModal: jest.fn() }));
jest.mock('../lib/bootPopupsPause', () => ({
  useIsBootPopupsPaused: jest.fn(),
}));

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

const openModal = jest.fn();
let routeHandlers: Record<string, (url: string) => void>;
// Next hands out a new router object per navigation but keeps one emitter.
const events = {
  on: jest.fn((event: string, handler: (url: string) => void) => {
    routeHandlers[event] = handler;
  }),
  off: jest.fn((event: string) => {
    delete routeHandlers[event];
  }),
  emit: jest.fn(),
};

const mockRouter = (asPath = '/'): NextRouter =>
  ({ asPath, events }) as unknown as NextRouter;

const clearMarketingCta = jest.fn();

const mockCtas = (ctas: MarketingCta[]) =>
  jest.mocked(useBoot).mockReturnValue({
    getMarketingCta: (variant: MarketingCtaVariant) =>
      ctas.find((cta) => cta.variant === variant) ?? null,
    clearMarketingCta,
  } as unknown as ReturnType<typeof useBoot>);

const navigate = (url: string) => routeHandlers.routeChangeComplete?.(url);

describe('isPostUrl', () => {
  it('matches post pages on either layout', () => {
    expect(isPostUrl('/posts/abc123')).toBe(true);
    expect(isPostUrl('/posts/abc123?ref=share#comments')).toBe(true);
    expect(isPostUrl('/layout-v2/posts/abc123')).toBe(true);
    expect(isPostUrl('/')).toBe(false);
    expect(isPostUrl('/popular')).toBe(false);
    expect(isPostUrl('/squads/watercooler')).toBe(false);
  });
});

describe('useAppStoreReviewPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routeHandlers = {};
    jest.mocked(useRouter).mockReturnValue(mockRouter());
    jest.mocked(useAuthContext).mockReturnValue({
      user: loggedUser,
    } as unknown as ReturnType<typeof useAuthContext>);
    jest.mocked(useFeature).mockReturnValue(true);
    jest.mocked(iOSSupportsReview).mockReturnValue(true);
    jest.mocked(isIOSNative).mockReturnValue(true);
    jest.mocked(useIsBootPopupsPaused).mockReturnValue(false);
    mockCtas([marketingCta]);
    jest.mocked(useLazyModal).mockReturnValue({
      openModal,
      closeModal: jest.fn(),
      modal: null,
    } as unknown as ReturnType<typeof useLazyModal>);
  });

  it('asks once, when a post is left for the feed', () => {
    renderHook(() => useAppStoreReviewPrompt());

    navigate('/popular');
    expect(openModal).not.toHaveBeenCalled();

    navigate('/posts/abc123');
    expect(openModal).not.toHaveBeenCalled();

    navigate('/posts/def456');
    expect(openModal).not.toHaveBeenCalled();

    navigate('/');
    expect(openModal).toHaveBeenCalledTimes(1);
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.AppStoreReview,
      props: { marketingCta },
    });

    navigate('/posts/ghi789');
    navigate('/');
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('asks when the app opened on a post page', () => {
    jest.mocked(useRouter).mockReturnValue(mockRouter('/posts/abc123'));
    renderHook(() => useAppStoreReviewPrompt());

    navigate('/');
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('keeps one listener while the router object changes', () => {
    const { rerender } = renderHook(() => useAppStoreReviewPrompt());

    navigate('/posts/abc123');
    jest.mocked(useRouter).mockReturnValue(mockRouter('/posts/abc123'));
    rerender();
    expect(events.on).toHaveBeenCalledTimes(1);

    navigate('/');
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('opens the Plus thank-you for a member', () => {
    mockCtas([plusCta]);
    jest.mocked(useAuthContext).mockReturnValue({
      user: { ...loggedUser, isPlus: true },
    } as unknown as ReturnType<typeof useAuthContext>);
    renderHook(() => useAppStoreReviewPrompt());

    navigate('/posts/abc123');
    navigate('/');
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.AppStoreReviewPlus,
      props: { marketingCta: plusCta },
    });
  });

  it('clears a Plus thank-you aimed at someone without Plus', () => {
    mockCtas([plusCta]);
    renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeUndefined();
    expect(clearMarketingCta).toHaveBeenCalledWith(plusCta.campaignId);
  });

  it('keeps a plain ask for someone without Plus', () => {
    mockCtas([marketingCta]);
    renderHook(() => useAppStoreReviewPrompt());

    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('stays quiet on a page that pauses pop-ups', () => {
    jest.mocked(useIsBootPopupsPaused).mockReturnValue(true);
    renderHook(() => useAppStoreReviewPrompt());

    navigate('/posts/abc123');
    navigate('/squads/startup/setup');
    expect(openModal).not.toHaveBeenCalled();
  });

  it('waits while another modal is open', () => {
    jest.mocked(useLazyModal).mockReturnValue({
      openModal,
      closeModal: jest.fn(),
      modal: { type: LazyModal.NewStreak },
    } as unknown as ReturnType<typeof useLazyModal>);
    renderHook(() => useAppStoreReviewPrompt());

    navigate('/posts/abc123');
    navigate('/');
    expect(openModal).not.toHaveBeenCalled();
  });

  it('does nothing without a scheduled ask', () => {
    mockCtas([]);
    const { result } = renderHook(() => useAppStoreReviewPrompt());

    expect(result.current).toBeUndefined();
    expect(routeHandlers.routeChangeComplete).toBeUndefined();
  });

  it('clears the ask in an iOS app without the review bridge', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeUndefined();
    expect(clearMarketingCta).toHaveBeenCalledTimes(1);
    expect(clearMarketingCta).toHaveBeenCalledWith(marketingCta.campaignId);
  });

  it('clears a Plus thank-you in an iOS app without the review bridge', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    jest.mocked(useAuthContext).mockReturnValue({
      user: { ...loggedUser, isPlus: true },
    } as unknown as ReturnType<typeof useAuthContext>);
    mockCtas([plusCta]);
    renderHook(() => useAppStoreReviewPrompt());

    expect(openModal).not.toHaveBeenCalled();
    expect(clearMarketingCta).toHaveBeenCalledTimes(1);
    expect(clearMarketingCta).toHaveBeenCalledWith(plusCta.campaignId);
  });

  it('keeps the ask outside the iOS app', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    jest.mocked(isIOSNative).mockReturnValue(false);
    renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeUndefined();
    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('keeps the ask in an old iOS app while logged out', () => {
    jest.mocked(iOSSupportsReview).mockReturnValue(false);
    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthContext>);
    renderHook(() => useAppStoreReviewPrompt());

    expect(clearMarketingCta).not.toHaveBeenCalled();
  });

  it('does nothing when the feature is off', () => {
    jest.mocked(useFeature).mockReturnValue(false);
    renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeUndefined();
  });

  it('does nothing when logged out', () => {
    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthContext>);
    renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeUndefined();
  });

  it('stops listening on unmount', () => {
    const { unmount } = renderHook(() => useAppStoreReviewPrompt());

    expect(routeHandlers.routeChangeComplete).toBeDefined();
    unmount();
    expect(routeHandlers.routeChangeComplete).toBeUndefined();
  });
});
