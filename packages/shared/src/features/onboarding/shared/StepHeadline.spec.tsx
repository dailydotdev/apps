import React from 'react';
import { render, screen } from '@testing-library/react';
import StepHeadline, { StepHeadlineAlign } from './StepHeadline';
import { TypographyType } from '../../../components/typography/Typography';

const defaultProps = {
  heading: 'Test Headline',
  description: 'Test description text',
};

const renderComponent = (props = {}) => {
  return render(<StepHeadline {...defaultProps} {...props} />);
};

describe('StepHeadline', () => {
  it('should render headline and description text', () => {
    renderComponent();
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test description text')).toBeInTheDocument();
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

  it('should apply custom props to description text', () => {
    renderComponent({
      description: 'Test description text',
      descriptionProps: { type: TypographyType.Subhead },
    });
    const description = screen.getByTestId('step-headline-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('typo-subhead');
  });

  it('should not render description when not provided', () => {
    renderComponent({ description: undefined });
    expect(
      screen.queryByTestId('step-headline-description'),
    ).not.toBeInTheDocument();
  });
});
