import { act, renderHook } from '@testing-library/react';
import { NotificationCtaPlacement } from '../../lib/log';
import { useReadingReminderHero } from './useReadingReminderHero';
import { useReadingReminderFeedHero } from './useReadingReminderFeedHero';
import {
  getReadingReminderCtaParams,
  getReadingReminderPushCtaParams,
  useNotificationCtaAnalytics,
} from './useNotificationCtaAnalytics';
import { readingReminderPushPromptCopy } from './useReadingReminderPushPrompt';
import { ReadingReminderHeroVariant } from '../../lib/featureManagement';

const mockUseRouter = jest.fn();
const mockUseReadingReminderHero = jest.fn();
const mockUseNotificationCtaAnalytics = jest.fn();
const mockUseReadingReminderPushPrompt = jest.fn();
const mockPersistentContext = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { timezone: 'UTC' } }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

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
  getReadingReminderPushCtaParams: jest.fn((placement) => ({
    placement,
    kind: 'push_cta',
  })),
  useNotificationCtaAnalytics: jest.fn(),
  useNotificationCtaImpression: jest.fn(),
}));

jest.mock('./useReadingReminderPushPrompt', () => ({
  readingReminderPushPromptCopy: {
    title: 'Paused title',
    heroSubtitle: 'Paused subtitle',
    cta: 'Turn on notifications',
  },
  useReadingReminderPushPrompt: (...args: unknown[]) =>
    mockUseReadingReminderPushPrompt(...args),
}));

jest.mock('../usePersistentContext', () => ({
  __esModule: true,
  PersistentContextKeys: {
    ReadingReminderPushPromptDismissed:
      'reading_reminder_push_prompt_dismissed',
  },
  default: (...args: unknown[]) => mockPersistentContext(...args),
}));

describe('useReadingReminderFeedHero', () => {
  const onEnable = jest.fn(() => Promise.resolve());
  const onDismiss = jest.fn(() => Promise.resolve());
  const onSchedule = jest.fn(() => Promise.resolve('granted'));
  const logClick = jest.fn();
  const logDismiss = jest.fn();
  const onEnablePush = jest.fn(() => Promise.resolve(true));
  const setPushPromptDismissed = jest.fn(() => Promise.resolve());

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
      variant: ReadingReminderHeroVariant.Control,
      title: 'Title',
      subtitle: 'Subtitle',
      onEnable,
      onSchedule,
      onDismiss,
    });
    mockUseNotificationCtaAnalytics.mockReturnValue({
      logClick,
      logDismiss,
    });
    mockUseReadingReminderPushPrompt.mockReturnValue({
      shouldShow: false,
      onEnable: onEnablePush,
    });
    mockPersistentContext.mockReturnValue([
      false,
      setPushPromptDismissed,
      true,
    ]);

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
    expect(mockUseReadingReminderHero).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('should not show the top hero off the homepage', () => {
    mockUseRouter.mockReturnValue({ pathname: '/bookmarks' });

    const { result } = renderHook(() => useReadingReminderFeedHero());

    expect(result.current.shouldShowTopHero).toBe(false);
  });

  it('should ask a paused reminder holder to turn on push instead', async () => {
    mockUseReadingReminderHero.mockReturnValue({
      shouldShow: false,
      title: 'Title',
      subtitle: 'Subtitle',
      onEnable,
      onDismiss,
    });
    mockUseReadingReminderPushPrompt.mockReturnValue({
      shouldShow: true,
      onEnable: onEnablePush,
    });

    const { result } = renderHook(() => useReadingReminderFeedHero());

    expect(result.current).toMatchObject({
      shouldShowTopHero: true,
      title: readingReminderPushPromptCopy.title,
      subtitle: readingReminderPushPromptCopy.heroSubtitle,
      ctaLabel: readingReminderPushPromptCopy.cta,
    });

    await act(async () => {
      await result.current.onEnableHero();
    });
    expect(onEnablePush).toHaveBeenCalledTimes(1);
    expect(onEnable).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onDismissHero();
    });
    expect(logDismiss).toHaveBeenCalledWith(
      getReadingReminderPushCtaParams(NotificationCtaPlacement.TopHero),
    );
    expect(setPushPromptDismissed).toHaveBeenCalledWith(true);
  });

  it('should not ask again once the push prompt was dismissed', () => {
    mockPersistentContext.mockReturnValue([true, setPushPromptDismissed, true]);

    renderHook(() => useReadingReminderFeedHero());

    expect(mockUseReadingReminderPushPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  describe('habit variant', () => {
    const renderHabit = () => {
      mockUseReadingReminderHero.mockReturnValue({
        shouldShow: true,
        variant: ReadingReminderHeroVariant.Habit,
        title: 'Title',
        subtitle: 'Subtitle',
        onEnable,
        onSchedule,
        onDismiss,
      });
      return renderHook(() => useReadingReminderFeedHero());
    };

    it('should not offer the redesign to the control', () => {
      const { result } = renderHook(() => useReadingReminderFeedHero());

      expect(result.current.habit).toBeUndefined();
    });

    it('should hold the slot to confirm a saved reminder', async () => {
      const { result } = renderHabit();

      expect(result.current.habit?.step).toBe('offer');

      await act(async () => {
        await result.current.habit?.onSend(20, 'now');
      });

      expect(onSchedule).toHaveBeenCalledWith(20);
      expect(onEnable).not.toHaveBeenCalled();
      expect(result.current.habit).toMatchObject({
        step: 'saved',
        savedHour: 20,
      });
      expect(result.current.shouldShowTopHero).toBe(true);
    });

    it('should show the way back when push is blocked', async () => {
      onSchedule.mockResolvedValueOnce('denied');
      const { result } = renderHabit();

      await act(async () => {
        await result.current.habit?.onSend(13, 'picked');
      });

      expect(result.current.habit?.step).toBe('denied');
    });

    it('should return to the offer when the prompt is closed', async () => {
      onSchedule.mockResolvedValueOnce('dismissed');
      const { result } = renderHabit();

      await act(async () => {
        await result.current.habit?.onSend(20, 'now');
      });

      expect(result.current.habit?.step).toBe('offer');
    });
  });
});
