import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header component', () => {
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();
  const defaultProps = {
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

  it('should render correct number of progress bar elements', () => {
    render(<Header {...defaultProps} />);
    // Since we have 2 chapters in our mock data, we should have 2 progress bar elements
    const progressBarElements = screen.getAllByTestId('progress-bar-chapter');
    expect(progressBarElements.length).toBe(2);
  });

  it('should not show progress bar when disabled', () => {
    render(<Header {...defaultProps} showProgressBar={false} />);
    expect(
      screen.queryByTestId('progress-bar-container'),
    ).not.toBeInTheDocument();
  });

  it('should display correct progress percentage for current chapter', () => {
    render(<Header {...defaultProps} currentChapter={0} currentStep={2} />);

    // First chapter (index 0) should show progress at 66.67%
    const progressElement = screen.getByTestId('progress-bar-current');
    expect(progressElement).toHaveStyle({ width: '66.66666666666666%' });
  });

  it('should display completed chapters with 100% progress', () => {
    render(<Header {...defaultProps} currentChapter={1} currentStep={1} />);

    // First chapter (index 0) should be complete
    const completeChapterElement = screen.getByTestId('progress-bar-complete');
    expect(completeChapterElement).toHaveStyle({ width: '100%' });
  });
});
