import type { ReactNode } from 'react';
import React from 'react';
import { renderHook, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeedbackShortcut } from './useFeedbackShortcut';
import { MODAL_KEY } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { registerSpotlightShortcutBlocker } from '../components/spotlight/shortcuts';
import { LogEvent, TargetId } from '../lib/log';

let mockUser: { id: string } | null = { id: 'u1' };
const mockLogEvent = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const setupShortcut = () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  renderHook(() => useFeedbackShortcut(), { wrapper });

  return client;
};

describe('useFeedbackShortcut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'u1' };
  });

  it('opens the feedback modal on ctrl+shift+f and logs the shortcut', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.KeyboardShortcutTriggered,
      target_id: TargetId.FeedbackOpen,
    });
  });

  it('opens the feedback modal on meta+shift+f', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'f', metaKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
  });

  it('is open-only: does not close an already-open feedback modal', async () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });
    await waitFor(() =>
      expect(client.getQueryData(MODAL_KEY)).toEqual({
        type: LazyModal.Feedback,
      }),
    );

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });

  it('ignores the key without modifiers', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'f' });
    fireEvent.keyDown(window, { key: 'f', shiftKey: true });
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });

    expect(client.getQueryData(MODAL_KEY)).toBeUndefined();
  });

  it('honours the global shortcut blocker', () => {
    const unregister = registerSpotlightShortcutBlocker();
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toBeUndefined();

    unregister();
    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
  });

  it('does nothing for anonymous users', () => {
    mockUser = null;
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toBeUndefined();
  });
});
