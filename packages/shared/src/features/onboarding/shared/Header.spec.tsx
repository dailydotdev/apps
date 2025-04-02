import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { HeaderProps } from './Header';
import { Header } from './Header';

describe('Header component', () => {
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();
  const defaultProps: HeaderProps = {
    currentChapter: 1,
    currentStep: 1,
    chapters: [{ steps: 3 }, { steps: 2 }],
    showBackButton: true,
    showSkipButton: true,
    showProgressBar: true,
    onBack: mockOnBack,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not show back button on first step', () => {
    render(<Header {...defaultProps} showBackButton={false} />);
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('should show back button after first step', () => {
    render(<Header {...defaultProps} currentChapter={1} currentStep={2} />);
    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should show skip button when enabled', () => {
    render(<Header {...defaultProps} />);
    const skipButton = screen.getByRole('button', { name: 'Skip' });
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('should not show skip button when disabled', () => {
    render(<Header {...defaultProps} showSkipButton={false} />);
    expect(
      screen.queryByRole('button', { name: 'Skip' }),
    ).not.toBeInTheDocument();
  });

  it('should not show back button when disabled', () => {
    render(
      <Header
        {...defaultProps}
        showBackButton={false}
        currentChapter={2}
        currentStep={1}
      />,
    );
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('should show progress bar when enabled', () => {
    render(<Header {...defaultProps} />);
    expect(screen.queryByTestId('progress-bar-container')).toBeInTheDocument();
  });

  it('should not show progress bar when disabled', () => {
    render(<Header {...defaultProps} showProgressBar={false} />);
    expect(
      screen.queryByTestId('progress-bar-container'),
    ).not.toBeInTheDocument();
  });
});
