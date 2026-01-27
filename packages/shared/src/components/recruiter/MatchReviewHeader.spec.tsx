import type { RenderResult } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { MatchReviewHeaderProps } from './MatchReviewHeader';
import { MatchReviewHeader } from './MatchReviewHeader';

const defaultProps: MatchReviewHeaderProps = {
  currentMatch: 1,
  totalMatches: 5,
  name: 'John Doe',
  onReject: jest.fn(),
  onApprove: jest.fn(),
};

const renderComponent = (
  props: Partial<MatchReviewHeaderProps> = {},
): RenderResult => {
  return render(<MatchReviewHeader {...defaultProps} {...props} />);
};

describe('MatchReviewHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the candidate name', async () => {
    renderComponent();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('should display current match and total matches', async () => {
    renderComponent({ currentMatch: 2, totalMatches: 10 });
    expect(await screen.findByText('2 of 10 for review')).toBeInTheDocument();
  });

  describe('navigation arrows', () => {
    it('should render previous and next navigation buttons', async () => {
      renderComponent();
      expect(
        await screen.findByRole('button', { name: 'Previous match' }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: 'Next match' }),
      ).toBeInTheDocument();
    });

    it('should disable previous button when hasPrevious is false', async () => {
      renderComponent({ hasPrevious: false, hasNext: true });
      const prevButton = await screen.findByRole('button', {
        name: 'Previous match',
      });
      expect(prevButton).toBeDisabled();
    });

    it('should enable previous button when hasPrevious is true', async () => {
      renderComponent({ hasPrevious: true, hasNext: true });
      const prevButton = await screen.findByRole('button', {
        name: 'Previous match',
      });
      expect(prevButton).toBeEnabled();
    });

    it('should disable next button when hasNext is false', async () => {
      renderComponent({ hasPrevious: true, hasNext: false });
      const nextButton = await screen.findByRole('button', {
        name: 'Next match',
      });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when hasNext is true', async () => {
      renderComponent({ hasPrevious: true, hasNext: true });
      const nextButton = await screen.findByRole('button', {
        name: 'Next match',
      });
      expect(nextButton).toBeEnabled();
    });

    it('should call onPrevious when previous button is clicked', async () => {
      const onPrevious = jest.fn();
      renderComponent({ onPrevious, hasPrevious: true });
      const prevButton = await screen.findByRole('button', {
        name: 'Previous match',
      });
      fireEvent.click(prevButton);
      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when next button is clicked', async () => {
      const onNext = jest.fn();
      renderComponent({ onNext, hasNext: true });
      const nextButton = await screen.findByRole('button', {
        name: 'Next match',
      });
      fireEvent.click(nextButton);
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should not call onPrevious when previous button is disabled', async () => {
      const onPrevious = jest.fn();
      renderComponent({ onPrevious, hasPrevious: false });
      const prevButton = await screen.findByRole('button', {
        name: 'Previous match',
      });
      fireEvent.click(prevButton);
      expect(onPrevious).not.toHaveBeenCalled();
    });

    it('should not call onNext when next button is disabled', async () => {
      const onNext = jest.fn();
      renderComponent({ onNext, hasNext: false });
      const nextButton = await screen.findByRole('button', {
        name: 'Next match',
      });
      fireEvent.click(nextButton);
      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe('action buttons', () => {
    it('should render Reject button when onReject is provided', async () => {
      renderComponent();
      expect(
        await screen.findByRole('button', { name: /reject/i }),
      ).toBeInTheDocument();
    });

    it('should render Approve button when onApprove is provided', async () => {
      renderComponent();
      expect(
        await screen.findByRole('button', { name: /approve/i }),
      ).toBeInTheDocument();
    });

    it('should call onReject when Reject button is clicked', async () => {
      const onReject = jest.fn();
      renderComponent({ onReject });
      const rejectButton = await screen.findByRole('button', {
        name: /reject/i,
      });
      fireEvent.click(rejectButton);
      expect(onReject).toHaveBeenCalledTimes(1);
    });

    it('should call onApprove when Approve button is clicked', async () => {
      const onApprove = jest.fn();
      renderComponent({ onApprove });
      const approveButton = await screen.findByRole('button', {
        name: /approve/i,
      });
      fireEvent.click(approveButton);
      expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it('should disable action buttons when disabled is true', async () => {
      renderComponent({ disabled: true });
      const rejectButton = await screen.findByRole('button', {
        name: /reject/i,
      });
      const approveButton = await screen.findByRole('button', {
        name: /approve/i,
      });
      expect(rejectButton).toBeDisabled();
      expect(approveButton).toBeDisabled();
    });
  });

  describe('without action buttons', () => {
    it('should not render navigation when onReject or onApprove are not provided', () => {
      renderComponent({ onReject: undefined, onApprove: undefined });
      expect(
        screen.queryByRole('button', { name: 'Previous match' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Next match' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/for review/)).not.toBeInTheDocument();
    });
  });
});
