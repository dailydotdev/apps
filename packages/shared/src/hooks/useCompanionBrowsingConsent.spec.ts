import { renderHook, act } from '@testing-library/react';
import { useCompanionBrowsingConsent } from './useCompanionBrowsingConsent';
import { useConditionalFeature } from './useConditionalFeature';
import { useSettingsContext } from '../contexts/SettingsContext';
import { usePrompt } from './usePrompt';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin } from '../lib/log';
import { SidebarSettingsFlags } from '../graphql/settings';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('./usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUsePrompt = usePrompt as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;

describe('useCompanionBrowsingConsent', () => {
  const updateFlag = jest.fn().mockResolvedValue(undefined);
  const updatePromptFlag = jest.fn().mockResolvedValue(undefined);
  const showPrompt = jest.fn();
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
    mockUsePrompt.mockReturnValue({ showPrompt });
    mockUseLogContext.mockReturnValue({ logEvent });
  });

  it('shows the consent prompt when feature is enabled and user has not seen it', async () => {
    showPrompt.mockResolvedValue(true);

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(showPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Personalize your feed with browsing context?',
        okButton: { title: 'Allow' },
        cancelButton: { title: 'No thanks' },
      }),
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptShow,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
  });

  it('saves browsingContextEnabled flag when user accepts', async () => {
    showPrompt.mockResolvedValue(true);

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(updateFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.BrowsingContextEnabled,
      true,
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptAccept,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'browsing_context_consent_prompt',
      true,
    );
  });

  it('does not save browsingContextEnabled when user declines', async () => {
    showPrompt.mockResolvedValue(false);

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(updateFlag).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.BrowsingConsentPromptDecline,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'browsing_context_consent_prompt',
      true,
    );
  });

  it('does not show prompt when feature is disabled', async () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(showPrompt).not.toHaveBeenCalled();
  });

  it('does not show prompt when user already consented', async () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: true,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(showPrompt).not.toHaveBeenCalled();
  });

  it('does not show prompt when user already dismissed it', async () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: false,
        prompt: { browsing_context_consent_prompt: true },
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(showPrompt).not.toHaveBeenCalled();
  });

  it('does not show prompt when settings are not loaded', async () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        browsingContextEnabled: false,
        prompt: {},
      },
      loadedSettings: false,
      updateFlag,
      updatePromptFlag,
    });

    await act(async () => {
      renderHook(() => useCompanionBrowsingConsent());
    });

    expect(showPrompt).not.toHaveBeenCalled();
  });
});
