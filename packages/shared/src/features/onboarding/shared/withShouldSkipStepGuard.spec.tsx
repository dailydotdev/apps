import React from 'react';
import { render, screen } from '@testing-library/react';
import { withShouldSkipStepGuard } from './withShouldSkipStepGuard';
import type { FunnelStep, FunnelStepUserRole } from '../types/funnel';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';

const mockShouldSkip = jest.fn(() => false);
const GuardedStep = withShouldSkipStepGuard<FunnelStep>(
  () => <p>step content</p>,
  () => ({ shouldSkip: mockShouldSkip() }),
);

const renderStep = (props: Partial<FunnelStepUserRole> = {}) => {
  const step = {
    id: 'role',
    type: FunnelStepType.UserRole,
    parameters: {},
    transitions: [
      { on: FunnelStepTransitionType.Complete, destination: 'next' },
    ],
    isActive: true,
    onTransition: jest.fn(),
    onRegisterStepToSkip: jest.fn(),
    ...props,
  } as FunnelStepUserRole;

  const view = render(<GuardedStep {...step} />);

  return { ...view, step };
};

describe('withShouldSkipStepGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldSkip.mockReturnValue(false);
  });

  it('renders the step when it should not be skipped', () => {
    const { step } = renderStep();

    expect(screen.getByText('step content')).toBeInTheDocument();
    expect(step.onRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.UserRole,
      false,
    );
    expect(step.onTransition).not.toHaveBeenCalled();
  });

  it('completes an active step that should be skipped', () => {
    mockShouldSkip.mockReturnValue(true);
    const { step, rerender } = renderStep();
    rerender(<GuardedStep {...step} />);

    expect(screen.queryByText('step content')).not.toBeInTheDocument();
    expect(step.onTransition).toHaveBeenCalledTimes(1);
    expect(step.onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
    });
  });

  it('completes a skipped step when it becomes active', () => {
    mockShouldSkip.mockReturnValue(true);
    const { step, rerender } = renderStep({ isActive: false });
    expect(step.onTransition).not.toHaveBeenCalled();

    rerender(<GuardedStep {...step} isActive />);

    expect(step.onTransition).toHaveBeenCalledTimes(1);
  });

  it('leaves an active step alone when it becomes skippable after an answer', () => {
    const { step, rerender } = renderStep();

    mockShouldSkip.mockReturnValue(true);
    rerender(<GuardedStep {...step} />);

    expect(step.onRegisterStepToSkip).toHaveBeenLastCalledWith(
      FunnelStepType.UserRole,
      true,
    );
    expect(step.onTransition).not.toHaveBeenCalled();
  });

  it('only registers an inactive step that should be skipped', () => {
    mockShouldSkip.mockReturnValue(true);
    const { step } = renderStep({ isActive: false });

    expect(step.onRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.UserRole,
      true,
    );
    expect(step.onTransition).not.toHaveBeenCalled();
  });
});
