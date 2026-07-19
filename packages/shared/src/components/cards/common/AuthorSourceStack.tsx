import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { Author } from '../../../graphql/comments';
import type { Source, SourceTooltip } from '../../../graphql/sources';
import { isSourceUserSource } from '../../../graphql/sources';
import { ProfileImageSize, roundClasses } from '../../ProfilePicture';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import SourceButton from './SourceButton';
import { useViewSize, ViewSize } from '../../../hooks';
import type { UserShortProfile } from '../../../lib/user';

const HoverCard = dynamic(
  /* webpackChunkName: "hoverCard" */ () => import('./HoverCard'),
);

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../entity/UserEntityCard'),
);

// Overlap for the author + source stack — mirrors CollectionSourceStack: it
// rests tight and opens up on hover.
const OPEN_OVERLAP_PX = 6;
const REST_OVERLAP_RATIO = 0.62;

const avatarPx: Partial<Record<ProfileImageSize, number>> = {
  [ProfileImageSize.Small]: 24,
  [ProfileImageSize.Medium]: 32,
  [ProfileImageSize.Large]: 40,
};

// Ring separating the overlapping avatars from the card behind them.
const avatarRing = 'ring-2 ring-background-default';

// margin-left is applied through a class reading a CSS var (never inline) so the
// group-hover variant can win and the stack opens up on hover.
const marginClass =
  'ml-[var(--ml-rest)] group-hover/authstack:ml-[var(--ml-open)]';

interface AuthorSourceStackProps {
  author?: Author | null;
  source?: Source | null;
  size?: ProfileImageSize;
  className?: string;
}

/**
 * Renders a post's author + source as an overlapping stack matching the
 * collection source stack: the author (primary, a rounded-square user avatar)
 * sits in front on the left, the source/squad (secondary, a circle) tucks in
 * behind on the right, and the stack opens on hover. Each avatar keeps its own
 * hover card (author → profile, source → source/squad).
 *
 * Falls back to a single bare avatar when only one is present (so article
 * cards, which have a source and no author, render exactly as before).
 */
export const AuthorSourceStack = ({
  author,
  source,
  size = ProfileImageSize.Medium,
  className,
}: AuthorSourceStackProps): ReactElement | null => {
  const alwaysExpanded = !useViewSize(ViewSize.Laptop);
  const showSource = !!source && !isSourceUserSource(source);

  if (!author && !showSource) {
    return null;
  }

  const authorAvatar = author ? (
    <HoverCard
      appendTo={globalThis?.document?.body}
      align="start"
      side="bottom"
      sideOffset={10}
      trigger={<ProfileImageLink picture={{ size }} user={author} />}
    >
      <UserEntityCard user={author as UserShortProfile} />
    </HoverCard>
  ) : null;

  const sourceAvatar = showSource ? (
    <SourceButton source={source as SourceTooltip} size={size} />
  ) : null;

  // Single avatar: render it bare (no ring / overlap) — keeps non-author cards
  // (e.g. articles) pixel-identical to before.
  if (!authorAvatar || !sourceAvatar) {
    return authorAvatar ?? sourceAvatar;
  }

  const restStep = alwaysExpanded
    ? OPEN_OVERLAP_PX
    : Math.round((avatarPx[size] ?? 32) * REST_OVERLAP_RATIO);

  // index 0 = author (front, fixed); index 1 = source (behind, opens on hover).
  const overlapStyle = (index: number): CSSProperties =>
    ({
      '--ml-rest': `${index === 0 ? 0 : -restStep}px`,
      '--ml-open': `${index === 0 ? 0 : -OPEN_OVERLAP_PX}px`,
      transitionProperty: 'margin-left',
      transitionDuration: '260ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      // zIndex is inline (this build doesn't emit Tailwind z-* utilities) so the
      // author (primary) always wins the stacking order over the source.
      zIndex: index === 0 ? 2 : 1,
    } as CSSProperties);

  return (
    <div
      className={classNames(
        'group/authstack pointer-events-auto relative flex flex-row items-center',
        className,
      )}
    >
      {/* Author avatar: a rounded square, like every user avatar (rounding
          matches the ProfilePicture size so the ring hugs the avatar). */}
      <div
        className={classNames(
          'relative',
          roundClasses[size],
          avatarRing,
          marginClass,
        )}
        style={overlapStyle(0)}
      >
        {authorAvatar}
      </div>
      {/* Source/squad avatar stays circular. */}
      <div
        className={classNames('relative rounded-full', avatarRing, marginClass)}
        style={overlapStyle(1)}
      >
        {sourceAvatar}
      </div>
    </div>
  );
};
