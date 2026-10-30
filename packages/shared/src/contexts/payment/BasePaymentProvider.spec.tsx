import { getPricingDiscountId } from './BasePaymentProvider';

describe('getPricingDiscountId', () => {
  it('uses the page discount until a checkout has loaded', () => {
    expect(
      getPricingDiscountId({
        discountId: 'dsc_sale',
        appliedDiscountId: undefined,
      }),
    ).toBe('dsc_sale');
  });

  it('prices without a discount when the checkout applied none', () => {
    expect(
      getPricingDiscountId({ discountId: 'dsc_sale', appliedDiscountId: null }),
    ).toBeUndefined();
  });

  it('uses the discount the checkout applied', () => {
    expect(
      getPricingDiscountId({
        discountId: 'dsc_sale',
        appliedDiscountId: 'dsc_coupon',
      }),
    ).toBe('dsc_coupon');
  });
});
