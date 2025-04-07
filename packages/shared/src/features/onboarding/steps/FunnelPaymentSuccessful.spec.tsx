import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FunnelPaymentSuccessful from './FunnelPaymentSuccessful';
import { FunnelStepTransitionType } from '../types/funnel';

describe('FunnelPaymentSuccessful component', () => {
  const mockOnTransition = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(<FunnelPaymentSuccessful onTransition={mockOnTransition} />);
  };

  it('should render the success title', () => {
    renderComponent();
    expect(screen.getByText('Payment successful!')).toBeInTheDocument();
  });

  it('should render payment success message', () => {
    renderComponent();
    expect(
      screen.getByText("Your payment is complete, you're all set."),
    ).toBeInTheDocument();
  });

  it('should render continue button', () => {
    renderComponent();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
  });

  it('should call onTransition with Complete when continue button is clicked', () => {
    renderComponent();
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    fireEvent.click(continueButton);

    expect(mockOnTransition).toHaveBeenCalledTimes(1);
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
    });
  });
});
