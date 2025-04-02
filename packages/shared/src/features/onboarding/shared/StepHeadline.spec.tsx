import React from 'react';
import { render, screen } from '@testing-library/react';
import StepHeadline from './StepHeadline';
import { FunnelStepType } from '../types/funnel';

const defaultProps = {
  headline: 'Test Headline',
  explainer: 'Test explainer text',
};

const renderComponent = (props = {}) => {
  return render(<StepHeadline {...defaultProps} {...props} />);
};

describe('StepHeadline', () => {
  it('should render headline and explainer text', () => {
    renderComponent();
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test explainer text')).toBeInTheDocument();
  });

  it('should have text-center class when align is center', () => {
    renderComponent({ align: 'center' });
    const container = screen.getByTestId('step-headline-container');
    expect(container).toHaveClass('text-center');
  });

  it('should have text-left class when align is left', () => {
    renderComponent({ align: 'left' });
    const container = screen.getByTestId('step-headline-container');
    expect(container).toHaveClass('text-left');
  });

  it('should use tertiary color for quiz type', () => {
    renderComponent({ type: FunnelStepType.Quiz });
    const explainer = screen.getByTestId('step-headline-explainer');
    expect(explainer).toHaveClass('text-text-tertiary');
  });

  it('should use primary color for non-quiz types', () => {
    renderComponent({ type: FunnelStepType.Fact });
    const explainer = screen.getByTestId('step-headline-explainer');
    expect(explainer).toHaveClass('text-text-primary');
  });
});
