import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { StreakRingInfo } from '../../hooks/streaks/useStreakRingState';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { LogEvent, TargetType } from '../../lib/log';
import { recordPatchyActivity } from './patchyDay';
import { PatchyDen } from './PatchyDen';

const mockLogEvent = jest.fn();

jest.mock('../../hooks/streaks/useStreakRingState', () => ({
  ...jest.requireActual('../../hooks/streaks/useStreakRingState'),
  useStreakRingState: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' } }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/streaks/useStreakDays', () => ({
  useReadingStreak30Days: () => [],
}));

jest.mock('./usePatchyConfigSync', () => ({
  usePatchyConfigSync: () => undefined,
}));

const ringState = (hasReadToday: boolean): StreakRingInfo =>
  ({
    isEnabled: true,
    isLoading: false,
    streak: { current: 4, lastViewAt: new Date() },
    state: hasReadToday ? 'safe' : 'pending',
    count: 4,
    hasReadToday,
  }) as unknown as StreakRingInfo;

// jsdom has no layout: report a fixed den size so the clickable spots render.
class MockResizeObserver {
  constructor(
    private callback: (entries: { contentRect: DOMRectReadOnly }[]) => void,
  ) {}

  observe() {
    this.callback([
      { contentRect: { width: 1376, height: 768 } as DOMRectReadOnly },
    ]);
  }

  disconnect = jest.fn();
}

describe('PatchyDen', () => {
  beforeEach(() => {
    localStorage.clear();
    mockLogEvent.mockClear();
    window.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
  });

  it('keeps the bone until the first read of the day', () => {
    jest.mocked(useStreakRingState).mockReturnValue(ringState(false));
    render(<PatchyDen />);
    expect(
      screen.getByRole('button', { name: 'Read a post to earn today’s bone' }),
    ).toBeDisabled();
  });

  it('gives the bone once a day after a read', () => {
    jest.mocked(useStreakRingState).mockReturnValue(ringState(true));
    render(<PatchyDen />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Give Patchy today’s bone' }),
    );

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyDen,
      target_id: 'treat',
    });
    expect(
      screen.getByRole('button', { name: 'Bone given · back tomorrow' }),
    ).toBeDisabled();
  });

  it('counts pets and tells the day back from the robot', () => {
    jest.mocked(useStreakRingState).mockReturnValue(ringState(true));
    recordPatchyActivity('u1', 'upvote');
    render(<PatchyDen />);

    fireEvent.click(screen.getByRole('button', { name: 'Pet Patchy' }));
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyDen,
      target_id: 'pet',
    });
    expect(screen.getByText('pets').previousSibling).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Patchy’s log' }));
    expect(
      screen.getByText('You upvoted something. I waved.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('You petted me. Best part of my day.'),
    ).toBeInTheDocument();
  });
});
