import { isIOSNative } from './func';
import {
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from './ios';

// The Android wrapper has no bridge yet. When it ships one it is a
// JavascriptInterface named DailyAndroid taking the same messages as the iOS
// handlers, and answering which of them it handles.
interface AndroidBridge {
  postMessage: (name: string, payload: string) => void;
  supports?: (name: string) => boolean;
}

// What the wrappers call on the web layer. `refresh` answers once the page's
// data is fresh, so the native pull control ends with the refetch; `back`
// answers whether the web layer used the press (a sheet, Spotlight or the
// reading drawer closed), and only otherwise does the wrapper pop history.
export interface NativeHandlers {
  refresh: () => Promise<boolean>;
  back: () => boolean;
}

type NativeGlobal = typeof globalThis & {
  DailyAndroid?: AndroidBridge;
  dailyNative?: NativeHandlers;
};

const androidBridge = (): AndroidBridge | undefined =>
  (globalThis as NativeGlobal).DailyAndroid;

export const hasNativeHandler = (handler: WebKitMessageHandlers): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (isIOSNative()) {
    return messageHandlerExists(handler);
  }

  return !!androidBridge()?.supports?.(handler);
};

export const postNativeMessage = <T = unknown>(
  handler: WebKitMessageHandlers,
  payload: T,
): boolean => {
  if (!hasNativeHandler(handler)) {
    return false;
  }

  if (isIOSNative()) {
    postWebKitMessage(handler, payload);
    return true;
  }

  androidBridge()?.postMessage(handler, JSON.stringify(payload));
  return true;
};

export const setNativeHandlers = (handlers: NativeHandlers | null): void => {
  const nativeGlobal = globalThis as NativeGlobal;

  if (handlers) {
    nativeGlobal.dailyNative = handlers;
    return;
  }

  delete nativeGlobal.dailyNative;
};

export enum HapticStyle {
  Light = 'light',
  Medium = 'medium',
  Success = 'success',
}

// Safari and WKWebView never vibrate, so haptics go through a wrapper that
// answers for the handler; without one, nothing plays.
export const playHaptic = (style: HapticStyle = HapticStyle.Light): void => {
  postNativeMessage(WebKitMessageHandlers.Haptic, { style });
};

export enum StatusBarStyle {
  Default = 'default',
  Light = 'light',
}

export const setNativeStatusBar = (style: StatusBarStyle): void => {
  postNativeMessage(WebKitMessageHandlers.StatusBar, { style });
};
