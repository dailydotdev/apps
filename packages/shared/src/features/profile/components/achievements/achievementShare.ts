import type { Achievement } from '../../../../graphql/user/achievements';
import { webappUrl } from '../../../../lib/constants';

// Achievements are shown on the public profile achievements tab, so that page
// is the shareable destination for a single achievement.
export const getAchievementShareLink = (username: string): string =>
  `${webappUrl}${username}/achievements`;

export const getAchievementShareText = (
  achievement: Pick<Achievement, 'name'>,
  isOwner: boolean,
  name?: string,
): string =>
  isOwner
    ? `I just unlocked the "${achievement.name}" achievement on daily.dev`
    : `${name ?? 'This developer'} unlocked the "${
        achievement.name
      }" achievement on daily.dev`;

export const getAchievementDownloadFilename = (
  achievement: Pick<Achievement, 'name'>,
): string =>
  `${achievement.name.replace(/[^\w\s-]/g, '').trim() || 'achievement'}.png`;
