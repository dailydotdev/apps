import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleOneTap } from './useGoogleOneTap';

type Callback = (response: { credential?: string }) => void;

const initialize = jest.fn<void, [{ callback: Callback }]>();
const prompt = jest.fn();
const cancel = jest.fn();

const setGoogleGlobal = (present: boolean) => {
  if (present) {
    (globalThis as unknown as { google: unknown }).google = {
      accounts: { id: { initialize, prompt, cancel } },
    };
  } else {
    delete (globalThis as unknown as { google?: unknown }).google;
  }
};

const ORIGINAL_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

beforeEach(() => {
  jest.clearAllMocks();
  setGoogleGlobal(true);
});

afterEach(() => {
  setGoogleGlobal(false);
  if (ORIGINAL_CLIENT_ID === undefined) {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  } else {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = ORIGINAL_CLIENT_ID;
  }
});

describe('useGoogleOneTap', () => {
  it('should initialize and prompt when enabled', async () => {
    renderHook(() =>
      useGoogleOneTap({
        enabled: true,
        clientId: 'client-123',
        onCredential: jest.fn(),
      }),
    );

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-123', context: 'signin' }),
    );
  });

  it('should not initialize when disabled', async () => {
    renderHook(() =>
      useGoogleOneTap({
        enabled: false,
        clientId: 'client-123',
        onCredential: jest.fn(),
      }),
    );

    await Promise.resolve();
    expect(initialize).not.toHaveBeenCalled();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('should not initialize without a clientId', async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    renderHook(() =>
      useGoogleOneTap({ enabled: true, onCredential: jest.fn() }),
    );

    await Promise.resolve();
    expect(initialize).not.toHaveBeenCalled();
  });

  it('should default the clientId from env when not provided', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'env-client';
    renderHook(() =>
      useGoogleOneTap({ enabled: true, onCredential: jest.fn() }),
    );

    await waitFor(() =>
      expect(initialize).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'env-client' }),
      ),
    );
  });

  it('should forward the credential to onCredential', async () => {
    const onCredential = jest.fn();
    renderHook(() =>
      useGoogleOneTap({ enabled: true, clientId: 'client-123', onCredential }),
    );

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const { callback } = initialize.mock.calls[0][0];
    callback({ credential: 'id-token-abc' });

    expect(onCredential).toHaveBeenCalledWith('id-token-abc');
  });

  it('should cancel the prompt on unmount', async () => {
    const { unmount } = renderHook(() =>
      useGoogleOneTap({
        enabled: true,
        clientId: 'client-123',
        onCredential: jest.fn(),
      }),
    );

    await waitFor(() => expect(prompt).toHaveBeenCalled());
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
