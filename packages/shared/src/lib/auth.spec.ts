import { iosNativeAuth, IOS_NATIVE_AUTH_TIMEOUT_MS } from './auth';
import { WebKitMessageHandlers } from './ios';

type WebkitWindow = typeof globalThis & {
  webkit?: { messageHandlers?: Record<string, { postMessage: jest.Mock }> };
};

const dispatchNativeAuth = (detail: unknown) =>
  globalThis.dispatchEvent(new CustomEvent('native-auth', { detail }));

describe('iosNativeAuth', () => {
  const runtime = globalThis as WebkitWindow;
  const postMessage = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    runtime.webkit = {
      messageHandlers: { [WebKitMessageHandlers.NativeAuth]: { postMessage } },
    };
    document.documentElement.classList.add('ios');
  });

  afterEach(() => {
    jest.useRealTimers();
    postMessage.mockReset();
    delete runtime.webkit;
    document.documentElement.classList.remove('ios');
  });

  it('asks the iOS app for the provider and resolves with its token', async () => {
    const promise = iosNativeAuth('google');
    expect(postMessage).toHaveBeenCalledWith('google');

    const reply = { provider: 'google', token: 'id-token', nonce: 'nonce' };
    dispatchNativeAuth(reply);

    await expect(promise).resolves.toEqual(reply);
  });

  it('resolves undefined when the app reports a cancel or failure', async () => {
    const onTimeout = jest.fn();
    const promise = iosNativeAuth('google', { onTimeout });

    dispatchNativeAuth(null);

    await expect(promise).resolves.toBeUndefined();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('stops waiting when the app never replies', async () => {
    const onTimeout = jest.fn();
    const promise = iosNativeAuth('google', { onTimeout });

    jest.advanceTimersByTime(IOS_NATIVE_AUTH_TIMEOUT_MS);

    await expect(promise).resolves.toBeUndefined();
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('ignores a reply that arrives after the timeout', async () => {
    const promise = iosNativeAuth('google', { timeoutMs: 1000 });
    jest.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();

    const next = iosNativeAuth('apple', { timeoutMs: 5000 });
    const reply = { provider: 'apple', token: 'apple-token', nonce: 'n' };
    dispatchNativeAuth(reply);

    await expect(next).resolves.toEqual(reply);
  });
});
