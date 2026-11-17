import {
  iOSSupportsReview,
  openIOSWriteReview,
  requestIOSReview,
  requestIOSTracking,
  WebKitMessageHandlers,
} from './ios';

type WebkitWindow = typeof globalThis & {
  webkit?: { messageHandlers?: Record<string, { postMessage: jest.Mock }> };
};

describe('requestIOSTracking', () => {
  const runtime = globalThis as WebkitWindow;

  afterEach(() => {
    delete runtime.webkit;
    document.documentElement.classList.remove('ios');
  });

  it('asks the iOS app for the tracking prompt', () => {
    const postMessage = jest.fn();
    runtime.webkit = {
      messageHandlers: {
        [WebKitMessageHandlers.RequestTracking]: { postMessage },
      },
    };
    document.documentElement.classList.add('ios');

    requestIOSTracking();

    expect(postMessage).toHaveBeenCalledWith(null);
  });

  it('does nothing on app builds without the handler', () => {
    const postMessage = jest.fn();
    runtime.webkit = {
      messageHandlers: { [WebKitMessageHandlers.TrackEvent]: { postMessage } },
    };
    document.documentElement.classList.add('ios');

    expect(() => requestIOSTracking()).not.toThrow();
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('does nothing outside the iOS app', () => {
    expect(() => requestIOSTracking()).not.toThrow();
  });
});

const runtime = globalThis as WebkitWindow;

const installBridge = (handlers: WebKitMessageHandlers[]) => {
  const messageHandlers = Object.fromEntries(
    handlers.map((handler) => [handler, { postMessage: jest.fn() }]),
  );
  runtime.webkit = { messageHandlers };
  document.documentElement.classList.add('ios');
  return messageHandlers;
};

describe('iOS review bridge', () => {
  afterEach(() => {
    delete runtime.webkit;
    document.documentElement.classList.remove('ios');
  });

  it('is unsupported outside the iOS app', () => {
    expect(iOSSupportsReview()).toBe(false);
    expect(requestIOSReview()).toBe(false);
    expect(openIOSWriteReview()).toBe(false);
  });

  it('is unsupported on an app older than the review bridge', () => {
    installBridge([WebKitMessageHandlers.RequestTracking]);

    expect(iOSSupportsReview()).toBe(false);
    expect(requestIOSReview()).toBe(false);
    expect(openIOSWriteReview()).toBe(false);
  });

  it('needs both review handlers', () => {
    installBridge([WebKitMessageHandlers.ReviewRequest]);

    expect(iOSSupportsReview()).toBe(false);
  });

  it('asks iOS for the rating pop-up', () => {
    const handlers = installBridge([
      WebKitMessageHandlers.ReviewRequest,
      WebKitMessageHandlers.ReviewOpenStore,
    ]);

    expect(iOSSupportsReview()).toBe(true);
    expect(requestIOSReview()).toBe(true);
    expect(
      handlers[WebKitMessageHandlers.ReviewRequest].postMessage,
    ).toHaveBeenCalledWith(null);
    expect(
      handlers[WebKitMessageHandlers.ReviewOpenStore].postMessage,
    ).not.toHaveBeenCalled();
  });

  it('opens the write-a-review screen', () => {
    const handlers = installBridge([
      WebKitMessageHandlers.ReviewRequest,
      WebKitMessageHandlers.ReviewOpenStore,
    ]);

    expect(openIOSWriteReview()).toBe(true);
    expect(
      handlers[WebKitMessageHandlers.ReviewOpenStore].postMessage,
    ).toHaveBeenCalledWith(null);
    expect(
      handlers[WebKitMessageHandlers.ReviewRequest].postMessage,
    ).not.toHaveBeenCalled();
  });
});
