import { getRecommendedCorePrice } from './recommendedCorePrice';
import type { ProductPricingPreview } from '../../graphql/paddle';

const pack = (priceId: string, coresValue: number) =>
  ({ priceId, metadata: { coresValue } }) as ProductPricingPreview;

const prices = [pack('p600', 600), pack('p100', 100), pack('p5k', 5000)];

describe('getRecommendedCorePrice', () => {
  it('returns nothing without a minimum', () => {
    expect(getRecommendedCorePrice({ prices })).toBeUndefined();
    expect(getRecommendedCorePrice({ prices, minCores: 0 })).toBeUndefined();
  });

  it('returns nothing without prices', () => {
    expect(getRecommendedCorePrice({ minCores: 500 })).toBeUndefined();
  });

  it('picks the smallest pack that covers the minimum', () => {
    expect(getRecommendedCorePrice({ prices, minCores: 500 })?.priceId).toBe(
      'p600',
    );
    expect(getRecommendedCorePrice({ prices, minCores: 600 })?.priceId).toBe(
      'p600',
    );
    expect(getRecommendedCorePrice({ prices, minCores: 601 })?.priceId).toBe(
      'p5k',
    );
  });

  it('falls back to the biggest pack when none covers the minimum', () => {
    expect(getRecommendedCorePrice({ prices, minCores: 50000 })?.priceId).toBe(
      'p5k',
    );
  });
});
