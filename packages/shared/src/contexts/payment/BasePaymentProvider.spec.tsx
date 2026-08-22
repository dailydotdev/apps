import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { PurchaseType } from '../../graphql/paddle';
import { useProductPricing } from '../../hooks/useProductPricing';
import { BasePaymentProvider } from './BasePaymentProvider';
import { usePaymentContext } from './context';

jest.mock('../../hooks/useProductPricing', () => ({
  useProductPricing: jest.fn(),
}));

jest.mock('../AuthContext', () => ({
  useAuthContext: () => ({ isValidRegion: true }),
}));

const mockUseProductPricing = useProductPricing as jest.MockedFunction<
  typeof useProductPricing
>;

const personalPriceId = 'pri_personal';
const organizationPriceId = 'pri_organization';

const CheckoutProbe = ({ priceId }: { priceId: string }) => {
  const { openCheckout } = usePaymentContext();

  useEffect(() => {
    openCheckout?.({ priceId });
  }, [openCheckout, priceId]);

  return null;
};

describe('BasePaymentProvider sale discount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies the sale discount to personal Plus pricing and checkout', async () => {
    const openCheckout = jest.fn();
    mockUseProductPricing.mockReturnValue({
      data: [{ priceId: personalPriceId }],
      isPending: false,
    } as never);

    render(
      <BasePaymentProvider
        openCheckout={openCheckout}
        priceType={PurchaseType.Plus}
        discountId="dsc_summer"
      >
        <CheckoutProbe priceId={personalPriceId} />
      </BasePaymentProvider>,
    );

    expect(mockUseProductPricing).toHaveBeenCalledWith(
      expect.objectContaining({ discountId: 'dsc_summer' }),
    );
    await waitFor(() =>
      expect(openCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ discountId: 'dsc_summer' }),
      ),
    );
  });

  it('does not apply the sale discount to organization pricing or checkout', async () => {
    const openCheckout = jest.fn();
    mockUseProductPricing.mockReturnValue({
      data: [{ priceId: organizationPriceId }],
      isPending: false,
    } as never);

    render(
      <BasePaymentProvider
        openCheckout={openCheckout}
        priceType={PurchaseType.Organization}
        discountId="dsc_summer"
      >
        <CheckoutProbe priceId={organizationPriceId} />
      </BasePaymentProvider>,
    );

    expect(mockUseProductPricing).toHaveBeenCalledWith(
      expect.objectContaining({ discountId: undefined }),
    );
    await waitFor(() =>
      expect(openCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ discountId: undefined }),
      ),
    );
  });

  it('does not apply the sale discount to a non-Plus price on the payment page', async () => {
    const openCheckout = jest.fn();
    mockUseProductPricing.mockReturnValue({
      data: [{ priceId: personalPriceId }],
      isPending: false,
    } as never);

    render(
      <BasePaymentProvider
        openCheckout={openCheckout}
        priceType={PurchaseType.Plus}
        discountId="dsc_summer"
      >
        <CheckoutProbe priceId={organizationPriceId} />
      </BasePaymentProvider>,
    );

    await waitFor(() =>
      expect(openCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ discountId: undefined }),
      ),
    );
  });
});
