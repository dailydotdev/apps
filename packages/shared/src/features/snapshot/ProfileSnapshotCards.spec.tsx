import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReadingOverviewSnapshotCard } from './ReadingOverviewSnapshotCard';
import { BadgesSnapshotCard } from './BadgesSnapshotCard';
import { AchievementsSnapshotCard } from './AchievementsSnapshotCard';

const user = { name: 'Ada Lovelace', handle: '@ada' };

describe('profile snapshot cards with little to show', () => {
  it('leaves the heatmap, tags and zero streak off the reading card', () => {
    render(
      <ReadingOverviewSnapshotCard
        heatmap={[0, 0, 0]}
        longestStreak={0}
        monthsLabel="in the last months"
        postsRead={0}
        topTags={[]}
        totalReadingDays={4}
        user={user}
      />,
    );

    expect(screen.getByText('Total reading days')).toBeInTheDocument();
    expect(screen.queryByText(/Longest streak/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Posts read/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Top tags by reading days'),
    ).not.toBeInTheDocument();
  });

  it('leaves the zero tally and the empty rows off the badges card', () => {
    const { rerender } = render(
      <BadgesSnapshotCard
        awards={[]}
        badges={[{ keyword: 'React', earnedAt: 'Jan 2026' }]}
        topReaderBadges={1}
        totalAwards={0}
        user={user}
      />,
    );

    expect(screen.getByText('Top reader badge')).toBeInTheDocument();
    expect(screen.queryByText('Total awards')).not.toBeInTheDocument();

    rerender(
      <BadgesSnapshotCard
        awards={[{ name: 'Coffee', count: 2 }]}
        badges={[]}
        topReaderBadges={0}
        totalAwards={2}
        user={user}
      />,
    );

    expect(screen.getByText('Total awards')).toBeInTheDocument();
    expect(screen.queryByText('Top reader badge')).not.toBeInTheDocument();
    expect(screen.queryByText('x0')).not.toBeInTheDocument();
  });

  it('leaves zero XP and an empty rarest row off the achievements card', () => {
    render(
      <AchievementsSnapshotCard
        achievements={[]}
        xp={0}
        total={74}
        unlocked={1}
        user={user}
      />,
    );

    expect(screen.getByText('of 74 unlocked')).toBeInTheDocument();
    expect(screen.queryByText('Achievement XP')).not.toBeInTheDocument();
    expect(screen.queryByText('Rarest unlocked')).not.toBeInTheDocument();
  });
});
