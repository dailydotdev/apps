import { render, screen } from '@testing-library/react';
import React from 'react';
import type { ProgressBarProps } from './ProgressBar';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar component', () => {
  const defaultProps: ProgressBarProps = {
    currentChapter: 1,
    currentStep: 1,
    chapters: [{ steps: 3 }, { steps: 2 }],
  };

  it('should render correct number of progress bar elements', () => {
    render(<ProgressBar {...defaultProps} />);
    // Since we have 2 chapters in our mock data, we should have 2 progress bar elements
    const progressBarElements = screen.getAllByTestId('progress-bar-chapter');
    expect(progressBarElements.length).toBe(2);
  });

  it('should display correct progress percentage for current chapter', () => {
    render(
      <ProgressBar {...defaultProps} currentChapter={0} currentStep={2} />,
    );

    // First chapter (index 0) should show progress at 66.67%
    const progressElement = screen.getByTestId('progress-bar-current');
    expect(progressElement).toHaveStyle({ width: '66.66666666666666%' });
  });

  it('should display completed chapters with 100% progress', () => {
    render(
      <ProgressBar {...defaultProps} currentChapter={1} currentStep={1} />,
    );

    // First chapter (index 0) should be complete
    const completeChapterElement = screen.getByTestId('progress-bar-complete');
    expect(completeChapterElement).toHaveStyle({ width: '100%' });
  });
});
