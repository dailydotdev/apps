import type { PaymentProvider, ProductOption } from '../types';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../../lib/featureValues';

export abstract class BasePaymentProvider implements PaymentProvider {
  protected productOptions: ProductOption[] = [];
  protected isInitialized = false;

  abstract initialize(): Promise<void>;
  abstract openCheckout(props: { priceId: string; giftToUserId?: string }): void;
  abstract isAvailable(): boolean;

  async getProductOptions(): Promise<ProductOption[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.productOptions;
  }

  protected formatPrice(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat(globalThis?.navigator?.language ?? 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  protected calculateMonthlyPrice(price: number, duration: PlusPriceType): number {
    const months = duration === PlusPriceType.Yearly ? 12 : 1;
    return Number((price / months).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
  }

  protected findGiftOneYearOption(): ProductOption | undefined {
    return this.productOptions.find(
      ({ appsId }) => appsId === PlusPriceTypeAppsId.GiftOneYear,
    );
  }

  protected findEarlyAdopterPlanId(): string | null {
    return (
      this.productOptions.find(
        ({ appsId }) => appsId === PlusPriceTypeAppsId.EarlyAdopter,
      )?.value ?? null
    );
  }

  protected hasFreeTrial(): boolean {
    return this.productOptions.some(({ trialPeriod }) => !!trialPeriod);
  }
} 