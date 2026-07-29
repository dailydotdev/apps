import { render, screen } from '@testing-library/react';
import React from 'react';
import { WeeklyQuizBanner } from './WeeklyQuizBanner';
import { useWeeklyQuizStatus } from '../hooks/useWeeklyQuizStatus';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useLogContext } from '../../../contexts/LogContext';
import type { WeeklyQuizStatus } from '../types';

jest.mock('../hooks/useWeeklyQuizStatus');
jest.mock('../../../hooks/useConditionalFeature');
jest.mock('../../../hooks/usePersistentContext');
jest.mock('../../../hooks/useLazyModal');
jest.mock('../../../contexts/LogContext');

const mockStatus = jest.mocked(useWeeklyQuizStatus);
const mockFeature = jest.mocked(useConditionalFeature);
const mockPersistent = jest.mocked(usePersistentContext);
const mockLazyModal = jest.mocked(useLazyModal);
const mockLog = jest.mocked(useLogContext);

const setStatus = (partial: Partial<WeeklyQuizStatus>) => {
  mockStatus.mockReturnValue({
    status: {
      isActive: true,
      activeQuizId: 'quiz-1',
      hasCompletedThisWeek: false,
      hasCompletedLastWeek: false,
      thisWeekResult: null,
      lastWeekResult: null,
      ...partial,
    },
    isPending: false,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setStatus({});
  mockFeature.mockReturnValue({ value: true, isLoading: false } as never);
  mockPersistent.mockReturnValue([false, jest.fn(), true, false]);
  mockLazyModal.mockReturnValue({ openModal: jest.fn() } as never);
  mockLog.mockReturnValue({ logEvent: jest.fn() } as never);
});

it('shows the CTA when the quiz is active, flag on, and not dismissed', () => {
  render(<WeeklyQuizBanner />);
  expect(screen.getByText("Let's play")).toBeInTheDocument();
});

it('renders nothing when the quiz is not active', () => {
  setStatus({ isActive: false });
  const { container } = render(<WeeklyQuizBanner />);
  expect(container).toBeEmptyDOMElement();
});

it('renders nothing when the flag is off', () => {
  mockFeature.mockReturnValue({ value: false, isLoading: false } as never);
  const { container } = render(<WeeklyQuizBanner />);
  expect(container).toBeEmptyDOMElement();
});

it('renders nothing when dismissed for the week', () => {
  mockPersistent.mockReturnValue([true, jest.fn(), true, false]);
  const { container } = render(<WeeklyQuizBanner />);
  expect(container).toBeEmptyDOMElement();
});

it('invites returning players to view the scoreboard once they have played', () => {
  setStatus({ hasCompletedThisWeek: true });
  render(<WeeklyQuizBanner />);
  expect(screen.getByText('View scoreboard')).toBeInTheDocument();
});
