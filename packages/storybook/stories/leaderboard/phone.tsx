import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { useSources } from '../sources/kit';
import { Cluster } from '../sources/phone';
import { ME } from './data';

// /users on a phone after the phone shell (#6855): /users is one of
// Explore's views, so the block is Explore's root row over its segments with
// Leaderboard lit, and the bar lights Explore. Production also floats a
// "Search people" SpotlightField above the bar; the redesign drops it, so
// pages/users.tsx loses that line when this ships. Signed-out phone visitors are sent
// to the marketing site's /users, so there is no signed-out chrome here.
// Every piece hides from tablet up.

const segments = [
  { label: 'Posts', path: '/posts' },
  { label: 'Tags', path: '/tags' },
  { label: 'Sources', path: '/sources' },
  { label: 'Leaderboard', path: '/users' },
];

const Block = (): ReactElement => {
  const { goTo } = useSources();
  return (
    <header className="fixed inset-x-0 top-0 z-header bg-background-default tablet:hidden">
      <div className="flex h-[3.25rem] items-center gap-2 px-4">
        <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">
          Explore
        </h1>
        <ShellSquare
          aria-label="You"
          className="overflow-hidden"
          onClick={() => goTo('/you')}
        >
          <img alt="" src={ME.image} className="size-full object-cover" />
        </ShellSquare>
      </div>
      <div className="no-scrollbar flex h-11 items-center gap-1 overflow-x-auto px-4">
        {segments.map(({ label, path }) => {
          const active = label === 'Leaderboard';
          return (
            <button
              key={label}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => !active && goTo(path)}
              className={classNames(
                'shell-press flex h-7 shrink-0 items-center rounded-8 border px-2 font-bold typo-footnote',
                active
                  ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
                  : 'border-transparent text-text-tertiary',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

/** Explore's block on top, the bar at the bottom. */
export const LeaderboardPhoneChrome = (): ReactElement => (
  <>
    <Block />
    <div aria-hidden className="h-[6rem] tablet:hidden" />
    <div aria-hidden className="shell-scrim tablet:hidden" />
    <Cluster />
  </>
);

/** Room under the content for the bar: its 8px floor, 56px, and a gap. */
export const LeaderboardBottomSpace = (): ReactElement => (
  <div aria-hidden className="h-20 tablet:hidden" />
);
