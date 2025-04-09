import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelPricing } from './FunnelPricing';
import type { FunnelStepPricing } from '../types/funnel';
import { FunnelStepType, FunnelStepTransitionType } from '../types/funnel';
import { PricingPlanVariation } from '../shared/PricingPlan';
import { setupDateMock } from '../../../../__tests__/helpers/dateMock';

const mockOnTransition = jest.fn();

const defaultProps: FunnelStepPricing = {
  id: 'test-id',
  type: FunnelStepType.Pricing,
  transitions: [],
  parameters: {},
  defaultPlan: 'annual',
  discount: {
    message:
      'Get <b>additional 20% discount</b> if you subscribe in the next 15 minutes',
    duration: 15,
    startDate: new Date('2023-01-01T00:00:00Z'),
  },
  headline: 'Choose your plan',
  pricing: {
    perks: [],
    plans: [
      {
        id: 'monthly',
        value: 'monthly',
        label: 'Monthly',
        price: {
          amount: '$0.49',
          subtitle: 'per day',
        },
        badge: {
          text: 'Popular',
          background: '#CE3DF3',
        },
      },
      {
        id: 'annual',
        value: 'annual',
        label: 'Annual',
        price: {
          amount: '$0.24',
          subtitle: 'per day',
        },
        badge: {
          text: 'Save 50%',
          background: '#0ABA6E',
        },
        variation: PricingPlanVariation.BEST_VALUE,
      },
    ],
  },
  cta: 'Checkout',
  featuresList: {
    title: 'Your new abilities',
    items: [],
  },
  review: {
    image: 'https://example.com/review.jpg',
    reviewText: "This is the only tool I've stuck with for more than a month.",
    authorInfo: 'Dave N., Senior Data Scientist',
    authorImage: 'https://example.com/avatar.jpg',
  },
  refund: {
    image: {
      src: 'https://example.com/checkmark.jpg',
      alt: 'Checkmark',
    },
    title: '100% money back guarantee',
    content: "We're confident in the quality of our plan.",
  },
  faq: {
    items: [],
  },
  onTransition: mockOnTransition,
  isActive: true,
};

const renderComponent = (props = {}) => {
  return render(<FunnelPricing {...defaultProps} {...props} />);
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
    renderComponent();

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
    renderComponent();

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
});
