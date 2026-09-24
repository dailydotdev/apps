import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  PinIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Entry } from './data';
import { feedEntries, formatCount, pinnedEntry } from './data';
import { PinnedCard } from './kit';

// How the team's pins sit above the feed. Reddit's highlights row is the
// default; X's single pinned post stays switchable for testing.

export enum PinStyle {
  /** Reddit Community highlights: a row of compact cards above the feed. */
  Reddit = 'reddit',
  /** X profile: the first post, full size, a quiet Pinned line. One pin. */
  X = 'x',
}

export const pinStyles = Object.values(PinStyle);

export const pins: Entry[] = [
  pinnedEntry,
  ...feedEntries.filter((entry) => entry.image).slice(2, 4),
].map((entry) => ({ ...entry, pinned: false }));

/** The feed under the pins, without the posts the pins already show. */
export const feedUnder = (style: PinStyle): Entry[] => {
  const shown = new Set(
    (style === PinStyle.X ? pins.slice(0, 1) : pins).map((entry) => entry.id),
  );

  return feedEntries.filter((entry) => !shown.has(entry.id));
};

const labels = ['Announcement', 'Launch', 'Guide'];

const Stat = ({
  icon,
  value,
}: {
  icon: ReactElement;
  value: number;
}): ReactElement => (
  <span className="sq-nums flex items-center gap-1">
    {icon}
    {formatCount(value)}
  </span>
);

const RedditHighlights = (): ReactElement => {
  const [open, setOpen] = useState(true);

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 self-start text-text-secondary typo-footnote hover:text-text-primary"
      >
        <PinIcon size={IconSize.Size16} secondary />
        <span className="font-bold">Community highlights</span>
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames('transition-transform', !open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] tablet:-mx-6 tablet:px-6">
          {pins.map((entry, index) => (
            <a
              key={entry.id}
              href="#"
              className="group relative flex h-40 w-52 shrink-0 flex-col justify-end overflow-hidden rounded-16 border border-border-subtlest-tertiary"
            >
              {entry.image && (
                <img
                  src={entry.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-105"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-background-default via-background-default to-transparent opacity-[0.9]" />
              <span className="relative flex flex-col gap-1.5 p-3">
                <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
                  {entry.title}
                </span>
                <span className="flex items-center gap-2 text-text-tertiary typo-caption1">
                  <span className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-secondary">
                    {labels[index]}
                  </span>
                  <Stat
                    icon={<UpvoteIcon size={IconSize.Size16} />}
                    value={entry.upvotes}
                  />
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

/** What sits between the toolbar and the feed, per style. */
export const PinnedArea = ({ style }: { style: PinStyle }): ReactElement =>
  style === PinStyle.X ? <PinnedCard entry={pins[0]} /> : <RedditHighlights />;
