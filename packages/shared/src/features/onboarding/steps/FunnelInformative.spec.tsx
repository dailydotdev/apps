import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FunnelInformative from './FunnelInformative';
import { FunnelStepType } from '../types/funnel';
import type { FunnelInformativeProps } from './FunnelInformative';

const mockOnTransition = jest.fn();

const defaultProps: FunnelInformativeProps = {
  id: 'test-id',
  type: FunnelStepType.Fact,
  transitions: [],
  parameters: {
    headline: 'Test Headline',
    explainer: 'Test explanation text',
    align: 'center',
    cta: 'Continue',
  },
  onTransition: mockOnTransition,
};

const renderComponent = (props = {}) => {
  return render(<FunnelInformative {...defaultProps} {...props} />);
};

describe('FunnelInformative', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render headline and explainer text', async () => {
    renderComponent();
    expect(await screen.findByText('Test Headline')).toBeInTheDocument();
    expect(
      await screen.findByText('Test explanation text'),
    ).toBeInTheDocument();
  });

  it('should call onTransition when button is clicked', async () => {
    renderComponent();
    const button = await screen.findByText('Continue');
    fireEvent.click(button);
    expect(mockOnTransition).toHaveBeenCalledTimes(1);
  });

  it('should use "Next" as default CTA text when not provided', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        cta: undefined,
      },
    });
    expect(await screen.findByText('Next')).toBeInTheDocument();
  });

  it('should render with reverse layout when specified', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        reverse: 'true',
      },
    });

    const content = screen.getByTestId('informative-content');
    expect(content).toHaveClass('flex-col-reverse');
  });

  it('should render an image when visualUrl is provided', async () => {
    const visualUrl = 'https://example.com/image.png';
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        visualUrl,
      },
    });

    const image = screen.getByAltText(
      'Supportive illustration for the information',
    );
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', visualUrl);
  });

  it('should pass left alignment to StepHeadline when specified', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        align: 'left',
      },
    });

    const headlineContainer = screen.getByTestId('step-headline-container');
    expect(headlineContainer).toHaveClass('text-left');
    expect(headlineContainer).not.toHaveClass('text-center');
  });
});
