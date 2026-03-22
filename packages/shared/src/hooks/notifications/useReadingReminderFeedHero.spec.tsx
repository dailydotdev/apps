import { act, renderHook } from '@testing-library/react';
import { NotificationCtaPlacement } from '../../lib/log';
import { useReadingReminderHero } from './useReadingReminderHero';
import { useReadingReminderVariation } from './useReadingReminderVariation';
import { useReadingReminderFeedHero } from './useReadingReminderFeedHero';
import {
  getReadingReminderCtaParams,
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';

const mockUseRouter = jest.fn();
const mockUseReadingReminderHero = jest.fn();
const mockUseReadingReminderVariation = jest.fn();
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

jest.mock('./useReadingReminderVariation', () => ({
  useReadingReminderVariation: jest.fn(),
  ReadingReminderVariation: {
    Control: 'control',
    Hero: 'hero',
    Inline: 'inline',
  },
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
      shouldShowDismiss: true,
      onEnable,
      onDismiss,
    });
    mockUseReadingReminderVariation.mockReturnValue({
      variation: 'control',
      isControl: true,
      isHero: false,
      isInline: false,
    });
    mockUseNotificationCtaAnalytics.mockReturnValue({
      logClick,
      logDismiss,
    });

    (useReadingReminderHero as jest.Mock).mockImplementation(
      mockUseReadingReminderHero,
    );
    (useReadingReminderVariation as jest.Mock).mockImplementation(
      mockUseReadingReminderVariation,
    );
    (useNotificationCtaAnalytics as jest.Mock).mockImplementation(
      mockUseNotificationCtaAnalytics,
    );
  });

  it('should not show top or inline hero for control variation', () => {
    const { result } = renderHook(() =>
      useReadingReminderFeedHero({ itemCount: 10, itemsPerRow: 2 }),
    );

    expect(result.current.shouldShowTopHero).toBe(false);
    expect(result.current.shouldShowInFeedHero).toBe(false);
  });

  it('should show the top hero variation on the homepage', async () => {
    mockUseReadingReminderVariation.mockReturnValue({
      variation: 'hero',
      isControl: false,
      isHero: true,
      isInline: false,
    });

    const { result } = renderHook(() =>
      useReadingReminderFeedHero({ itemCount: 10, itemsPerRow: 2 }),
    );

    expect(result.current.shouldShowTopHero).toBe(true);
    expect(result.current.shouldShowInFeedHero).toBe(false);

    await act(async () => {
      await result.current.onEnableHero(NotificationCtaPlacement.TopHero);
    });

    expect(logClick).toHaveBeenCalledWith(
      getReadingReminderCtaParams(NotificationCtaPlacement.TopHero),
    );
    expect(onEnable).toHaveBeenCalledTimes(1);
  });

  it('should show the inline variation only after scroll', () => {
    mockUseReadingReminderVariation.mockReturnValue({
      variation: 'inline',
      isControl: false,
      isHero: false,
      isInline: true,
    });

    const { result } = renderHook(() =>
      useReadingReminderFeedHero({ itemCount: 10, itemsPerRow: 2 }),
    );

    expect(result.current.shouldShowTopHero).toBe(false);
    expect(result.current.shouldShowInFeedHero).toBe(false);

    act(() => {
      window.scrollY = 350;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.shouldShowInFeedHero).toBe(true);
    expect(useNotificationCtaImpression).toHaveBeenCalledWith(
      getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero),
      true,
    );
  });

  it('should not show the inline variation when there are not enough items', () => {
    mockUseReadingReminderVariation.mockReturnValue({
      variation: 'inline',
      isControl: false,
      isHero: false,
      isInline: true,
    });

    const { result } = renderHook(() =>
      useReadingReminderFeedHero({ itemCount: 6, itemsPerRow: 1 }),
    );

    act(() => {
      window.scrollY = 350;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.shouldShowInFeedHero).toBe(false);
  });

  it('should not show either variation off the homepage', () => {
    mockUseRouter.mockReturnValue({ pathname: '/bookmarks' });

    const { result } = renderHook(() =>
      useReadingReminderFeedHero({ itemCount: 10, itemsPerRow: 2 }),
    );

    expect(result.current.shouldShowTopHero).toBe(false);
    expect(result.current.shouldShowInFeedHero).toBe(false);
  });
});
