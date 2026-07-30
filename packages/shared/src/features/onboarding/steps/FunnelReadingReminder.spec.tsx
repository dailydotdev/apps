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

// The paid funnel's screen calls the same hook internally; rendering the real
// one here would make "how many times did the step call it" unanswerable.
jest.mock('../../../components/onboarding', () => ({
  ReadingReminder: () => <div data-testid="legacy-reading-reminder" />,
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

  // `useReadingReminder` logs an impression and mounts the push/digest
  // mutations, and the paid funnel's own ReadingReminder runs the same effects.
  // Calling the hook above the branch doubled both on /helloworld.
  it('does not call useReadingReminder outside the onboarding funnel', () => {
    renderStep(false);

    expect(screen.getByTestId('legacy-reading-reminder')).toBeInTheDocument();
    expect(useReadingReminder).not.toHaveBeenCalled();
  });

  it('calls useReadingReminder once inside the onboarding funnel', () => {
    renderStep(true);

    expect(
      screen.queryByTestId('legacy-reading-reminder'),
    ).not.toBeInTheDocument();
    expect(useReadingReminder).toHaveBeenCalledTimes(1);
  });
});
