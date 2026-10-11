import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FeedPatchy } from './FeedPatchy';
import { FunnelProgressContext } from '../../../features/onboarding/shared/FunnelStepDots';
import type { ReminderOutcome } from './useFeedPatchyReminder';

const mockOnCommit = jest.fn();
const mockOnSkip = jest.fn();
const mockOnSchedule = jest.fn<Promise<ReminderOutcome>, [number, string]>();
const mockCanRemind = jest.fn(() => true);

jest.mock('./useFeedPatchyReminder', () => ({
  useFeedPatchyReminder: () => ({
    canRemind: mockCanRemind(),
    isBlocked: () => false,
    onCommit: mockOnCommit,
    onSchedule: mockOnSchedule,
    onSkip: mockOnSkip,
  }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { timezone: 'Europe/London' } }),
}));

const onComplete = jest.fn();

const renderStep = () =>
  render(
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: 7 }],
        position: { chapter: 0, step: 4 },
        isOnboarding: true,
      }}
    >
      <FeedPatchy onComplete={onComplete} />
    </FunnelProgressContext.Provider>,
  );

const feedPatchy = async () => {
  fireEvent.click(
    screen.getByRole('button', { name: 'Give Patchy the Knowledge Bone' }),
  );
  // The flash, the celebration, then the headline's glide home: each beat
  // is scheduled once the one before it has rendered.
  const beat = (ms: number) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });
  await beat(180);
  await beat(1900);
  await beat(900);
};

describe('FeedPatchy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockCanRemind.mockReturnValue(true);
    // Reduced motion: no opening, the bone can be given straight away.
    (globalThis.matchMedia as jest.Mock).mockImplementation(() => ({
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves the reminder and moves on once it is granted', async () => {
    mockOnSchedule.mockResolvedValue('granted');
    renderStep();

    await feedPatchy();

    expect(mockOnCommit).toHaveBeenCalledWith('tap');
    expect(
      screen.getByRole('slider', { name: 'Reminder time' }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Remind me at 09:00' }),
      );
    });

    expect(mockOnSchedule).toHaveBeenCalledWith(9, 'Europe/London');
    expect(screen.getByText(/at 09:00$/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('waits on the way back after "Don\'t allow"', async () => {
    mockOnSchedule.mockResolvedValue('denied');
    renderStep();

    await feedPatchy();
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Remind me at 09:00' }),
      );
    });

    expect(screen.getByText('Notifications are off')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Start reading/ }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('can be put off, and still moves on', async () => {
    renderStep();

    await feedPatchy();
    fireEvent.click(screen.getByRole('button', { name: 'I’ll do it later' }));

    expect(mockOnSkip).toHaveBeenCalled();
    expect(mockOnSchedule).not.toHaveBeenCalled();
    expect(screen.getByText('Day 1 starts now')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('asks nothing where push is unavailable', async () => {
    mockCanRemind.mockReturnValue(false);
    renderStep();

    await feedPatchy();

    expect(
      screen.queryByRole('slider', { name: 'Reminder time' }),
    ).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
