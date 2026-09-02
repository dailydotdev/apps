import { act, renderHook } from '@testing-library/react';
import { NotificationCtaPlacement } from '../../lib/log';
import { useReadingReminderHero } from './useReadingReminderHero';
import { useReadingReminderFeedHero } from './useReadingReminderFeedHero';
import {
  getReadingReminderCtaParams,
  useNotificationCtaAnalytics,
} from './useNotificationCtaAnalytics';

const mockUseRouter = jest.fn();
const mockUseReadingReminderHero = jest.fn();
const mockUseNotificationCtaAnalytics = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: '/',
}));

jest.mock('./useReadingReminderHero', () => ({
  useReadingReminderHero: jest.fn(),
}));

jest.mock('./useNotificationCtaAnalytics', () => ({
  getReadingReminderCtaParams: jest.fn((placement) => ({ placement })),
  useNotificationCtaAnalytics: jest.fn(),
  useNotificationCtaImpression: jest.fn(),
}));

describe('useReadingReminderFeedHero', () => {
  const onEnable = jest.fn(() => Promise.resolve());
  const onDismiss = jest.fn(() => Promise.resolve());
  const logClick = jest.fn();
  const logDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });

    mockUseRouter.mockReturnValue({ pathname: '/' });
    mockUseReadingReminderHero.mockReturnValue({
      shouldShow: true,
      title: 'Title',
      subtitle: 'Subtitle',
      onEnable,
      onDismiss,
    });
    mockUseNotificationCtaAnalytics.mockReturnValue({
      logClick,
      logDismiss,
    });

    (useReadingReminderHero as jest.Mock).mockImplementation(
      mockUseReadingReminderHero,
    );
    (useNotificationCtaAnalytics as jest.Mock).mockImplementation(
      mockUseNotificationCtaAnalytics,
    );
  });

  it('should show the top hero on the homepage', async () => {
    const { result } = renderHook(() => useReadingReminderFeedHero());

    expect(result.current.shouldShowTopHero).toBe(true);

    await act(async () => {
      await result.current.onEnableHero();
    });

    expect(logClick).toHaveBeenCalledWith(
      getReadingReminderCtaParams(NotificationCtaPlacement.TopHero),
    );
    expect(onEnable).toHaveBeenCalledTimes(1);
  });

  it('should suppress the top hero when disabled by the parent layout', () => {
    const { result } = renderHook(() =>
      useReadingReminderFeedHero({
        disableTopHero: true,
      }),
    );

    expect(result.current.shouldShowTopHero).toBe(false);
  });

  it('should not show the top hero off the homepage', () => {
    mockUseRouter.mockReturnValue({ pathname: '/bookmarks' });

    const { result } = renderHook(() => useReadingReminderFeedHero());

    expect(result.current.shouldShowTopHero).toBe(false);
  });
});
