import { act, renderHook } from '@testing-library/react';
import { useNoAiFeed } from './useNoAiFeed';
import { useConditionalFeature } from './useConditionalFeature';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useToastNotification } from './useToastNotification';
import { usePrompt } from './usePrompt';
import { useLogContext } from '../contexts/LogContext';
import { SidebarSettingsFlags } from '../graphql/settings';
import { labels } from '../lib/labels';
import { LogEvent, Origin, TargetId } from '../lib/log';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('./useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('./usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseToastNotification = useToastNotification as jest.Mock;
const mockUsePrompt = usePrompt as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;

describe('useNoAiFeed', () => {
  const updateFlag = jest.fn().mockResolvedValue(undefined);
  const updatePromptFlag = jest.fn().mockResolvedValue(undefined);
  const displayToast = jest.fn();
  const showPrompt = jest.fn().mockResolvedValue(true);
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
    mockUseSettingsContext.mockReturnValue({
      flags: {
        noAiFeedEnabled: false,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });
    mockUseToastNotification.mockReturnValue({ displayToast });
    mockUsePrompt.mockReturnValue({ showPrompt });
    mockUseLogContext.mockReturnValue({ logEvent });
  });

  it('reads the saved no ai preference', () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        noAiFeedEnabled: true,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    const { result } = renderHook(() => useNoAiFeed());

    expect(result.current.isNoAi).toBe(true);
    expect(result.current.isNoAiAvailable).toBe(true);
    expect(result.current.isLoaded).toBe(true);
  });

  it('enables no ai mode locally, prompts to save it, and logs the decision', async () => {
    const { result } = renderHook(() => useNoAiFeed());

    await act(async () => {
      await result.current.toggleNoAi();
    });

    expect(displayToast).toHaveBeenCalledWith(labels.feed.noAi.hidden);
    expect(showPrompt).toHaveBeenCalledWith({
      title: labels.feed.noAi.prompt.title,
      description: labels.feed.noAi.prompt.description,
      okButton: {
        title: labels.feed.noAi.prompt.okButton,
      },
      cancelButton: {
        title: labels.feed.noAi.prompt.cancelButton,
      },
    });
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'no_ai_feed_preference_prompt',
      true,
    );
    expect(updateFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.NoAiFeedEnabled,
      true,
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SaveNoAiFeedPreference,
      target_id: TargetId.On,
      extra: JSON.stringify({
        origin: Origin.Feed,
      }),
    });
  });

  it('disables the saved no ai preference from the header', async () => {
    mockUseSettingsContext.mockReturnValue({
      flags: {
        noAiFeedEnabled: true,
        prompt: {},
      },
      loadedSettings: true,
      updateFlag,
      updatePromptFlag,
    });

    const { result } = renderHook(() => useNoAiFeed());

    await act(async () => {
      await result.current.toggleNoAi();
    });

    expect(updateFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.NoAiFeedEnabled,
      false,
    );
    expect(displayToast).toHaveBeenCalledWith(labels.feed.noAi.visible);
    expect(showPrompt).not.toHaveBeenCalled();
  });
});
