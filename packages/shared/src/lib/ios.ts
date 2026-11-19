import { isIOSNative } from './func';

export enum WebKitMessageHandlers {
  NativeAuth = 'native-auth',
  UpdateUserId = 'update-user-id',
  TrackEvent = 'track-event',

  PushState = 'push-state',
  PushUserId = 'push-user-id',
  PushSubscribe = 'push-subscribe',
  PushUnsubscribe = 'push-unsubscribe',

  IAPProductList = 'iap-product-list',
  IAPSubscriptionManage = 'iap-subscription-manage',
  IAPSubscriptionRequest = 'iap-subscription-request',
  IAPSetAppAccountToken = 'iap-set-app-account-token',

  IAPCoresPurchase = 'iap-cores-purchase',

  AppIconGet = 'app-icon-get',
  AppIconSet = 'app-icon-set',

  Haptic = 'haptic',
  StatusBar = 'status-bar',
  NavState = 'nav-state',
  Reading = 'reading',

  RequestTracking = 'request-tracking',

  ReviewRequest = 'review-request',
  ReviewOpenStore = 'review-open-store',
}

type IOSWebkitGlobal = typeof globalThis & {
  webkit?: {
    messageHandlers?: Partial<
      Record<WebKitMessageHandlers, { postMessage: (payload: unknown) => void }>
    >;
  };
};

export const messageHandlerExists = (handler: WebKitMessageHandlers): boolean =>
  isIOSNative() &&
  !!(globalThis as IOSWebkitGlobal)?.webkit?.messageHandlers?.[handler];

export const iOSSupportsPlusPurchase = (): boolean =>
  isIOSNative() &&
  messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest);

export const iOSSupportsCoresPurchase = (): boolean =>
  isIOSNative() && messageHandlerExists(WebKitMessageHandlers.IAPCoresPurchase);

export const iOSSupportsAppIconChange = (): boolean =>
  isIOSNative() &&
  messageHandlerExists(WebKitMessageHandlers.AppIconGet) &&
  messageHandlerExists(WebKitMessageHandlers.AppIconSet);

export const postWebKitMessage = <T = unknown>(
  handler: WebKitMessageHandlers,
  payload: T,
): void => {
  const webkitGlobal = globalThis as IOSWebkitGlobal;

  if (!isIOSNative()) {
    throw new Error('sendMessage is only available on iOS');
  }

  if (!messageHandlerExists(handler)) {
    throw new Error(`Message handler ${handler} does not exist`);
  }

  const messageHandler = webkitGlobal.webkit?.messageHandlers?.[handler];

  if (!messageHandler) {
    throw new Error(`Message handler ${handler} does not exist`);
  }

  messageHandler.postMessage(payload);
};

export const requestIOSTracking = (): void => {
  if (!messageHandlerExists(WebKitMessageHandlers.RequestTracking)) {
    return;
  }

  postWebKitMessage(WebKitMessageHandlers.RequestTracking, null);
};

// Both review handlers ship together in iOS 1.26, so one check covers the
// native rating pop-up and the App Store's write-a-review screen.
export const iOSSupportsReview = (): boolean =>
  messageHandlerExists(WebKitMessageHandlers.ReviewRequest) &&
  messageHandlerExists(WebKitMessageHandlers.ReviewOpenStore);

// Asks iOS for StoreKit's rating pop-up. Apple decides whether anything shows
// (at most three times a year per app) and never reports back, and the app
// keeps its own 120-day cooldown, so callers must not depend on the result.
export const requestIOSReview = (): boolean => {
  if (!iOSSupportsReview()) {
    return false;
  }

  postWebKitMessage(WebKitMessageHandlers.ReviewRequest, null);
  return true;
};

// Opens the App Store's write-a-review screen. Unlike the pop-up this always
// works, so it is the CTA behind every review ask.
export const openIOSWriteReview = (): boolean => {
  if (!iOSSupportsReview()) {
    return false;
  }

  postWebKitMessage(WebKitMessageHandlers.ReviewOpenStore, null);
  return true;
};
