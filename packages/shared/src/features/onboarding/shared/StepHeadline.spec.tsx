import React from 'react';
import { render, screen } from '@testing-library/react';
import StepHeadline, { StepHeadlineAlign } from './StepHeadline';
import { TypographyType } from '../../../components/typography/Typography';

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
    renderComponent({ align: StepHeadlineAlign.Center });
    const container = screen.getByTestId('step-headline-container');
    expect(container).toHaveClass('text-center');
  });

  it('should have text-left class when align is left', () => {
    renderComponent({ align: StepHeadlineAlign.Left });
    const container = screen.getByTestId('step-headline-container');
    expect(container).toHaveClass('text-left');
  });

  it('should have text-right class when align is right', () => {
    renderComponent({ align: StepHeadlineAlign.Right });
    const container = screen.getByTestId('step-headline-container');
    expect(container).toHaveClass('text-right');
  });

  it('should apply custom props to explainer text', () => {
    renderComponent({
      explainer: 'Test explainer text',
      explainerProps: { type: TypographyType.Subhead },
    });
    const explainer = screen.getByTestId('step-headline-explainer');
    expect(explainer).toBeInTheDocument();
    expect(explainer).toHaveClass('typo-subhead');
  });

  it('should not render explainer when not provided', () => {
    renderComponent({ explainer: undefined });
    expect(
      screen.queryByTestId('step-headline-explainer'),
    ).not.toBeInTheDocument();
  });
});
