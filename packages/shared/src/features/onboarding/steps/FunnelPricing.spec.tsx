import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { FunnelPricing } from './FunnelPricing';
import type {
  FunnelStepPricing,
  FunnelStepPricingParameters,
} from '../types/funnel';
import { FunnelStepType, FunnelStepTransitionType } from '../types/funnel';
import { PricingPlanVariation } from '../shared/PricingPlan';
import { setupDateMock } from '../../../../__tests__/helpers/dateMock';
import { applyDiscountAtom, selectedPlanAtom } from '../store/funnelStore';
import { PaymentContext } from '../../../contexts/payment/context';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../../lib/featureValues';

const mockOnTransition = jest.fn();

jest.mock('jotai-history', () => ({
  withHistory: jest.fn(),
}));

type HydrateAtomsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues: [any, any][];
  children: React.ReactNode;
};

// Hydration component to set initial atom values
const HydrateAtoms = ({ initialValues, children }: HydrateAtomsProps) => {
  useHydrateAtoms(initialValues);
  return children;
};

const mockPricingParameters: FunnelStepPricingParameters = {
  headline: 'Choose your plan',
  cta: 'Checkout',
  discount: {
    message:
      'Get <b>additional 20% discount</b> if you subscribe in the next 15 minutes',
    duration: 15,
  },
  defaultPlan: 'annual',
  plans: [
    {
      priceId: 'monthly',
      label: 'Monthly',
      badge: {
        text: 'Popular',
        background: '#CE3DF3',
      },
    },
    {
      priceId: 'annual',
      label: 'Annual',
      variation: PricingPlanVariation.BEST_VALUE,
      badge: {
        text: 'Save 50%',
        background: '#0ABA6E',
      },
    },
  ],
  perks: ['Unlimited Access', '24/7 Support'],
  featuresList: {
    title: 'Your new abilities',
    items: ['Access to premium content', 'Advanced filtering'],
  },
  review: {
    reviewText: "This is the only tool I've stuck with for more than a month.",
    authorInfo: 'Dave N., Senior Data Scientist',
    image: 'https://example.com/review.jpg',
    authorImage: 'https://example.com/avatar.jpg',
  },
  refund: {
    title: '100% money back guarantee',
    content: "We're confident in the quality of our plan.",
    image: 'https://example.com/checkmark.jpg',
  },
  faq: [
    {
      question: 'How do I cancel?',
      answer: 'You can cancel anytime from your account settings.',
    },
  ],
};

const defaultProps: FunnelStepPricing = {
  id: 'test-id',
  type: FunnelStepType.Pricing,
  transitions: [],
  parameters: mockPricingParameters,
  onTransition: mockOnTransition,
  isActive: true,
  discountStartDate: new Date('2023-01-01T00:00:00Z'),
};

// Interface for initial test state
interface InitialState {
  selectedPlan?: string;
  applyDiscount?: boolean;
}

const mockProductOptions: ProductPricingPreview[] = [
  {
    metadata: {
      appsId: PlusPriceTypeAppsId.Default,
      title: 'Monthly',
      idMap: {
        paddle: 'monthly',
        ios: 'monthly',
      },
    },
    priceId: 'monthly',
    price: {
      amount: 15,
      formatted: '$15',
      daily: {
        amount: 0.49,
        formatted: '$0.49',
      },
    },
    currency: {
      code: 'USD',
      symbol: '$',
    },
    duration: PlusPriceType.Monthly,
  },
  {
    metadata: {
      appsId: PlusPriceTypeAppsId.Default,
      title: 'Annual',
      idMap: {
        paddle: 'annual',
        ios: 'annual',
      },
    },
    priceId: 'annual',
    price: {
      amount: 150,
      formatted: '$150',
      daily: {
        amount: 0.24,
        formatted: '$0.24',
      },
    },
    currency: {
      code: 'USD',
      symbol: '$',
    },
    duration: PlusPriceType.Yearly,
  },
];

const renderComponent = (props = {}, initialState: InitialState = {}) => {
  // Use the provided values or defaults
  const selectedPlan = initialState.selectedPlan || 'annual';
  const applyDiscount =
    initialState.applyDiscount !== undefined
      ? initialState.applyDiscount
      : true;

  return render(
    <Provider>
      <HydrateAtoms
        initialValues={[
          [selectedPlanAtom, selectedPlan],
          [applyDiscountAtom, applyDiscount],
        ]}
      >
        <PaymentContext.Provider
          value={{
            productOptions: mockProductOptions,
            isPlusAvailable: true,
            isPricesPending: false,
          }}
        >
          <FunnelPricing {...defaultProps} {...props} />
        </PaymentContext.Provider>
      </HydrateAtoms>
    </Provider>,
  );
};

describe('FunnelPricing', () => {
  let dateMock;
  const initialDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    dateMock = setupDateMock(initialDate);
    jest.clearAllMocks();
  });

  afterEach(() => {
    dateMock.cleanup();
    jest.clearAllMocks();
  });

  it('selects the default plan on initial render', () => {
    renderComponent();

    // Find all radio inputs and filter for the checked ones
    const allRadios = screen.getAllByRole('radio');
    const checkedRadios = allRadios.filter(
      (radio) => radio.getAttribute('checked') !== null,
    );

    expect(checkedRadios.length).toEqual(2);
    // eslint-disable-next-line jest-dom/prefer-to-have-attribute
    expect(checkedRadios[0].getAttribute('value')).toEqual('annual');
  });

  it('should call onTransition with the selected plan when clicking the CTA button', () => {
    renderComponent();

    const proceedButtons = screen.getAllByText('Checkout');
    fireEvent.click(proceedButtons[0]);

    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'annual', applyDiscount: true },
    });
  });

  it('should switch plans when clicking on a different plan', () => {
    renderComponent({}, { selectedPlan: 'annual' });

    // Get the monthly plan radio button by finding the input with value="monthly"
    const monthlyInputs = screen.getAllByRole('radio');
    const monthlyPlan = monthlyInputs.find(
      (input) => input.getAttribute('value') === 'monthly',
    );

    // Click on the monthly plan
    fireEvent.click(monthlyPlan);

    // Then click the CTA
    const proceedButtons = screen.getAllByText('Checkout');
    fireEvent.click(proceedButtons[0]);

    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'monthly', applyDiscount: true },
    });
  });

  it('should set applyDiscount to false when the timer expires', async () => {
    renderComponent({}, { applyDiscount: false });

    // First verify the timer is shown
    const timerDisplay = screen.getByTestId('timer-display');
    expect(timerDisplay).toHaveTextContent('15:00');

    // Simulate timer expiration
    dateMock.advanceTimeByMinutes(16);

    // Click the CTA button
    const proceedButtons = screen.getAllByText('Checkout');
    fireEvent.click(proceedButtons[0]);

    // Check if mockOnTransition was called with applyDiscount: false
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'annual', applyDiscount: false },
    });
  });

  it('should display the correct prices for plans', () => {
    renderComponent();

    // Annual price should be displayed for the annual plan
    const annualPriceElements = screen.getAllByText('$0.24');
    expect(annualPriceElements.length).toBeGreaterThan(0);

    // Per day subtitle should be displayed
    const perDayElements = screen.getAllByText('per day');
    expect(perDayElements.length).toBeGreaterThan(0);

    // Monthly price should be displayed for the monthly plan
    const monthlyPriceElements = screen.getAllByText('$0.49');
    expect(monthlyPriceElements.length).toBeGreaterThan(0);

    // Badges should be displayed
    expect(screen.getAllByText('Save 50%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Popular').length).toBeGreaterThan(0);
  });
});
