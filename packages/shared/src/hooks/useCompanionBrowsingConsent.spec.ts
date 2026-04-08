import { renderHook, act } from '@testing-library/react';
import { useCompanionBrowsingConsent } from './useCompanionBrowsingConsent';
import { useConditionalFeature } from './useConditionalFeature';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin } from '../lib/log';
import { SidebarSettingsFlags } from '../graphql/settings';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;

describe('useCompanionBrowsingConsent', () => {
  const updateFlag = jest.fn().mockResolvedValue(undefined);
  const updatePromptFlag = jest.fn().mockResolvedValue(undefined);
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: false,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });
    mockUseLogContext.mockReturnValue({ logEvent });
  });

  it('shows the banner when feature is enabled and user has not seen it', () => {
    const { result } = renderHook(() => useCompanionBrowsingConsent());

    expect(result.current.shouldShowBanner).toBe(true);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptShow,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
  });

  it('saves browsingContextEnabled flag when user accepts', async () => {
    const { result } = renderHook(() => useCompanionBrowsingConsent());

    await act(async () => {
      await result.current.onAccept();
    });

    expect(updateFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.BrowsingContextEnabled,
      true,
    );
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'browsing_context_consent_prompt',
      true,
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptAccept,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
  });

  it('does not save browsingContextEnabled when user dismisses', async () => {
    const { result } = renderHook(() => useCompanionBrowsingConsent());

    await act(async () => {
      await result.current.onDismiss();
    });

    expect(updateFlag).not.toHaveBeenCalled();
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'browsing_context_consent_prompt',
      true,
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptDecline,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
  });

  it('does not show banner when feature is disabled', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useCompanionBrowsingConsent());

    expect(result.current.shouldShowBanner).toBe(false);
  });

  it('does not show banner when user already consented', () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: true,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    const { result } = renderHook(() => useCompanionBrowsingConsent());

    expect(result.current.shouldShowBanner).toBe(false);
  });

  it('does not show banner when user already dismissed it', () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: false,
        prompt: { browsing_context_consent_prompt: true },
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    const { result } = renderHook(() => useCompanionBrowsingConsent());

    expect(result.current.shouldShowBanner).toBe(false);
  });

  it('does not show banner when settings are not loaded', () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: false,
        prompt: {},
      },
      loadedSettings: false,
      updateFlag,
      updatePromptFlag,
    });

    const { result } = renderHook(() => useCompanionBrowsingConsent());

    expect(result.current.shouldShowBanner).toBe(false);
  });
});
