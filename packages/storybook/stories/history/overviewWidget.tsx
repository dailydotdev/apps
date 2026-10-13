import type { ReactElement } from 'react';
import React from 'react';
import type {
  MostReadTag,
  UserReadHistory,
  UserStreak,
} from '@dailydotdev/shared/src/graphql/users';
import { ReadingOverview } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ReadingOverview';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import type { HistoryItem } from './data';
import { NOW, topTags } from './data';
import { useHistory } from './kit';

// The profile's own Reading Overview widget (streaks, top tags by reading
// days, the heatmap), exactly as /<username> shows it, fed from history.

/** One reader's profile and streak. Mock. */
const user = {
  id: 'reader',
  name: 'Tomer',
  username: 'tomer',
  image:
    'https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/1',
} as PublicProfile;

const streak = {
  max: 31,
  total: 212,
  current: 5,
} as UserStreak;

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Six months of daily reads: the real history for the last three weeks,
 * a steady made-up rhythm before that. */
const readHistory = (items: HistoryItem[]): UserReadHistory[] =>
  Array.from({ length: 182 }, (_, index) => {
    const date = new Date(NOW);
    date.setDate(date.getDate() - index);
    const recent = items.filter(
      (item) => dayKey(item.readAt) === dayKey(date),
    ).length;
    const older = [0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0][(index * 7) % 11];
    return { date: date.toISOString(), reads: index <= 20 ? recent : older };
  });

/** Top tags by reading days, the shape userMostReadTags returns. */
const mostReadTags = (items: HistoryItem[]): MostReadTag[] => {
  const days = new Set(items.map((item) => dayKey(item.readAt)));
  return topTags(items, 12)
    .map(([tag]) => {
      const tagDays = new Set(
        items
          .filter((item) => item.tags.includes(tag))
          .map((item) => dayKey(item.readAt)),
      );
      return {
        value: tag,
        count: tagDays.size,
        total: days.size,
        percentage: tagDays.size / days.size,
      };
    })
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
    .slice(0, 6);
};

export const ReadingOverviewWidget = (): ReactElement => {
  const { items } = useHistory();
  const after = new Date(NOW);
  after.setDate(after.getDate() - 181);
  return (
    <div className="[&>section]:max-w-full">
      <ReadingOverview
        user={user}
        readHistory={readHistory(items)}
        before={NOW}
        after={after}
        streak={streak}
        mostReadTags={mostReadTags(items)}
      />
    </div>
  );
};
