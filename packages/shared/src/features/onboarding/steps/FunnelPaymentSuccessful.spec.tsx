import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelPaymentSuccessful } from './FunnelPaymentSuccessful';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import type { FunnelStepPaymentSuccessful } from '../types/funnel';

describe('FunnelPaymentSuccessful component', () => {
  const mockOnTransition = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (
    parameters: FunnelStepPaymentSuccessful['parameters'] = {},
  ) => {
    return render(
      <FunnelPaymentSuccessful
        id="payment-successful"
        onTransition={mockOnTransition}
        parameters={parameters}
        type={FunnelStepType.PaymentSuccessful}
        transitions={[
          {
            on: FunnelStepTransitionType.Complete,
            destination: 'completed',
          },
        ]}
      />,
    );
  };

  it('should render the success title', () => {
    renderComponent({ headline: 'You made it!' });
    expect(screen.getByText('You made it!')).toBeInTheDocument();
  });

  it('should render payment success message', () => {
    renderComponent();
    expect(
      screen.getByText("Your payment is complete, you're all set."),
    ).toBeInTheDocument();
  });

  it('should render continue button', () => {
    renderComponent({ cta: 'Continue!' });
    const continueButton = screen.getByRole('button', { name: 'Continue!' });
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
