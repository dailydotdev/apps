import { isIOSNative } from './func';

export enum WebKitMessageHandlers {
  IAPProductList = 'iap-product-list',
  IAPSubscriptionManage = 'iap-subscription-manage',
  IAPSubscriptionRequest = 'iap-subscription-request',
  IAPSetAppAccountToken = 'iap-set-app-account-token',
}

export const messageHandlerExists = (handler: WebKitMessageHandlers): boolean =>
  isIOSNative() && globalThis.webkit?.messageHandlers?.[handler];

export const sendMessage = <T = unknown>(
  handler: WebKitMessageHandlers,
  payload: T,
): void => {
  if (!isIOSNative()) {
    // eslint-disable-next-line no-console
    console.error('sendMessage is only available on iOS');
    return;
  }

  if (!messageHandlerExists(handler)) {
    // eslint-disable-next-line no-console
    console.error(`Message handler ${handler} does not exist`);
    return;
  }

  globalThis.webkit.messageHandlers[handler].postMessage(payload);
};
