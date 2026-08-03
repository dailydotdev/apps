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

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => true,
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
});
