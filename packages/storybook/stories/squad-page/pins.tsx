import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
  DiscussIcon,
  MenuIcon,
  PinIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Entry } from './data';
import { feedEntries, formatCount, formatDay, pinnedEntry } from './data';
import { Avatar, PinnedCard } from './kit';

// Five ways to show what the team pinned, one per product we looked at,
// all on the same three pins so they compare like for like.

export enum PinStyle {
  /** X profile: the first post, full size, a quiet Pinned line. One pin. */
  X = 'x',
  /** Reddit Community highlights: a row of compact cards above the feed. */
  Reddit = 'reddit',
  /** Facebook Groups Featured: a strip of post-shaped cards. */
  Facebook = 'facebook',
  /** Discord: out of the stream, behind a pin button with a count. */
  Discord = 'discord',
  /** The pick: X for the first pin, the rest folded under it. */
  Stack = 'stack',
}

export const pinStyles = Object.values(PinStyle);

export const pins: Entry[] = [
  pinnedEntry,
  ...feedEntries.filter((entry) => entry.image).slice(2, 4),
].map((entry) => ({ ...entry, pinned: false }));

const pinIds = new Set(pins.map((entry) => entry.id));

/** The feed under the pins, without the posts the pins already show. */
export const unpinnedEntries = feedEntries.filter(
  (entry) => !pinIds.has(entry.id),
);

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
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
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

const FacebookFeatured = (): ReactElement => (
  <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-bold text-text-primary typo-callout">
          Featured
        </span>
        <span className="flex items-center gap-1 text-accent-cabbage-default typo-caption1">
          1 new
          <span className="size-1.5 rounded-[999px] bg-accent-cabbage-default" />
        </span>
      </div>
      <span className="text-text-tertiary typo-footnote">See all</span>
    </div>
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none]">
      {pins.map((entry, index) => (
        <article
          key={entry.id}
          className={classNames(
            'relative flex h-56 w-64 shrink-0 flex-col gap-3 rounded-12 border bg-surface-float p-3',
            index === 0
              ? 'border-accent-cabbage-default'
              : 'border-border-subtlest-tertiary',
          )}
        >
          {index === 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-[999px] bg-accent-cabbage-default" />
          )}
          <div className="flex items-center gap-2">
            <Avatar member={entry.author} size={2} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary typo-footnote">
                {entry.author.name}
              </span>
              <span className="text-text-tertiary typo-caption1">
                {formatDay(entry.createdAt)}
              </span>
            </div>
            <MenuIcon size={IconSize.Size16} className="text-text-tertiary" />
          </div>
          <span className="line-clamp-4 flex-1 text-text-primary typo-title3">
            {entry.title}
          </span>
          <div className="flex items-center gap-4 border-t border-border-subtlest-tertiary pt-2 text-text-tertiary typo-caption1">
            <Stat
              icon={<UpvoteIcon size={IconSize.Size16} />}
              value={entry.upvotes}
            />
            <Stat
              icon={<DiscussIcon size={IconSize.Size16} />}
              value={entry.comments}
            />
          </div>
        </article>
      ))}
    </div>
  </section>
);

/** Discord's pins: a button in the toolbar, the list in a panel. */
export const DiscordPinsButton = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Pinned posts"
        title="Pinned posts"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={classNames(
          'relative flex size-8 items-center justify-center rounded-[999px] transition-colors hover:bg-surface-float hover:text-text-primary',
          open ? 'bg-surface-float text-text-primary' : 'text-text-tertiary',
        )}
      >
        <PinIcon size={IconSize.Small} secondary={open} />
        <span className="sq-nums absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[999px] bg-accent-cabbage-default px-1 font-bold text-white typo-caption2">
          {pins.length}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-popup flex w-96 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-2">
          <span className="border-b border-border-subtlest-tertiary px-4 py-3 font-bold text-text-primary typo-callout">
            Pinned posts
          </span>
          <ul className="flex flex-col p-2">
            {pins.map((entry) => (
              <li
                key={entry.id}
                className="group flex items-start gap-3 rounded-12 p-2 hover:bg-surface-hover"
              >
                <Avatar member={entry.author} size={2} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 typo-caption1">
                    <span className="font-bold text-text-primary">
                      {entry.author.name}
                    </span>
                    <span className="text-text-quaternary">
                      {formatDay(entry.createdAt)}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-text-secondary typo-footnote">
                    {entry.title}
                  </span>
                </div>
                <span className="rounded-8 bg-surface-float px-2 py-1 text-text-primary opacity-0 typo-caption1 group-hover:opacity-100">
                  Jump
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/** The pick: the first pin in full, the others one tap away in place. */
const PinStack = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const rest = pins.slice(1);

  return (
    <div className="flex flex-col gap-3">
      <PinnedCard entry={pins[0]} />
      {open && rest.map((entry) => <PinnedCard key={entry.id} entry={entry} />)}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-12 px-4 py-2 text-left text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
        >
          <span className="flex w-[2.75rem] justify-end">
            <PinIcon size={IconSize.Size16} secondary />
          </span>
          <span className="min-w-0 flex-1 truncate typo-footnote">
            {open ? (
              'Show fewer pinned posts'
            ) : (
              <>
                <b className="text-text-secondary">{rest.length} more pinned</b>
                <span className="text-text-quaternary">
                  {' '}
                  · {rest.map((entry) => entry.title).join(' · ')}
                </span>
              </>
            )}
          </span>
          <ArrowIcon
            size={IconSize.Size16}
            className={classNames(
              'shrink-0 transition-transform',
              open ? 'rotate-0' : 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
};

/** What sits between the toolbar and the feed, per style. */
export const PinnedArea = ({
  style,
}: {
  style: PinStyle;
}): ReactElement | null => {
  switch (style) {
    case PinStyle.X:
      return <PinnedCard entry={pins[0]} />;
    case PinStyle.Reddit:
      return <RedditHighlights />;
    case PinStyle.Facebook:
      return <FacebookFeatured />;
    case PinStyle.Discord:
      return null;
    default:
      return <PinStack />;
  }
};
