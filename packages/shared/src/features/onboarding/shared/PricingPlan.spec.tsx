import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingPlan, PricingPlanVariation } from './PricingPlan';

const renderComponent = (
  props: Partial<React.ComponentProps<typeof PricingPlan>> = {},
): RenderResult => {
  const defaultProps = {
    name: 'plan',
    value: 'monthly',
    label: 'Monthly',
    price: {
      amount: '$10',
      subtitle: 'per month',
    },
    onChange: jest.fn(),
  };

  return render(<PricingPlan {...defaultProps} {...props} />);
};

describe('PricingPlan', () => {
  it('should render the plan label', () => {
    renderComponent();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('should render the price amount and subtitle', () => {
    renderComponent();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('per month')).toBeInTheDocument();
  });

  it('should call onChange when clicked', () => {
    const onChange = jest.fn();
    renderComponent({ onChange });

    const radioInput = screen.getByRole('radio');
    fireEvent.click(radioInput);

    expect(onChange).toHaveBeenCalled();
  });

  it('should show perks when checked', () => {
    const perks = ['Feature 1', 'Feature 2', 'Feature 3'];
    renderComponent({ perks, checked: true });

    perks.forEach((perk) => {
      expect(screen.getByText(perk)).toBeInTheDocument();
    });
  });

  it('should not show perks when not checked', () => {
    const perks = ['Feature 1', 'Feature 2', 'Feature 3'];
    renderComponent({ perks, checked: false });

    perks.forEach((perk) => {
      expect(screen.queryByText(perk)).not.toBeInTheDocument();
    });
  });

  it('should render badge when provided', () => {
    const badge = { text: 'Popular', background: '#ff0000' };
    renderComponent({ badge });

    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('should apply different background to badge when checked', () => {
    const badge = { text: 'Popular', background: '#ff0000' };
    renderComponent({ badge, checked: true });

    const badgeElement = screen.getByText('Popular');
    expect(badgeElement).toHaveStyle({ background: '#ff0000' });
  });

  it('should apply best value styling when variation is BEST_VALUE', () => {
    renderComponent({ variation: PricingPlanVariation.BEST_VALUE });
    expect(screen.getByTestId('radio-item-wrapper')).toBeInTheDocument();
  });
});
