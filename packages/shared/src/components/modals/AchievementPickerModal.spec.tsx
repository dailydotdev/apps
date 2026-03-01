import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserAchievement } from '../../graphql/user/achievements';
import { AchievementType } from '../../graphql/user/achievements';
import { getLogContextStatic } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { AchievementPickerModal } from './AchievementPickerModal';

const LogContext = getLogContextStatic();
const mockLogEvent = jest.fn();

const createLockedAchievement = (id: string, progress = 0): UserAchievement => ({
  achievement: {
    id,
    name: `Achievement ${id}`,
    description: `Description for ${id}`,
    image: 'https://daily.dev/achievement.png',
    type: AchievementType.Milestone,
    criteria: { targetCount: 10 },
    points: 50,
    rarity: null,
    unit: null,
  },
  progress,
  unlockedAt: null,
  createdAt: null,
  updatedAt: null,
});

const renderModal = (props: Partial<React.ComponentProps<typeof AchievementPickerModal>> = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const achievements = props.achievements ?? [
    createLockedAchievement('ach1', 3),
    createLockedAchievement('ach2', 7),
  ];

  return render(
    <QueryClientProvider client={client}>
      <LogContext.Provider
        value={{
          logEvent: mockLogEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        <AchievementPickerModal
          isOpen
          onRequestClose={jest.fn()}
          achievements={achievements}
          onTrack={jest.fn().mockResolvedValue(undefined)}
          onUntrack={jest.fn().mockResolvedValue(undefined)}
          ariaHideApp={false}
          {...props}
        />
      </LogContext.Provider>
    </QueryClientProvider>,
  );
};

describe('AchievementPickerModal — stop tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="__next"></div>';
  });

  it('renders "Track" button for an untracked achievement', () => {
    renderModal({ trackedAchievementId: null });

    const trackButtons = screen.getAllByRole('button', { name: 'Track' });
    expect(trackButtons.length).toBeGreaterThan(0);
  });

  it('renders "Stop tracking" button for the currently tracked achievement', () => {
    renderModal({ trackedAchievementId: 'ach1' });

    expect(screen.getByRole('button', { name: 'Stop tracking' })).toBeInTheDocument();
  });

  it('still renders "Track" for non-tracked achievements when one is tracked', () => {
    renderModal({ trackedAchievementId: 'ach1' });

    // ach2 is not tracked, should show Track
    const trackButtons = screen.getAllByRole('button', { name: 'Track' });
    expect(trackButtons.length).toBeGreaterThan(0);
  });

  it('calls onTrack with the achievement id when "Track" is clicked', async () => {
    const onTrack = jest.fn().mockResolvedValue(undefined);
    renderModal({ trackedAchievementId: null, onTrack });

    const trackButtons = screen.getAllByRole('button', { name: 'Track' });
    fireEvent.click(trackButtons[0]);

    await waitFor(() => expect(onTrack).toHaveBeenCalledTimes(1));
    expect(onTrack).toHaveBeenCalledWith('ach1');
  });

  it('calls onUntrack when "Stop tracking" is clicked', async () => {
    const onUntrack = jest.fn().mockResolvedValue(undefined);
    renderModal({ trackedAchievementId: 'ach1', onUntrack });

    fireEvent.click(screen.getByRole('button', { name: 'Stop tracking' }));

    await waitFor(() => expect(onUntrack).toHaveBeenCalledTimes(1));
  });

  it('logs TrackAchievement event with origin picker_modal when Track is clicked', async () => {
    const onTrack = jest.fn().mockResolvedValue(undefined);
    renderModal({ trackedAchievementId: null, onTrack });

    fireEvent.click(screen.getAllByRole('button', { name: 'Track' })[0]);

    await waitFor(() =>
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.TrackAchievement,
          target_id: 'ach1',
          extra: JSON.stringify({ origin: 'picker_modal' }),
        }),
      ),
    );
  });

  it('logs UntrackAchievement event with origin picker_modal and target_id when Stop tracking is clicked', async () => {
    const onUntrack = jest.fn().mockResolvedValue(undefined);
    renderModal({ trackedAchievementId: 'ach2', onUntrack });

    fireEvent.click(screen.getByRole('button', { name: 'Stop tracking' }));

    await waitFor(() =>
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.UntrackAchievement,
          target_id: 'ach2',
          extra: JSON.stringify({ origin: 'picker_modal' }),
        }),
      ),
    );
  });

  it('disables all action buttons while tracking is in progress', async () => {
    let resolveTrack: () => void;
    const onTrack = jest.fn(
      () => new Promise<void>((resolve) => { resolveTrack = resolve; }),
    );
    renderModal({ trackedAchievementId: null, onTrack });

    const trackButtons = screen.getAllByRole('button', { name: 'Track' });
    fireEvent.click(trackButtons[0]);

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Track' })[0]).toBeDisabled(),
    );

    resolveTrack!();
  });

  it('disables all action buttons while untracking is in progress', async () => {
    let resolveUntrack: () => void;
    const onUntrack = jest.fn(
      () => new Promise<void>((resolve) => { resolveUntrack = resolve; }),
    );
    renderModal({ trackedAchievementId: 'ach1', onUntrack });

    fireEvent.click(screen.getByRole('button', { name: 'Stop tracking' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Track' })).toBeDisabled(),
    );

    resolveUntrack!();
  });

  it('shows empty state message when all achievements are unlocked', () => {
    const unlockedAchievement: UserAchievement = {
      ...createLockedAchievement('ach1'),
      unlockedAt: new Date().toISOString(),
    };
    renderModal({ achievements: [unlockedAchievement] });

    expect(
      screen.getByText('You unlocked every achievement.'),
    ).toBeInTheDocument();
  });
});
