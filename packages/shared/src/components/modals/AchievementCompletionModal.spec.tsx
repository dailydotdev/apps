import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserAchievement } from '../../graphql/user/achievements';
import { AchievementType } from '../../graphql/user/achievements';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../hooks/profile/useTrackedAchievement';
import { AchievementCompletionModal } from './AchievementCompletionModal';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));
jest.mock('../../hooks/profile/useProfileAchievements', () => ({
  useProfileAchievements: jest.fn(),
}));
jest.mock('../../hooks/profile/useTrackedAchievement', () => ({
  useTrackedAchievement: jest.fn(),
}));

const unlocked: UserAchievement = {
  achievement: {
    id: 'ach1',
    name: "Teacher's pet",
    description: 'Make daily.dev a preferred source on Google',
    image: 'https://daily.dev/achievement.png',
    type: AchievementType.Instant,
    xp: 5,
    rarity: 0.4,
    unit: null,
  },
  progress: 1,
  unlockedAt: '2026-06-23T10:00:00.000Z',
  createdAt: null,
  updatedAt: null,
};

const logEvent = jest.fn();

const renderModal = (achievement: UserAchievement = unlocked) => {
  jest.mocked(useProfileAchievements).mockReturnValue({
    achievements: [achievement],
    unlockedCount: 1,
    totalCount: 1,
    totalAchievementXp: 5,
    isPending: false,
    isError: false,
  });

  return render(
    <TestBootProvider
      auth={{ user: loggedUser }}
      client={new QueryClient()}
      log={{ logEvent }}
    >
      <AchievementCompletionModal
        achievementId="ach1"
        ariaHideApp={false}
        isOpen
        onRequestClose={jest.fn()}
      />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(captureShareImage)
    .mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  jest.mocked(copyShareImage).mockResolvedValue(true);
  jest.mocked(useTrackedAchievement).mockReturnValue({
    trackedAchievement: null,
    isPending: false,
    isError: false,
    trackAchievement: jest.fn().mockResolvedValue(undefined),
    untrackAchievement: jest.fn().mockResolvedValue(undefined),
    isTrackPending: false,
    isUntrackPending: false,
  });
});

describe('AchievementCompletionModal', () => {
  it('copies the achievement card to the clipboard on snapshot', async () => {
    renderModal();
    const button = screen.getByRole('button', { name: 'Snapshot' });

    fireEvent.pointerEnter(button);
    fireEvent.click(button);

    await waitFor(() => expect(copyShareImage).toHaveBeenCalled());
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareProfile,
      target_type: TargetType.AchievementCompletion,
      target_id: 'ach1',
      extra: JSON.stringify({
        provider: ShareProvider.Snapshot,
        origin: Origin.AchievementCompletion,
        result: 'clipboard',
      }),
    });
  });

  it('leaves the snapshot out when the unlock has no date to credit', () => {
    renderModal({ ...unlocked, unlockedAt: null });

    expect(
      screen.queryByRole('button', { name: 'Snapshot' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Choose next goal' }),
    ).toBeInTheDocument();
  });
});
