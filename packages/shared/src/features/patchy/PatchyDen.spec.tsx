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

describe('PatchyDen', () => {
  beforeEach(() => {
    localStorage.clear();
    mockLogEvent.mockClear();
  });

  it('keeps the bone until the first read of the day', () => {
    jest.mocked(useStreakRingState).mockReturnValue(ringState(false));
    render(<PatchyDen />);

    expect(
      screen.getByText('Read a post to earn today’s bone.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Give Patchy today’s bone' }),
    ).not.toBeInTheDocument();
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
    expect(screen.getByText('Bone given. Back tomorrow.')).toBeInTheDocument();
  });

  it('counts pets and talks about your day', () => {
    jest.mocked(useStreakRingState).mockReturnValue(ringState(true));
    recordPatchyActivity('u1', 'upvote');
    recordPatchyActivity('u1', 'upvote');
    recordPatchyActivity('u1', 'upvote');
    render(<PatchyDen />);

    expect(
      screen.getByText('“3 upvotes today. Generous mood!”'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pet Patchy' }));
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyDen,
      target_id: 'pet',
    });
    expect(
      JSON.parse(localStorage.getItem('patchy_day:u1') ?? '{}'),
    ).toMatchObject({ pets: 1 });
  });
});
