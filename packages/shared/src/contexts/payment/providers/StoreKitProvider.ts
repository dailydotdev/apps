import { useRouter } from 'next/router';
import { useToastNotification } from '../../../hooks';
import { LogEvent } from '../../../lib/log';
import { DEFAULT_ERROR } from '../../../graphql/common';
import { isNullOrUndefined, promisifyEventListener } from '../../../lib/func';
import { WebKitMessageHandlers } from '../../../lib/ios';
import { BasePaymentProvider } from './BasePaymentProvider';
import type { ProductOption } from '../types';

export class StoreKitProvider extends BasePaymentProvider {
  private readonly router: ReturnType<typeof useRouter>;
  private readonly displayToast: ReturnType<typeof useToastNotification>['displayToast'];
  private readonly appAccountToken?: string;

  constructor(
    router: ReturnType<typeof useRouter>,
    displayToast: ReturnType<typeof useToastNotification>['displayToast'],
    appAccountToken?: string,
  ) {
    super();
    this.router = router;
    this.displayToast = displayToast;
    this.appAccountToken = appAccountToken;
  }

  async initialize(): Promise<void> {
    this.setupEventListeners();
    this.isInitialized = true;
  }

  openCheckout({ priceId }: { priceId: string; giftToUserId?: string }): void {
    this.postWebKitMessage(WebKitMessageHandlers.IAPSubscriptionRequest, {
      productId: priceId,
      appAccountToken: this.appAccountToken,
    });
  }

  isAvailable(): boolean {
    return true; // StoreKit is always available on iOS
  }

  private setupEventListeners(): void {
    const eventName = 'iap-purchase-event';
    promisifyEventListener<void, PurchaseEvent>(
      eventName,
      (event) => {
        const { name, detail, product } = event.detail;
        switch (name) {
          case PurchaseEventName.PurchaseCompleted:
            this.handlePurchaseCompleted(product);
            break;
          case PurchaseEventName.PurchaseInitiated:
            this.logEvent(LogEvent.InitiatePayment);
            break;
          case PurchaseEventName.PurchaseFailed:
            this.handlePurchaseFailed(detail);
            break;
          case PurchaseEventName.PurchasePending:
            this.displayToast('Please wait for the purchase to be completed.');
            break;
          case PurchaseEventName.PurchaseCancelled:
          default:
            break;
        }
      },
      {
        once: false,
      },
    );
  }

  private handlePurchaseCompleted(product: IAPProduct): void {
    this.logEvent(LogEvent.CompleteCheckout, undefined, {
      user_id: this.getUserId(),
      cycle: product.attributes.offers[0].recurringSubscriptionPeriod,
      localCost: product.attributes.offers[0].price,
      localCurrency: product.attributes.offers[0].currencyCode,
      payment: 'apple_storekit',
    });
    this.router.push('/plus/success');
  }

  private handlePurchaseFailed(detail: string): void {
    this.logEvent(LogEvent.ErrorCheckout, undefined, {
      errorCode: detail,
    });
    this.displayToast(DEFAULT_ERROR);
  }

  private logEvent(eventName: LogEvent, targetId?: string, extra?: Record<string, unknown>): void {
    // Implementation will be provided by the context
  }

  private getUserId(): string | undefined {
    // Implementation will be provided by the context
    return undefined;
  }

  private postWebKitMessage(handler: WebKitMessageHandlers, data: unknown): void {
    // Implementation will be provided by the context
  }
} 