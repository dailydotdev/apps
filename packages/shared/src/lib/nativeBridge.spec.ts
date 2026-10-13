import { WebKitMessageHandlers } from './ios';
import { HapticStyle, playHaptic, postNativeMessage } from './nativeBridge';

type BridgeGlobal = typeof globalThis & {
  webkit?: unknown;
  DailyAndroid?: unknown;
};

const bridgeGlobal = globalThis as BridgeGlobal;

afterEach(() => {
  delete bridgeGlobal.webkit;
  delete bridgeGlobal.DailyAndroid;
  document.documentElement.classList.remove('ios');
});

describe('postNativeMessage', () => {
  it('posts to the iOS handler the wrapper registered', () => {
    const postMessage = jest.fn();
    bridgeGlobal.webkit = { messageHandlers: { haptic: { postMessage } } };
    document.documentElement.classList.add('ios');

    expect(
      postNativeMessage(WebKitMessageHandlers.Haptic, { style: 'light' }),
    ).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ style: 'light' });
  });

  it('stays silent when the wrapper has no such handler', () => {
    bridgeGlobal.webkit = { messageHandlers: {} };
    document.documentElement.classList.add('ios');

    expect(
      postNativeMessage(WebKitMessageHandlers.Reading, { action: 'open' }),
    ).toBe(false);
  });

  it('sends the same message to the Android bridge as JSON', () => {
    const postMessage = jest.fn();
    bridgeGlobal.DailyAndroid = {
      postMessage,
      supports: (name: string) => name === WebKitMessageHandlers.Haptic,
    };

    expect(
      postNativeMessage(WebKitMessageHandlers.Haptic, { style: 'light' }),
    ).toBe(true);
    expect(postMessage).toHaveBeenCalledWith('haptic', '{"style":"light"}');
    expect(
      postNativeMessage(WebKitMessageHandlers.StatusBar, { style: 'light' }),
    ).toBe(false);
  });
});

describe('playHaptic', () => {
  const vibrate = jest.fn();

  beforeEach(() => {
    vibrate.mockClear();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
  });

  it('vibrates in the Android app, which has no haptic bridge', () => {
    playHaptic(HapticStyle.Light, true);

    expect(vibrate).toHaveBeenCalledWith(10);
  });

  it('does nothing on the mobile web', () => {
    playHaptic(HapticStyle.Light, false);

    expect(vibrate).not.toHaveBeenCalled();
  });
});
