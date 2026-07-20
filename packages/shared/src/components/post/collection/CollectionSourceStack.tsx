import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import { ProfileImageSize, sizeClasses } from '../../ProfilePicture';
import HoverCard from '../../cards/common/HoverCard';
import type { SourceTooltip } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks';

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../../cards/entity/SquadEntityCard'),
);

// Lazy: the source's details are fetched on hover, so the feed stays lean.
const LazySourceEntityCard = dynamic(
  /* webpackChunkName: "lazySourceEntityCard" */ () =>
    import('../../cards/entity/LazySourceEntityCard').then(
      (m) => m.LazySourceEntityCard,
    ),
);

// Resting stack shows at most 3 avatars + one "+N" counter = 4 circles.
const MAX_AVATARS = 3;
// Open spacing matches how sources sit today (~6px overlap, i.e. -ml-1.5).
const OPEN_OVERLAP_PX = 6;
// While resting the circles overlap ~62% of their width for a compact mark.
const REST_OVERLAP_RATIO = 0.62;

const avatarPx: Partial<Record<ProfileImageSize, number>> = {
  [ProfileImageSize.Small]: 24,
  [ProfileImageSize.Medium]: 32,
  [ProfileImageSize.Large]: 40,
};

interface CollectionSourceStackProps {
  sources: SourceTooltip[];
  totalSources: number;
  size?: ProfileImageSize;
  className?: string;
  /**
   * Force the stack open (no hover needed). Defaults to true on touch/mobile
   * where there is no cursor to hover.
   */
  alwaysExpanded?: boolean;
  /**
   * Show the rich source hover card per avatar. Defaults to true on desktop
   * only — touch surfaces have no hover.
   */
  enableHoverCard?: boolean;
}

export const CollectionSourceStack = ({
  sources,
  totalSources,
  size = ProfileImageSize.Medium,
  className,
  alwaysExpanded: alwaysExpandedProp,
  enableHoverCard: enableHoverCardProp,
}: CollectionSourceStackProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const alwaysExpanded = alwaysExpandedProp ?? !isLaptop;
  const enableHoverCard = enableHoverCardProp ?? isLaptop;

  if (!sources?.length) {
    return null;
  }

  const shown = sources.slice(0, MAX_AVATARS);
  const remaining = Math.max(totalSources - shown.length, 0);
  const px = avatarPx[size] ?? 32;
  const restStep = alwaysExpanded
    ? OPEN_OVERLAP_PX
    : Math.round(px * REST_OVERLAP_RATIO);

  // margin-left is applied through a class reading a CSS var (never inline), so
  // the group-hover variant can win. Inline margin would always beat the class.
  const marginClass =
    'ml-[var(--ml-rest)] group-hover/srcstack:ml-[var(--ml-open)]';

  const circleStyle = (index: number): React.CSSProperties =>
    ({
      '--ml-rest': `${index === 0 ? 0 : -restStep}px`,
      '--ml-open': `${index === 0 ? 0 : -OPEN_OVERLAP_PX}px`,
      transitionProperty: 'margin-left',
      transitionDuration: '260ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    } as React.CSSProperties);

  // Squads read from their handle; every other source lazily fetches its
  // details by id when the hover card mounts.
  const renderEntityCard = (source: SourceTooltip): ReactElement | null => {
    if (source.type === SourceType.Squad) {
      return <SquadEntityCard handle={source.handle} origin={Origin.Feed} />;
    }

    if (!source.id) {
      return null;
    }

    return <LazySourceEntityCard id={source.id} />;
  };

  const withHoverCard = (
    source: SourceTooltip,
    avatar: ReactElement,
  ): ReactElement => {
    if (!enableHoverCard) {
      return <React.Fragment key={source.handle}>{avatar}</React.Fragment>;
    }

    return (
      <HoverCard
        key={source.handle}
        appendTo={globalThis?.document?.body}
        side="bottom"
        align="start"
        sideOffset={10}
        trigger={avatar}
      >
        {renderEntityCard(source)}
      </HoverCard>
    );
  };

  return (
    // `pointer-events-auto` re-enables hover: the card's text container is
    // `pointer-events-none` so post clicks fall through to the card link, and
    // that inherits down to the stack.
    <div
      className={classNames(
        'group/srcstack pointer-events-auto relative flex w-fit flex-row items-center',
        className,
      )}
    >
      {shown.map((source, index) =>
        withHoverCard(
          source,
          <div
            style={{ ...circleStyle(index), zIndex: shown.length - index }}
            className={classNames('relative rounded-full', marginClass)}
          >
            <SourceAvatar
              className="!mr-0 box-content ring-2 ring-background-default"
              source={source}
              size={size}
            />
          </div>,
        ),
      )}
      {remaining > 0 && (
        <div
          style={{ ...circleStyle(shown.length), zIndex: 0 }}
          className={classNames(
            'flex items-center justify-center rounded-full bg-surface-float font-bold tabular-nums text-text-secondary ring-2 ring-background-default typo-caption1',
            sizeClasses[size],
            marginClass,
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
