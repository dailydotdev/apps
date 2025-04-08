import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import type { FunnelStepLoading } from '../types/funnel';
import FunnelLoading from './FunnelLoading';

jest.useFakeTimers();

describe('funnelLoading', () => {
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

  it('should display the initial 0% in the progress circle', () => {
    render(<FunnelLoading {...defaultProps} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should update the percentage as animation progresses', () => {
    render(<FunnelLoading {...defaultProps} />);

    // Initial state
    expect(screen.getByText('0%')).toBeInTheDocument();

    // First segment completion
    act(() => {
      jest.advanceTimersByTime(1600); // ~30% of animation duration
    });

    // Should be somewhere in the progress
    const percentageText = screen.getByText(/\d+%/);
    expect(parseInt(percentageText.textContent, 10)).toBeGreaterThan(0);
  });

  it('should call onTransition when reaching 100%', () => {
    render(<FunnelLoading {...defaultProps} />);

    // Fast forward to completion
    act(() => {
      jest.advanceTimersByTime(5000); // Beyond animation duration
    });

    expect(defaultProps.onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
    });
  });

  it('should cleanup animation on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(<FunnelLoading {...defaultProps} />);

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
