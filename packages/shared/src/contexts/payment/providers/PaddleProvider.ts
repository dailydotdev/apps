import type { Environments, Paddle, PaddleEventData } from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { useAuthContext } from '../../AuthContext';
import { usePixelsContext } from '../../PixelsContext';
import { LogEvent } from '../../../lib/log';
import { checkIsExtension } from '../../../lib/func';
import { BasePaymentProvider } from './BasePaymentProvider';
import type { ProductOption } from '../types';

export class PaddleProvider extends BasePaymentProvider {
  private paddle?: Paddle;
  private readonly environment: Environments;
  private readonly token: string;

  constructor() {
    super();
    this.environment =
      (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
      'production';
    this.token = process.env.NEXT_PUBLIC_PADDLE_TOKEN;
  }

  async initialize(): Promise<void> {
    if (checkIsExtension()) {
      return;
    }

    const existingPaddleInstance = getPaddleInstance();
    if (existingPaddleInstance) {
      this.paddle = existingPaddleInstance;
      this.isInitialized = true;
      return;
    }

    this.paddle = await initializePaddle({
      environment: this.environment,
      token: this.token,
      eventCallback: this.handlePaddleEvent.bind(this),
    });

    this.isInitialized = true;
  }

  openCheckout({ priceId, giftToUserId }: { priceId: string; giftToUserId?: string }): void {
    if (!this.paddle) return;

    this.paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: {
        email: this.getUserEmail(),
        ...(this.getUserRegion() && {
          address: {
            countryCode: this.getUserRegion(),
          },
        }),
      },
      customData: {
        user_id: giftToUserId ?? this.getUserId(),
        ...(!!giftToUserId && { gifter_id: this.getUserId() }),
      },
      settings: {
        displayMode: 'inline',
        variant: 'one-page',
        frameTarget: 'checkout-container',
        frameInitialHeight: 500,
        frameStyle: 'width: 100%; background-color: transparent; border: none;',
        theme: 'dark',
      },
    });
  }

  isAvailable(): boolean {
    return !checkIsExtension() && !!this.paddle;
  }

  private handlePaddleEvent(event: PaddleEventData): void {
    switch (event?.name) {
      case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
        this.logEvent(LogEvent.InitiatePayment, event?.data?.payment.method_details.type);
        break;
      case CheckoutEventNames.CHECKOUT_LOADED:
        this.logEvent(LogEvent.InitiateCheckout, event?.data?.payment.method_details.type);
        break;
      case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
        this.logEvent(LogEvent.SelectCheckoutPayment, event?.data?.payment.method_details.type);
        break;
      case CheckoutEventNames.CHECKOUT_COMPLETED:
        this.handleCheckoutCompleted(event);
        break;
      case CheckoutEventNames.CHECKOUT_ERROR:
        this.logEvent(LogEvent.ErrorCheckout);
        break;
    }
  }

  private handleCheckoutCompleted(event: PaddleEventData): void {
    const isGift = 'gifter_id' in event.data.custom_data;
    this.logEvent(
      isGift ? LogEvent.CompleteGiftCheckout : LogEvent.CompleteCheckout,
      undefined,
      {
        user_id:
          'gifter_id' in event.data.custom_data &&
          'user_id' in event.data.custom_data
            ? event.data.custom_data.user_id
            : undefined,
        cycle: event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
        localCost: event?.data.totals.total,
        localCurrency: event?.data.currency_code,
        payment: event?.data.payment.method_details.type,
      },
    );

    this.trackPayment(
      event?.data.totals.total,
      event?.data.currency_code,
      event?.data?.transaction_id,
    );
  }

  private logEvent(eventName: LogEvent, targetId?: string, extra?: Record<string, unknown>): void {
    // Implementation will be provided by the context
  }

  private trackPayment(value: number, currency: string, transactionId: string): void {
    // Implementation will be provided by the context
  }

  private getUserEmail(): string | undefined {
    // Implementation will be provided by the context
    return undefined;
  }

  private getUserId(): string | undefined {
    // Implementation will be provided by the context
    return undefined;
  }

  private getUserRegion(): string | undefined {
    // Implementation will be provided by the context
    return undefined;
  }
} 