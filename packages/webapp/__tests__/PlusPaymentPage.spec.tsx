import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { usePlusSale } from '@dailydotdev/shared/src/hooks/usePlusSale';
import {
  useProductPricing,
  useProductPricingByIds,
} from '@dailydotdev/shared/src/hooks/useProductPricing';
import type { ProductPricingPreview } from '@dailydotdev/shared/src/graphql/paddle';
import { useViewSize } from '@dailydotdev/shared/src/hooks';
import PlusPaymentPage from '../pages/plus/payment';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

jest.mock('@dailydotdev/shared/src/contexts/payment/context', () => ({
  usePaymentContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/usePlusSale', () => ({
  usePlusSale: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useProductPricing', () => ({
  useProductPricing: jest.fn(),
  useProductPricingByIds: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSize: jest.fn(),
}));

jest.mock(
  '@dailydotdev/shared/src/components/plus/PlusCheckoutContainer',
  () => ({ PlusCheckoutContainer: () => null }),
);

jest.mock('@dailydotdev/shared/src/components/plus/PlusProductList', () => ({
  __esModule: true,
  default: ({ productList }: { productList: ProductPricingPreview[] }) => (
    <div data-testid="plan-details">
      {productList.map(({ price }) => price.formatted).join(' ')}
    </div>
  ),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePaymentContext = usePaymentContext as jest.MockedFunction<
  typeof usePaymentContext
>;
const mockUsePlusSale = usePlusSale as jest.MockedFunction<typeof usePlusSale>;
const mockUseProductPricing = useProductPricing as jest.MockedFunction<
  typeof useProductPricing
>;
const mockUseProductPricingByIds =
  useProductPricingByIds as jest.MockedFunction<typeof useProductPricingByIds>;
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

const personal = 'pri_personal_annual';
const team = 'pri_team_annual';

const price = (formatted: string, priceId: string) =>
  ({
    priceId,
    price: { amount: 1, formatted },
    currency: { code: 'USD', symbol: '$' },
    metadata: { title: 'Annual' },
  } as ProductPricingPreview);

const renderPage = ({
  discountId,
  query = { pid: personal },
  teamPricing = [price('$150', team)],
}: {
  discountId?: string;
  query?: Record<string, string>;
  teamPricing?: ProductPricingPreview[];
}) => {
  mockUseRouter.mockReturnValue({
    query,
    isReady: true,
    replace: jest.fn(),
  } as never);
  mockUsePaymentContext.mockReturnValue({
    isPaddleReady: false,
    openCheckout: jest.fn(),
    productOptions: [price('$16', personal)],
  } as never);
  mockUsePlusSale.mockReturnValue({ discountId } as never);
  mockUseProductPricing.mockReturnValue({ data: teamPricing } as never);
  mockUseProductPricingByIds.mockReturnValue({
    data: [price('$32', personal), price('$300', team)],
  } as never);

  return render(<PlusPaymentPage />);
};

describe('PlusPaymentPage plan details', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The panel only renders from laptop up.
    mockUseViewSize.mockReturnValue(true);
  });

  it('shows the discounted amount Paddle will charge during a sale', async () => {
    renderPage({ discountId: 'dsc_summer' });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$16');
  });

  it('shows the list price when no sale is running', async () => {
    renderPage({ discountId: undefined });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$32');
  });

  it('shows the list price for a gift, which the sale does not discount', async () => {
    renderPage({
      discountId: 'dsc_summer',
      query: { pid: personal, gift: 'u1' },
    });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$32');
  });

  it('keeps the panel for a team plan, which the provider does not preview', async () => {
    renderPage({ discountId: 'dsc_summer', query: { pid: team } });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$150');
    expect(mockUseProductPricing).toHaveBeenCalledWith(
      expect.objectContaining({ discountId: 'dsc_summer', enabled: true }),
    );
  });

  it('only asks for team prices when the personal list misses the plan', () => {
    renderPage({ discountId: 'dsc_summer' });

    expect(mockUseProductPricing).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });
});
