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
