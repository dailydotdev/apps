import type { ReactNode } from 'react';
import React from 'react';
import { renderHook, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeedbackShortcut } from './useFeedbackShortcut';
import { MODAL_KEY } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

let mockUser: { id: string } | null = { id: 'u1' };

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
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
    mockUser = { id: 'u1' };
  });

  it('opens the feedback modal on ctrl+shift+f', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
  });

  it('opens the feedback modal on meta+shift+f', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'f', metaKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toEqual({
      type: LazyModal.Feedback,
    });
  });

  it('closes the feedback modal when it is already open', async () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });
    await waitFor(() =>
      expect(client.getQueryData(MODAL_KEY)).toEqual({
        type: LazyModal.Feedback,
      }),
    );

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });
    await waitFor(() => expect(client.getQueryData(MODAL_KEY)).toBeNull());
  });

  it('ignores the key without modifiers', () => {
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'f' });
    fireEvent.keyDown(window, { key: 'f', shiftKey: true });
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });

    expect(client.getQueryData(MODAL_KEY)).toBeUndefined();
  });

  it('does nothing for anonymous users', () => {
    mockUser = null;
    const client = setupShortcut();

    fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true });

    expect(client.getQueryData(MODAL_KEY)).toBeUndefined();
  });
});
