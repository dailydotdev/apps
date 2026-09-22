import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelReadingReminder } from './FunnelReadingReminder';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import { useReadingReminder } from '../../../components/onboarding/useReadingReminder';

jest.mock('../../../components/onboarding/useReadingReminder', () => ({
  useReadingReminder: jest.fn(() => ({
    customTimeIndex: 8,
    isEditingTimezone: false,
    loading: false,
    onSkip: jest.fn(),
    onSubmit: jest.fn(),
    setCustomTimeIndex: jest.fn(),
    setIsEditingTimezone: jest.fn(),
    setTimeOption: jest.fn(),
    setUserTimeZone: jest.fn(),
    timeOption: '9',
    userTimeZone: 'UTC',
  })),
}));

jest.mock('../../../components/onboarding', () => ({
  ReadingReminder: ({ isOnboarding }: { isOnboarding?: boolean }) => (
    <div data-testid={isOnboarding ? 'funnel-reminder' : 'paid-reminder'} />
  ),
}));

jest.mock('../../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => ({
    isPushSupported: true,
    isInitialized: true,
  }),
}));

const mockUseViewSize = jest.fn(() => true);
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => mockUseViewSize(),
}));

const mockUseConditionalFeature = jest.fn<
  { value: boolean; isLoading: boolean },
  [{ shouldEvaluate?: boolean }]
>(() => ({ value: false, isLoading: false }));
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: (args: { shouldEvaluate?: boolean }) =>
    mockUseConditionalFeature(args),
}));

const defaultProps: FunnelStepReadingReminder = {
  id: 'reading-reminder',
  type: FunnelStepType.ReadingReminder,
  transitions: [],
  isActive: true,
  onTransition: jest.fn(),
  parameters: { headline: 'When do you want to read?' },
};

const renderStep = (isOnboarding: boolean) =>
  render(
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: 1 }],
        position: { chapter: 0, step: 0 },
        isOnboarding,
      }}
    >
      <FunnelReadingReminder {...defaultProps} />
    </FunnelProgressContext.Provider>,
  );

describe('FunnelReadingReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseViewSize.mockReturnValue(true);
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
  });

  // The hook logs an impression and mounts the push/digest mutations, so a
  // second copy of that state anywhere doubles the funnel's own metrics.
  it('owns the state once for the paid funnel', () => {
    renderStep(false);

    expect(screen.getByTestId('paid-reminder')).toBeInTheDocument();
    expect(useReadingReminder).toHaveBeenCalledTimes(1);
  });

  it('owns the state once for the onboarding funnel', () => {
    renderStep(true);

    expect(screen.getByTestId('funnel-reminder')).toBeInTheDocument();
    expect(useReadingReminder).toHaveBeenCalledTimes(1);
  });

  it('skips desktop unless the desktop experiment is on', () => {
    mockUseViewSize.mockReturnValue(false);

    const { unmount } = renderStep(true);

    expect(screen.queryByTestId('funnel-reminder')).not.toBeInTheDocument();
    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: true }),
    );
    unmount();

    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
    renderStep(true);

    expect(screen.getByTestId('funnel-reminder')).toBeInTheDocument();
  });

  it('keeps the experiment out of the paid funnel', () => {
    mockUseViewSize.mockReturnValue(false);
    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });

    renderStep(false);

    expect(screen.queryByTestId('paid-reminder')).not.toBeInTheDocument();
    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('never evaluates the desktop experiment on mobile', () => {
    renderStep(true);

    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });
});
