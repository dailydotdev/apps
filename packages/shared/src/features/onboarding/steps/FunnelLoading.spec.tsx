import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelStepType, FunnelStepTransitionType } from '../types/funnel';
import type { FunnelStepLoading } from '../types/funnel';
import FunnelLoading from './FunnelLoading';

// Mock the useState hook to control the percentage state
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn(),
  };
});

describe('FunnelLoading', () => {
  const defaultProps: FunnelStepLoading = {
    parameters: {
      headline: 'Test Loading Headline',
      explainer: 'Test loading description',
    },
    id: 'loading-step',
    type: FunnelStepType.Loading,
    onTransition: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useState mock to default behavior
    (React.useState as jest.Mock).mockImplementation(
      jest.requireActual('react').useState,
    );
  });

  it('should render headline and description from parameters', () => {
    render(<FunnelLoading {...defaultProps} />);

    expect(screen.getByText('Test Loading Headline')).toBeInTheDocument();
    expect(screen.getByText('Test loading description')).toBeInTheDocument();
  });

  it('should use default headline and description when not provided', () => {
    render(<FunnelLoading {...defaultProps} parameters={{}} />);

    expect(screen.getByText('Lining up your next move...')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Based on everything you shared, we're lining up insights that match where you're headed. Give us a sec.",
      ),
    ).toBeInTheDocument();
  });

  it('should display percentage in the progress circle', () => {
    // Mock useState to return a fixed percentage
    (React.useState as jest.Mock).mockImplementationOnce(() => [25, jest.fn()]);

    render(<FunnelLoading {...defaultProps} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should call onTransition when percentage reaches 100', () => {
    // Mock useState to return 100% for percentage
    (React.useState as jest.Mock).mockImplementationOnce(() => [
      100,
      jest.fn(),
    ]);

    render(<FunnelLoading {...defaultProps} />);

    expect(defaultProps.onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
    });
  });

  it('should not call onTransition when percentage is less than 100', () => {
    // Mock useState to return 99% for percentage
    (React.useState as jest.Mock).mockImplementationOnce(() => [99, jest.fn()]);

    render(<FunnelLoading {...defaultProps} />);

    expect(defaultProps.onTransition).not.toHaveBeenCalled();
  });
});
