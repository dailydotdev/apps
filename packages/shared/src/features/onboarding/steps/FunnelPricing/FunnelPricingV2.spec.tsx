import type { PropsWithChildren } from 'react';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { FunnelPricingV2 } from './FunnelPricingV2';
import type { FunnelStepPricingV2 } from '../../types/funnel';
import {
  FunnelStepType,
  FunnelStepTransitionType,
  FunnelPricingType,
} from '../../types/funnel';
import { PricingPlanVariation } from '../../shared';
import { setupDateMock } from '../../../../../__tests__/helpers/dateMock';
import {
  applyDiscountAtom,
  discountTimerAtom,
  selectedPlanAtom,
} from '../../store/funnel.store';
import { PaymentContext } from '../../../../contexts/payment/context';
import type { ProductPricingPreview } from '../../../../graphql/paddle';
import {
  PlusPriceType,
  PlusPriceTypeAppsId,
} from '../../../../lib/featureValues';

const mockOnTransition = jest.fn();

// Hydration component to set initial atom values
const HydrateAtoms = ({
  initialValues,
  children,
}: PropsWithChildren<{
  initialValues: typeof useHydrateAtoms extends (values: infer T) => void
    ? T
    : never;
}>) => {
  useHydrateAtoms(initialValues);
  return children;
};

const mockPricingParameters: FunnelStepPricingV2['parameters'] = {
  version: 'v2',
  discount: {
    message: 'Your special offer is live for the next:',
    duration: 15,
  },
  hero: {
    image: '/images/onboarding/pricing-v2-header.png',
    headline: "It's time to level up",
    explainer:
      'Stay ahead, grow your skills, and get noticed. Less effort, more results.',
  },
  features: {
    heading: 'What you get',
    items: [
      'Curated content from top sources',
      'Easy discovery of trending tools',
      'AI-powered learning, simplified',
    ],
  },
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
  plansBlock: {
    heading: 'Your personalized plan is ready!',
    timer: {
      message: 'This offer ends in',
    },
    pricingType: FunnelPricingType.Monthly,
    defaultPlan: 'annual',
    ctaMessage: '30-day money-back guarantee',
    cta: 'Get my plan',
  },
  refund: {
    title: '100% money back guarantee',
    content: "We're confident in the quality of our plan.",
    image: 'https://example.com/checkmark.jpg',
  },
  reviews: {
    heading: 'Engineers ❤️ daily.dev',
    items: [
      {
        authorImage: 'https://example.com/author1.jpg',
        authorInfo: 'Dave N., Senior Data Scientist',
        reviewText:
          "This is the only tool I've stuck with for more than a month.",
      },
    ],
  },
  trust: {
    image: 'https://example.com/trust.jpg',
  },
  faq: {
    items: [
      {
        question: 'How do I cancel?',
        answer: 'You can cancel anytime from your account settings.',
      },
    ],
  },
};

const defaultProps: FunnelStepPricingV2 = {
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
  discountStartDate?: Date | null;
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
      monthly: {
        amount: 15,
        formatted: '$15',
      },
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
      monthly: {
        amount: 12.5,
        formatted: '$12.50',
      },
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
  const discountStartDate =
    initialState.discountStartDate !== undefined
      ? initialState.discountStartDate
      : new Date('2023-01-01T00:00:00Z');

  return render(
    <Provider>
      <HydrateAtoms
        initialValues={[
          [selectedPlanAtom, selectedPlan],
          [applyDiscountAtom, applyDiscount],
          [discountTimerAtom, discountStartDate],
        ]}
      >
        <PaymentContext.Provider
          value={{
            productOptions: mockProductOptions,
            isPlusAvailable: true,
            isPricesPending: false,
          }}
        >
          <FunnelPricingV2 {...defaultProps} {...props} />
        </PaymentContext.Provider>
      </HydrateAtoms>
    </Provider>,
  );
};

describe('FunnelPricingV2', () => {
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

    // Find all radio inputs
    const checkedRadios = screen.getAllByRole<HTMLInputElement>('radio', {
      checked: true,
    });
    const uniqueCheckedValues = [
      ...new Set(checkedRadios.map((radio) => radio.value)),
    ];

    expect(uniqueCheckedValues.length).toBe(1);
    expect(checkedRadios[0].value).toBe('annual');
  });

  it('should call onTransition with the selected plan when clicking the CTA button', () => {
    renderComponent();

    const proceedButton = screen
      .getAllByText('Get my plan')
      // skip the first link which is not the CTA
      .filter((button) => button.tagName === 'BUTTON')
      .at(0);
    fireEvent.click(proceedButton);

    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'annual', applyDiscount: true },
    });
  });

  it('should switch plans when clicking on a different plan', () => {
    renderComponent({}, { selectedPlan: 'annual' });

    // Get the monthly plan radio button
    const monthlyPlan = screen
      .getAllByRole('radio')
      .find((input) => input.getAttribute('value') === 'monthly');

    // Click on the monthly plan
    fireEvent.click(monthlyPlan);

    // Then click the CTA
    const proceedButton = screen
      .getAllByText('Get my plan')
      // skip the first link which is not the CTA
      .filter((button) => button.tagName === 'BUTTON')
      .at(0);
    fireEvent.click(proceedButton);

    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'monthly', applyDiscount: true },
    });
  });

  it('should set applyDiscount to false when the timer expires', () => {
    renderComponent();

    // Simulate timer expiration by calling the onTimerEnd function
    const discountTimer = screen.getAllByTestId('mini-discount-timer');
    expect(discountTimer.length).toBe(2);

    // Simulate timer expiration
    dateMock.advanceTimeByMinutes(16);

    // Click the CTA button
    const proceedButton = screen
      .getAllByText('Get my plan')
      // skip the first link which is not the CTA
      .filter((button) => button.tagName === 'BUTTON')
      .at(0);
    fireEvent.click(proceedButton);

    // Check if mockOnTransition was called with applyDiscount: false
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { plan: 'annual', applyDiscount: false },
    });
  });

  it('should render all major sections of the pricing page', () => {
    renderComponent();

    // Check for hero section
    expect(screen.getByText("It's time to level up")).toBeInTheDocument();

    // Check for features section
    expect(screen.getByText('What you get')).toBeInTheDocument();

    expect(
      screen.getAllByText('100% money back guarantee').length,
    ).toBeGreaterThan(0);

    // Check for reviews section
    expect(screen.getByText('Engineers ❤️ daily.dev')).toBeInTheDocument();

    // Check for FAQ section
    expect(screen.getByText('How do I cancel?')).toBeInTheDocument();
  });

  it('should initialize discount timer when component becomes active', () => {
    // Re-render with isActive=true
    renderComponent({ isActive: true }, { discountStartDate: null });

    // Timer should be initialized now
    expect(screen.getByTestId('discount-message')).toBeInTheDocument();
    expect(screen.getByTestId('timer-display')).toHaveTextContent('15:00');
  });

  it('should display badges on pricing plans', () => {
    renderComponent();

    const badges = screen.getAllByTestId('plan-badge');
    const badgeTexts = badges.map((badge) => badge.textContent);

    expect(badgeTexts).toContain('Popular');
    expect(badgeTexts).toContain('Save 50%');
  });

  it('should not show discount timer when applyDiscount is false', () => {
    renderComponent({}, { applyDiscount: false });

    // Timer should not be visible
    expect(screen.queryByTestId('discount-message')).not.toBeInTheDocument();
  });
});
