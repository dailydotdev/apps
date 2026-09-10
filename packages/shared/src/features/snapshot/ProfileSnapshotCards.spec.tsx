import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileSnapshotCard } from './ProfileSnapshotCard';
import { ReadingOverviewSnapshotCard } from './ReadingOverviewSnapshotCard';
import { BadgesSnapshotCard } from './BadgesSnapshotCard';
import { AchievementsSnapshotCard } from './AchievementsSnapshotCard';

const user = { name: 'Ada Lovelace', handle: '@ada' };

describe('profile snapshot cards with little to show', () => {
  it('leaves zero stats off the header card', () => {
    render(
      <ProfileSnapshotCard
        handle="@ada"
        joined="May 2026"
        name="Ada Lovelace"
        postsRead={0}
        reputation={0}
      />,
    );

    expect(screen.getByText('Joined')).toBeInTheDocument();
    expect(screen.queryByText('Posts read')).not.toBeInTheDocument();
    expect(screen.queryByText('Reputation')).not.toBeInTheDocument();
  });

  it('labels the header card reads as a plain count', () => {
    render(
      <ProfileSnapshotCard
        handle="@ada"
        joined="May 2026"
        name="Ada Lovelace"
        postsRead={1200}
        reputation={40}
      />,
    );

    expect(screen.getByText('Posts read')).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument();
  });

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

  it('leaves zero points and an empty rarest row off the achievements card', () => {
    render(
      <AchievementsSnapshotCard
        achievements={[]}
        points={0}
        total={74}
        unlocked={1}
        user={user}
      />,
    );

    expect(screen.getByText('of 74 unlocked')).toBeInTheDocument();
    expect(screen.queryByText('Achievement points')).not.toBeInTheDocument();
    expect(screen.queryByText('Rarest unlocked')).not.toBeInTheDocument();
  });
});
