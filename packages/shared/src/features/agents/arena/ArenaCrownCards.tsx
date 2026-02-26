import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../../components/Icon';
import type { CrownData } from './types';

interface ArenaCrownCardsProps {
  crowns: CrownData[];
  loading?: boolean;
}

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const CrownCard = ({
  crown,
  loading,
}: {
  crown: CrownData;
  loading?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-w-[170px] flex-1 flex-col items-center gap-2 overflow-hidden rounded-16 border p-3 tablet:min-w-[180px] tablet:gap-3 tablet:p-5',
      loading
        ? 'border-border-subtlest-tertiary bg-surface-float'
        : 'border-border-subtlest-secondary bg-surface-float',
    )}
    style={
      !loading && crown.entity?.brandColor
        ? {
            boxShadow: `0 0 30px ${crown.entity.brandColor}20, inset 0 1px 0 ${crown.entity.brandColor}30`,
          }
        : undefined
    }
  >
    {/* Animated gradient glow that breathes */}
    {!loading && crown.entity?.brandColor && (
      <>
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-2xl"
          style={{
            backgroundColor: crown.entity.brandColor,
            animation: 'pulse 3s ease-in-out infinite',
            opacity: 0.15,
          }}
        />
      </>
    )}

    {/* Crown icon + label */}
    <div className="flex flex-col items-center gap-1">
      <crown.icon
        size={IconSize.Large}
        secondary={!loading && !!crown.entity}
        className={classNames(
          !loading && crown.entity
            ? crown.iconColor
            : 'text-text-quaternary',
        )}
      />
      <span className="text-center font-bold uppercase tracking-wider text-text-quaternary typo-caption2 tablet:typo-caption1">
        {crown.label}
      </span>
    </div>

    {/* Tool info */}
    <div className="flex h-7 items-center gap-1.5 tablet:h-8 tablet:gap-2">
      {loading ? (
        <>
          <Placeholder className="h-6 w-6 shrink-0 rounded-8 tablet:h-8 tablet:w-8" />
          <Placeholder className="h-4 w-16 tablet:h-5 tablet:w-20" />
        </>
      ) : (
        <>
          <img
            src={crown.entity?.logo}
            alt={crown.entity?.name}
            className="h-6 w-6 shrink-0 rounded-8 bg-surface-float object-cover tablet:h-8 tablet:w-8"
          />
          <span className="truncate font-bold text-text-primary typo-callout tablet:typo-title3">
            {crown.entity?.name}
          </span>
        </>
      )}
    </div>

    {/* Stat line */}
    <div className="flex h-5 items-center">
      {loading ? (
        <Placeholder className="h-4 w-16" />
      ) : (
        <span className="font-bold text-text-secondary typo-callout">
          {crown.stat}
        </span>
      )}
    </div>
  </div>
);

export const ArenaCrownCards = ({
  crowns,
  loading,
}: ArenaCrownCardsProps): ReactElement => (
  <div className="flex gap-3 overflow-x-auto pb-2 tablet:grid tablet:grid-cols-5 tablet:overflow-visible">
    {crowns.map((crown) => (
      <CrownCard key={crown.type} crown={crown} loading={loading} />
    ))}
  </div>
);
