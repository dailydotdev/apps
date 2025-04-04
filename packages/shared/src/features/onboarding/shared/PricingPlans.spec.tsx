import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingPlans } from './PricingPlans';

// Mock the PricingPlan component to simplify tests
jest.mock('./PricingPlan', () => {
  const actual = jest.requireActual('./PricingPlan');
  return {
    PricingPlan: jest.fn(({ children, onChange, ...props }) => (
      <button
        type="button"
        data-testid="pricing-plan"
        data-props={JSON.stringify(props)}
        onClick={() => onChange && onChange()}
      >
        {children}
      </button>
    )),
    PricingPlanVariation: actual.PricingPlanVariation,
  };
});

const mockPlans = [
  {
    value: 'monthly',
    label: 'Monthly',
    id: 'monthly',
    price: {
      amount: '$10',
      subtitle: 'billed monthly',
    },
  },
  {
    value: 'yearly',
    label: 'Yearly',
    id: 'yearly',
    price: {
      amount: '$100',
      subtitle: 'billed yearly',
    },
    isBestValue: true,
  },
];

const mockPerks = ['Feature 1', 'Feature 2', 'Feature 3'];

const renderComponent = (
  props: Partial<React.ComponentProps<typeof PricingPlans>> = {},
): RenderResult => {
  const defaultProps = {
    name: 'subscription',
    plans: mockPlans,
    perks: mockPerks,
    onChange: jest.fn(),
  };

  return render(<PricingPlans {...defaultProps} {...props} />);
};

describe('PricingPlans', () => {
  it('should render all plans', () => {
    renderComponent();
    const pricingPlans = screen.getAllByTestId('pricing-plan');
    expect(pricingPlans).toHaveLength(2);
  });

  it('should pass perks to all PricingPlan components', () => {
    const customPerks = ['Custom Feature 1', 'Custom Feature 2'];
    renderComponent({ perks: customPerks });

    const pricingPlans = screen.getAllByTestId('pricing-plan');

    pricingPlans.forEach((plan) => {
      const planProps = JSON.parse(plan.getAttribute('data-props') || '{}');
      expect(planProps.perks).toEqual(customPerks);
    });
  });

  it('should call onChange with the correct value when a plan is selected', () => {
    const onChange = jest.fn();
    renderComponent({ onChange });

    const pricingPlans = screen.getAllByTestId('pricing-plan');

    // Simulate clicking the yearly plan
    fireEvent.click(pricingPlans[1]);

    expect(onChange).toHaveBeenCalledWith('yearly');
  });
});
