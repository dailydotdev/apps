import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
      'group relative flex min-w-[180px] flex-1 flex-col items-center gap-3 overflow-hidden rounded-16 border p-5 transition-all duration-300',
      loading
        ? 'border-border-subtlest-tertiary bg-surface-float'
        : 'border-border-subtlest-secondary bg-surface-float hover:-translate-y-1 hover:shadow-2',
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
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${crown.entity.brandColor}15 50%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </>
    )}

    {/* Crown emoji + label */}
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-2xl"
        style={
          !loading && crown.entity
            ? { filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.4))' }
            : undefined
        }
      >
        {crown.emoji}
      </span>
      <span className="font-bold uppercase tracking-wider text-text-quaternary typo-caption1">
        {crown.label}
      </span>
    </div>

    {/* Tool info */}
    <div className="flex h-8 items-center gap-2">
      {loading ? (
        <>
          <Placeholder className="h-8 w-8 shrink-0 rounded-8" />
          <Placeholder className="h-5 w-20" />
        </>
      ) : (
        <>
          <img
            src={crown.entity?.logo}
            alt={crown.entity?.name}
            className="h-8 w-8 shrink-0 rounded-8 bg-surface-float object-cover"
          />
          <span className="font-bold text-text-primary typo-title3">
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
