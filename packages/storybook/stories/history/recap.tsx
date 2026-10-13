import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import {
  dailyCounts,
  minutesRead,
  NOW,
  thisWeek,
  topSources,
  topTags,
} from './data';
import { TagPill, useHistory } from './kit';
import type { FilterState } from './controls';

// The widget column beside the list, in production's SquadWidget cards:
// the reading streak, and your week in reading with its top tags and
// sources as filters on the list.

/** The profile's streak numbers. Mock: one reader's profile. */
export const streak = { current: 5, longest: 31, total: 212 };

/** The last seven days, oldest first, as narrow weekday labels. */
const lastSevenDays = (): Date[] =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(NOW);
    day.setDate(day.getDate() - (6 - index));
    return day;
  });

export const StreakWidget = (): ReactElement => {
  const { items } = useHistory();
  const counts = dailyCounts(items, 7);
  return (
    <SquadWidget
      title="Reading streak"
      action={
        <span className="flex items-center gap-1 font-bold typo-callout">
          <ReadingStreakIcon
            secondary
            size={IconSize.Small}
            className="text-accent-bacon-default"
          />
          {streak.current} days
        </span>
      }
    >
      <div className="mt-4 flex justify-between">
        {lastSevenDays().map((day, index) => (
          <span
            key={day.toISOString()}
            title={`${counts[index]} posts`}
            className="flex flex-col items-center gap-1"
          >
            <ReadingStreakIcon
              secondary={counts[index] > 0}
              size={IconSize.Medium}
              className={
                counts[index] > 0
                  ? 'text-accent-bacon-default'
                  : 'text-text-disabled'
              }
            />
            <span
              className={classNames(
                'typo-caption2',
                index === 6
                  ? 'font-bold text-text-primary'
                  : 'text-text-quaternary',
              )}
            >
              {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-4 text-text-tertiary typo-footnote">
        Longest streak {streak.longest} days · {streak.total} reading days in
        total
      </p>
    </SquadWidget>
  );
};

const Stat = ({
  value,
  label,
}: {
  value: string | number;
  label: string;
}): ReactElement => (
  <span className="flex flex-1 flex-col rounded-12 bg-surface-float px-3 py-2">
    <span className="hx-nums font-bold typo-title3">{value}</span>
    <span className="text-text-tertiary typo-caption1">{label}</span>
  </span>
);

const Bars = ({ counts }: { counts: number[] }): ReactElement => {
  const max = Math.max(...counts, 1);
  const days = lastSevenDays();
  return (
    <div className="flex h-16 items-end justify-between gap-1.5">
      {counts.map((count, index) => (
        <span
          key={days[index].toISOString()}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <span className="flex h-11 w-full items-end">
            <span
              title={`${count} posts`}
              style={{ height: `${Math.max(10, (count / max) * 100)}%` }}
              className={classNames(
                'w-full rounded-6',
                !count && 'bg-surface-float',
                count && index === 6 && 'bg-accent-cabbage-default',
                count && index !== 6 && 'bg-accent-cabbage-subtler',
              )}
            />
          </span>
          <span
            className={classNames(
              'typo-caption2',
              index === 6
                ? 'font-bold text-text-primary'
                : 'text-text-quaternary',
            )}
          >
            {days[index].toLocaleDateString('en-US', { weekday: 'narrow' })}
          </span>
        </span>
      ))}
    </div>
  );
};

export const WeekWidget = ({ state }: { state: FilterState }): ReactElement => {
  const { items } = useHistory();
  const week = thisWeek(items);
  const counts = dailyCounts(items, 7);
  return (
    <SquadWidget title="Your week in reading">
      <p className="mt-1 text-text-tertiary typo-footnote">
        {week.length} posts, mostly{' '}
        <span className="font-bold text-accent-cabbage-default">
          #{topTags(week, 1)[0]?.[0]}
        </span>
      </p>
      <div className="mt-4 flex gap-2">
        <Stat value={week.length} label="posts" />
        <Stat value={`${minutesRead(week)}m`} label="reading" />
        <Stat value={counts.filter(Boolean).length} label="active days" />
      </div>
      <div className="mt-4">
        <Bars counts={counts} />
      </div>
      <h3 className="mt-4 text-text-tertiary typo-footnote">Top tags</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {topTags(week, 6).map(([tag]) => (
          <TagPill
            key={tag}
            tag={tag}
            active={state.filters.tag === tag}
            onClick={() =>
              state.set({ tag: state.filters.tag === tag ? undefined : tag })
            }
          />
        ))}
      </div>
      <h3 className="mt-4 text-text-tertiary typo-footnote">Top sources</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {topSources(week, 5).map(([source]) => (
          <button
            type="button"
            key={source.id}
            onClick={() =>
              state.set({
                source:
                  state.filters.source === source.id ? undefined : source.id,
              })
            }
            className={classNames(
              'flex h-6 items-center gap-1.5 rounded-8 border pl-0.5 pr-2 typo-footnote',
              state.filters.source === source.id
                ? 'border-transparent bg-surface-primary text-surface-invert'
                : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
            )}
          >
            <ProfilePicture
              size={ProfileImageSize.Size16}
              rounded="full"
              user={{ image: source.image, username: source.name }}
            />
            {source.name}
          </button>
        ))}
      </div>
    </SquadWidget>
  );
};
