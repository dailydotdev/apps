import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { CreatorAchievementType } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  achievementCategoryLabel,
  achievementPeriodLabel,
  achievementSubtitle,
  achievementTitle,
  describableAchievements,
} from '../components/analytics/creator/achievements';

const achievement = (
  partial: Partial<CreatorAchievement> = {},
): CreatorAchievement => ({
  id: 'ca1',
  type: CreatorAchievementType.CategoryRanking,
  achievedAt: '2026-09-01T00:00:00.000Z',
  post: {
    id: 'p1',
    title: 'Shipping a design system',
    commentsPermalink: 'http://localhost:5002/posts/p1',
  },
  keyword: { value: 'webdev', flags: { title: 'Web Development' } },
  periodStart: '2026-08-01T00:00:00.000Z',
  periodEnd: '2026-09-01T00:00:00.000Z',
  threshold: null,
  rank: 2,
  measuredValue: null,
  evidenceUrl: 'https://daily.dev/tags/webdev/best-of/2026/08',
  isHistorical: false,
  ...partial,
});

describe('achievementCategoryLabel', () => {
  it('should prefer the display title over the raw keyword', () => {
    expect(achievementCategoryLabel(achievement())).toEqual('Web Development');
  });

  it('should fall back to the keyword when it has no title', () => {
    expect(
      achievementCategoryLabel(
        achievement({ keyword: { value: 'rust', flags: null } }),
      ),
    ).toEqual('rust');
  });
});

describe('achievementPeriodLabel', () => {
  it('should name the month the period starts in, in UTC', () => {
    expect(achievementPeriodLabel(achievement())).toEqual('August 2026');
  });

  it('should have nothing to say for a threshold award', () => {
    expect(
      achievementPeriodLabel(achievement({ periodStart: null })),
    ).toBeNull();
  });
});

describe('achievementTitle', () => {
  it('should state the placement and category for a ranking', () => {
    expect(achievementTitle(achievement())).toEqual('#2 in Web Development');
  });

  it('should state the threshold, not the measured value, for a milestone', () => {
    expect(
      achievementTitle(
        achievement({
          type: CreatorAchievementType.PostUpvoteMilestone,
          rank: null,
          threshold: 100,
          measuredValue: 137,
        }),
      ),
    ).toEqual('100 upvotes');
    expect(
      achievementTitle(
        achievement({
          type: CreatorAchievementType.CreatorImpressionMilestone,
          rank: null,
          threshold: 100000,
          measuredValue: 104233,
        }),
      ),
    ).toEqual('100K impressions');
  });

  it('should say nothing for an award it cannot describe', () => {
    expect(achievementTitle(achievement({ rank: null }))).toBeNull();
    expect(
      achievementTitle(
        achievement({
          type: 'unknown_future_type' as CreatorAchievementType,
        }),
      ),
    ).toBeNull();
  });
});

describe('achievementSubtitle', () => {
  it('should caption a ranking with its month', () => {
    expect(achievementSubtitle(achievement())).toEqual('August 2026');
  });

  it('should caption an article milestone with the article', () => {
    expect(
      achievementSubtitle(
        achievement({
          type: CreatorAchievementType.PostUpvoteMilestone,
          periodStart: null,
        }),
      ),
    ).toEqual('Shipping a design system');
  });
});

describe('describableAchievements', () => {
  it('should drop awards this build cannot describe', () => {
    const known = achievement();
    const unknown = achievement({
      id: 'ca2',
      type: 'unknown_future_type' as CreatorAchievementType,
    });

    expect(describableAchievements([known, unknown])).toEqual([known]);
  });
});
