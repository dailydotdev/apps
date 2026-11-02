import { requestIOSTracking, WebKitMessageHandlers } from './ios';

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
