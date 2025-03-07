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
}

export const messageHandlerExists = (handler: WebKitMessageHandlers): boolean =>
  isIOSNative() && !!globalThis?.webkit?.messageHandlers?.[handler];

export const iOSSupportsPlusPurchase = (): boolean =>
  isIOSNative() &&
  messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest);

export const postWebKitMessage = <T = unknown>(
  handler: WebKitMessageHandlers,
  payload: T,
): void => {
  if (!isIOSNative()) {
    throw new Error('sendMessage is only available on iOS');
  }

  if (!messageHandlerExists(handler)) {
    throw new Error(`Message handler ${handler} does not exist`);
  }

  globalThis.webkit.messageHandlers[handler].postMessage(payload);
};
