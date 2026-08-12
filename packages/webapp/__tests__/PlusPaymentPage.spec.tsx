import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { usePlusSale } from '@dailydotdev/shared/src/hooks/usePlusSale';
import { useProductPricingByIds } from '@dailydotdev/shared/src/hooks/useProductPricing';
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
const mockUseProductPricingByIds =
  useProductPricingByIds as jest.MockedFunction<typeof useProductPricingByIds>;
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;

const annual = 'pri_annual';

const price = (formatted: string, priceId = annual) =>
  ({
    priceId,
    price: { amount: 1, formatted },
    currency: { code: 'USD', symbol: '$' },
    metadata: { title: 'Annual' },
  } as ProductPricingPreview);

const renderPage = ({
  isSaleActive,
  query = { pid: annual },
  productOptions = [price('$16')],
}: {
  isSaleActive: boolean;
  query?: Record<string, string>;
  productOptions?: ProductPricingPreview[];
}) => {
  mockUseRouter.mockReturnValue({
    query,
    isReady: true,
    replace: jest.fn(),
  } as never);
  mockUsePaymentContext.mockReturnValue({
    isPaddleReady: false,
    openCheckout: jest.fn(),
    productOptions,
  } as never);
  mockUsePlusSale.mockReturnValue({ isActive: isSaleActive } as never);
  mockUseProductPricingByIds.mockReturnValue({
    data: [price('$32')],
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
    renderPage({ isSaleActive: true });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$16');
  });

  it('shows the list price when no sale is running', async () => {
    renderPage({ isSaleActive: false });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$32');
  });

  it('shows the list price for a gift, which the sale does not discount', async () => {
    renderPage({
      isSaleActive: true,
      query: { pid: annual, gift: 'u1' },
    });

    expect(await screen.findByTestId('plan-details')).toHaveTextContent('$32');
  });

  it('shows nothing rather than a price the sale may have moved', () => {
    renderPage({ isSaleActive: true, productOptions: [price('$16', 'pri_x')] });

    expect(screen.queryByText('Plan details')).not.toBeInTheDocument();
  });
});
