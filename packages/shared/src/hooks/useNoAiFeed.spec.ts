import { act, renderHook } from '@testing-library/react';
import { useNoAiFeed } from './useNoAiFeed';
import { useConditionalFeature } from './useConditionalFeature';
import { useSettingsContext } from '../contexts/SettingsContext';
import { ToastSubject, useToastNotification } from './useToastNotification';
import { useLogContext } from '../contexts/LogContext';
import { SidebarSettingsFlags } from '../graphql/settings';
import { labels } from '../lib/labels';
import { LogEvent, Origin, TargetId } from '../lib/log';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('./useToastNotification', () => ({
  ...jest.requireActual('./useToastNotification'),
  useToastNotification: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('./useActions', () => ({
  useActions: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseToastNotification = useToastNotification as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseActions = useActions as jest.Mock;

describe('useNoAiFeed', () => {
  const updateFlag = jest.fn().mockResolvedValue(undefined);
  const updatePromptFlag = jest.fn().mockResolvedValue(undefined);
  const displayToast = jest.fn();
  const logEvent = jest.fn();
  const completeAction = jest.fn().mockResolvedValue(undefined);

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
    mockUseLogContext.mockReturnValue({ logEvent });
    mockUseActions.mockReturnValue({ completeAction });
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

  it('enables no ai mode locally and shows a save nudge toast', async () => {
    const { result } = renderHook(() => useNoAiFeed());

    await act(async () => {
      await result.current.toggleNoAi();
    });

    expect(displayToast).toHaveBeenCalledWith(labels.feed.noAi.nudge.message, {
      persistent: true,
      subject: ToastSubject.Feed,
      action: expect.objectContaining({
        copy: labels.feed.noAi.nudge.action,
      }),
    });
    expect(updatePromptFlag).toHaveBeenCalledWith(
      'no_ai_feed_preference_prompt',
      true,
    );

    const toastAction = displayToast.mock.calls[0][1].action.onClick;

    await act(async () => {
      await toastAction();
    });

    expect(updateFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.NoAiFeedEnabled,
      true,
    );
    expect(completeAction).toHaveBeenCalledWith(
      ActionType.DismissNoAiFeedToggle,
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
  });
});
