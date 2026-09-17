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
    isLoading: false,
  }),
}));

const mockUseViewSize = jest.fn(() => true);
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => mockUseViewSize(),
}));

const mockGetFeatureValue = jest.fn((feature: { defaultValue: unknown }) =>
  Boolean(feature.defaultValue),
);
jest.mock('../../../components/GrowthBookProvider', () => ({
  ...jest.requireActual('../../../components/GrowthBookProvider'),
  useFeaturesReadyContext: () => ({
    ready: true,
    getFeatureValue: (feature: { defaultValue: unknown }) =>
      mockGetFeatureValue(feature),
  }),
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
    mockGetFeatureValue.mockImplementation((feature) =>
      Boolean(feature.defaultValue),
    );
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
    unmount();

    mockGetFeatureValue.mockReturnValue(true);
    renderStep(true);

    expect(screen.getByTestId('funnel-reminder')).toBeInTheDocument();
  });

  it('keeps the experiment out of the paid funnel', () => {
    mockUseViewSize.mockReturnValue(false);
    mockGetFeatureValue.mockReturnValue(true);

    renderStep(false);

    expect(screen.queryByTestId('paid-reminder')).not.toBeInTheDocument();
  });

  // Every step mounts from the first screen on, so reading the flag eagerly
  // would log the experiment exposure for users who never reach this step.
  it('only reads the flag when the funnel resolves the step', () => {
    mockUseViewSize.mockReturnValue(false);
    const onRegisterStepToSkip = jest.fn();

    render(
      <FunnelProgressContext.Provider
        value={{
          chapters: [{ steps: 1 }],
          position: { chapter: 0, step: 0 },
          isOnboarding: true,
        }}
      >
        <FunnelReadingReminder
          {...defaultProps}
          isActive={false}
          onRegisterStepToSkip={onRegisterStepToSkip}
        />
      </FunnelProgressContext.Provider>,
    );

    expect(mockGetFeatureValue).not.toHaveBeenCalled();

    const [, shouldSkip] = onRegisterStepToSkip.mock.calls[0];
    expect(shouldSkip()).toBe(true);
    expect(mockGetFeatureValue).toHaveBeenCalledTimes(1);
  });

  it('never reads the flag on mobile', () => {
    const onRegisterStepToSkip = jest.fn();

    render(
      <FunnelProgressContext.Provider
        value={{
          chapters: [{ steps: 1 }],
          position: { chapter: 0, step: 0 },
          isOnboarding: true,
        }}
      >
        <FunnelReadingReminder
          {...defaultProps}
          onRegisterStepToSkip={onRegisterStepToSkip}
        />
      </FunnelProgressContext.Provider>,
    );

    const [, shouldSkip] = onRegisterStepToSkip.mock.calls[0];
    expect(shouldSkip()).toBe(false);
    expect(mockGetFeatureValue).not.toHaveBeenCalled();
  });
});
