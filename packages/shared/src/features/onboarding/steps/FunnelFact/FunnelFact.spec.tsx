import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelFact } from '.';
import { FunnelStepType } from '../../types/funnel';
import type { FunnelStepFact } from '../../types/funnel';
import { StepHeadlineAlign } from '../../shared';

import { useIsLightTheme } from '../../../../hooks/utils';

// Add useIsLightTheme mock
jest.mock('../../../../hooks/utils', () => ({
  useIsLightTheme: jest.fn(),
}));

const mockOnTransition = jest.fn();

const defaultProps: FunnelStepFact = {
  id: 'test-id',
  type: FunnelStepType.Fact,
  transitions: [],
  parameters: {
    headline: 'Test Headline',
    explainer: 'Test explanation text',
    align: StepHeadlineAlign.Center,
    cta: 'Continue',
  },
  onTransition: mockOnTransition,
};

const renderComponent = (props = {}) => {
  return render(<FunnelFact {...defaultProps} {...props} />);
};

describe('FunnelFact', () => {
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

  it('should render badge when provided', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        badge: {
          cta: 'Badge CTA',
          variant: 'primary',
          placement: 'top',
        },
      },
    });

    expect(await screen.findByText('Badge CTA')).toBeInTheDocument();
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

    const content = screen.getByTestId('step-content');
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

  it('should render dark mode image when in dark mode', async () => {
    // Mock dark mode
    (useIsLightTheme as jest.Mock).mockReturnValue(false);

    const darkModeUrl = 'https://example.com/dark-image.png';
    const lightModeUrl = 'https://example.com/light-image.png';

    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        visualUrl: darkModeUrl,
        visualUrlLightMode: lightModeUrl,
      },
    });

    const image = screen.getByAltText(
      'Supportive illustration for the information',
    );
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', darkModeUrl);
  });

  it('should render light mode image when in light mode', async () => {
    // Mock light mode
    (useIsLightTheme as jest.Mock).mockReturnValue(true);

    const darkModeUrl = 'https://example.com/dark-image.png';
    const lightModeUrl = 'https://example.com/light-image.png';

    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        visualUrl: darkModeUrl,
        visualUrlLightMode: lightModeUrl,
      },
    });

    const image = screen.getByAltText(
      'Supportive illustration for the information',
    );
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', lightModeUrl);
  });

  it('should pass left alignment to StepHeadline when specified', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        align: StepHeadlineAlign.Left,
      },
    });

    const headlineContainer = screen.getByTestId('step-headline-container');
    expect(headlineContainer).toHaveClass('text-left');
    expect(headlineContainer).not.toHaveClass('text-center');
  });
});
